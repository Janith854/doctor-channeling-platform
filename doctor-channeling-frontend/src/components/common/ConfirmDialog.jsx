import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this action? This cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center py-2">
        <div className="w-12 h-12 rounded-2xl bg-danger-50 text-danger-600 flex items-center justify-center mx-auto mb-3.5">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-navy-900 mb-1.5">{title}</h3>
        <p className="text-xs sm:text-sm text-navy-500 mb-6 leading-relaxed">
          {message}
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" size="md" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={variant} size="md" onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
