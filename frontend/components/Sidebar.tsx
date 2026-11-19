import React from 'react';
import { 
  LayoutDashboard, 
  GraduationCap, 
  CalendarDays, 
  FileText, 
  BellRing, 
  Clock, 
  Bot, 
  BookMarked,
  BookOpenCheck,
  X,
  Users,
  Monitor,
  ShieldCheck,
  LogIn
} from 'lucide-react';
import { AuthorizedUser } from '../types';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  currentUser: AuthorizedUser;
  onOpenGoogleSignIn: () => void;
  onOpenAiModal: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  onOpenGoogleSignIn,
  onOpenAiModal,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'dashboard', label: '工作台总览', icon: LayoutDashboard },
    { id: 'journal', label: '教室教学日志', icon: BookOpenCheck },
    { id: 'resources', label: '教材·试卷·课件库', icon: BookMarked },
    { id: 'grades', label: '学生成绩与作业', icon: GraduationCap },
    { id: 'timetable', label: '电脑室周课表与维修', icon: Clock },
    { id: 'documents', label: '公文与空白表单', icon: FileText },
    { id: 'calendar', label: '2027年行事历', icon: CalendarDays },
    { id: 'announcements', label: '校园通知公告', icon: BellRing },
  ];

  // 仅当 isSuperAdmin === true 时才显示管理 10 人成员访问权限选项
  if (currentUser.isSuperAdmin) {
    navItems.push({
      id: 'manage_access',
      label: '管理10人成员权限',
      icon: ShieldCheck
    });
  }

  const handleSelectTab = (id: string) => {
    onTabChange(id);
    onCloseMobile();
  };

  return (
    <>
      {/* 移动端/平板遮罩 */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          aria-label="关闭侧边栏"
        />
      )}

      {/* 侧边栏主体 */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-72 sm:w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0 border-r border-slate-800 transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* 品牌标识：资讯处 / 电脑科 */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 shrink-0">
              <Monitor className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-bold text-white text-base tracking-wide flex items-center gap-1.5">
                资讯处 / 电脑科
              </h1>
              <p className="text-xs text-sky-400 font-medium">教学与电教管理中心</p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 当前登录教职员（Google 认证卡片） */}
        <div className="p-3.5 mx-3 my-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400">Google 认证账号</span>
            <button
              onClick={onOpenGoogleSignIn}
              className="text-xs text-sky-400 hover:text-sky-300 font-medium underline underline-offset-2 transition flex items-center gap-1"
            >
              <LogIn className="h-3 w-3" />
              <span>切换</span>
            </button>
          </div>
          <div className="flex items-center gap-2.5">
            <div className={`h-8 w-8 rounded-lg bg-gradient-to-tr ${currentUser.avatarColor} flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm`}>
              {currentUser.name.slice(0, 1)}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate flex items-center gap-1">
                <span>{currentUser.name}</span>
                {currentUser.isSuperAdmin && (
                  <span className="text-[9px] bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 px-1 rounded">
                    Admin
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-300 truncate font-mono">
                {currentUser.email}
              </div>
            </div>
          </div>
        </div>

        {/* 导航菜单列表 */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pt-2 pb-1 text-xs font-semibold text-slate-400 tracking-wider uppercase">
            功能菜单
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            const isManage = item.id === 'manage_access';

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 sm:py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? isManage 
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-bold'
                      : 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                    : isManage
                    ? 'text-indigo-300 hover:bg-slate-800 hover:text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : isManage ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Gemini AI 助手调用按钮 */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => {
              onOpenAiModal();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 text-white font-medium text-sm shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all active:scale-[0.98]"
          >
            <Bot className="h-5 w-5 text-sky-200 animate-pulse" />
            <span>Gemini AI 助手</span>
          </button>
          <p className="text-[11px] text-center text-slate-400 mt-2">
            教学日志备课 · 试卷课件 · 维修排障
          </p>
        </div>
      </aside>
    </>
  );
};
