import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  open,
  title,
  children,
  onClose
}: {
  open: boolean;
  title: ReactNode;
  children: ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onMouseDown={onClose} role="dialog" aria-modal="true">
      <div className="modal panel" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3 className="modal-title">{title}</h3>
          <button className="icon-button" onClick={onClose} aria-label="Закрыть">
            <X />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

