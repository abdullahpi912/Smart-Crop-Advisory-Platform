import React, { useEffect } from 'react';

export default function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      className={`toast-technical ${type}`}
      role="alert"
      aria-live="polite"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: type === 'error' ? 'var(--agri-danger)' : 'var(--agri-accent)',
            display: 'inline-block',
            flexShrink: 0
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="mono-meta" style={{ fontSize: '9px', color: type === 'error' ? 'var(--agri-danger)' : 'var(--agri-accent)' }}>
            SYSTEM NOTIFICATION // {type.toUpperCase()}
          </span>
          <span style={{ fontSize: '0.92rem', color: '#FFFFFF', fontWeight: 500, marginTop: '2px' }}>
            {message}
          </span>
        </div>
      </div>
      <button
        onClick={onClose}
        aria-label="Dismiss notification"
        style={{
          background: 'none',
          border: 'none',
          color: '#FFFFFF',
          cursor: 'pointer',
          marginLeft: 'auto',
          opacity: 0.7,
          padding: '4px',
          fontSize: '0.9rem',
          lineHeight: 1
        }}
      >
        <i className="fa-solid fa-xmark"></i>
      </button>
    </div>
  );
}
