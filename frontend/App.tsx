import React, { useEffect, useMemo, useState } from 'react';
import {
  AuthorizedUser,
  StudentGrade,
  HomeworkSubmission,
  TimetableSlot,
  SchoolDocument,
  CalendarEvent,
  SchoolAnnouncement,
  TeacherUser,
  TeachingResource,
  TeachingJournalEntry
} from './types';
import {
  initialGrades,
  initialHomework,
  initialTimetable,
  initialDocuments,
  initialCalendarEvents,
  initialAnnouncements,
  initialTeachers,
  initialTeachingResources,
  initialTeachingJournals
} from './data/initialData';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { TeachingJournal } from './components/TeachingJournal';
import { DepartmentRecords } from './components/DepartmentRecords';
import { BudgetPage } from './components/BudgetPage';
import { ResourceHub } from './components/ResourceHub';
import { GradeManager } from './components/GradeManager';
import { Timetable } from './components/Timetable';
import { DocumentCenter } from './components/DocumentCenter';
import { SchoolCalendar } from './components/SchoolCalendar';
import { AnnouncementCenter } from './components/AnnouncementCenter';
import { ManageAccess } from './components/ManageAccess';
import { FileManager } from './components/FileManager';
import { GeminiAssistantModal } from './components/GeminiAssistantModal';

interface AppProps {
  /** 已通过 Firestore 授权校验的登录成员 */
  authUser: AuthorizedUser;
  onLogout: () => void;
  onRefreshAuthUser: (user: AuthorizedUser) => void;
}

