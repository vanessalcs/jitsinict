import React, { useState } from 'react';
import { 
  BellRing, 
  Plus, 
  Pin, 
  Sparkles, 
  Calendar, 
  User, 
} from 'lucide-react';
import { SchoolAnnouncement, UserRole } from '../types';
import { notify } from '../utils/toast';
import { generateAnnouncementDraft } from '../services/geminiService';

interface AnnouncementCenterProps {
  announcements: SchoolAnnouncement[];
  onAddAnnouncement: (ann: SchoolAnnouncement) => void;
  role: UserRole;
}

export const AnnouncementCenter: React.FC<AnnouncementCenterProps> = ({
  announcements,
  onAddAnnouncement,
  role,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('黄世泓');
  const [newType, setNewType] = useState<SchoolAnnouncement['type']>('facility');
  const [newContent, setNewContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [aiPolishing, setAiPolishing] = useState(false);

  const handleAiDraft = async () => {
    if (!newTitle) {
      notify('请先输入公告标题或核心主题，再让 AI 扩写与润色！');
      return;
    }
    setAiPolishing(true);
    try {
      const draft = await generateAnnouncementDraft(newTitle, newContent || '请包含设备影响范围与使用提醒');
      setNewTitle(draft.title);
      setNewContent(draft.content);
    } catch (e) {
      notify('AI 润色发生异常，请稍后重试。');
    } finally {
      setAiPolishing(false);
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    const newAnn: SchoolAnnouncement = {
      id: `ann_${Date.now()}`,
      title: newTitle,
      author: newAuthor,
      role: 'IT老师 兼 资讯处助理',
      date: new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date()),
      pinned: isPinned,
      type: newType,
      content: newContent,
      readCount: 1,
    };

    onAddAnnouncement(newAnn);
    setShowModal(false);
    setNewTitle('');
    setNewContent('');
    setIsPinned(false);
  };

  const badgeStyle = (type: SchoolAnnouncement['type']) => {
    switch (type) {
      case 'urgent':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'facility':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'teaching':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 头部标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <BellRing className="h-5 w-5 sm:h-6 sm:w-6 text-sky-600" />
            <span>全校资讯处与信息教学通知中心</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            由 IT老师 兼 资讯处助理（黄世泓、林慈贤）统一发布微机室运维、教学赛事与教务通报
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus className="h-4 w-4" />
          <span>发布新公告</span>
        </button>
      </div>

      {/* 公告列表 */}
      <div className="space-y-3 sm:space-y-4">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className={`p-4 sm:p-5 rounded-2xl border bg-white shadow-sm transition ${
              ann.pinned ? 'border-sky-300 ring-1 ring-sky-200/60' : 'border-slate-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                {ann.pinned && (
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                    <Pin className="h-3 w-3" />
                    <span>置顶</span>
                  </span>
                )}
                <span className={`text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeStyle(ann.type)}`}>
                  {ann.type === 'facility' && '设施运维'}
                  {ann.type === 'teaching' && '教学竞赛'}
                  {ann.type === 'urgent' && '紧急排障'}
                  {ann.type === 'general' && '常规公告'}
                </span>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">{ann.title}</h3>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Calendar className="h-3.5 w-3.5" />
                <span>{ann.date}</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed mb-3">
              {ann.content}
            </p>

            <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>发布人：{ann.author} ({ann.role})</span>
              </div>
              <span>已浏览 {ann.readCount} 次</span>
            </div>
          </div>
        ))}
      </div>

      {/* 发布公告模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <h3 className="text-base font-bold text-slate-900">发布全校通知公告</h3>
              <button
                type="button"
                onClick={handleAiDraft}
                disabled={aiPolishing}
                className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 text-xs font-semibold transition"
              >
                <Sparkles className="h-3.5 w-3.5 text-sky-500" />
                <span>{aiPolishing ? 'AI 润色中...' : 'Gemini 智能撰写/润色'}</span>
              </button>
            </div>

            <form onSubmit={handlePublish} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">公告标题</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="例如: 【通知】第一微机室 Windows 安全补丁升级维护"
                  className="w-full text-xs sm:text-sm p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">发布人 (IT老师兼资讯处助理)</label>
                  <select
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-none bg-white font-medium"
                  >
                    <option value="黄世泓">黄世泓 (IT老师兼资讯处助理)</option>
                    <option value="林慈贤">林慈贤 (IT老师兼资讯处助理)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">通知类别</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as SchoolAnnouncement['type'])}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-none bg-white"
                  >
                    <option value="facility">设施运维与网络</option>
                    <option value="teaching">教学课程与赛事</option>
                    <option value="urgent">紧急排障通报</option>
                    <option value="general">一般校务通知</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="rounded text-sky-600 focus:ring-sky-500 h-4 w-4"
                  />
                  <span>在首页置顶展示</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">公告详细内容</label>
                <textarea
                  rows={5}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="输入详细事由、影响时段、注意事项与技术联络电话..."
                  className="w-full text-xs sm:text-sm p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-lg"
                >
                  确认发布
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
