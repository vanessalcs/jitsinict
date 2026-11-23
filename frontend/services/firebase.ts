import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import config from '../firebase/config.json';

// 配置来自 frontend/firebase/config.json (Firebase Web 配置属于公开信息，安全性由 firestore.rules 保证)
export const app = initializeApp(config.webAppConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, config.databaseId);
export const storage = getStorage(app);

export { onAuthStateChanged };
export type { FirebaseUser };

/** 弹出 Google 登录窗口。 */
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  // `hd` only nudges Google's account picker toward the school domain; access is
  // still enforced by the Firestore authorized_users list and firestore.rules.
  provider.setCustomParameters({ prompt: 'select_account', hd: 'jitsin-ind.edu.my' });
  return signInWithPopup(auth, provider);
}

/** 邮箱 + 密码登录。 */
export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

/** 首次使用：创建密码账号并发送邮箱验证邮件（验证后才能登录）。 */
export async function registerWithEmail(email: string, password: string): Promise<void> {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await sendEmailVerification(cred.user);
}

/** 发送重设密码邮件。 */
export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}
