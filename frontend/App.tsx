import React, { useState, useEffect } from 'react';
import { 
  UserRole, 
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
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { TeachingJournal } from './components/TeachingJournal';
import { ResourceHub } from './components/ResourceHub';
import { GradeManager } from './components/GradeManager';
import { Timetable } from './components/Timetable';
import { DocumentCenter } from './components/DocumentCenter';
import { SchoolCalendar } from './components/SchoolCalendar';
import { AnnouncementCenter } from './components/AnnouncementCenter';
import { GeminiAssistantModal } from './components/GeminiAssistantModal';
import { UserSwitchModal } from './components/UserSwitchModal';

export const App: React.FC = () => {
  // 当前活动标签页 (默认 dashboard，支持切换到 journal 教学日志)
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // 多教师用户后端模拟状态（黄世泓 / 林慈贤）
  const [teachers, setTeachers] = useState<TeacherUser[]>(() => {
    const saved = localStorage.getItem('eduit_teachers_v5');
    return saved ? JSON.parse(saved) : initialTeachers;
  });

  const [currentUser, setCurrentUser] = useState<TeacherUser>(() => {
    const savedId = localStorage.getItem('eduit_current_user_id_v5');
    const matched = teachers.find(t => t.id === savedId);
    return matched || teachers[0];
  });

  // 教室教学日志状态 (每堂课记录与周记，查阅上周教了什么)
  const [journals, setJournals] = useState<TeachingJournalEntry[]>(() => {
    const saved = localStorage.getItem('eduit_teaching_journals_v5');
    return saved ? JSON.parse(saved) : initialTeachingJournals;
  });

  // 共享资源库
  const [resources, setResources] = useState<TeachingResource[]>(() => {
    const saved = localStorage.getItem('eduit_resources_v5');
    return saved ? JSON.parse(saved) : initialTeachingResources;
  });

  // 抽屉与弹窗状态
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // 成绩与作业
  const [grades, setGrades] = useState<StudentGrade[]>(() => {
    const saved = localStorage.getItem('eduit_grades_v5');
    return saved ? JSON.parse(saved) : initialGrades;
  });

  const [homeworkList, setHomeworkList] = useState<HomeworkSubmission[]>(() => {
    const saved = localStorage.getItem('eduit_homework_v5');
    return saved ? JSON.parse(saved) : initialHomework;
  });

  const [timetable, setTimetable] = useState<TimetableSlot[]>(() => {
    const saved = localStorage.getItem('eduit_timetable_v5');
    return saved ? JSON.parse(saved) : initialTimetable;
  });

  const [documents, setDocuments] = useState<SchoolDocument[]>(() => {
    const saved = localStorage.getItem('eduit_documents_v5');
    return saved ? JSON.parse(saved) : initialDocuments;
  });

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('eduit_calendar_v5');
    return saved ? JSON.parse(saved) : initialCalendarEvents;
  });

  const [announcements, setAnnouncements] = useState<SchoolAnnouncement[]>(() => {
    const saved = localStorage.getItem('eduit_announcements_v5');
    return saved ? JSON.parse(saved) : initialAnnouncements;
  });

  // Gemini 智能助理弹窗
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiModalPrompt, setAiModalPrompt] = useState('');

  // 状态自动同步至 localStorage
  useEffect(() => {
    localStorage.setItem('eduit_teachers_v5', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('eduit_current_user_id_v5', currentUser.id);
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('eduit_teaching_journals_v5', JSON.stringify(journals));
  }, [journals]);

  useEffect(() => {
    localStorage.setItem('eduit_resources_v5', JSON.stringify(resources));
  }, [resources]);

  useEffect(() => {
    localStorage.setItem('eduit_grades_v5', JSON.stringify(grades));
  }, [grades]);

  useEffect(() => {
    localStorage.setItem('eduit_homework_v5', JSON.stringify(homeworkList));
  }, [homeworkList]);

  useEffect(() => {
    localStorage.setItem('eduit_timetable_v5', JSON.stringify(timetable));
  }, [timetable]);

  useEffect(() => {
    localStorage.setItem('eduit_documents_v5', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('eduit_calendar_v5', JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  useEffect(() => {
    localStorage.setItem('eduit_announcements_v5', JSON.stringify(announcements));
  }, [announcements]);

  const handleOpenAiWithPrompt = (prompt: string) => {
    setAiModalPrompt(prompt);
    setIsAiModalOpen(true);
  };

  // 教学日志处理
  const handleAddJournal = (entry: TeachingJournalEntry) => {
    setJournals((prev) => [entry, ...prev]);
  };

  // 资源库处理
  const handleAddResource = (newRes: TeachingResource) => {
    setResources((prev) => [newRes, ...prev]);
  };

  const handleIncrementDownload = (id: string) => {
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, downloadCount: r.downloadCount + 1 } : r))
    );
  };

  // 教师列表处理
  const handleAddTeacher = (newTeacher: TeacherUser) => {
    setTeachers((prev) => [...prev, newTeacher]);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      {/* 响应式侧边栏 */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        currentUser={currentUser}
        onOpenUserModal={() => setIsUserModalOpen(true)}
        onOpenAiModal={() => {
          setAiModalPrompt('');
          setIsAiModalOpen(true);
        }}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* 主界面内容区 */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full min-w-0">
        <Header
          currentUser={currentUser}
          onOpenAi={() => {
            setAiModalPrompt('');
            setIsAiModalOpen(true);
          }}
          onOpenMenu={() => setIsMobileMenuOpen(true)}
          onOpenUserModal={() => setIsUserModalOpen(true)}
        />

        {/* 滚动工作区 */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <Dashboard
              role={currentUser.role}
              onNavigate={setCurrentTab}
              timetable={timetable}
              announcements={announcements}
              onOpenAiWithPrompt={handleOpenAiWithPrompt}
            />
          )}

          {currentTab === 'journal' && (
            <TeachingJournal
              journals={journals}
              currentUser={currentUser}
              onAddJournal={handleAddJournal}
            />
          )}

          {currentTab === 'resources' && (
            <ResourceHub
              resources={resources}
              currentUser={currentUser}
              teachers={teachers}
              onAddResource={handleAddResource}
              onIncrementDownload={handleIncrementDownload}
            />
          )}

          {currentTab === 'grades' && (
            <GradeManager
              grades={grades}
              onUpdateGrade={(updated) => setGrades(prev => prev.map(g => g.id === updated.id ? updated : g))}
              onAddGrade={(newGrade) => setGrades(prev => [newGrade, ...prev])}
              homeworkList={homeworkList}
              onAddHomework={(newHw) => setHomeworkList(prev => [newHw, ...prev])}
            />
          )}

          {currentTab === 'timetable' && (
            <Timetable
              slots={timetable}
              onAddSlot={(slot) => setTimetable(prev => [...prev, slot])}
            />
          )}

          {currentTab === 'documents' && (
            <DocumentCenter
              documents={documents}
              onAddDocument={(doc) => setDocuments(prev => [doc, ...prev])}
            />
          )}

          {currentTab === 'calendar' && (
            <SchoolCalendar
              events={calendarEvents}
              onAddEvent={(evt) => setCalendarEvents(prev => [...prev, evt])}
            />
          )}

          {currentTab === 'announcements' && (
            <AnnouncementCenter
              announcements={announcements}
              onAddAnnouncement={(ann) => setAnnouncements(prev => [ann, ...prev])}
              role={currentUser.role}
            />
          )}
        </main>
      </div>

      {/* 教师切换与后端档案管理弹窗 */}
      <UserSwitchModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        currentUser={currentUser}
        teachers={teachers}
        onSelectUser={setCurrentUser}
        onAddUser={handleAddTeacher}
      />

      {/* Gemini AI 智能助手弹窗 */}
      <GeminiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        role={currentUser.role}
        initialPrompt={aiModalPrompt}
      />
    </div>
  );
};

export default App;
