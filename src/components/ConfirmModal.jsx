import { useEffect, useRef } from 'react';
import Button from './Button';
import Card from './Card';
import Spinner from './Spinner';

/**
 * Accessible confirmation modal dialog for destructive or important actions.
 * Follows AGENTS.md and docs/UI_GUIDELINES.md.
 */
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  loading = false,
  icon,
}) {
  const cancelBtnRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => cancelBtnRef.current?.focus(), 50);

    function handleKeyDown(e) {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      {/* Semi-transparent backdrop overlay */}
      <div
        className="fixed inset-0 bg-overlay/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => !loading && onClose()}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md z-10 animate-in zoom-in-95 duration-200">
        <Card className="p-6 sm:p-7 shadow-2xl rounded-2xl border-line">
          <div className="flex items-start gap-4">
            {icon && (
              <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted text-fg text-lg">
                {icon}
              </div>
            )}
            <div className="space-y-1.5 flex-1 min-w-0">
              <h3 id="confirm-modal-title" className="text-lg font-bold text-fg leading-tight">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5">
            <Button
              ref={cancelBtnRef}
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto text-xs min-h-10 px-4"
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              variant={variant}
              onClick={onConfirm}
              disabled={loading}
              className="w-full sm:w-auto text-xs min-h-10 px-5 font-semibold"
            >
              {loading ? <Spinner label="Processing…" /> : confirmText}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

