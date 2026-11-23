import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Edit3, FileText, HardDrive, Pencil, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { ResourceType, SchoolDocument, TeachingResource } from '../types';
import { notify } from '../utils/toast';
import {
  FILE_INPUT_ACCEPT,
  deleteUploadedDocument,
  formatBytes,
  getExtension,
  isTextEditableFile,
  readTextFile,
  replaceDocumentFile,
  subscribeUploadedDocuments,
  updateDocumentMeta,
} from '../services/documentFiles';
import {
  deleteUploadedResource,
  replaceResourceFile,
  subscribeUploadedResources,
  updateResourceMeta,
} from '../services/resourceFiles';

type SourceFilter = 'all' | 'document' | 'resource';
type DocumentCategory = 'form' | 'regulation' | 'application';
type GradeLevel = TeachingResource['gradeLevel'];

const DOCUMENT_CATEGORY_LABELS: Record<string, string> = {
  form: '空白表单',
  regulation: '规章手册',
  application: '核定申请',
  manual: '手册',
};

const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  powerpoint: '教学课件 PPT',
  exam_paper: '阶段与期末试卷',
  textbook: '教材与复习讲义',
  lab_project: '实训工程源码',
};

const GRADE_LEVELS: GradeLevel[] = ['初一', '初二', '初三', '高一', '高二', '高三', '全校通用'];

/** 初中年级对应「电脑资讯与工艺」，其余对应「资讯科技」 */
const subjectForGrade = (grade: GradeLevel): TeachingResource['subjectCategory'] =>
  grade.startsWith('初') ? '电脑资讯与工艺' : '资讯科技';

/** 两个来源（公文与空白表单 / 教材库）的文件统一成同一种行，便于集中管理。 */
interface ManagedFile {
  key: string;
  kind: 'document' | 'resource';
  id: string;
  title: string;
  fileName: string;
  sizeBytes: number;
  sourceLabel: string;
  categoryLabel: string;
  department: string;
  uploaderName: string;
  uploaderEmail: string;
  date: string;
  downloadUrl: string;
  storagePath: string;
  document?: SchoolDocument;
  resource?: TeachingResource;
}

function fromDocument(d: SchoolDocument): ManagedFile | null {
  if (!d.file) return null;
  return {
    key: `document:${d.id}`,
    kind: 'document',
    id: d.id,
    title: d.title,
    fileName: d.file.fileName,
    sizeBytes: d.file.sizeBytes,
    sourceLabel: '公文与空白表单',
    categoryLabel: DOCUMENT_CATEGORY_LABELS[d.category] ?? d.category,
    department: d.department,
    uploaderName: d.file.uploadedByName,
    uploaderEmail: d.file.uploadedByEmail,
    date: d.updatedAt,
    downloadUrl: d.file.downloadUrl,
    storagePath: d.file.storagePath,
    document: d,
  };
}

function fromResource(r: TeachingResource): ManagedFile | null {
  if (!r.file) return null;
  return {
    key: `resource:${r.id}`,
    kind: 'resource',
    id: r.id,
    title: r.title,
    fileName: r.file.fileName,
    sizeBytes: r.file.sizeBytes,
    sourceLabel: '教材·试卷·课件库',
    categoryLabel: `${RESOURCE_TYPE_LABELS[r.type] ?? r.type} · ${r.gradeLevel}`,
    department: r.authorDepartment,
    uploaderName: r.authorTeacherName,
    uploaderEmail: r.file.uploadedByEmail,
    date: r.uploadedAt,
    downloadUrl: r.file.downloadUrl,
    storagePath: r.file.storagePath,
    resource: r,
  };
}

