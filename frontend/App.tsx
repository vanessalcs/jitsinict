import React, { useState, useEffect } from 'react';
import { 
  StudentGrade, 
  HomeworkSubmission, 
  TimetableSlot, 
  SchoolDocument, 
  CalendarEvent, 
  SchoolAnnouncement,
  TeachingResource,
  TeachingJournalEntry,
  AuthorizedUser
} from './types';
import { 
  initialGrades, 
  initialHomework, 
  initialTimetable, 
  initialDocuments, 
  initialCalendarEvents, 
  initialAnnouncements,
  initialTeachingResources,
  initialTeachingJournals
} from './data/initialData';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut, 
  getFirestore, 
  doc, 
  getDoc,
  setAuthorizedSession,
  auth,
  db
} from './services/firebase';
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
import { ManageAccess } from './components/ManageAccess';
import { GeminiAssistantModal } from './components/GeminiAssistantModal';
import { ShieldAlert, LogIn, Lock, Monitor, Sparkles, X } from 'lucide-react';

export const App: React.FC = () => {
  // 1. 严格鉴权：初始 currentUser 必须为 null，authLoading 设为 true
  const [currentUser, setCurrentUser] = useState<AuthorizedUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  
  // 登录墙错误提示信息
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);
  
  // 模拟 Google 登录弹窗状态
  const [showGooglePromptModal, setShowGooglePromptModal] = useState(false);
  const [promptGoogleEmail, setPromptGoogleEmail] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  // 当前活动功能标签页
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // 移动端侧边抽屉
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 业务数据状态
  const [journals, setJournals] = useState<TeachingJournalEntry[]>(() => {
    const saved = localStorage.getItem('eduit_teaching_journals_v6');
    return saved ? JSON.parse(saved) : initialTeachingJournals;
  });

  const [resources, setResources] = useState<TeachingResource[]>(() => {
    const saved = localStorage.getItem('eduit_resources_v6');
    return saved ? JSON.parse(saved) : initialTeachingResources;
  });

  const [grades, setGrades] = useState<StudentGrade[]>(() => {
    const saved = localStorage.getItem('eduit_grades_v6');
    return saved ? JSON.parse(saved) : initialGrades;
  });

  const [homeworkList, setHomeworkList] = useState<HomeworkSubmission[]>(() => {
    const saved = localStorage.getItem('eduit_homework_v6');
    return saved ? JSON.parse(saved) : initialHomework;
  });

  const [timetable, setTimetable] = useState<TimetableSlot[]>(() => {
    const saved = localStorage.getItem('eduit_timetable_v6');
    return saved ? JSON.parse(saved) : initialTimetable;
  });

  const [documents, setDocuments] = useState<SchoolDocument[]>(() => {
    const saved = localStorage.getItem('eduit_documents_v6');
    return saved ? JSON.parse(saved) : initialDocuments;
  });

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('eduit_calendar_v6');
    return saved ? JSON.parse(saved) : initialCalendarEvents;
  });

  const [announcements, setAnnouncements] = useState<SchoolAnnouncement[]>(() => {
    const saved = localStorage.getItem('eduit_announcements_v6');
    return saved ? JSON.parse(saved) : initialAnnouncements;
  });

  // Gemini 智能助理弹窗
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiModalPrompt, setAiModalPrompt] = useState('');

  // 2. onAuthStateChanged 监听：检查登录状态并向 Firestore authorized_users/{email} 发起核对
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setAuthLoading(true);
      if (firebaseUser && firebaseUser.email) {
        const lowerEmail = firebaseUser.email.trim().toLowerCase();
        try {
          const userDocRef = doc(db, 'authorized_users', lowerEmail);
          const userDocSnap = await getDoc(userDocRef);

          // 严格检查：文档必须存在且 isActive === true
          if (!userDocSnap.exists() || userDocSnap.data()?.isActive !== true) {
            await signOut(auth);
            setCurrentUser(null);
            setAccessDeniedMessage('Access Denied: Your Google account is not on the 10-member authorized list.');
          } else {
            setCurrentUser(userDocSnap.data() as AuthorizedUser);
            setAccessDeniedMessage(null);
          }
        } catch {
          await signOut(auth);
          setCurrentUser(null);
          setAccessDeniedMessage('Access Denied: Your Google account is not on the 10-member authorized list.');
        }
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 状态自动同步至 localStorage (仅在成功授权登录后)
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('eduit_teaching_journals_v6', JSON.stringify(journals));
      localStorage.setItem('eduit_resources_v6', JSON.stringify(resources));
      localStorage.setItem('eduit_grades_v6', JSON.stringify(grades));
      localStorage.setItem('eduit_homework_v6', JSON.stringify(homeworkList));
      localStorage.setItem('eduit_timetable_v6', JSON.stringify(timetable));
      localStorage.setItem('eduit_documents_v6', JSON.stringify(documents));
      localStorage.setItem('eduit_calendar_v6', JSON.stringify(calendarEvents));
      localStorage.setItem('eduit_announcements_v6', JSON.stringify(announcements));
    }
  }, [journals, resources, grades, homeworkList, timetable, documents, calendarEvents, announcements, currentUser]);

  // 点击 "Sign in with Google" 触发
  const handleInitiateGoogleSignIn = () => {
    setAccessDeniedMessage(null);
    setPromptGoogleEmail('');
    setShowGooglePromptModal(true);
  };

  // 执行 Google 登录并调用 Firebase Auth 与 Firestore
  const handleExecuteGoogleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptGoogleEmail.trim()) return;

    setIsSigningIn(true);
    setAccessDeniedMessage(null);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      // 调用 signInWithPopup
      const result = await signInWithPopup(auth, provider, promptGoogleEmail);
      const email = result.user.email?.toLowerCase() || '';

      // 在 Firestore 中检索 authorized_users/{email}
      const userDocRef = doc(db, 'authorized_users', email);
      const userDocSnap = await getDoc(userDocRef);

      // 4. If the document does not exist or isActive is not true, immediately call signOut(auth) and display error
      if (!userDocSnap.exists() || userDocSnap.data()?.isActive !== true) {
        await signOut(auth);
        setCurrentUser(null);
        setAccessDeniedMessage('Access Denied: Your Google account is not on the 10-member authorized list.');
      } else {
        const authorizedData = userDocSnap.data() as AuthorizedUser;
        setAuthorizedSession(authorizedData);
        setCurrentUser(authorizedData);
        setAccessDeniedMessage(null);
      }
      setShowGooglePromptModal(false);
    } catch (err: any) {
      await signOut(auth);
      setCurrentUser(null);
      setAccessDeniedMessage(err?.message || 'Access Denied: Your Google account is not on the 10-member authorized list.');
    } finally {
      setIsSigningIn(false);
    }
  };

  // 登出
  const handleSignOut = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setAccessDeniedMessage(null);
  };

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

  // 公告增删改
  const handleAddAnnouncement = (ann: SchoolAnnouncement) => {
    setAnnouncements((prev) => [ann, ...prev]);
  };

  const handleUpdateAnnouncement = (updated: SchoolAnnouncement) => {
    setAnnouncements((prev) => prev.map(a => a.id === updated.id ? updated : a));
  };

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter(a => a.id !== id));
  };

  // =========================================================================
  // 1. 严格鉴权守卫：加载中状态
  // =========================================================================
  if (authLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 text-white space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center animate-pulse shadow-lg shadow-sky-500/20">
          <Monitor className="h-6 w-6 text-white" />
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 font-mono">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-sky-400 animate-ping"></span>
          <span>Verifying Firebase Authentication & Firestore Permissions...</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. 严格登录墙：未登录或未通过 10 人名单时，只渲染居中的登录卡片与单个 "Sign in with Google" 按钮
  // 彻底移除任何人员名单或列表，绝不提前展示任何账号！
  // =========================================================================
  if (!currentUser || currentUser.isActive !== true) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950 p-4 font-sans selection:bg-sky-500 selection:text-white">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
          {/* 卡片头部 */}
          <div className="p-8 sm:p-10 text-center bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
            <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-sky-500/25 mb-4">
              <Monitor className="h-8 w-8" />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Jit Sin Smart Campus
            </h1>
            <h2 className="text-sm font-semibold text-sky-700 mt-1">
              Authorized Staff Portal · 资讯处 / 电脑科
            </h2>
            <p className="text-xs text-slate-500 mt-3 leading-relaxed max-w-xs mx-auto">
              Welcome to the school IT management portal. Please sign in with your verified institutional Google Account to proceed.
            </p>
          </div>

          {/* 访问拒绝错误信息提示条 */}
          {accessDeniedMessage && (
            <div className="mx-6 sm:mx-8 mt-6 p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-start gap-3 text-rose-900 text-xs animate-shake">
              <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <div className="font-bold text-sm text-rose-700">
                  Access Denied
                </div>
                <p className="text-rose-800 mt-0.5">
                  {accessDeniedMessage}
                </p>
              </div>
            </div>
          )}

          {/* 核心操作区：只呈现一个极简干净的 "Sign in with Google" 按钮 */}
          <div className="p-8 sm:p-10 flex flex-col items-center space-y-4">
            <button
              onClick={handleInitiateGoogleSignIn}
              className="w-full py-3.5 px-5 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm rounded-2xl border border-slate-300 hover:border-slate-400 shadow-md hover:shadow-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98] group"
            >
              {/* Google 官方彩色 G 图标 */}
              <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span className="tracking-wide">Sign in with Google</span>
            </button>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
              <Lock className="h-3 w-3 text-emerald-500" />
              <span>Protected by Firebase Authentication & Firestore Rules</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400">
            Jit Sin High School · IT Department & Computer Section
          </div>
        </div>

        {/* Google 账号弹窗 (模拟 prompt: 'select_account') */}
        {showGooglePromptModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span className="font-bold text-slate-800 text-sm">Google Account</span>
                </div>
                <button 
                  onClick={() => setShowGooglePromptModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="text-center my-3">
                <h3 className="font-bold text-slate-900 text-base">Sign in to continue</h3>
                <p className="text-xs text-slate-500 mt-1">
                  to <span className="font-semibold text-slate-800">Jit Sin Smart Campus</span>
                </p>
                <div className="text-[10px] text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full inline-block mt-2 font-mono">
                  prompt: select_account
                </div>
              </div>

              <form onSubmit={handleExecuteGoogleAuth} className="space-y-4 mt-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email or phone
                  </label>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={promptGoogleEmail}
                    onChange={(e) => setPromptGoogleEmail(e.target.value)}
                    placeholder="Enter your Google Account email"
                    className="w-full text-xs sm:text-sm p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-normal">
                    Email will be normalized to lowercase and verified against Firestore database.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowGooglePromptModal(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSigningIn || !promptGoogleEmail.trim()}
                    className="px-5 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white rounded-xl shadow-sm transition"
                  >
                    {isSigningIn ? 'Authenticating...' : 'Next'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 3. 授权通过状态：渲染完整的系统侧边栏、工作台、成绩、课表、日志与公告等
  // =========================================================================
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      {/* 侧边栏 */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        currentUser={currentUser}
        onOpenGoogleSignIn={handleInitiateGoogleSignIn}
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
          onOpenGoogleSignIn={handleInitiateGoogleSignIn}
          onSignOut={handleSignOut}
        />

        {/* 滚动工作区 */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <Dashboard
              role={currentUser.isSuperAdmin ? 'it_admin' : 'it_teacher'}
              onNavigate={setCurrentTab}
              timetable={timetable}
              announcements={announcements}
              onOpenAiWithPrompt={handleOpenAiWithPrompt}
            />
          )}

          {currentTab === 'journal' && (
            <TeachingJournal
              journals={journals}
              currentUser={{
                id: currentUser.email,
                name: currentUser.name,
                email: currentUser.email,
                role: currentUser.isSuperAdmin ? 'it_admin' : 'it_teacher',
                title: currentUser.title,
                department: currentUser.department,
                avatarColor: currentUser.avatarColor,
                assignedClasses: []
              }}
              onAddJournal={handleAddJournal}
            />
          )}

          {currentTab === 'resources' && (
            <ResourceHub
              resources={resources}
              currentUser={{
                id: currentUser.email,
                name: currentUser.name,
                email: currentUser.email,
                role: currentUser.isSuperAdmin ? 'it_admin' : 'it_teacher',
                title: currentUser.title,
                department: currentUser.department,
                avatarColor: currentUser.avatarColor,
                assignedClasses: []
              }}
              teachers={getAuthorizedUsersList().map(u => ({
                id: u.email,
                name: u.name,
                email: u.email,
                role: u.isSuperAdmin ? 'it_admin' : 'it_teacher',
                title: u.title,
                department: u.department,
                avatarColor: u.avatarColor,
                assignedClasses: []
              }))}
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
              currentUser={currentUser}
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
              onAddAnnouncement={handleAddAnnouncement}
              onUpdateAnnouncement={handleUpdateAnnouncement}
              onDeleteAnnouncement={handleDeleteAnnouncement}
              currentUser={currentUser}
            />
          )}

          {currentTab === 'manage_access' && currentUser.isSuperAdmin && (
            <ManageAccess
              currentUser={currentUser}
              onRefreshCurrentUser={setCurrentUser}
            />
          )}
        </main>
      </div>

      {/* Gemini AI 智能助手弹窗 */}
      <GeminiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        role={currentUser.isSuperAdmin ? 'it_admin' : 'it_teacher'}
        initialPrompt={aiModalPrompt}
      />
    </div>
  );
};

export default App;
