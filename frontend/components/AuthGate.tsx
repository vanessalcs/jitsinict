import React, { useEffect, useRef, useState } from 'react';
import { LogIn, Monitor, ShieldAlert, Info } from 'lucide-react';
import {
  auth,
  onAuthStateChanged,
  registerWithEmail,
  sendPasswordReset,
  signInWithEmail,
  signInWithGoogle,
  signOut,
} from '../services/firebase';
import { ACCESS_DENIED_MESSAGE, getActiveAuthorizedUser } from '../services/authService';
import { AuthorizedUser } from '../types';

interface AuthGateProps {
  children: (user: AuthorizedUser, onLogout: () => void, onRefreshUser: (user: AuthorizedUser) => void) => React.ReactNode;
}

type AuthStatus = 'loading' | 'signed_out' | 'signed_in';
type Mode = 'login' | 'register';

const VERIFY_EMAIL_MESSAGE = '该邮箱尚未验证，请先点击邮箱中的验证链接，然后再登录。';

function describeAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return '邮箱或密码错误。首次使用请点击“首次使用？设置密码”。';
    case 'auth/email-already-in-use':
      return '该邮箱已注册，请直接登录；忘记密码可点击“忘记密码”。';
    case 'auth/weak-password':
      return '密码太简单，至少需要 6 位字符。';
    case 'auth/too-many-requests':
      return '尝试次数过多，请稍后再试。';
    case 'auth/operation-not-allowed':
      return '尚未启用邮箱密码登录，请联系管理员。';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return '登录已取消。';
    default:
      return '登录失败，请稍后重试。';
  }
}

/** 登录墙：仅 Firestore authorized_users 中已激活的账号（Google 或 邮箱密码）可进入系统。 */
export const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthorizedUser | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  // 注册过程中 Firebase 会短暂自动登录，此时不应触发授权校验提示
  const registeringRef = useRef(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (registeringRef.current) return;
      if (!firebaseUser?.email) {
        setUser(null);
        setStatus('signed_out');
        return;
      }
      if (!firebaseUser.emailVerified) {
        await signOut();
        setNotice('');
        setError(VERIFY_EMAIL_MESSAGE);
        setUser(null);
        setStatus('signed_out');
        return;
      }
      try {
        const member = await getActiveAuthorizedUser(firebaseUser.email);
        if (!member) {
          await signOut();
          setNotice('');
          setError(ACCESS_DENIED_MESSAGE);
          setUser(null);
          setStatus('signed_out');
          return;
        }
        setError('');
        setNotice('');
        setUser(member);
        setStatus('signed_in');
      } catch (err) {
        console.error('Authorization check failed:', err);
        await signOut();
        setNotice('');
        setError('登录校验失败，请稍后重试。');
        setUser(null);
        setStatus('signed_out');
      }
    });
  }, []);

  const resetMessages = () => {
    setError('');
    setNotice('');
  };

  const handleGoogleLogin = async () => {
    resetMessages();
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google sign-in failed:', err);
      setError(describeAuthError(err));
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (!email.trim() || !password) {
      setError('请输入邮箱和密码。');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else {
        registeringRef.current = true;
        try {
          await registerWithEmail(email, password);
          await signOut();
        } finally {
          registeringRef.current = false;
        }
        setPassword('');
        setMode('login');
        setNotice('验证邮件已发送到您的邮箱。请点击邮件中的链接完成验证后，再用该邮箱和密码登录。');
      }
    } catch (err) {
      console.error('Email auth failed:', err);
      setError(describeAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleForgotPassword = async () => {
    resetMessages();
    if (!email.trim()) {
      setError('请先在上方输入您的邮箱。');
      return;
    }
    try {
      await sendPasswordReset(email);
      setNotice('如果该邮箱已注册，重设密码邮件已发送，请查收。');
    } catch (err) {
      console.error('Password reset failed:', err);
      setError(describeAuthError(err));
    }
  };

  if (status === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center text-slate-500 text-sm">正在验证登录状态…</div>
    );
  }

  if (status === 'signed_in' && user) {
    return <>{children(user, () => void signOut(), setUser)}</>;
  }

  return (
    <div className="h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8 w-full max-w-sm space-y-5">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white">
            <Monitor className="h-7 w-7" />
          </div>
          <h1 className="text-lg font-bold text-slate-900 mt-3">资讯处 / 电脑科</h1>
          <p className="text-xs text-slate-500 mt-1">教学与电教管理中心 · 仅限授权教职员登录</p>
        </div>

        {error && (
          <div className="flex items-start gap-2 text-left text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {notice && (
          <div className="flex items-start gap-2 text-left text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{notice}</span>
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition"
        >
          <LogIn className="h-4 w-4" />
          <span>使用 Google 账号登录</span>
        </button>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <div className="flex-1 h-px bg-slate-200" />
          <span>或使用邮箱密码</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-3">
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="学校邮箱，例如 name@jitsin-ind.edu.my"
            className="w-full text-sm p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
          />
          <input
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === 'login' ? '密码' : '设置新密码（至少 6 位）'}
            className="w-full text-sm p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white text-sm font-semibold transition"
          >
            {mode === 'login' ? '邮箱登录' : '设置密码并发送验证邮件'}
          </button>
        </form>

        <div className="flex items-center justify-between text-xs">
          <button
            onClick={() => {
              resetMessages();
              setMode(mode === 'login' ? 'register' : 'login');
            }}
            className="text-sky-700 hover:underline"
          >
            {mode === 'login' ? '首次使用？设置密码' : '已有密码？返回登录'}
          </button>
          <button onClick={handleForgotPassword} className="text-slate-500 hover:underline">
            忘记密码
          </button>
        </div>
      </div>
    </div>
  );
};
