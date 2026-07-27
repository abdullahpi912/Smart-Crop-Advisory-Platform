import React, { useEffect } from 'react';

export default function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 9999,
        background: type === 'error' ? 'var(--accent-terracotta)' : 'var(--primary-dark)',
        color: '#fff',
        padding: '1rem 1.5rem',
        borderRadius: 'var(--radius-sm)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        animation: 'slideUp 0.3s ease-out forwards',
        maxWidth: '400px'
      }}
    >
      <i className={type === 'error' ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-circle-check'} style={{ color: 'var(--accent-gold)', fontSize: '1.2rem' }}></i>
      <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          marginLeft: 'auto',
          opacity: 0.8
        }}
      >
        <i className="fa-solid fa-xmark"></i>
      </button>
    </div>
  );
}
