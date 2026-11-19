import { AuthorizedUser } from '../types';
import { initialAuthorizedUsers } from '../data/initialData';

const STORAGE_USERS_KEY = 'eduit_authorized_users_v1';
const STORAGE_CURRENT_AUTH_KEY = 'eduit_current_auth_user_v1';

// 获取所有授权成员名单（对应 Firestore authorized_users 集合）
export function getAuthorizedUsersList(): AuthorizedUser[] {
  const saved = localStorage.getItem(STORAGE_USERS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(initialAuthorizedUsers));
  return initialAuthorizedUsers;
}

// 保存更新授权成员列表（仅超级管理员可操作）
export function saveAuthorizedUsersList(users: AuthorizedUser[]): void {
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
}

// 获取当前登录用户（严格无 fallback，无登录则返回 null）
export function getCurrentAuthUser(): AuthorizedUser | null {
  const saved = localStorage.getItem(STORAGE_CURRENT_AUTH_KEY);
  if (saved) {
    try {
      const user: AuthorizedUser = JSON.parse(saved);
      // 二次校验当前在册状态与激活标记
      const allUsers = getAuthorizedUsersList();
      const currentDoc = allUsers.find(u => u.email.toLowerCase() === user.email.toLowerCase());
      if (currentDoc && currentDoc.isActive === true) {
        return currentDoc;
      }
    } catch {
      // ignore
    }
  }
  return null;
}

// 模拟 Firebase Google Sign-In 认证与 Firestore authorized_users/{email} 安全检查
export function verifyAndLoginGoogleUser(emailInput: string): { 
  success: boolean; 
  user?: AuthorizedUser; 
  errorMessage?: string; 
} {
  const normalizedEmail = emailInput.trim().toLowerCase();
  const allUsers = getAuthorizedUsersList();

  const userDoc = allUsers.find(u => u.email.toLowerCase() === normalizedEmail);

  // 1. 若文档不存在或 isActive 不是 true：立刻阻断登出
  if (!userDoc || userDoc.isActive !== true) {
    logoutUser();
    return {
      success: false,
      errorMessage: 'Access Denied: Authorized 10-Member Portal Only.'
    };
  }

  // 2. 授权通过，存储当前合法凭据
  localStorage.setItem(STORAGE_CURRENT_AUTH_KEY, JSON.stringify(userDoc));
  return {
    success: true,
    user: userDoc
  };
}

// 登出用户
export function logoutUser(): void {
  localStorage.removeItem(STORAGE_CURRENT_AUTH_KEY);
}
