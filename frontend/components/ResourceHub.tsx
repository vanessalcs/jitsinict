import React, { useEffect, useMemo, useState } from 'react';
import { 
  BookOpen, 
  FileText, 
  Presentation, 
  FileCode, 
  Download, 
  Plus, 
  Search, 
  User, 
  Sparkles, 
  Eye, 
  Check, 
  BookMarked,
  Trash2
} from 'lucide-react';
import { AuthorizedUser, TeachingResource, ResourceType, TeacherUser, SchoolSubject } from '../types';
import { notify } from '../utils/toast';
import { askGeminiAssistant } from '../services/geminiService';
import { FILE_INPUT_ACCEPT, MAX_UPLOAD_BYTES, formatBytes, validateUploadFile } from '../services/documentFiles';
import {
  deleteUploadedResource,
  incrementResourceDownload,
  subscribeUploadedResources,
  uploadResourceFile,
} from '../services/resourceFiles';

interface ResourceHubProps {
  resources: TeachingResource[];
  authUser: AuthorizedUser;
  currentUser: TeacherUser;
  teachers: TeacherUser[];
  onAddResource: (newRes: TeachingResource) => void;
  onIncrementDownload: (id: string) => void;
}

export const ResourceHub: React.FC<ResourceHubProps> = ({
  resources: localResources,
  authUser,
  currentUser,
  teachers,
  onAddResource,
  onIncrementDownload
}) => {
  // 已上传的真实文件资源（Firebase，实时共享）与本地资源合并显示
  const [uploadedResources, setUploadedResources] = useState<TeachingResource[]>([]);
  const resources = useMemo(() => [...uploadedResources, ...localResources], [uploadedResources, localResources]);

  useEffect(() => {
    return subscribeUploadedResources(setUploadedResources, (err) => {
      console.error('Failed to load uploaded resources:', err);
      notify('加载共享资源失败，请确认已发布 Firestore 规则。');
    });
  }, []);

  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // 预览模态框
  const [previewResource, setPreviewResource] = useState<TeachingResource | null>(null);
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);

  // 上传分享表单
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState<ResourceType>('powerpoint');
  const [uploadGrade, setUploadGrade] = useState<TeachingResource['gradeLevel']>('初一');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadTags, setUploadTags] = useState('教材, 课件');
  const [uploadOutline, setUploadOutline] = useState('');

  // AI 智能出卷/课件表单
  const [showAiGenModal, setShowAiGenModal] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiTargetType, setAiTargetType] = useState<ResourceType>('exam_paper');
  const [aiTargetGrade, setAiTargetGrade] = useState<'初一' | '初二' | '高一' | '高二'>('初一');
  const [aiLoading, setAiLoading] = useState(false);

  // 资源筛选过滤
  const filteredResources = resources.filter((res) => {
    const matchesType = selectedType === 'all' || res.type === selectedType;
    const matchesGrade = selectedGrade === 'all' || res.gradeLevel === selectedGrade;
    const matchesTeacher = selectedTeacher === 'all' || res.authorTeacherId === selectedTeacher;
    const matchesSearch = 
      res.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.authorTeacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())) ||
      res.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesType && matchesGrade && matchesTeacher && matchesSearch;
  });

  const handleDownload = (res: TeachingResource) => {
    setDownloadSuccessId(res.id);
    setTimeout(() => setDownloadSuccessId(null), 2500);

    // 真实上传的文件：直接下载原文件，并在共享记录上累加下载次数
    if (res.file) {
      incrementResourceDownload(res.id).catch((err) => console.error('Failed to count download:', err));
      const a = document.createElement('a');
      a.href = res.file.downloadUrl;
      a.download = res.file.fileName;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.click();
      return;
    }

    onIncrementDownload(res.id);

    const content = `【EduIT Hub 教师教学资源库下载回执】\n文件名：${res.title}\n格式：${res.fileFormat} (${res.fileSize})\n分享教师：${res.authorTeacherName} (${res.authorDepartment})\n适用年级：${res.gradeLevel}\n更新日期：${res.uploadedAt}\n\n简介说明：\n${res.description}\n\n=========================\n资源大纲 / 试卷题目预览：\n=========================\n${res.contentOutline || '（无附加文本大纲，已下载模拟课件数据包）'}`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${res.title.replace(/[\/\\?%*:|"<>]/g, '_')}.${res.fileFormat.toLowerCase() === 'pptx' ? 'pptx.txt' : 'txt'}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteResource = async (res: TeachingResource) => {
    if (!window.confirm(`确定要删除「${res.title}」吗？此操作无法撤销。`)) return;
    try {
      await deleteUploadedResource(res);
      if (previewResource?.id === res.id) setPreviewResource(null);
      notify('已删除。', 'success');
    } catch (err) {
      console.error('Delete resource failed:', err);
      notify('删除失败：没有权限或网络异常。');
    }
  };

  // 初中年级对应「电脑资讯与工艺」，其余（高中/全校通用）对应「资讯科技」
  const subjectForGrade = (grade: TeachingResource['gradeLevel']): SchoolSubject =>
    grade.startsWith('初') ? '电脑资讯与工艺' : '资讯科技';

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
    if (!uploadTitle.trim()) setUploadTitle(file.name.replace(/\.[^.]+$/, ''));
  };

  const closeUploadModal = () => {
    if (uploading) return;
    setShowUploadModal(false);
    setUploadFile(null);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploading) return;
    if (!uploadTitle.trim()) return;
    if (!uploadFile) {
      notify('请先选择要上传的文件。');
      return;
    }

    setUploading(true);
    try {
      await uploadResourceFile({
        file: uploadFile,
        uploadedByEmail: authUser.email,
        resource: {
          title: uploadTitle.trim(),
          subjectCategory: subjectForGrade(uploadGrade),
          type: uploadType,
          gradeLevel: uploadGrade,
          authorTeacherId: currentUser.id,
          authorTeacherName: currentUser.name,
          authorDepartment: currentUser.department,
          description: uploadDesc || '教师上传之日常教学核心资源。',
          contentOutline: uploadOutline,
          tags: uploadTags.split(',').map((t) => t.trim()).filter(Boolean),
        },
      });
      notify('资源上传成功。', 'success');
      setUploading(false);
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadTitle('');
      setUploadDesc('');
      setUploadOutline('');
    } catch (err) {
      console.error('Resource upload failed:', err);
      notify(err instanceof Error && err.message.includes('文件') ? err.message : '上传失败：没有权限或网络异常，请确认已发布 Firestore 与 Storage 规则。');
      setUploading(false);
    }
  };

  const handleGenerateWithAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim() || aiLoading) return;
    setAiLoading(true);

    try {
      const typeLabel = 
        aiTargetType === 'exam_paper' ? '阶段测试模拟试卷（包含单选题、填空题、编程实操题与标准答案详解）'
        : aiTargetType === 'powerpoint' ? '课堂教学 PPT 完整页面脚本大纲（包含每页核心知识点、生动案例、互动提问与课后练习）'
        : '单元重点归纳与课后复习讲义';

      const prompt = `你是一位资深的中学信息科技（IT）学科带头人。请为【${aiTargetGrade}】年级编写一份主题为「${aiTopic}」的${typeLabel}。
要求：
1. 结构完整、内容详实、符合现代信息科技课标。
2. 给出具体题目与解析，或完整的 PPT 页面逐页设计。
3. 全文采用规范严谨的简体中文。`;

      const aiResult = await askGeminiAssistant(prompt, 'it_teacher');

      const format: TeachingResource['fileFormat'] = 
        aiTargetType === 'powerpoint' ? 'PPTX' : (aiTargetType === 'exam_paper' ? 'PDF' : 'DOCX');

      const aiRes: TeachingResource = {
        id: `res_ai_${Date.now()}`,
        title: `【AI教研产出】${aiTopic} - ${aiTargetGrade}专用`,
        subjectCategory: subjectForGrade(aiTargetGrade),
        type: aiTargetType,
        gradeLevel: aiTargetGrade,
        authorTeacherId: currentUser.id,
        authorTeacherName: `${currentUser.name} (Gemini AI协作)`,
        authorDepartment: currentUser.department,
        uploadedAt: new Date().toISOString().split('T')[0],
        fileFormat: format,
        fileSize: '3.6 MB',
        downloadCount: 1,
        description: `使用 Gemini 2.5 Flash 依据中学生信息科技大纲自动生成的 ${aiTopic} 教学资源。`,
        contentOutline: aiResult,
        tags: ['AI生成', aiTopic.split(' ')[0], aiTargetGrade, '即时可用']
      };

      onAddResource(aiRes);
      setShowAiGenModal(false);
      setPreviewResource(aiRes);
      setAiTopic('');
    } catch (err: any) {
      notify('AI 资源生成失败，请检查网络连接。');
    } finally {
      setAiLoading(false);
    }
  };

  const getTypeIcon = (type: ResourceType) => {
    switch (type) {
      case 'powerpoint':
        return <Presentation className="h-4 w-4 text-amber-500" />;
      case 'exam_paper':
        return <FileText className="h-4 w-4 text-rose-500" />;
      case 'textbook':
        return <BookOpen className="h-4 w-4 text-sky-500" />;
      case 'lab_project':
        return <FileCode className="h-4 w-4 text-emerald-500" />;
    }
  };

  const getTypeBadge = (type: ResourceType) => {
    switch (type) {
      case 'powerpoint':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'exam_paper':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'textbook':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'lab_project':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const getTypeLabel = (type: ResourceType) => {
    switch (type) {
      case 'powerpoint': return '教学课件 PPT';
      case 'exam_paper': return '阶段与期末试卷';
      case 'textbook': return '教材与复习讲义';
      case 'lab_project': return '实训工程源码';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 顶部标题与快捷操作 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <BookMarked className="h-5 w-5 sm:h-6 sm:w-6 text-sky-600" />
              <span>全校教师共享教材·试卷·课件库</span>
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold hidden md:inline">
              多教师跨学科协作
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            收录全校 IT 授课教师上传的教材讲义、阶段考真题试卷、课件 PPT 与实践工程代码
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAiGenModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:opacity-95 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Sparkles className="h-4 w-4 text-sky-200 animate-pulse" />
            <span>AI 一键生成试卷/PPT</span>
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Plus className="h-4 w-4" />
            <span>上传分享新资源</span>
          </button>
        </div>
      </div>

      {/* 搜索与筛选工具条 */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        {/* 搜索输入 */}
        <div className="relative">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索资源标题、关键词（如 Python、Blender、试卷）、或授课教师姓名..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 transition"
          />
        </div>

        {/* 筛选网格 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
          {/* 种类 */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">资源类型</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium text-slate-700"
            >
              <option value="all">全部类型 ({resources.length})</option>
              <option value="powerpoint">教学课件 PPT</option>
              <option value="exam_paper">阶段与期末试卷</option>
              <option value="textbook">教材与复习讲义</option>
              <option value="lab_project">实训工程源码</option>
            </select>
          </div>

          {/* 年级 */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">适用年级</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium text-slate-700"
            >
              <option value="all">全年级通用</option>
              <option value="初一">初一</option>
              <option value="初二">初二</option>
              <option value="高一">高一</option>
              <option value="高二">高二</option>
              <option value="高三">高三</option>
              <option value="全校通用">全校竞赛</option>
            </select>
          </div>

          {/* 提供教师 */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">提供教师</label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium text-slate-700"
            >
              <option value="all">全体任课教师</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.title.split('组长')[0].slice(0, 4)})</option>
              ))}
            </select>
          </div>

          {/* 重置 */}
          <div className="flex flex-col justify-end">
            <button
              onClick={() => {
                setSelectedType('all');
                setSelectedGrade('all');
                setSelectedTeacher('all');
                setSearchTerm('');
              }}
              className="w-full p-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              重置筛选 ({filteredResources.length} 项)
            </button>
          </div>
        </div>
      </div>

      {/* 资源卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {filteredResources.map((res) => {
          return (
            <div
              key={res.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                {/* 标签与年级 */}
                <div className="flex items-center justify-between gap-1.5 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${getTypeBadge(res.type)}`}>
                      {getTypeIcon(res.type)}
                      <span>{getTypeLabel(res.type)}</span>
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {res.gradeLevel}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-slate-400 font-medium">
                    {res.fileFormat} · {res.fileSize}
                  </span>
                </div>

                {/* 标题 */}
                <h3 
                  onClick={() => setPreviewResource(res)}
                  className="font-bold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-sky-600 transition cursor-pointer line-clamp-2"
                >
                  {res.title}
                </h3>

                {/* 描述 */}
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                  {res.description}
                </p>

                {/* 标签列表 */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {res.tags.map((tag, idx) => (
                    <span key={idx} className="text-[10px] bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded border border-slate-100">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* 底部信息与动作 */}
              <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-500 min-w-0 pr-2">
                  <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate font-medium">{res.authorTeacherName}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setPreviewResource(res)}
                    className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition"
                    title="在线预览大纲"
                  >
                    <Eye className="h-4 w-4" />
                  </button>

                  {res.file && (res.file.uploadedByEmail === authUser.email.toLowerCase() || authUser.isSuperAdmin) && (
                    <button
                      onClick={() => handleDeleteResource(res)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="删除该上传文件"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDownload(res)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold rounded-lg transition border border-sky-200 text-xs"
                    title="下载教案资料包"
                  >
                    {downloadSuccessId === res.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-700">已取件</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-3.5 w-3.5" />
                        <span>下载 ({res.downloadCount})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <BookOpen className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">查无符合条件的教材资源</p>
          <p className="text-xs text-slate-400 mt-1">请尝试清除关键词或切换年级与类型筛选条件</p>
        </div>
      )}

      {/* 模态框 1：资源大纲在线预览 */}
      {previewResource && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getTypeBadge(previewResource.type)}`}>
                    {getTypeLabel(previewResource.type)}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {previewResource.gradeLevel} · {previewResource.fileFormat} ({previewResource.fileSize})
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">{previewResource.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  上传教师：{previewResource.authorTeacherName} ({previewResource.authorDepartment}) · 上传于 {previewResource.uploadedAt}
                </p>
              </div>

              <button
                onClick={() => setPreviewResource(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">资源简介</h4>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl leading-relaxed">
                  {previewResource.description}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    试卷题型 / 课件 PPT 页面大纲预览
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">共 {previewResource.downloadCount} 次引用</span>
                </div>
                <pre className="text-xs font-mono text-slate-800 bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-72">
                  {previewResource.contentOutline || '（该文件为标准课件包，请点击下方下载获取完整资料）'}
                </pre>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-400">已同步至校级教研数据库</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewResource(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  关闭
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(previewResource)}
                  className="px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="h-4 w-4" />
                  <span>下载文件包</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 模态框 2：上传教学资源 */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-lg shadow-2xl max-h-[92vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-1">上传分享教学资源至校库</h3>
            <p className="text-xs text-slate-500 mb-4">
              当前登录身份：<span className="font-bold text-sky-700">{currentUser.name}</span> ({currentUser.title})
            </p>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">资源名称与标题</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="例如: 【阶段试卷】高二物联网传感器实训考卷 A/B 卷"
                  className="w-full text-xs sm:text-sm p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">资源类型</label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as ResourceType)}
                    className="w-full text-xs p-2.5 border rounded-xl outline-none bg-white"
                  >
                    <option value="powerpoint">教学课件 PPT</option>
                    <option value="exam_paper">阶段与期末试卷</option>
                    <option value="textbook">教材与复习讲义</option>
                    <option value="lab_project">实训工程源码</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">适用年级</label>
                  <select
                    value={uploadGrade}
                    onChange={(e) => setUploadGrade(e.target.value as TeachingResource['gradeLevel'])}
                    className="w-full text-xs p-2.5 border rounded-xl outline-none bg-white"
                  >
                    <option value="初一">初一</option>
                    <option value="初二">初二</option>
                    <option value="高一">高一</option>
                    <option value="高二">高二</option>
                    <option value="高三">高三</option>
                    <option value="全校通用">全校通用</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  选择文件（PDF / Word / Excel / PowerPoint 等文档，不超过 {formatBytes(MAX_UPLOAD_BYTES)}）
                </label>
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
                <label className="block text-xs font-medium text-slate-600 mb-1">检索标签（以逗号分隔）</label>
                <input
                  type="text"
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                  placeholder="例如: Python, 循环, 测评"
                  className="w-full text-xs p-2.5 border rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">资源简要说明</label>
                <textarea
                  rows={2}
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  placeholder="简述教学重难点与建议授课学时..."
                  className="w-full text-xs p-2.5 border rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">大纲文本 / 试卷题目摘要预览</label>
                <textarea
                  rows={4}
                  value={uploadOutline}
                  onChange={(e) => setUploadOutline(e.target.value)}
                  placeholder="输入 PPT 页面提纲、核心试题摘要，方便其他教师免下载即刻在线预览..."
                  className="w-full text-xs font-mono p-2.5 border rounded-xl outline-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeUploadModal}
                  disabled={uploading}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadFile}
                  className="px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white rounded-xl"
                >
                  {uploading ? '上传中...' : '确认上传校库'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 模态框 3：Gemini AI 一键生成试卷/课件 */}
      {showAiGenModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-lg shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Gemini AI 智能教案与试卷生成器</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              输入教学主题，AI 将自动规划标准试卷题组、课堂 PPT 详细大纲或讲义，并同步存入全校资源库。
            </p>

            <form onSubmit={handleGenerateWithAi} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">教学主题或测试考点</label>
                <input
                  type="text"
                  required
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="例如：「Python 列表与字典期中综合题组」或「校园网络安全意识课件PPT」..."
                  className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">生成资源形式</label>
                  <select
                    value={aiTargetType}
                    onChange={(e) => setAiTargetType(e.target.value as ResourceType)}
                    className="w-full text-xs p-2.5 border rounded-xl outline-none bg-white"
                  >
                    <option value="exam_paper">阶段考与模拟试卷 (含详解)</option>
                    <option value="powerpoint">课堂教学课件 PPT 详细脚本</option>
                    <option value="textbook">教材单元重点复习讲义</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">目标年级</label>
                  <select
                    value={aiTargetGrade}
                    onChange={(e) => setAiTargetGrade(e.target.value as typeof aiTargetGrade)}
                    className="w-full text-xs p-2.5 border rounded-xl outline-none bg-white"
                  >
                    <option value="初一">初一</option>
                    <option value="初二">初二</option>
                    <option value="高一">高一</option>
                    <option value="高二">高二</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAiGenModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={aiLoading || !aiTopic.trim()}
                  className="px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  {aiLoading ? <span className="animate-spin">⏳</span> : <Sparkles className="h-4 w-4" />}
                  <span>{aiLoading ? 'Gemini 智能生成中...' : '生成并入库'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
