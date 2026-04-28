import { useState, useEffect, useCallback } from 'react';

// ============================================================
// TOAST NOTIFICATION SYSTEM
// Tai sao khong dung alert()? alert() la blocking call —
// no freeze toan bo JS thread va khong the custom style.
// Toast hien thi overlay, tu dong bien mat, va co the stack nhieu thong bao.
// ============================================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // ms, mac dinh 4000
}

// --- ICONS ---
const icons: Record<ToastType, string> = {
  success: '✅',
  error:   '❌',
  warning: '⚠️',
  info:    'ℹ️',
};

// --- MAU SAC THEO LOAI ---
const colors: Record<ToastType, { bg: string; border: string; title: string }> = {
  success: { bg: 'rgba(16, 185, 129, 0.12)', border: '#10b981', title: '#34d399' },
  error:   { bg: 'rgba(239, 68, 68, 0.12)',  border: '#ef4444', title: '#f87171' },
  warning: { bg: 'rgba(245, 158, 11, 0.12)', border: '#f59e0b', title: '#fbbf24' },
  info:    { bg: 'rgba(59, 130, 246, 0.12)', border: '#3b82f6', title: '#60a5fa' },
};

// --- SINGLE TOAST ITEM ---
interface ToastItemProps {
  toast: ToastMessage;
  onRemove: (id: number) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const c = colors[toast.type];
  const duration = toast.duration ?? 4000;

  useEffect(() => {
    // Trigger slide-in sau 1 tick de CSS transition hoat dong
    const showTimer = setTimeout(() => setVisible(true), 10);

    // Bat dau slide-out truoc khi xoa khoi DOM
    const leaveTimer = setTimeout(() => setLeaving(true), duration - 300);

    // Xoa khoi DOM sau khi animation ket thuc
    const removeTimer = setTimeout(() => onRemove(toast.id), duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(leaveTimer);
      clearTimeout(removeTimer);
    };
  }, [toast.id, duration, onRemove]);

  const handleClose = () => {
    setLeaving(true);
    setTimeout(() => onRemove(toast.id), 280);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '12px 14px',
        marginBottom: '8px',
        borderRadius: '10px',
        backgroundColor: c.bg,
        border: `1px solid ${c.border}`,
        backdropFilter: 'blur(12px)',
        boxShadow: `0 4px 20px rgba(0,0,0,0.3), 0 0 0 1px ${c.border}22`,
        minWidth: '280px',
        maxWidth: '380px',
        // Slide-in tu phai vao, slide-out ra phai
        transform: visible && !leaving ? 'translateX(0)' : 'translateX(110%)',
        opacity: visible && !leaving ? 1 : 0,
        transition: 'transform 0.28s cubic-bezier(0.16,1,0.3,1), opacity 0.28s ease',
        cursor: 'default',
        position: 'relative',
      }}
    >
      <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>
        {icons[toast.type]}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0,
          fontSize: '13px',
          fontWeight: 700,
          color: c.title,
          lineHeight: 1.3,
        }}>
          {toast.title}
        </p>
        {toast.message && (
          <p style={{
            margin: '4px 0 0',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.65)',
            lineHeight: 1.4,
            wordBreak: 'break-word',
          }}>
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={handleClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.4)',
          cursor: 'pointer',
          fontSize: '14px',
          padding: '0 0 0 4px',
          flexShrink: 0,
          lineHeight: 1,
        }}
        aria-label="Dong thong bao"
      >
        ✕
      </button>
    </div>
  );
};

// --- TOAST CONTAINER (fixed, stack o goc duoi phai) ---
interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: number) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column-reverse', // Moi nhat hien phia duoi
        pointerEvents: 'none',
      }}
    >
      {toasts.map(t => (
        <div key={t.id} style={{ pointerEvents: 'all' }}>
          <ToastItem toast={t} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
};

// ============================================================
// HOOK: useToast — dung trong bat ky component nao can toast
//
// Cach dung:
//   const { toasts, removeToast, success, error, warning, info } = useToast();
//   ...
//   success('Dat lenh thanh cong!');
//   error('Loi ket noi', 'Khong the ket noi Backend');
//   ...
//   <ToastContainer toasts={toasts} onRemove={removeToast} />
// ============================================================
let toastIdCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((
    type: ToastType,
    title: string,
    message?: string,
    duration?: number
  ) => {
    const id = ++toastIdCounter;
    setToasts(prev => [...prev, { id, type, title, message, duration }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return {
    toasts,
    removeToast,
    success: (title: string, message?: string, duration?: number) =>
      addToast('success', title, message, duration),
    error: (title: string, message?: string, duration?: number) =>
      addToast('error', title, message, duration ?? 6000),
    warning: (title: string, message?: string, duration?: number) =>
      addToast('warning', title, message, duration),
    info: (title: string, message?: string, duration?: number) =>
      addToast('info', title, message, duration),
  };
}
