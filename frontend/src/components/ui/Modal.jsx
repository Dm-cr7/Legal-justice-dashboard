import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ children, onClose, title, isOpen }) {
  const modalRef = useRef(null);

  // Close on Esc key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent render if not open
  if (!isOpen) return null;

  // Styles
  const backdropStyle = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '1rem',
    animation: 'fadeIn 0.3s ease-in-out',
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
    animation: 'scaleIn 0.3s ease',
    outline: 'none',
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
    <>
      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0 }
          to { opacity: 1 }
        }

        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}
      </style>

      <div
        style={backdropStyle}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        ref={modalRef}
      >
        <div style={modalStyle}>
          <div style={headerStyle}>
            <h3 id="modal-title" style={{ fontSize: '1.125rem', fontWeight: '600' }}>
              {title}
            </h3>
            <button onClick={onClose} style={closeButtonStyle} aria-label="Close modal">
              <X size={20} />
            </button>
          </div>
          <div style={bodyStyle}>{children}</div>
        </div>
      </div>
    </>
  );
}
