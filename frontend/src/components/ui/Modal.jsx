import React from 'react';
import { X } from 'lucide-react';

/**
 * A self-contained, reusable Modal component.
 * Includes internal styling, dark mode support, and backdrop click-to-close.
 */
export default function Modal({ children, onClose, title, isOpen }) {
  if (!isOpen) return null;

  const backdropStyle = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '1rem',
  };

  const modalStyle = {
    backgroundColor: 'var(--modal-bg, #ffffff)',
    color: 'var(--modal-text, #1e293b)',
    border: '1px solid var(--modal-border, #e2e8f0)',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
    width: '100%',
    maxWidth: '500px',
    padding: '1.5rem',
    position: 'relative',
    transition: 'all 0.3s ease-in-out',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '1rem',
    borderBottom: '1px solid var(--modal-border, #e2e8f0)',
  };

  const closeButtonStyle = {
    background: 'transparent',
    border: 'none',
    borderRadius: '50%',
    padding: '0.25rem',
    cursor: 'pointer',
    color: 'var(--modal-muted, #6b7280)',
  };

  const bodyStyle = {
    marginTop: '1rem',
  };

  return (
    <div style={backdropStyle} onClick={onClose} aria-modal="true" role="dialog">
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>{title}</h3>
          <button onClick={onClose} style={closeButtonStyle} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        <div style={bodyStyle}>{children}</div>
      </div>
    </div>
  );
}