/** 文件管理后台：集中查看、编辑、替换、删除所有页面上传的文件（仅超级管理员可见）。 */
export const FileManager: React.FC = () => {
  const [documentFiles, setDocumentFiles] = useState<SchoolDocument[]>([]);
  const [resourceFiles, setResourceFiles] = useState<TeachingResource[]>([]);
  const [loadedDocs, setLoadedDocs] = useState(false);
  const [loadedResources, setLoadedResources] = useState(false);
  const [search, setSearch] = useState('');
  const [source, setSource] = useState<SourceFilter>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  // 编辑名称 / 分类 / 部门（文档）或 名称 / 类型 / 年级（教材）
  const [metaFile, setMetaFile] = useState<ManagedFile | null>(null);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaCategory, setMetaCategory] = useState<DocumentCategory>('form');
  const [metaDepartment, setMetaDepartment] = useState('');
  const [metaType, setMetaType] = useState<ResourceType>('powerpoint');
  const [metaGrade, setMetaGrade] = useState<GradeLevel>('初一');

  // 在线编辑文本文件
  const [textFile, setTextFile] = useState<ManagedFile | null>(null);
  const [textContent, setTextContent] = useState('');
  const [textLoading, setTextLoading] = useState(false);

  // 替换文件
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replaceTarget, setReplaceTarget] = useState<ManagedFile | null>(null);

  useEffect(() => {
    const unsubDocs = subscribeUploadedDocuments(
      (list) => {
        setDocumentFiles(list);
        setLoadedDocs(true);
      },
      (err) => {
        console.error('Failed to load document files:', err);
        setLoadedDocs(true);
        notify('加载公文文件失败，请确认已发布 Firestore 规则。');
      }
    );
    const unsubResources = subscribeUploadedResources(
      (list) => {
        setResourceFiles(list);
        setLoadedResources(true);
      },
      (err) => {
        console.error('Failed to load resource files:', err);
        setLoadedResources(true);
        notify('加载教材文件失败，请确认已发布 Firestore 规则。');
      }
    );
    return () => {
      unsubDocs();
      unsubResources();
    };
  }, []);

  const loading = !(loadedDocs && loadedResources);

  const files = useMemo(() => {
    const all = [
      ...documentFiles.map(fromDocument),
      ...resourceFiles.map(fromResource),
    ].filter((f): f is ManagedFile => f !== null);
    // 最新在前（日期相同则保持原顺序）
    return all.sort((a, b) => b.date.localeCompare(a.date));
  }, [documentFiles, resourceFiles]);

  // 清理已不存在的勾选项
  useEffect(() => {
    setSelected((prev) => {
      const next = new Set([...prev].filter((key) => files.some((f) => f.key === key)));
      return next.size === prev.size ? prev : next;
    });
  }, [files]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return files.filter((f) => {
      if (source !== 'all' && f.kind !== source) return false;
      if (!term) return true;
      return `${f.title} ${f.fileName} ${f.department} ${f.uploaderName} ${f.categoryLabel}`.toLowerCase().includes(term);
    });
  }, [files, search, source]);

  const totalBytes = useMemo(() => files.reduce((sum, f) => sum + f.sizeBytes, 0), [files]);
  const allVisibleSelected = visible.length > 0 && visible.every((f) => selected.has(f.key));

  const toggleSelect = (key: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const toggleSelectAll = () =>
    setSelected(allVisibleSelected ? new Set() : new Set(visible.map((f) => f.key)));

  // ---- 编辑信息 ----
  const openMetaEditor = (f: ManagedFile) => {
    setMetaFile(f);
    setMetaTitle(f.title);
    if (f.document) {
      setMetaCategory((['form', 'regulation', 'application'] as const).find((c) => c === f.document?.category) ?? 'form');
      setMetaDepartment(f.document.department);
    }
    if (f.resource) {
      setMetaType(f.resource.type);
      setMetaGrade(f.resource.gradeLevel);
    }
  };

  const saveMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metaFile || busy) return;
    if (!metaTitle.trim()) {
      notify('文件名称不能为空。');
      return;
    }
    setBusy(true);
    try {
      if (metaFile.kind === 'document') {
        await updateDocumentMeta(metaFile.id, {
          title: metaTitle.trim(),
          category: metaCategory,
          department: metaDepartment.trim() || '资讯处 / 电脑科',
        });
      } else {
        await updateResourceMeta(metaFile.id, {
          title: metaTitle.trim(),
          type: metaType,
          gradeLevel: metaGrade,
          subjectCategory: subjectForGrade(metaGrade),
        });
      }
      notify('已保存。', 'success');
      setMetaFile(null);
    } catch (err) {
      console.error('Update meta failed:', err);
      notify('保存失败：没有权限或网络异常。');
    } finally {
      setBusy(false);
    }
  };

  // ---- 替换文件 ----
  const replaceWith = async (target: ManagedFile, file: File) => {
    if (target.kind === 'document' && target.document) await replaceDocumentFile(target.document, file);
    else if (target.resource) await replaceResourceFile(target.resource, file);
  };

  const startReplace = (f: ManagedFile) => {
    setReplaceTarget(f);
    replaceInputRef.current?.click();
  };

  const handleReplacePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    const target = replaceTarget;
    setReplaceTarget(null);
    if (!file || !target) return;
    setBusy(true);
    try {
      await replaceWith(target, file);
      notify('文件已替换。', 'success');
    } catch (err) {
      console.error('Replace failed:', err);
      notify(err instanceof Error && err.message.includes('文件') ? err.message : '替换失败：没有权限或网络异常。');
    } finally {
      setBusy(false);
    }
  };

  // ---- 在线编辑文本 ----
  const openTextEditor = async (f: ManagedFile) => {
    setTextFile(f);
    setTextContent('');
    setTextLoading(true);
    try {
      setTextContent(await readTextFile(f.storagePath));
    } catch (err) {
      console.error('Read text failed:', err);
      notify('读取文件失败：请确认 Storage 桶已配置 CORS（见 README）。');
      setTextFile(null);
    } finally {
      setTextLoading(false);
    }
  };

  const saveText = async () => {
    if (!textFile || busy) return;
    setBusy(true);
    try {
      const ext = getExtension(textFile.fileName);
      const file = new File([textContent], textFile.fileName, {
        type: ext === 'csv' ? 'text/csv' : 'text/plain',
      });
      await replaceWith(textFile, file);
      notify('已保存修改。', 'success');
      setTextFile(null);
    } catch (err) {
      console.error('Save text failed:', err);
      notify('保存失败：没有权限或网络异常。');
    } finally {
      setBusy(false);
    }
  };

  // ---- 删除 ----
  const deleteMany = async (targets: ManagedFile[]) => {
    if (targets.length === 0 || busy) return;
    const label = targets.length === 1 ? `「${targets[0].title}」` : `选中的 ${targets.length} 个文件`;
    if (!window.confirm(`确定要删除${label}吗？此操作无法撤销。`)) return;
    setBusy(true);
    let failed = 0;
    for (const f of targets) {
      try {
        if (f.kind === 'document' && f.document) await deleteUploadedDocument(f.document);
        else if (f.resource) await deleteUploadedResource(f.resource);
      } catch (err) {
        console.error('Delete failed:', err);
        failed += 1;
      }
    }
    setBusy(false);
    if (failed > 0) notify(`${failed} 个文件删除失败。`);
    else notify('已删除。', 'success');
  };

  const SOURCE_CHIPS: { id: SourceFilter; label: string }[] = [
    { id: 'all', label: `全部 (${files.length})` },
    { id: 'document', label: `公文与空白表单 (${files.filter((f) => f.kind === 'document').length})` },
    { id: 'resource', label: `教材·试卷·课件库 (${files.filter((f) => f.kind === 'resource').length})` },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
          <HardDrive className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
          <span>文件管理后台</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold border border-indigo-200">
            超级管理员专享
          </span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          汇总所有页面上传的文件：共 {files.length} 个 · 占用 {formatBytes(totalBytes)} · 可重命名、改分类、替换文件、在线编辑文本（.txt / .csv）、批量删除
        </p>
      </div>

      {/* 搜索与筛选 */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索名称、文件名、部门或上传人..."
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex flex-wrap gap-1.5 text-xs">
          {SOURCE_CHIPS.map((c) => (
            <button
              key={c.id}
              onClick={() => setSource(c.id)}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                source === c.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        {selected.size > 0 && (
          <button
            onClick={() => deleteMany(files.filter((f) => selected.has(f.key)))}
            disabled={busy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-xs font-semibold"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>删除选中 ({selected.size})</span>
          </button>
        )}
      </div>

      {/* 文件表格 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="p-3 w-8">
                  <input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAll} aria-label="全选" />
                </th>
                <th className="p-3">名称 / 文件名</th>
                <th className="p-3">来源</th>
                <th className="p-3">分类</th>
                <th className="p-3">部门</th>
                <th className="p-3">大小</th>
                <th className="p-3">上传人</th>
                <th className="p-3">日期</th>
                <th className="p-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-slate-400">正在加载文件…</td>
                </tr>
              )}
              {!loading && visible.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-slate-400">暂无文件。可在「公文与空白表单」或「教材·试卷·课件库」页面上传。</td>
                </tr>
              )}
              {visible.map((f) => (
                <tr key={f.key} className="hover:bg-slate-50/70 transition">
                  <td className="p-3">
                    <input type="checkbox" checked={selected.has(f.key)} onChange={() => toggleSelect(f.key)} aria-label={`选择 ${f.title}`} />
                  </td>
                  <td className="p-3">
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-sm break-all">{f.title}</div>
                        <div className="text-[11px] text-slate-400 break-all">{f.fileName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap">{f.sourceLabel}</td>
                  <td className="p-3">{f.categoryLabel}</td>
                  <td className="p-3">{f.department}</td>
                  <td className="p-3 whitespace-nowrap">{formatBytes(f.sizeBytes)}</td>
                  <td className="p-3">
                    <div>{f.uploaderName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{f.uploaderEmail}</div>
                  </td>
                  <td className="p-3 whitespace-nowrap">{f.date}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1 flex-wrap">
                      <button onClick={() => openMetaEditor(f)} disabled={busy} title="编辑信息" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600">
                        <Pencil className="h-4 w-4" />
                      </button>
                      {isTextEditableFile(f.fileName, f.sizeBytes) && (
                        <button onClick={() => openTextEditor(f)} disabled={busy} title="在线编辑文本" className="p-1.5 rounded-lg hover:bg-slate-100 text-indigo-600">
                          <Edit3 className="h-4 w-4" />
                        </button>
                      )}
                      <button onClick={() => startReplace(f)} disabled={busy} title="替换文件" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600">
                        <RefreshCw className="h-4 w-4" />
                      </button>
                      <a href={f.downloadUrl} download={f.fileName} target="_blank" rel="noopener noreferrer" title="下载" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600">
                        <Download className="h-4 w-4" />
                      </a>
                      <button onClick={() => deleteMany([f])} disabled={busy} title="删除" className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <input ref={replaceInputRef} type="file" accept={FILE_INPUT_ACCEPT} onChange={handleReplacePicked} className="hidden" />

      {/* 编辑信息 */}
      {metaFile && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <form onSubmit={saveMeta} className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">编辑文件信息</h3>
            <p className="text-[11px] text-slate-400">来源：{metaFile.sourceLabel}</p>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">名称</label>
              <input type="text" required value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="w-full text-sm p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            {metaFile.kind === 'document' ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">分类</label>
                  <select value={metaCategory} onChange={(e) => setMetaCategory(e.target.value as DocumentCategory)} className="w-full text-sm p-2.5 border border-slate-200 rounded-xl bg-white outline-none">
                    <option value="form">空白表单</option>
                    <option value="regulation">规章手册</option>
                    <option value="application">核定申请</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">部门</label>
                  <input type="text" value={metaDepartment} onChange={(e) => setMetaDepartment(e.target.value)} className="w-full text-sm p-2.5 border border-slate-200 rounded-xl outline-none" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">资源类型</label>
                  <select value={metaType} onChange={(e) => setMetaType(e.target.value as ResourceType)} className="w-full text-sm p-2.5 border border-slate-200 rounded-xl bg-white outline-none">
                    {(Object.keys(RESOURCE_TYPE_LABELS) as ResourceType[]).map((t) => (
                      <option key={t} value={t}>{RESOURCE_TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">适用年级</label>
                  <select value={metaGrade} onChange={(e) => setMetaGrade(e.target.value as GradeLevel)} className="w-full text-sm p-2.5 border border-slate-200 rounded-xl bg-white outline-none">
                    {GRADE_LEVELS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setMetaFile(null)} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg">取消</button>
              <button type="submit" disabled={busy} className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg">保存</button>
            </div>
          </form>
        </div>
      )}

      {/* 在线编辑文本 */}
      {textFile && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-3xl shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 break-all">编辑：{textFile.fileName}</h3>
              <button onClick={() => !busy && setTextFile(null)} aria-label="关闭" className="p-1 text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              disabled={textLoading || busy}
              placeholder={textLoading ? '正在读取文件…' : ''}
              spellCheck={false}
              className="w-full h-[55vh] p-3 font-mono text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setTextFile(null)} disabled={busy} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg">取消</button>
              <button onClick={saveText} disabled={textLoading || busy} className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg">
                {busy ? '保存中...' : '保存修改'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
