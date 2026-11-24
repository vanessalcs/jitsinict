import React from 'react';
import { Sparkles, Calendar, Menu, Database, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { TeacherUser } from '../types';

interface HeaderProps {
  currentUser: TeacherUser;
  onOpenAi: () => void;
  onOpenMenu: () => void;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onOpenAi, onOpenMenu, sidebarCollapsed, onToggleSidebar }) => {
  const now = new Date();
  const weekdayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const formattedDate = `${now.getMonth() + 1}月${now.getDate()}日 ${weekdayNames[now.getDay()]}`;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm shrink-0">
      {/* 左侧区域：汉堡菜单按钮、格式化星期日期与资讯处终端状态 */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <button
          onClick={onOpenMenu}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
          aria-label="打开导航菜单"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* 平板/桌面：收起或展开左侧菜单 */}
        <button
          onClick={onToggleSidebar}
          className="hidden lg:inline-flex p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
          aria-label={sidebarCollapsed ? '展开左侧菜单' : '收起左侧菜单'}
          title={sidebarCollapsed ? '展开左侧菜单' : '收起左侧菜单'}
        >
          {sidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600 text-xs sm:text-sm truncate">
          <Calendar className="h-4 w-4 text-sky-600 shrink-0" />
          <span className="font-semibold text-slate-800">{formattedDate}</span>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="bg-sky-50 text-sky-700 font-medium px-2 py-0.5 rounded-full text-xs hidden md:inline">
            资讯处 / 电脑科
          </span>
          <div className="hidden xl:flex items-center gap-1 text-[11px] text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
            <Database className="h-3 w-3 text-emerald-500" />
            <span>机房管理与教研系统在线</span>
          </div>
        </div>
      </div>

      {/* 右侧区域：AI 呼出入口与当前用户卡片 */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={onOpenAi}
          className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-semibold transition"
        >
          <Sparkles className="h-3.5 w-3.5 text-sky-500 animate-pulse" />
          <span className="hidden xs:inline">Gemini 助手</span>
          <span className="xs:hidden">AI</span>
        </button>

        {/* 当前登录用户 */}
        <div className="flex items-center gap-2 sm:pl-3 sm:border-l sm:border-slate-200 text-left">
          <div className={`h-8 w-8 rounded-full bg-gradient-to-tr ${currentUser.avatarColor} flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0`}>
            {currentUser.name.slice(0, 1)}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1">
              <span>{currentUser.name}</span>
            </div>
            <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
              {currentUser.title}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
