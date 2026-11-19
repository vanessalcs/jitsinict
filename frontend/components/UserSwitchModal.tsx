import React, { useState } from 'react';
import { X, Check, UserPlus, Shield, User, School, Database, Info } from 'lucide-react';
import { TeacherUser, UserRole } from '../types';

interface UserSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: TeacherUser;
  teachers: TeacherUser[];
  onSelectUser: (user: TeacherUser) => void;
  onAddUser: (user: TeacherUser) => void;
}

export const UserSwitchModal: React.FC<UserSwitchModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  teachers,
  onSelectUser,
  onAddUser,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newTitle, setNewTitle] = useState('IT老师 兼 资讯处助理');
  const [newDept, setNewDept] = useState('信息科技教研组 & 资讯处');
  const [newRole, setNewRole] = useState<UserRole>('it_teacher');

  if (!isOpen) return null;

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const colors = [
      'from-sky-500 to-indigo-600',
      'from-emerald-500 to-teal-600',
      'from-purple-500 to-pink-600',
      'from-amber-500 to-rose-600',
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const created: TeacherUser = {
      id: `u_${Date.now()}`,
      name: newName,
      email: newEmail || `${newName.toLowerCase()}@eduit.edu`,
      role: newRole,
      title: newTitle,
      department: newDept,
      avatarColor: randomColor,
      assignedClasses: ['信息专题班']
    };

    onAddUser(created);
    onSelectUser(created);
    setShowAddForm(false);
    setNewName('');
    setNewEmail('');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-lg shadow-2xl max-h-[92vh] flex flex-col">
        {/* 表头 */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 className="font-bold text-slate-900 text-base">教师与用户账号后端管理中心</h3>
            <p className="text-xs text-slate-500">在黄世泓与林慈贤（IT老师 兼 资讯处助理）之间切换登录</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 本地存储提示 */}
        <div className="my-3 p-3 bg-sky-50 border border-sky-200 rounded-xl text-sky-800 text-xs flex items-start gap-2">
          <Info className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">资讯处协作状态：</span>
            两位老师同时兼任教学（课表、成绩、备课、作业）与资讯处电教运维（机房巡检、设备借用、公告发布），支持自由切换。
          </div>
        </div>

        {/* 教师用户列表 */}
        <div className="flex-1 overflow-y-auto space-y-2 py-2">
          {teachers.map((t) => {
            const isSelected = t.id === currentUser.id;
            return (
              <div
                key={t.id}
                onClick={() => {
                  onSelectUser(t);
                  onClose();
                }}
                className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-sky-50 border-sky-400 ring-1 ring-sky-300'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-tr ${t.avatarColor} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow`}>
                    {t.name.slice(0, 1)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-sm truncate">{t.name}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                        IT老师 兼 资讯处助理
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">{t.department}</div>
                    <div className="text-[11px] text-slate-400 truncate">{t.email}</div>
                  </div>
                </div>

                {isSelected ? (
                  <div className="p-1 bg-sky-600 text-white rounded-full shrink-0">
                    <Check className="h-4 w-4" />
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-slate-400 hover:text-sky-600 shrink-0">
                    选择登录
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* 注册添加教师表单 */}
        <div className="pt-3 border-t border-slate-200">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-sky-500 hover:text-sky-600 text-slate-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <UserPlus className="h-4 w-4" />
              <span>添加其他助理或教师档案</span>
            </button>
          ) : (
            <form onSubmit={handleCreateUser} className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h4 className="font-bold text-xs text-slate-800">建立新教师 / 管理员个人档案</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">姓名</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="姓名"
                    className="w-full text-xs p-2 border rounded-lg bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">身份权限</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full text-xs p-2 border rounded-lg bg-white outline-none"
                  >
                    <option value="it_teacher">IT 教学权限</option>
                    <option value="it_admin">资讯处运维权限</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">部门</label>
                  <input
                    type="text"
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full text-xs p-2 border rounded-lg bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">职务头衔</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full text-xs p-2 border rounded-lg bg-white outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-lg"
                >
                  确认建立并登录
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
