'use client';

import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target.classList.contains('modal-overlay')) onClose();
    }}>
      <div className={`card glass modal ${size}`}>
        <div className="modal-header">
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{title}</h3>
          <button className="btn-ghost" onClick={onClose} style={{ 
            border: 'none', background: 'transparent', cursor: 'pointer',
            fontSize: '1.5rem', lineHeight: 1, padding: '4px'
          }}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}
