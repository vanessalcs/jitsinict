import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

function readStored<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    // 数据损坏或存储不可用时回退到默认值
    return fallback;
  }
}

/** useState 的持久化版本：自动读写 localStorage，且对损坏的 JSON 安全。 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => readStored(key, initialValue));

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // 存储已满或被禁用：忽略，保持内存状态可用
    }
  }, [key, value]);

  return [value, setValue];
}
