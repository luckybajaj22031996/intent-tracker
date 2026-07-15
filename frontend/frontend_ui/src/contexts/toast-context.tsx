import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { CheckCircle2, AlertCircle, Info, X } from '@/utils/icons';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.length > 0 && (
        <div
          role="region"
          aria-label="Notifications"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4"
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              role="alert"
              className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg animate-slide-up ${
                toast.type === 'success'
                  ? 'bg-green-900/90 border border-green-500/50 text-green-200'
                  : toast.type === 'error'
                    ? 'bg-red-900/90 border border-red-500/50 text-red-200'
                    : 'bg-surface-elevated border border-white/10 text-white'
              }`}
            >
              {toast.type === 'success' && <CheckCircle2 size={18} aria-hidden />}
              {toast.type === 'error' && <AlertCircle size={18} aria-hidden />}
              {toast.type === 'info' && <Info size={18} aria-hidden />}
              <span className="flex-1 text-sm">{toast.message}</span>
              <button
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="text-current opacity-60 hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
