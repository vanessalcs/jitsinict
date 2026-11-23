import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { subscribeToasts, type ToastMessage } from '../utils/toast';

const TOAST_DURATION_MS = 4000;

const KIND_STYLES: Record<ToastMessage['kind'], string> = {
  error: 'bg-rose-600',
  info: 'bg-slate-800',
  success: 'bg-emerald-600',
};

export const ToastHost: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const timers = new Set<number>();
    const unsubscribe = subscribeToasts((toast) => {
      setToasts((prev) => [...prev, toast]);
      const timer = window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
        timers.delete(timer);
      }, TOAST_DURATION_MS);
      timers.add(timer);
    });
    return () => {
      unsubscribe();
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${KIND_STYLES[t.kind]} text-white text-sm px-4 py-2.5 rounded-xl shadow-lg flex items-start gap-3`}
        >
          <span className="flex-1">{t.text}</span>
          <button
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            className="opacity-80 hover:opacity-100"
            aria-label="关闭提示"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
