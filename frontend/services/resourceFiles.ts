import { collection, deleteDoc, doc, increment, onSnapshot, orderBy, query, setDoc, updateDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from './firebase';
import { CONTENT_TYPES, formatBytes, getExtension, validateUploadFile } from './documentFiles';
import { TeachingResource } from '../types';

const COLLECTION = 'uploaded_resources';

/** 根据文件扩展名推断资源的文件格式标签。 */
export function formatFromExtension(ext: string): TeachingResource['fileFormat'] {
  switch (ext.toLowerCase()) {
    case 'pdf':
      return 'PDF';
    case 'ppt':
    case 'pptx':
    case 'odp':
      return 'PPTX';
    case 'xls':
    case 'xlsx':
    case 'ods':
    case 'csv':
      return 'XLSX';
    case 'txt':
      return 'TXT';
    default:
      return 'DOCX'; // doc / docx / rtf / odt
  }
}

type StoredResource = Omit<TeachingResource, 'id'> & { createdAt: number };

/** 实时订阅共享的已上传资源（最新在前）。返回取消订阅函数。 */
export function subscribeUploadedResources(
  onChange: (resources: TeachingResource[]) => void,
  onError: (err: Error) => void
): () => void {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) =>
      onChange(
        snap.docs.map((d) => {
          const { createdAt: _createdAt, ...rest } = d.data() as StoredResource;
          return { id: d.id, ...rest };
        })
      ),
    onError
  );
}

export interface ResourceUploadInput {
  file: File;
  resource: Omit<TeachingResource, 'id' | 'fileFormat' | 'fileSize' | 'file' | 'downloadCount' | 'uploadedAt'>;
  uploadedByEmail: string;
}

/** 上传资源文件（Storage）并在 Firestore 创建共享记录。 */
export async function uploadResourceFile(input: ResourceUploadInput): Promise<void> {
  const error = validateUploadFile(input.file);
  if (error) throw new Error(error);

  const id = crypto.randomUUID();
  const ext = getExtension(input.file.name);
  // 放在 documents/ 目录下，沿用已发布的 Storage 规则
  const storagePath = `documents/res_${id}.${ext}`;
  const fileRef = ref(storage, storagePath);

  await uploadBytes(fileRef, input.file, { contentType: CONTENT_TYPES[ext] });
  try {
    const downloadUrl = await getDownloadURL(fileRef);
    const record: StoredResource = {
      ...input.resource,
      uploadedAt: new Date().toISOString().split('T')[0],
      fileFormat: formatFromExtension(ext),
      fileSize: formatBytes(input.file.size),
      downloadCount: 0,
      file: {
        fileName: input.file.name,
        storagePath,
        downloadUrl,
        sizeBytes: input.file.size,
        uploadedByEmail: input.uploadedByEmail.toLowerCase(),
      },
      createdAt: Date.now(),
    };
    await setDoc(doc(db, COLLECTION, id), record);
  } catch (err) {
    await deleteObject(fileRef).catch(() => undefined);
    throw err;
  }
}

/** 修改资源的名称 / 类型 / 年级（仅超级管理员，由 Firestore 规则保证）。 */
export async function updateResourceMeta(
  id: string,
  meta: Pick<TeachingResource, 'title' | 'type' | 'gradeLevel' | 'subjectCategory'>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), meta);
}

/** 用新文件替换资源文件：先上传新文件，记录更新成功后再删除旧文件（仅超级管理员）。 */
export async function replaceResourceFile(resource: TeachingResource, file: File): Promise<void> {
  if (!resource.file) return;
  const error = validateUploadFile(file);
  if (error) throw new Error(error);

  const ext = getExtension(file.name);
  const newPath = `documents/res_${crypto.randomUUID()}.${ext}`;
  const newRef = ref(storage, newPath);

  await uploadBytes(newRef, file, { contentType: CONTENT_TYPES[ext] });
  try {
    const downloadUrl = await getDownloadURL(newRef);
    await updateDoc(doc(db, COLLECTION, resource.id), {
      fileFormat: formatFromExtension(ext),
      fileSize: formatBytes(file.size),
      uploadedAt: new Date().toISOString().split('T')[0],
      file: {
        fileName: file.name,
        storagePath: newPath,
        downloadUrl,
        sizeBytes: file.size,
        uploadedByEmail: resource.file.uploadedByEmail, // 上传人保持不变
      },
    });
  } catch (err) {
    await deleteObject(newRef).catch(() => undefined);
    throw err;
  }
  await deleteObject(ref(storage, resource.file.storagePath)).catch(() => undefined);
}

/** 删除资源文件及其记录。 */
export async function deleteUploadedResource(resource: TeachingResource): Promise<void> {
  if (!resource.file) return;
  await deleteObject(ref(storage, resource.file.storagePath)).catch((err: { code?: string }) => {
    if (err?.code !== 'storage/object-not-found') throw err;
  });
  await deleteDoc(doc(db, COLLECTION, resource.id));
}

/** 下载次数 +1（任何在册成员均可，由 Firestore 规则限制只能 +1）。 */
export async function incrementResourceDownload(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { downloadCount: increment(1) });
}
