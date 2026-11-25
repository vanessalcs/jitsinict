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
  ClipboardList,
  Wallet,
  ChevronDown,
  ChevronRight,
  X,
  Monitor,
  ShieldCheck,
  HardDrive,
  LogOut
} from 'lucide-react';
import { TeacherUser } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  currentUser: TeacherUser;
  isSuperAdmin: boolean;
  onOpenAiModal: () => void;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  /** 平板/桌面宽度下是否收起为图标栏（手机抽屉不受影响） */
  collapsed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  isSuperAdmin,
  onOpenAiModal,
  onLogout,
  isOpenMobile,
  onCloseMobile,
  collapsed,
}) => {
  // 仅在 lg 及以上生效的「收起」样式
  const hideWhenCollapsed = collapsed ? 'lg:hidden' : '';

  // 已收起的分组（电脑科 / 资讯处），记住上次的选择
  const [closedGroups, setClosedGroups] = useLocalStorage<string[]>('eduit_sidebar_closed_groups_v1', []);
  const toggleGroup = (label: string) =>
    setClosedGroups((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]));
  type NavItem = { id: string; label: string; icon: React.ComponentType<{ className?: string }> };
  type NavEntry = { kind: 'item'; item: NavItem } | { kind: 'group'; label: string; items: NavItem[] };

  const navEntries: NavEntry[] = [
    { kind: 'item', item: { id: 'dashboard', label: '工作台总览', icon: LayoutDashboard } },
    { kind: 'item', item: { id: 'calendar', label: '2027年行事历', icon: CalendarDays } },
    { kind: 'item', item: { id: 'announcements', label: '校园通知公告', icon: BellRing } },
    { kind: 'item', item: { id: 'timetable', label: '电脑室周课表与维修', icon: Clock } },
    { kind: 'item', item: { id: 'documents', label: '公文与空白表单', icon: FileText } },
    {
      kind: 'group',
      label: '电脑科',
      items: [
        { id: 'journal', label: '教室教学日志', icon: BookOpenCheck },
        { id: 'resources', label: '教材·试卷·课件库', icon: BookMarked },
        { id: 'grades', label: '学生成绩与作业', icon: GraduationCap },
      ],
    },
    {
      kind: 'group',
      label: '资讯处',
      items: [
        { id: 'records', label: '资讯处事项记录', icon: ClipboardList },
        { id: 'budget', label: '资讯处预算', icon: Wallet },
      ],
    },
    ...(isSuperAdmin
      ? ([
          { kind: 'item', item: { id: 'files', label: '文件管理后台', icon: HardDrive } },
          { kind: 'item', item: { id: 'access', label: '成员权限管理', icon: ShieldCheck } },
        ] as NavEntry[])
      : []),
  ];

  const handleSelectTab = (id: string) => {
    onTabChange(id);
    onCloseMobile();
  };

  // topLevel：不属于任何分组的项目，用粗体与分组内的项目区分
  const renderNavButton = (item: NavItem, topLevel = false) => {
    const Icon = item.icon;
    const isActive = currentTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => handleSelectTab(item.id)}
        title={collapsed ? item.label : undefined}
        className={`w-full flex items-center gap-3 px-3.5 py-2.5 sm:py-3 rounded-xl text-sm ${topLevel ? 'font-bold' : 'font-medium'} transition-all ${
          collapsed ? 'lg:justify-center lg:px-0' : ''
        } ${
          isActive
            ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
        <span className={hideWhenCollapsed}>{item.label}</span>
      </button>
    );
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
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-72 sm:w-64 ${collapsed ? 'lg:w-[4.5rem]' : ''} bg-slate-900 text-slate-200 flex flex-col shrink-0 border-r border-slate-800 transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* 品牌标识：资讯处 / 电脑科 */}
        <div className={`p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between ${collapsed ? 'lg:justify-center lg:px-2' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 shrink-0">
              <Monitor className="h-6 w-6" />
            </div>
            <div className={hideWhenCollapsed}>
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

        {/* 当前登录教师卡片 */}
        <div className={`p-3.5 mx-3 my-3 bg-slate-800/80 rounded-xl border border-slate-700/60 ${collapsed ? 'lg:mx-2 lg:p-2' : ''}`}>
          <div className={`text-xs mb-2 ${hideWhenCollapsed}`}>
            <span className="text-slate-400">当前教职员</span>
          </div>
          <div className={`flex items-center gap-2.5 ${collapsed ? 'lg:justify-center' : ''}`} title={collapsed ? `${currentUser.name}（${currentUser.title}）` : undefined}>
            <div className={`h-8 w-8 rounded-lg bg-gradient-to-tr ${currentUser.avatarColor} flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm`}>
              {currentUser.name.slice(0, 1)}
            </div>
            <div className={`min-w-0 ${hideWhenCollapsed}`}>
              <div className="text-sm font-semibold text-white truncate">
                {currentUser.name}
              </div>
              <div className="text-xs text-slate-300 truncate font-medium">
                {currentUser.title}
              </div>
            </div>
          </div>
        </div>

        {/* 导航菜单列表 */}
        <nav className={`flex-1 px-3 space-y-1 overflow-y-auto ${collapsed ? 'lg:px-2' : ''}`}>
          <div className={`px-3 pt-2 pb-1 text-xs font-semibold text-slate-400 tracking-wider uppercase ${hideWhenCollapsed}`}>
            功能菜单
          </div>
          {navEntries.map((entry) =>
            entry.kind === 'item' ? (
              renderNavButton(entry.item, true)
            ) : (
              <div key={entry.label} className="pt-2 pb-1 space-y-1">
                {/* 分组标题：带箭头，点击可收起/展开（图标栏模式下改为一条细分隔线） */}
                <button
                  onClick={() => toggleGroup(entry.label)}
                  aria-expanded={!closedGroups.includes(entry.label)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-bold text-sky-400 tracking-wider hover:bg-slate-800 transition ${hideWhenCollapsed}`}
                >
                  <span>{entry.label}</span>
                  {closedGroups.includes(entry.label) ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                {collapsed && <div className="hidden lg:block mx-2 my-1 border-t border-slate-700" />}
                {/* 收起时隐藏项目；图标栏模式下始终显示图标 */}
                <div
                  className={`space-y-1 ${
                    closedGroups.includes(entry.label) ? (collapsed ? 'hidden lg:block' : 'hidden') : ''
                  }`}
                >
                  {entry.items.map((it) => renderNavButton(it))}
                </div>
              </div>
            )
          )}
        </nav>

        {/* Gemini AI 助手调用按钮 */}
        <div className={`p-4 border-t border-slate-800 ${collapsed ? 'lg:p-2' : ''}`}>
          <button
            onClick={() => {
              onOpenAiModal();
              onCloseMobile();
            }}
            title={collapsed ? 'Gemini AI 助手' : undefined}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 text-white font-medium text-sm shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all active:scale-[0.98] ${collapsed ? 'lg:px-0' : ''}`}
          >
            <Bot className="h-5 w-5 text-sky-200 animate-pulse shrink-0" />
            <span className={hideWhenCollapsed}>Gemini AI 助手</span>
          </button>
          <p className={`text-[11px] text-center text-slate-400 mt-2 ${hideWhenCollapsed}`}>
            教学日志备课 · 试卷课件 · 维修排障
          </p>
          <button
            onClick={onLogout}
            title={collapsed ? '退出登录' : undefined}
            className={`w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition ${collapsed ? 'lg:px-0' : ''}`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className={hideWhenCollapsed}>退出登录</span>
          </button>
        </div>
      </aside>
    </>
  );
};
