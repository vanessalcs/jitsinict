import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup as firebaseSignInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { AuthorizedUser } from '../types';

// PASTE YOUR REAL firebaseConfig FROM FIREBASE CONSOLE (jit-sin-ai) HERE:
export const firebaseConfig = {
  apiKey: "YOUR_REAL_API_KEY",
  authDomain: "jit-sin-ai.firebaseapp.com",
  projectId: "jit-sin-ai",
  storageBucket: "jit-sin-ai.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export {
  GoogleAuthProvider,
  getAuth,
  getFirestore,
  doc,
  getDoc,
  onAuthStateChanged
};
export type { FirebaseUser };

export async function signOut(authInstance = auth): Promise<void> {
  await firebaseSignOut(authInstance);
}

export async function signInWithPopup(
  authInstance = auth,
  provider = new GoogleAuthProvider(),
  _ignoredInputEmail?: string
) {
  return await firebaseSignInWithPopup(authInstance, provider);
}

// Updates a user document in real Firestore (used by Admin dashboard)
export async function updateFirestoreUserDoc(email: string, user: AuthorizedUser) {
  const cleanEmail = email.trim().toLowerCase();
  await setDoc(
    doc(db, 'authorized_users', cleanEmail),
    { ...user, email: cleanEmail },
    { merge: true }
  );
}

// Kept for compatibility (real Firebase Auth persists sessions automatically)
export function setAuthorizedSession(_user: AuthorizedUser) {}