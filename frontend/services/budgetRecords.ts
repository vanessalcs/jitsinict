import { collection, deleteDoc, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

// 资讯处预算：子类别下的实际购买 & 预算追加，全处共享（Firestore）。
const PURCHASES = 'budget_purchases';
const EXTRAS = 'budget_extras';

export interface BudgetPurchaseDoc {
  id: string;
  itemId: string; // 子类别编号，例如 '1-3'
  at: string; // YYYY-MM-DDTHH:mm
  desc: string;
  qty: string;
  price: string;
  createdAt: number;
  createdByName: string;
  createdByEmail: string;
}

export interface BudgetExtraDoc {
  id: string;
  code: number; // 所属类别编号
  at: string;
  name: string;
  qty: string;
  price: string;
  createdAt: number;
  createdByName: string;
  createdByEmail: string;
}

type Who = { name: string; email: string };

function subscribe<T extends { id: string; createdAt: number }>(
  col: string,
  onChange: (list: T[]) => void,
  onError: (e: Error) => void
): () => void {
  return onSnapshot(
    collection(db, col),
    (snap) =>
      onChange(
        snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<T, 'id'>) }) as T)
          .sort((a, b) => a.createdAt - b.createdAt)
      ),
    onError
  );
}

export const subscribeBudgetPurchases = (cb: (l: BudgetPurchaseDoc[]) => void, err: (e: Error) => void) =>
  subscribe<BudgetPurchaseDoc>(PURCHASES, cb, err);
export const subscribeBudgetExtras = (cb: (l: BudgetExtraDoc[]) => void, err: (e: Error) => void) =>
  subscribe<BudgetExtraDoc>(EXTRAS, cb, err);

export async function addBudgetPurchase(
  data: Pick<BudgetPurchaseDoc, 'itemId' | 'at' | 'desc' | 'qty' | 'price'>,
  who: Who
): Promise<void> {
  await setDoc(doc(db, PURCHASES, crypto.randomUUID()), {
    ...data,
    createdAt: Date.now(),
    createdByName: who.name,
    createdByEmail: who.email.toLowerCase(),
  });
}

export const updateBudgetPurchase = (
  id: string,
  patch: Partial<Pick<BudgetPurchaseDoc, 'at' | 'desc' | 'qty' | 'price'>>
) => updateDoc(doc(db, PURCHASES, id), { ...patch });
export const deleteBudgetPurchase = (id: string) => deleteDoc(doc(db, PURCHASES, id));

export async function addBudgetExtra(
  data: Pick<BudgetExtraDoc, 'code' | 'at' | 'name' | 'qty' | 'price'>,
  who: Who
): Promise<void> {
  await setDoc(doc(db, EXTRAS, crypto.randomUUID()), {
    ...data,
    createdAt: Date.now(),
    createdByName: who.name,
    createdByEmail: who.email.toLowerCase(),
  });
}
export const deleteBudgetExtra = (id: string) => deleteDoc(doc(db, EXTRAS, id));