export const App: React.FC<AppProps> = ({ authUser, onLogout, onRefreshAuthUser }) => {
  // 当前活动标签页 (默认 dashboard，支持切换到 journal 教学日志)
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // 多教师档案（黄世泓 / 林慈贤），用于教学日志、资源库等署名与任教班级
  const [teachers, setTeachers] = useLocalStorage<TeacherUser[]>('eduit_teachers_v5', initialTeachers);

  // 把内置档案（邮箱、职称等）同步进已保存的名单：同 id 的以内置为准，缺少的补上，用户自行添加的保留
  useEffect(() => {
    setTeachers((prev) => {
      const builtIn = new Map(initialTeachers.map((t) => [t.id, t]));
      const merged = prev.map((t) => builtIn.get(t.id) ?? t);
      const missing = initialTeachers.filter((t) => !prev.some((p) => p.id === t.id));
      const next = [...merged, ...missing];
      return JSON.stringify(next) === JSON.stringify(prev) ? prev : next;
    });
  }, [setTeachers]);

  // 登录成员对应的教师档案（名单内没有同邮箱档案时，按授权信息即时生成）
  const authAsTeacher = useMemo<TeacherUser>(
    () =>
      teachers.find((t) => t.email.toLowerCase() === authUser.email.toLowerCase()) ?? {
        id: `auth_${authUser.email}`,
        name: authUser.name,
        email: authUser.email,
        role: authUser.isSuperAdmin ? 'it_admin' : 'it_teacher',
        title: authUser.title,
        department: authUser.department,
        avatarColor: authUser.avatarColor,
        assignedClasses: []
      },
    [teachers, authUser]
  );

  const currentUser: TeacherUser = authAsTeacher;

  // 业务数据（自动持久化到 localStorage）
  const [journals, setJournals] = useLocalStorage<TeachingJournalEntry[]>('eduit_teaching_journals_v5', initialTeachingJournals);
  const [resources, setResources] = useLocalStorage<TeachingResource[]>('eduit_resources_v5', initialTeachingResources);
  const [grades, setGrades] = useLocalStorage<StudentGrade[]>('eduit_grades_v5', initialGrades);
  const [homeworkList, setHomeworkList] = useLocalStorage<HomeworkSubmission[]>('eduit_homework_v5', initialHomework);
  const [timetable, setTimetable] = useLocalStorage<TimetableSlot[]>('eduit_timetable_v5', initialTimetable);
  const [documents, setDocuments] = useLocalStorage<SchoolDocument[]>('eduit_documents_v5', initialDocuments);
  const [calendarEvents, setCalendarEvents] = useLocalStorage<CalendarEvent[]>('eduit_calendar_v6', initialCalendarEvents);
  const [announcements, setAnnouncements] = useLocalStorage<SchoolAnnouncement[]>('eduit_announcements_v5', initialAnnouncements);

  // 抽屉与弹窗状态
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // 平板/桌面宽度下左侧菜单是否收起为图标栏（记住上次选择）
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage<boolean>('eduit_sidebar_collapsed_v1', false);

  // Gemini 智能助理弹窗
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiModalPrompt, setAiModalPrompt] = useState('');

  const openAi = (prompt = '') => {
    setAiModalPrompt(prompt);
    setIsAiModalOpen(true);
  };

  // 资源库处理
  const handleIncrementDownload = (id: string) => {
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, downloadCount: r.downloadCount + 1 } : r))
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      {/* 响应式侧边栏 */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        currentUser={currentUser}
        isSuperAdmin={authUser.isSuperAdmin}
        onOpenAiModal={() => openAi()}
        onLogout={onLogout}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        collapsed={sidebarCollapsed}
      />

      {/* 主界面内容区 */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full min-w-0">
        <Header
          currentUser={currentUser}
          onOpenAi={() => openAi()}
          onOpenMenu={() => setIsMobileMenuOpen(true)}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
        />

        {/* 滚动工作区 */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <Dashboard
              role={currentUser.role}
              onNavigate={setCurrentTab}
              timetable={timetable}
              announcements={announcements}
              onOpenAiWithPrompt={openAi}
            />
          )}

          {currentTab === 'journal' && (
            <TeachingJournal
              journals={journals}
              currentUser={currentUser}
              onAddJournal={(entry) => setJournals((prev) => [entry, ...prev])}
            />
          )}

          {currentTab === 'resources' && (
            <ResourceHub
              resources={resources}
              authUser={authUser}
              currentUser={currentUser}
              teachers={teachers}
              onAddResource={(res) => setResources((prev) => [res, ...prev])}
              onIncrementDownload={handleIncrementDownload}
            />
          )}

          {currentTab === 'grades' && (
            <GradeManager
              grades={grades}
              onUpdateGrade={(updated) => setGrades((prev) => prev.map((g) => (g.id === updated.id ? updated : g)))}
              onAddGrade={(newGrade) => setGrades((prev) => [newGrade, ...prev])}
              homeworkList={homeworkList}
              onAddHomework={(newHw) => setHomeworkList((prev) => [newHw, ...prev])}
            />
          )}

          {currentTab === 'timetable' && (
            <Timetable
              slots={timetable}
              onAddSlot={(slot) => setTimetable((prev) => [...prev, slot])}
            />
          )}

          {currentTab === 'documents' && (
            <DocumentCenter
              documents={documents}
              onAddDocument={(doc) => setDocuments((prev) => [doc, ...prev])}
              authUser={authUser}
            />
          )}

          {currentTab === 'calendar' && (
            <SchoolCalendar
              events={calendarEvents}
              onAddEvent={(evt) => setCalendarEvents((prev) => [...prev, evt])}
            />
          )}

          {currentTab === 'announcements' && (
            <AnnouncementCenter
              announcements={announcements}
              onAddAnnouncement={(ann) => setAnnouncements((prev) => [ann, ...prev])}
              role={currentUser.role}
            />
          )}

          {currentTab === 'records' && <DepartmentRecords authUser={authUser} />}

          {currentTab === 'budget' && <BudgetPage />}

          {currentTab === 'files' && authUser.isSuperAdmin && <FileManager />}

          {currentTab === 'access' && authUser.isSuperAdmin && (
            <ManageAccess currentUser={authUser} onRefreshCurrentUser={onRefreshAuthUser} />
          )}
        </main>
      </div>

      {/* Gemini AI 智能助手弹窗 */}
      <GeminiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        role={currentUser.role}
        userName={currentUser.name}
        localData={{
          timetable,
          calendarEvents,
          announcements,
          journals,
          homework: homeworkList,
          resources,
          documents,
        }}
        initialPrompt={aiModalPrompt}
      />
    </div>
  );
};

export default App;
