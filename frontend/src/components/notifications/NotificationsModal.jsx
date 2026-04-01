import React from 'react';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';

function fmt(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return '';
  }
}

export function NotificationsModal({ open, onClose, notifications }) {
  const items = notifications?.items || [];
  const unreadCount = notifications?.unreadCount || 0;
  const readMap = notifications?.readMap || {};

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Notifications${unreadCount ? ` • ${unreadCount} unread` : ''}`}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 12.5, color: 'rgba(16,18,23,0.55)', fontWeight: 800 }}>
            Showing latest {Math.min(items.length, 50)} updates
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button onClick={() => notifications?.refresh?.()}>Refresh</Button>
            <Button onClick={() => notifications?.markAllRead?.()} disabled={!unreadCount}>
              Mark all read
            </Button>
          </div>
        </div>
      }
    >
      {items.length === 0 ? (
        <div style={{ padding: 8, color: 'rgba(16,18,23,0.55)', fontWeight: 700 }}>No notifications yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((n) => {
            const isUnread = !readMap[n.id];
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => notifications?.markRead?.(n.id)}
                className="stl-notif"
              >
                <div className="stl-notif__top">
                  <div className="stl-notif__title">
                    {n.title}
                    {isUnread ? <span className="stl-notif__dot" aria-hidden="true" /> : null}
                  </div>
                  <div className="stl-notif__ts">{fmt(n.ts)}</div>
                </div>
                <div className="stl-notif__msg">{n.message}</div>
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

