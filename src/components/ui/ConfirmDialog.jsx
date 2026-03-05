import { useEffect } from 'react';
import Button from './Button';
import '../../styles/components/ConfirmDialog.css';

function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when dialog is open
      document.body.style.overflow = 'hidden';

      // Handle escape key
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onCancel();
        }
      };

      document.addEventListener('keydown', handleEscape);

      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="confirm-dialog-overlay" onClick={onCancel}>
      <div
        className="confirm-dialog"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        <div className="confirm-dialog__header">
          <h2 id="confirm-dialog-title" className="confirm-dialog__title">
            {title}
          </h2>
          <button
            className="confirm-dialog__close"
            onClick={onCancel}
            aria-label="Close dialog"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        <div className="confirm-dialog__body">
          <p id="confirm-dialog-message" className="confirm-dialog__message">
            {message}
          </p>
        </div>

        <div className="confirm-dialog__footer">
          <Button
            onClick={onCancel}
            variant="secondary"
            size="medium"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            variant={variant}
            size="medium"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
