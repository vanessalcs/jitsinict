import React, { useEffect, useMemo, useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Copy,
  Check,
  Sparkles,
  Search,
  ArrowLeft,
  Upload,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { AuthorizedUser, SchoolDocument } from '../types';
import { notify } from '../utils/toast';
import { askGeminiAssistant } from '../services/geminiService';
import {
  FILE_INPUT_ACCEPT,
  MAX_UPLOAD_BYTES,
  deleteUploadedDocument,
  formatBytes,
  getExtension,
  subscribeUploadedDocuments,
  uploadDocumentFile,
  validateUploadFile,
} from '../services/documentFiles';

interface DocumentCenterProps {
  documents: SchoolDocument[];
  onAddDocument: (doc: SchoolDocument) => void;
  authUser: AuthorizedUser;
}

type UploadCategory = 'form' | 'regulation' | 'application';

export const DocumentCenter: React.FC<DocumentCenterProps> = ({ documents, onAddDocument, authUser }) => {
  // 已上传的文件（Firebase，实时同步）与本地文档合并显示
  const [uploadedDocs, setUploadedDocs] = useState<SchoolDocument[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const allDocs = useMemo(() => [...uploadedDocs, ...documents], [uploadedDocs, documents]);
  const selectedDoc = allDocs.find((d) => d.id === selectedId) ?? allDocs[0] ?? null;

  useEffect(() => {
    return subscribeUploadedDocuments(setUploadedDocs, (err) => {
      console.error('Failed to load uploaded documents:', err);
      notify('加载已上传文件失败，请确认已发布 Firestore 规则。');
    });
  }, []);

  // 上传文件表单
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<UploadCategory>('form');
  const [uploadDepartment, setUploadDepartment] = useState('资讯处 / 电脑科');
  const [uploading, setUploading] = useState(false);

  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'form' | 'regulation' | 'application'>('all');
  const [mobileView, setMobileView] = useState<'list' | 'preview'>('list');

  // AI 智能公文生成表单
  const [showAiDocModal, setShowAiDocModal] = useState(false);
  const [aiPromptTopic, setAiPromptTopic] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);

  const filteredDocs = allDocs.filter((d) => {
    const matchesSearch = d.title.includes(searchTerm) || d.department.includes(searchTerm);
    const matchesCat = categoryFilter === 'all' || d.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleCopyText = () => {
    if (!selectedDoc) return;
    navigator.clipboard.writeText(selectedDoc.contentTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSelectDocMobile = (doc: SchoolDocument) => {
    setSelectedId(doc.id);
    setMobileView('preview');
  };

  const handlePickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const problem = validateUploadFile(file);
    if (problem) {
      notify(problem);
      return;
    }
    setUploadFile(file);
    if (!uploadTitle.trim()) {
      setUploadTitle(file.name.replace(/\.[^.]+$/, ''));
    }
  };

  const closeUploadModal = () => {
    if (uploading) return;
    setShowUploadModal(false);
    setUploadFile(null);
    setUploadTitle('');
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || uploading) return;
    if (!uploadTitle.trim()) {
      notify('请填写文件名称。');
      return;
    }
    setUploading(true);
    try {
      await uploadDocumentFile({
        file: uploadFile,
        title: uploadTitle.trim(),
        category: uploadCategory,
        department: uploadDepartment.trim() || '资讯处 / 电脑科',
        uploadedByEmail: authUser.email,
        uploadedByName: authUser.name,
      });
      notify('文件上传成功。', 'success');
      setUploading(false);
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadTitle('');
    } catch (err) {
      console.error('Upload failed:', err);
      notify(err instanceof Error && err.message.includes('文件') ? err.message : '上传失败：没有权限或网络异常，请确认已发布 Storage 规则。');
      setUploading(false);
    }
  };

  const handleDeleteUploaded = async (doc: SchoolDocument) => {
    if (!window.confirm(`确定要删除「${doc.title}」吗？此操作无法撤销。`)) return;
    try {
      await deleteUploadedDocument(doc);
      notify('文件已删除。', 'success');
    } catch (err) {
      console.error('Delete failed:', err);
      notify('删除失败：没有权限或网络异常。');
    }
  };

  const handleGenerateAiDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPromptTopic || aiGenerating) return;
    setAiGenerating(true);

    try {
      const prompt = `请帮学校信息技术中心或 IT 教研组设计一份规范的「${aiPromptTopic}」。
内容需具备：
1. 文件/表单标题与编号抬头
2. 基本信息填写栏目（申请人/日期/教室/物资）
3. 申请原因与必要性论证
4. 注意事项与安全保密责任条款
5. 逐级审批签名栏（申请人/教研组长/信息中心主管）
请以标准文本表单格式规范排版。`;

      const result = await askGeminiAssistant(prompt, 'it_admin');

      const newDoc: SchoolDocument = {
        id: `doc_${Date.now()}`,
        title: `【AI智能生成】${aiPromptTopic}`,
        category: 'form',
        department: '现代教育技术中心 (AI 协作生成)',
        updatedAt: new Date().toISOString().split('T')[0],
        fileSize: '40 KB',
        isTemplate: true,
        contentTemplate: result,
      };

      onAddDocument(newDoc);
      setSelectedId(newDoc.id);
      setShowAiDocModal(false);
      setAiPromptTopic('');
      setMobileView('preview');
    } catch (err) {
      notify('生成失败，请确认 API 连接。');
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-sky-600" />
            <span>学校公文库与常用表单中心</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            设备借用单 · 故障报修单 · 成绩复核单 · AI 智能起草公文
          </p>
        </div>

        <div className="self-start sm:self-auto flex items-center gap-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Upload className="h-4 w-4" />
            <span>上传文件</span>
          </button>
          <button
            onClick={() => setShowAiDocModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:opacity-95 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Sparkles className="h-4 w-4" />
            <span>AI 智能生成表单模板</span>
          </button>
        </div>
      </div>

      {/* 主工作区 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* 左侧列表 */}
        <div className={`lg:col-span-5 space-y-3 ${mobileView === 'preview' ? 'hidden lg:block' : 'block'}`}>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            {/* 搜索 */}
            <div className="relative">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索表单名称或部门..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* 分类标签 */}
            <div className="flex flex-wrap gap-1.5 text-xs">
              {(['all', 'form', 'regulation', 'application'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    categoryFilter === cat
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'all' && '全部'}
                  {cat === 'form' && '空白表单'}
                  {cat === 'regulation' && '规章手册'}
                  {cat === 'application' && '核定申请'}
                </button>
              ))}
            </div>
          </div>

          {/* 表单条目列表 */}
          <div className="space-y-2 max-h-[500px] lg:max-h-[580px] overflow-y-auto pr-1">
            {filteredDocs.map((doc) => {
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => handleSelectDocMobile(doc)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-sky-50/80 border-sky-400 ring-1 ring-sky-400/50 shadow-sm'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm leading-snug line-clamp-2">
                      {doc.title}
                    </h4>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${
                        doc.category === 'form'
                          ? 'bg-emerald-100 text-emerald-800'
                          : doc.category === 'regulation'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {doc.category === 'form' ? '表单' : doc.category === 'regulation' ? '制度' : '申请'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span>
                      {doc.department}
                      {doc.file && ` · ${getExtension(doc.file.fileName).toUpperCase()}`}
                    </span>
                    <span>{doc.updatedAt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 右侧表单预览与复制 */}
        <div className={`lg:col-span-7 ${mobileView === 'list' ? 'hidden lg:block' : 'block'}`}>
          {!selectedDoc ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center text-sm text-slate-400">
              暂无公文，可使用 AI 生成公文。
            </div>
          ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 flex flex-col h-full">
            {/* 手机端返回按钮 */}
            <div className="lg:hidden mb-3 pb-2 border-b border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setMobileView('list')}
                className="flex items-center gap-1.5 text-xs text-sky-600 font-bold"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>返回表单目录</span>
              </button>
              <span className="text-xs text-slate-400">{selectedDoc.fileSize}</span>
            </div>

            {/* 表头工具条 */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-3 border-b border-slate-200 gap-2.5">
              <div>
                <span className="text-[11px] font-semibold text-sky-600 uppercase tracking-wide">
                  {selectedDoc.department}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">{selectedDoc.title}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  更新日期：{selectedDoc.updatedAt}
                </p>
              </div>

              {selectedDoc.file ? (
                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <a
                    href={selectedDoc.file.downloadUrl}
                    download={selectedDoc.file.fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>下载</span>
                  </a>
                  {(selectedDoc.file.uploadedByEmail === authUser.email.toLowerCase() || authUser.isSuperAdmin) && (
                    <button
                      onClick={() => handleDeleteUploaded(selectedDoc)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-medium transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>删除</span>
                    </button>
                  )}
                </div>
              ) : (
              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <button
                  onClick={handleCopyText}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition"
                  title="复制表单文本"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? '已复制' : '复制内容'}</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition"
                  title="打印表单"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>打印</span>
                </button>
              </div>
              )}
            </div>

            {/* 表单内容 */}
            {selectedDoc.file ? (
              <div className="flex-1 mt-4 space-y-3">
                <div className="p-4 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs text-slate-700 space-y-1">
                  <div className="font-semibold text-slate-900 break-all">{selectedDoc.file.fileName}</div>
                  <div>
                    {getExtension(selectedDoc.file.fileName).toUpperCase()} · {formatBytes(selectedDoc.file.sizeBytes)}
                  </div>
                  <div className="text-slate-500">上传人：{selectedDoc.file.uploadedByName}（{selectedDoc.file.uploadedByEmail}）</div>
                </div>
                {getExtension(selectedDoc.file.fileName) === 'pdf' ? (
                  <iframe
                    src={selectedDoc.file.downloadUrl}
                    title={selectedDoc.title}
                    className="w-full h-[420px] rounded-xl border border-slate-200"
                  />
                ) : (
                  <a
                    href={selectedDoc.file.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-sky-700 hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>该格式不支持在线预览，点击在新窗口打开或下载</span>
                  </a>
                )}
              </div>
            ) : (
            <div className="flex-1 mt-4 p-4 sm:p-5 bg-slate-50/70 border border-slate-200/90 rounded-xl font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed overflow-y-auto max-h-[450px]">
              {selectedDoc.contentTemplate}
            </div>
            )}

            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>* 可直接复制填写后交由相关科室审批</span>
              <span className="text-emerald-600 font-medium">标准格式</span>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* 上传文件模态框 */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
                <Upload className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">上传文件</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              支持 PDF、Word (.doc/.docx)、Excel (.xls/.xlsx)、PowerPoint (.ppt/.pptx)、TXT、CSV、RTF、ODF 文档，单个文件不超过 {formatBytes(MAX_UPLOAD_BYTES)}。
            </p>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">选择文件</label>
                <input
                  type="file"
                  accept={FILE_INPUT_ACCEPT}
                  onChange={handlePickFile}
                  disabled={uploading}
                  className="w-full text-xs file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 file:font-medium hover:file:bg-slate-200"
                />
                {uploadFile && (
                  <p className="text-[11px] text-slate-500 mt-1.5 break-all">
                    已选择：{uploadFile.name}（{formatBytes(uploadFile.size)}）
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">文件名称</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">分类</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as UploadCategory)}
                    className="w-full text-xs sm:text-sm p-2.5 border border-slate-200 rounded-xl bg-white outline-none"
                  >
                    <option value="form">空白表单</option>
                    <option value="regulation">规章手册</option>
                    <option value="application">核定申请</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">所属部门</label>
                  <input
                    type="text"
                    value={uploadDepartment}
                    onChange={(e) => setUploadDepartment(e.target.value)}
                    className="w-full text-xs sm:text-sm p-2.5 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeUploadModal}
                  disabled={uploading}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadFile}
                  className="px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-lg flex items-center gap-1.5"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>{uploading ? '上传中...' : '开始上传'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI 生成公文模态框 */}
      {showAiDocModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Gemini AI 智能公文与表单生成</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              输入您的表单需求，AI 将自动规划标准抬头、审批流签名栏与责任条款。
            </p>

            <form onSubmit={handleGenerateAiDoc} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  请输入表单需求名称或应用场景
                </label>
                <input
                  type="text"
                  required
                  value={aiPromptTopic}
                  onChange={(e) => setAiPromptTopic(e.target.value)}
                  placeholder="例如：「教师笔记本电脑长期借用申请表」或「学生网络账号注销登记单」..."
                  className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAiDocModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={aiGenerating || !aiPromptTopic.trim()}
                  className="px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white rounded-lg flex items-center gap-1.5"
                >
                  {aiGenerating ? <span className="animate-spin">⏳</span> : <Sparkles className="h-3.5 w-3.5" />}
                  <span>{aiGenerating ? 'AI 起草中...' : '立即生成'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
