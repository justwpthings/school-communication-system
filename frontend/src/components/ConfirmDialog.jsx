import { Button } from './Button';
import { Modal } from './Modal';

export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  confirmVariant = 'danger',
  onCancel,
  onConfirm,
  isSubmitting
}) => (
  <Modal
    open={open}
    title={title}
    description={description}
    onClose={onCancel}
    footer={
      <>
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm} disabled={isSubmitting}>
          {isSubmitting ? 'Please wait…' : confirmLabel}
        </Button>
      </>
    }
  />
);
