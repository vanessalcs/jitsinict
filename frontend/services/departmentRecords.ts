import { collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { DepartmentRecord } from '../types';

const COLLECTION = 'department_records';

type StoredRecord = Omit<DepartmentRecord, 'id'> & { createdAt: number };

/** 实时订阅共享的资讯处事项记录（日期新→旧）。返回取消订阅函数。 */
export function subscribeDepartmentRecords(
  onChange: (records: DepartmentRecord[]) => void,
  onError: (err: Error) => void
): () => void {
  const q = query(collection(db, COLLECTION), orderBy('date', 'desc'));
  return onSnapshot(
    q,
    (snap) =>
      onChange(
        snap.docs.map((d) => {
          const { createdAt: _createdAt, ...rest } = d.data() as StoredRecord;
          return { id: d.id, ...rest };
        })
      ),
    onError
  );
}

export type DepartmentRecordInput = Omit<DepartmentRecord, 'id' | 'recorderName' | 'recorderEmail'>;

/** 新增一条记录；记录者固定为当前登录成员。 */
export async function addDepartmentRecord(
  input: DepartmentRecordInput,
  recorder: { name: string; email: string }
): Promise<void> {
  const record: StoredRecord = {
    ...input,
    recorderName: recorder.name,
    recorderEmail: recorder.email.toLowerCase(),
    createdAt: Date.now(),
  };
  await setDoc(doc(db, COLLECTION, crypto.randomUUID()), record);
}

/** 修改记录内容（记录者不可更改，由 Firestore 规则保证）。 */
export async function updateDepartmentRecord(id: string, input: DepartmentRecordInput): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { ...input });
}

export async function deleteDepartmentRecord(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
