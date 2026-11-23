import { collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc, updateDoc } from 'firebase/firestore';
import { deleteObject, getBlob, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from './firebase';
import { SchoolDocument } from '../types';

const COLLECTION = 'uploaded_documents';

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

export const CONTENT_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  txt: 'text/plain',
  csv: 'text/csv',
  rtf: 'application/rtf',
  odt: 'application/vnd.oasis.opendocument.text',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  odp: 'application/vnd.oasis.opendocument.presentation',
};

export const ALLOWED_EXTENSIONS = Object.keys(CONTENT_TYPES);
export const FILE_INPUT_ACCEPT = ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(',');

export function getExtension(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  return dot === -1 ? '' : fileName.slice(dot + 1).toLowerCase();
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** 校验文件格式与大小，返回错误提示；通过则返回 null。 */
export function validateUploadFile(file: File): string | null {
  if (!ALLOWED_EXTENSIONS.includes(getExtension(file.name))) {
    return `不支持的文件格式。支持：${ALLOWED_EXTENSIONS.join('、')}`;
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `文件过大（${formatBytes(file.size)}），单个文件不能超过 ${formatBytes(MAX_UPLOAD_BYTES)}。`;
  }
  if (file.size === 0) {
    return '文件为空。';
  }
  return null;
}

interface StoredUploadedDocument {
  title: string;
  category: SchoolDocument['category'];
  department: string;
  updatedAt: string;
  fileName: string;
  storagePath: string;
  downloadUrl: string;
  sizeBytes: number;
  uploadedByEmail: string;
  uploadedByName: string;
  createdAt: number;
}

function toSchoolDocument(id: string, d: StoredUploadedDocument): SchoolDocument {
  return {
    id,
    title: d.title,
    category: d.category,
    department: d.department,
    updatedAt: d.updatedAt,
    fileSize: formatBytes(d.sizeBytes),
    isTemplate: false,
    contentTemplate: '',
    file: {
      fileName: d.fileName,
      storagePath: d.storagePath,
      downloadUrl: d.downloadUrl,
      sizeBytes: d.sizeBytes,
      uploadedByEmail: d.uploadedByEmail,
      uploadedByName: d.uploadedByName,
    },
  };
}

/** 实时订阅已上传的文件列表（最新在前）。返回取消订阅函数。 */
export function subscribeUploadedDocuments(
  onChange: (docs: SchoolDocument[]) => void,
  onError: (err: Error) => void
): () => void {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => onChange(snap.docs.map((d) => toSchoolDocument(d.id, d.data() as StoredUploadedDocument))),
    onError
  );
}

export interface UploadInput {
  file: File;
  title: string;
  category: SchoolDocument['category'];
  department: string;
  uploadedByEmail: string;
  uploadedByName: string;
}

/** 上传文件到 Firebase Storage，并在 Firestore 记录文件信息。 */
export async function uploadDocumentFile(input: UploadInput): Promise<void> {
  const error = validateUploadFile(input.file);
  if (error) throw new Error(error);

  const id = crypto.randomUUID();
  const ext = getExtension(input.file.name);
  const storagePath = `documents/${id}.${ext}`;
  const fileRef = ref(storage, storagePath);

  await uploadBytes(fileRef, input.file, { contentType: CONTENT_TYPES[ext] });
  try {
    const downloadUrl = await getDownloadURL(fileRef);
    const record: StoredUploadedDocument = {
      title: input.title,
      category: input.category,
      department: input.department,
      updatedAt: new Date().toISOString().split('T')[0],
      fileName: input.file.name,
      storagePath,
      downloadUrl,
      sizeBytes: input.file.size,
      uploadedByEmail: input.uploadedByEmail.toLowerCase(),
      uploadedByName: input.uploadedByName,
      createdAt: Date.now(),
    };
    await setDoc(doc(db, COLLECTION, id), record);
  } catch (err) {
    // 记录写入失败时回收已上传的文件，避免产生孤立文件
    await deleteObject(fileRef).catch(() => undefined);
    throw err;
  }
}

/** 仅文本类文件可在浏览器内编辑，且不超过 1 MB。 */
export const EDITABLE_TEXT_EXTENSIONS = ['txt', 'csv'];
export const MAX_EDITABLE_BYTES = 1024 * 1024;

export function isTextEditableFile(fileName: string, sizeBytes: number): boolean {
  return EDITABLE_TEXT_EXTENSIONS.includes(getExtension(fileName)) && sizeBytes <= MAX_EDITABLE_BYTES;
}

/** 修改文件记录的名称 / 分类 / 部门（仅超级管理员，由 Firestore 规则保证）。 */
export async function updateDocumentMeta(
  id: string,
  meta: { title: string; category: SchoolDocument['category']; department: string }
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...meta,
    updatedAt: new Date().toISOString().split('T')[0],
  });
}

/** 用新文件替换原文件：先上传到新路径，记录更新成功后再删除旧文件。 */
export async function replaceDocumentFile(document: SchoolDocument, file: File): Promise<void> {
  if (!document.file) return;
  const error = validateUploadFile(file);
  if (error) throw new Error(error);

  const ext = getExtension(file.name);
  const newPath = `documents/${crypto.randomUUID()}.${ext}`;
  const newRef = ref(storage, newPath);

  await uploadBytes(newRef, file, { contentType: CONTENT_TYPES[ext] });
  try {
    const downloadUrl = await getDownloadURL(newRef);
    await updateDoc(doc(db, COLLECTION, document.id), {
      fileName: file.name,
      storagePath: newPath,
      downloadUrl,
      sizeBytes: file.size,
      updatedAt: new Date().toISOString().split('T')[0],
    });
  } catch (err) {
    await deleteObject(newRef).catch(() => undefined);
    throw err;
  }
  await deleteObject(ref(storage, document.file.storagePath)).catch(() => undefined);
}

/** 读取文本文件内容（用于在线编辑）。需要 Storage 桶已配置 CORS，见 README。 */
export async function readTextFile(storagePath: string): Promise<string> {
  const blob = await getBlob(ref(storage, storagePath));
  return blob.text();
}

/** 删除已上传文件及其记录。 */
export async function deleteUploadedDocument(document: SchoolDocument): Promise<void> {
  if (!document.file) return;
  await deleteObject(ref(storage, document.file.storagePath)).catch((err: { code?: string }) => {
    if (err?.code !== 'storage/object-not-found') throw err;
  });
  await deleteDoc(doc(db, COLLECTION, document.id));
}
