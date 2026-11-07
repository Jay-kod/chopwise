import { createContext, useCallback, useContext, useState, useRef } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

/**
 * Toast notification provider. Wrap the app with this.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const addToast = useCallback(
    (message, variant = 'ok', duration = 4000) => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, message, variant }]);
      timers.current[id] = setTimeout(() => removeToast(id), duration);
      return id;
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** @returns {(message: string, variant?: string, duration?: number) => number} */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}

function ToastItem({ toast, onDismiss }) {
  const styles = {
    ok: 'bg-primary-soft text-on-primary-soft',
    warning: 'bg-warn-bg text-warn-fg border border-warn-line',
    error: 'bg-danger-bg text-danger-fg border border-danger-line',
  };

  const icons = { ok: '✓', warning: '⚠', error: '✕' };

  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm shadow-lg ${
        styles[toast.variant] || styles.ok
      }`}
      role="status"
    >
      <span aria-hidden="true">{icons[toast.variant] || '✓'}</span>
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={onDismiss}
        className="ml-2 text-sm opacity-70 hover:opacity-100"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}

