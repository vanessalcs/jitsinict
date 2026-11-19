import React, { useState } from 'react';
import { 
  Users, 
  Shield, 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  Plus, 
  Edit3, 
  Check, 
  X, 
  BellRing, 
  MessageSquare, 
  FileText, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { AuthorizedUser } from '../types';
import { getAuthorizedUsersList, saveAuthorizedUsersList } from '../services/authService';

interface ManageAccessProps {
  currentUser: AuthorizedUser;
  onRefreshCurrentUser: (user: AuthorizedUser) => void;
}

// 报告权限字典
const AVAILABLE_REPORTS = [
  { id: 'lab_maintenance', label: '电脑室设备故障运维检修报告' },
  { id: 'grade_summary', label: '学生学期成绩总评汇总报告' },
  { id: 'equipment_inventory', label: '全校电教设备与微机终端资产盘点' },
  { id: 'lab_utilization', label: '电脑室上机率与课时利用率统计' }
];

export const ManageAccess: React.FC<ManageAccessProps> = ({
  currentUser,
  onRefreshCurrentUser,
}) => {
  const [users, setUsers] = useState<AuthorizedUser[]>(() => getAuthorizedUsersList());
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<AuthorizedUser>>({});

  // 新增成员表单
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newTitle, setNewTitle] = useState('IT老师 / 资讯处助理');
  const [newDept, setNewDept] = useState('资讯处 / 电脑科');
  const [newIsAdmin, setNewIsAdmin] = useState(false);
  const [newCanPost, setNewCanPost] = useState(false);
  const [newCanComment, setNewCanComment] = useState(true);
  const [newReports, setNewReports] = useState<string[]>(['grade_summary']);

  // 保存到本地
  const persistUsers = (updated: AuthorizedUser[]) => {
    setUsers(updated);
    saveAuthorizedUsersList(updated);
    // 若更新的是当前用户，同步更新当前登录信息
    const currentUpdated = updated.find(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
    if (currentUpdated) {
      onRefreshCurrentUser(currentUpdated);
    }
  };

  const handleToggleActive = (email: string) => {
    const updated = users.map(u => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return { ...u, isActive: !u.isActive };
      }
      return u;
    });
    persistUsers(updated);
  };

  const handleToggleSuperAdmin = (email: string) => {
    const updated = users.map(u => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return { ...u, isSuperAdmin: !u.isSuperAdmin };
      }
      return u;
    });
    persistUsers(updated);
  };

  const handleToggleCanPost = (email: string) => {
    const updated = users.map(u => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return { ...u, canPostAnnouncements: !u.canPostAnnouncements };
      }
      return u;
    });
    persistUsers(updated);
  };

  const handleToggleCanComment = (email: string) => {
    const updated = users.map(u => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return { ...u, canComment: !u.canComment };
      }
      return u;
    });
    persistUsers(updated);
  };

  const handleStartEdit = (user: AuthorizedUser) => {
    setEditingEmail(user.email);
    setEditDraft({ ...user });
  };

  const handleSaveEdit = (email: string) => {
    const updated = users.map(u => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return {
          ...u,
          name: editDraft.name ?? u.name,
          title: editDraft.title ?? u.title,
          department: editDraft.department ?? u.department,
          allowedReports: editDraft.allowedReports ?? u.allowedReports
        };
      }
      return u;
    });
    persistUsers(updated);
    setEditingEmail(null);
  };

  const handleToggleReportPermission = (reportId: string) => {
    const currentAllowed = editDraft.allowedReports || [];
    if (currentAllowed.includes(reportId)) {
      setEditDraft({
        ...editDraft,
        allowedReports: currentAllowed.filter(id => id !== reportId)
      });
    } else {
      setEditDraft({
        ...editDraft,
        allowedReports: [...currentAllowed, reportId]
      });
    }
  };

  const handleCreateNewStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newEmail.trim().toLowerCase();
    if (!cleanEmail || !newName.trim()) {
      alert('请填写完整的邮箱与姓名！');
      return;
    }

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      alert('此邮箱已在名单中！');
      return;
    }

    const colors = [
      'from-sky-500 to-indigo-600',
      'from-emerald-500 to-teal-600',
      'from-amber-500 to-orange-600',
      'from-purple-500 to-pink-600',
      'from-rose-500 to-red-600',
      'from-cyan-500 to-blue-600'
    ];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const created: AuthorizedUser = {
      email: cleanEmail,
      name: newName.trim(),
      title: newTitle.trim(),
      department: newDept.trim(),
      avatarColor,
      isActive: true,
      isSuperAdmin: newIsAdmin,
      canPostAnnouncements: newCanPost,
      canComment: newCanComment,
      allowedReports: newReports
    };

    persistUsers([created, ...users]);
    setShowAddModal(false);
    setNewEmail('');
    setNewName('');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 头部标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
              <span>10 人成员团队权限管理 (Manage 10-Member Access)</span>
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold border border-indigo-200">
              超级管理员专享
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            严格根据 Firestore 安全规则配置教职员账号激活状态 (isActive)、公告发布 (canPostAnnouncements)、评论权限 (canComment) 与报表准入 (allowedReports)
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus className="h-4 w-4" />
          <span>添加新成员档案</span>
        </button>
      </div>

      {/* 规则机制与配额提示 */}
      <div className="p-3.5 bg-gradient-to-r from-indigo-50 via-sky-50 to-slate-50 rounded-2xl border border-indigo-100 flex items-start gap-3 text-xs text-slate-700">
        <Info className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold text-slate-900">安全规则生效机制：</span>
          未激活成员或非名单内 Google 账号登录时将立刻被阻断并提示 <span className="font-mono font-bold text-rose-600">Access Denied: Authorized 10-Member Portal Only.</span> 当前在册人数：<b>{users.length}</b> / 10 位。
        </div>
      </div>

      {/* 成员权限控制大表格 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="p-3.5">教职员姓名 / 职称</th>
                <th className="p-3.5">Google 邮箱 (小写)</th>
                <th className="p-3.5 text-center">账号激活 (isActive)</th>
                <th className="p-3.5 text-center">发公告 (canPost)</th>
                <th className="p-3.5 text-center">发评论 (canComment)</th>
                <th className="p-3.5 text-center">超管 (isSuperAdmin)</th>
                <th className="p-3.5">允许查看的报表权限 (allowedReports)</th>
                <th className="p-3.5 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const isEditing = editingEmail === u.email;

                return (
                  <tr key={u.email} className="hover:bg-slate-50/70 transition">
                    {/* 姓名与职称 */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`h-8 w-8 rounded-full bg-gradient-to-tr ${u.avatarColor} text-white font-bold text-xs flex items-center justify-center shrink-0`}>
                          {u.name.slice(0, 1)}
                        </div>
                        <div>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editDraft.name}
                              onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                              className="p-1 border rounded text-xs font-bold w-24 bg-white"
                            />
                          ) : (
                            <div className="font-bold text-slate-900 text-sm">{u.name}</div>
                          )}
                          <div className="text-[11px] text-slate-400">{u.title} · {u.department}</div>
                        </div>
                      </div>
                    </td>

                    {/* 邮箱 (统一小写) */}
                    <td className="p-3.5 font-mono text-xs text-slate-600">
                      {u.email}
                    </td>

                    {/* isActive 状态开关 */}
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleToggleActive(u.email)}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold transition ${
                          u.isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                        title="点击切换启用/停用"
                      >
                        {u.isActive ? '已激活' : '已停用'}
                      </button>
                    </td>

                    {/* canPostAnnouncements 开关 */}
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleToggleCanPost(u.email)}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold transition ${
                          u.canPostAnnouncements
                            ? 'bg-sky-100 text-sky-800 hover:bg-sky-200'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                        title="点击切换是否允许发布公告"
                      >
                        {u.canPostAnnouncements ? '允许发公告' : '仅浏览'}
                      </button>
                    </td>

                    {/* canComment 开关 */}
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleToggleCanComment(u.email)}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold transition ${
                          u.canComment
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                        title="点击切换是否允许在公告下评论"
                      >
                        {u.canComment ? '允许评论' : '禁止评论'}
                      </button>
                    </td>

                    {/* isSuperAdmin 开关 */}
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleToggleSuperAdmin(u.email)}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold transition ${
                          u.isSuperAdmin
                            ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                        title="点击切换超级管理员权限"
                      >
                        {u.isSuperAdmin ? '超级管理员' : '普通成员'}
                      </button>
                    </td>

                    {/* allowedReports 报表权限标签 */}
                    <td className="p-3.5 max-w-xs">
                      {isEditing ? (
                        <div className="space-y-1 bg-slate-50 p-2 rounded-xl border border-slate-200">
                          {AVAILABLE_REPORTS.map((r) => {
                            const isChecked = (editDraft.allowedReports || []).includes(r.id);
                            return (
                              <label key={r.id} className="flex items-center gap-1.5 cursor-pointer text-[11px]">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleReportPermission(r.id)}
                                  className="rounded text-indigo-600 h-3.5 w-3.5"
                                />
                                <span>{r.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {u.allowedReports.length === 0 ? (
                            <span className="text-slate-400 text-[11px]">无报表权限</span>
                          ) : (
                            u.allowedReports.map((rid) => {
                              const found = AVAILABLE_REPORTS.find(r => r.id === rid);
                              return (
                                <span key={rid} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">
                                  {found ? found.label.slice(0, 6) : rid}
                                </span>
                              );
                            })
                          )}
                        </div>
                      )}
                    </td>

                    {/* 编辑与保存 */}
                    <td className="p-3.5 text-right whitespace-nowrap">
                      {isEditing ? (
                        <button
                          onClick={() => handleSaveEdit(u.email)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-xs inline-flex items-center gap-1 shadow-sm"
                        >
                          <Check className="h-3 w-3" />
                          <span>保存</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(u)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium inline-flex items-center gap-1 transition"
                        >
                          <Edit3 className="h-3 w-3 text-slate-500" />
                          <span>配置</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 模态框：添加新成员档案 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-lg shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-base font-bold text-slate-900">登记新的 10 人成员门户账号</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewStaff} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Google 邮箱地址 (系统将自动转为小写储存)
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="例如: teacher.name@eduit.edu"
                  className="w-full text-xs sm:text-sm p-2.5 border rounded-xl outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">姓名</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="例如: 周立明"
                    className="w-full text-xs sm:text-sm p-2.5 border rounded-xl outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">职务职称</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full text-xs sm:text-sm p-2.5 border rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">所属科室/教研组</label>
                <input
                  type="text"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full text-xs p-2.5 border rounded-xl outline-none"
                />
              </div>

              <div className="p-3 bg-slate-50 border rounded-xl space-y-2 text-xs">
                <div className="font-bold text-slate-700">基础权限设定：</div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsAdmin}
                    onChange={(e) => setNewIsAdmin(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span>设为超级管理员 (isSuperAdmin)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newCanPost}
                    onChange={(e) => setNewCanPost(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span>允许发布/修改/删除公告 (canPostAnnouncements)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newCanComment}
                    onChange={(e) => setNewCanComment(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span>允许在公告下发表评论 (canComment)</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">报表准入权限 (allowedReports)</label>
                <div className="space-y-1.5 p-3 bg-slate-50 border rounded-xl text-xs">
                  {AVAILABLE_REPORTS.map((r) => (
                    <label key={r.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newReports.includes(r.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewReports([...newReports, r.id]);
                          } else {
                            setNewReports(newReports.filter(id => id !== r.id));
                          }
                        }}
                        className="rounded text-indigo-600"
                      />
                      <span>{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm"
                >
                  确认录入名单
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
