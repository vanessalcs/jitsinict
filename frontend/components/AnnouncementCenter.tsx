import React, { useState } from 'react';
import { 
  BellRing, 
  Plus, 
  Pin, 
  Sparkles, 
  Calendar, 
  User, 
  MessageSquare, 
  Send, 
  Trash2, 
  Edit3, 
  ShieldAlert,
  Lock
} from 'lucide-react';
import { SchoolAnnouncement, AuthorizedUser, AnnouncementComment } from '../types';
import { generateAnnouncementDraft } from '../services/geminiService';

interface AnnouncementCenterProps {
  announcements: SchoolAnnouncement[];
  onAddAnnouncement: (ann: SchoolAnnouncement) => void;
  onUpdateAnnouncement: (ann: SchoolAnnouncement) => void;
  onDeleteAnnouncement: (id: string) => void;
  currentUser: AuthorizedUser;
}

export const AnnouncementCenter: React.FC<AnnouncementCenterProps> = ({
  announcements,
  onAddAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
  currentUser,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // 表单状态
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<SchoolAnnouncement['type']>('facility');
  const [newContent, setNewContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [aiPolishing, setAiPolishing] = useState(false);

  // 展开评论列表 ID 集合
  const [expandedCommentIds, setExpandedCommentIds] = useState<Record<string, boolean>>({});
  // 评论输入框文本
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const toggleComments = (id: string) => {
    setExpandedCommentIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAiDraft = async () => {
    if (!newTitle) {
      alert('请先输入公告标题或核心主题，再让 AI 扩写与润色！');
      return;
    }
    setAiPolishing(true);
    try {
      const draft = await generateAnnouncementDraft(newTitle, newContent || '请包含设备影响范围与使用提醒');
      setNewTitle(draft.title);
      setNewContent(draft.content);
    } catch {
      alert('AI 润色发生异常，请稍后重试。');
    } finally {
      setAiPolishing(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setNewTitle('');
    setNewContent('');
    setIsPinned(false);
    setNewType('facility');
    setShowModal(true);
  };

  const handleOpenEditModal = (ann: SchoolAnnouncement) => {
    setEditingId(ann.id);
    setNewTitle(ann.title);
    setNewContent(ann.content);
    setIsPinned(ann.pinned);
    setNewType(ann.type);
    setShowModal(true);
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    if (!currentUser.canPostAnnouncements) {
      alert('操作被拒绝：您没有发布/编辑公告的权限 (canPostAnnouncements: false)！');
      return;
    }

    if (editingId) {
      const original = announcements.find(a => a.id === editingId);
      if (original) {
        onUpdateAnnouncement({
          ...original,
          title: newTitle,
          content: newContent,
          pinned: isPinned,
          type: newType,
        });
      }
    } else {
      const newAnn: SchoolAnnouncement = {
        id: `ann_${Date.now()}`,
        title: newTitle,
        author: currentUser.name,
        authorEmail: currentUser.email.toLowerCase(),
        role: currentUser.title,
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
        comments: []
      };
      onAddAnnouncement(newAnn);
    }

    setShowModal(false);
    setNewTitle('');
    setNewContent('');
    setIsPinned(false);
  };

  // 发表评论：遵循 canComment == true && request.resource.data.authorEmail == userEmail()
  const handleAddComment = (announcementId: string) => {
    const text = commentInputs[announcementId]?.trim();
    if (!text) return;

    if (!currentUser.canComment) {
      alert('操作被拒绝：您没有发表评论的权限 (canComment: false)！');
      return;
    }

    const targetAnn = announcements.find(a => a.id === announcementId);
    if (!targetAnn) return;

    const newComment: AnnouncementComment = {
      id: `cm_${Date.now()}`,
      announcementId,
      authorEmail: currentUser.email.toLowerCase(),
      authorName: currentUser.name,
      content: text,
      createdAt: new Intl.DateTimeFormat('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date())
    };

    const updatedAnn: SchoolAnnouncement = {
      ...targetAnn,
      comments: [...(targetAnn.comments || []), newComment]
    };

    onUpdateAnnouncement(updatedAnn);
    setCommentInputs(prev => ({ ...prev, [announcementId]: '' }));
    setExpandedCommentIds(prev => ({ ...prev, [announcementId]: true }));
  };

  // 删除评论：遵循 resource.data.authorEmail == userEmail() || isSuperAdmin == true
  const handleDeleteComment = (announcementId: string, commentId: string, commentAuthorEmail: string) => {
    const isOwner = commentAuthorEmail.toLowerCase() === currentUser.email.toLowerCase();
    if (!isOwner && !currentUser.isSuperAdmin) {
      alert('操作被拒绝：您只能删除自己发表的评论，或由超级管理员处理！');
      return;
    }

    const targetAnn = announcements.find(a => a.id === announcementId);
    if (!targetAnn) return;

    const updatedAnn: SchoolAnnouncement = {
      ...targetAnn,
      comments: (targetAnn.comments || []).filter(c => c.id !== commentId)
    };

    onUpdateAnnouncement(updatedAnn);
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
      {/* 头部标题与发帖按钮权限受控 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <BellRing className="h-5 w-5 sm:h-6 sm:w-6 text-sky-600" />
            <span>全校资讯处与信息教学通知中心</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            当前身份：<span className="font-semibold text-slate-800">{currentUser.name}</span> ({currentUser.email}) · 
            发帖权限：{currentUser.canPostAnnouncements ? <span className="text-emerald-600 font-bold">已授权</span> : <span className="text-slate-400">仅浏览</span>} · 
            评论权限：{currentUser.canComment ? <span className="text-emerald-600 font-bold">已授权</span> : <span className="text-slate-400">不可评论</span>}
          </p>
        </div>

        {/* 仅当 canPostAnnouncements 为 true 时才渲染 "+ 发布新公告" 按钮 */}
        {currentUser.canPostAnnouncements && (
          <button
            onClick={handleOpenCreateModal}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>+ 发布新公告</span>
          </button>
        )}
      </div>

      {/* 公告列表 */}
      <div className="space-y-3 sm:space-y-4">
        {announcements.map((ann) => {
          const comments = ann.comments || [];
          const isExpanded = !!expandedCommentIds[ann.id];

          return (
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

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{ann.date}</span>
                  </div>

                  {/* 仅当 canPostAnnouncements 为 true 时才显示编辑与删除按钮 */}
                  {currentUser.canPostAnnouncements && (
                    <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                      <button
                        onClick={() => handleOpenEditModal(ann)}
                        className="p-1 text-slate-400 hover:text-sky-600 rounded transition"
                        title="编辑公告"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`确定要删除公告「${ann.title}」吗？`)) {
                            onDeleteAnnouncement(ann.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                        title="删除公告"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed mb-3">
                {ann.content}
              </p>

              {/* 底部信息栏与评论折叠按钮 */}
              <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  <span>发布人：{ann.author} ({ann.role})</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleComments(ann.id)}
                    className="flex items-center gap-1 text-sky-700 hover:text-sky-800 font-semibold transition"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>讨论与评论 ({comments.length})</span>
                  </button>
                  <span>已浏览 {ann.readCount} 次</span>
                </div>
              </div>

              {/* 评论区区域 */}
              {isExpanded && (
                <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-3 bg-slate-50/70 p-3.5 rounded-xl">
                  <div className="text-xs font-bold text-slate-700">教职员讨论记录：</div>

                  {comments.length === 0 ? (
                    <div className="text-xs text-slate-400 py-1">暂无评论记录。</div>
                  ) : (
                    <div className="space-y-2">
                      {comments.map((cm) => {
                        const canDelete = cm.authorEmail.toLowerCase() === currentUser.email.toLowerCase() || currentUser.isSuperAdmin;

                        return (
                          <div key={cm.id} className="p-2.5 bg-white rounded-lg border border-slate-200/80 text-xs flex justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-bold text-slate-800">{cm.authorName}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{cm.authorEmail}</span>
                                <span className="text-[10px] text-slate-400">· {cm.createdAt}</span>
                              </div>
                              <div className="text-slate-700 leading-relaxed">{cm.content}</div>
                            </div>

                            {/* 仅限评论作者或超级管理员可删除 */}
                            {canDelete && (
                              <button
                                onClick={() => handleDeleteComment(ann.id, cm.id, cm.authorEmail)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded transition self-start"
                                title="删除该评论"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 仅当 canComment 为 true 时才渲染评论输入框 */}
                  {currentUser.canComment ? (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={commentInputs[ann.id] || ''}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [ann.id]: e.target.value })}
                        placeholder="撰写你的回复或技术跟进..."
                        className="flex-1 text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddComment(ann.id);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleAddComment(ann.id)}
                        className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <Send className="h-3 w-3" />
                        <span>评论</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-2 bg-slate-100 rounded-lg text-[11px] text-slate-500 flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-slate-400" />
                      <span>您当前账号未开启评论权限 (canComment: false)</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 发布/编辑公告模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingId ? '编辑公告内容' : '发布全新校园公告'}
              </h3>
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
                  placeholder="例如: 【通知】Lab A 电脑室 Windows 安全补丁升级维护"
                  className="w-full text-xs sm:text-sm p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">通知类别</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-none bg-white"
                  >
                    <option value="facility">设施运维与网络</option>
                    <option value="teaching">教学课程与赛事</option>
                    <option value="urgent">紧急排障通报</option>
                    <option value="general">一般校务通知</option>
                  </select>
                </div>
                <div className="flex items-center sm:pt-5">
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
                  {editingId ? '保存更改' : '确认发布'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
