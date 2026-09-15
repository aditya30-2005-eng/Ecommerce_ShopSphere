import React, { useEffect, useState } from 'react';

const NotificationCenter = () => {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const show = (event) => {
      setToast(event.detail);
      window.clearTimeout(window.__shopsphereToastTimer);
      window.__shopsphereToastTimer = window.setTimeout(() => setToast(null), 3600);
    };
    window.addEventListener('shopsphere:notify', show);
    return () => window.removeEventListener('shopsphere:notify', show);
  }, []);

  if (!toast) return null;

  return (
    <div className={`shop-toast shop-toast--${toast.type || 'success'}`} role="status" aria-live="polite">
      <span className="shop-toast__icon">
        <i className={`bi ${toast.type === 'error' ? 'bi-exclamation-lg' : 'bi-check-lg'}`} />
      </span>
      <div>
        <strong>{toast.title || 'Done'}</strong>
        {toast.message && <p>{toast.message}</p>}
      </div>
      <button type="button" aria-label="Dismiss notification" onClick={() => setToast(null)}>
        <i className="bi bi-x-lg" />
      </button>
    </div>
  );
};

export const notify = (detail) => window.dispatchEvent(new CustomEvent('shopsphere:notify', { detail }));
export default NotificationCenter;
