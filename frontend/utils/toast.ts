export type ToastKind = 'error' | 'info' | 'success';

export interface ToastMessage {
  id: number;
  kind: ToastKind;
  text: string;
}

type Listener = (toast: ToastMessage) => void;

const listeners = new Set<Listener>();
let nextId = 1;

/** 订阅 toast 事件（供 ToastHost 使用），返回取消订阅函数。 */
export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** 显示一条提示，替代原生 alert()。 */
export function notify(text: string, kind: ToastKind = 'error'): void {
  const toast: ToastMessage = { id: nextId++, kind, text };
  listeners.forEach((l) => l(toast));
}
