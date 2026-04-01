import React, { useEffect } from 'react';

export function Modal({ open, title, onClose, children, footer }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="stl-modal__backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="stl-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="stl-modal__header">
          <div className="stl-modal__title">{title}</div>
          <button className="stl-modal__close" type="button" onClick={onClose} aria-label="Close dialog">
            ×
          </button>
        </div>
        <div className="stl-modal__body">{children}</div>
        {footer ? <div className="stl-modal__footer">{footer}</div> : null}
      </div>
    </div>
  );
}

