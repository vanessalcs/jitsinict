import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { AuthorizedUser } from '../types';

const COLLECTION = 'authorized_users';

export const ACCESS_DENIED_MESSAGE = 'Access Denied: Authorized 10-Member Portal Only.';

const normalizeEmail = (email: string) => email.trim().toLowerCase();

/** 读取单个授权成员文档；不存在或未激活时返回 null。 */
export async function getActiveAuthorizedUser(email: string): Promise<AuthorizedUser | null> {
  const snap = await getDoc(doc(db, COLLECTION, normalizeEmail(email)));
  if (!snap.exists()) return null;
  const user = snap.data() as AuthorizedUser;
  return user.isActive === true ? user : null;
}

/** 读取全部授权成员（仅超级管理员有权限，由 Firestore 规则保证）。 */
export async function getAuthorizedUsersList(): Promise<AuthorizedUser[]> {
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs.map((d) => d.data() as AuthorizedUser);
}

/** 新增或更新一个授权成员（仅超级管理员）。 */
export async function saveAuthorizedUser(user: AuthorizedUser): Promise<void> {
  const email = normalizeEmail(user.email);
  await setDoc(doc(db, COLLECTION, email), { ...user, email }, { merge: true });
}
