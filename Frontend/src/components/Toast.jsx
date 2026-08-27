import React, { useEffect, useState } from 'react';

export default function Toast({ message, type = 'info', onClose }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!message) return;
    const startTime = Date.now();
    const duration = 4500;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (elapsed >= duration) {
        clearInterval(interval);
        onClose();
      }
    }, 40);

    return () => clearInterval(interval);
  }, [message, onClose]);

  if (!message) return null;

  // Icon and theme mapping
  const iconConfig = {
    success: {
      icon: 'fa-circle-check',
      label: 'SYSTEM // SUCCESS',
      color: '#4ADE80',
      bg: 'rgba(34, 197, 94, 0.16)',
      border: 'rgba(74, 222, 128, 0.35)'
    },
    error: {
      icon: 'fa-circle-exclamation',
      label: 'SYSTEM // ALERT',
      color: '#F87171',
      bg: 'rgba(239, 68, 68, 0.16)',
      border: 'rgba(248, 113, 113, 0.35)'
    },
    warning: {
      icon: 'fa-triangle-exclamation',
      label: 'SYSTEM // WARNING',
      color: '#FBBF24',
      bg: 'rgba(245, 158, 11, 0.16)',
      border: 'rgba(251, 191, 36, 0.35)'
    },
    info: {
      icon: 'fa-circle-info',
      label: 'SYSTEM // TELEMETRY',
      color: '#4ADE80',
      bg: 'rgba(34, 197, 94, 0.16)',
      border: 'rgba(74, 222, 128, 0.35)'
    }
  };

  const current = iconConfig[type] || iconConfig.info;

  return (
    <div
      className={`toast-technical toast-${type} ${type}`}
      role="alert"
      aria-live="polite"
    >
      <div className="toast-inner-content">
        {/* Left Status Icon Orb */}
        <div
          className="toast-icon-orb"
          style={{
            background: current.bg,
            border: `1px solid ${current.border}`,
            color: current.color
          }}
        >
          <i className={`fa-solid ${current.icon}`}></i>
        </div>

        {/* Center Typography Block */}
        <div className="toast-text-block">
          <div className="toast-meta-row">
            <span
              className="toast-pulse-dot"
              style={{ background: current.color, boxShadow: `0 0 8px ${current.color}` }}
            />
            <span
              className="toast-meta-tag"
              style={{ color: current.color }}
            >
              {current.label}
            </span>
          </div>
          <p className="toast-message-text">
            {message}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Dismiss notification"
          className="toast-close-btn"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      {/* Animated Bottom Timer Bar */}
      <div className="toast-progress-track">
        <div
          className="toast-progress-bar"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${current.color}, rgba(255,255,255,0.8))`
          }}
        />
      </div>
    </div>
  );
}
