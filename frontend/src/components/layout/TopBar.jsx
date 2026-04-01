import React from 'react';
import { IconButton } from '../ui/Button.jsx';
import { NotificationsModal } from '../notifications/NotificationsModal.jsx';

export function TopBar({
  userName = 'User',
  subtitle = '',
  showNotifications = false,
  notifications,
}) {
  const [open, setOpen] = React.useState(false);
  const unread = notifications?.unreadCount || 0;

  return (
    <div className="stl-topbar">
      <div className="stl-topbar__left">
        <div className="stl-topbar__title">
          <div className="stl-h1">Welcome, {userName} <span aria-hidden="true" className="stl-wave">✌️</span></div>
          <div className="stl-subtitle">{subtitle}</div>
        </div>
      </div>

      <div className="stl-topbar__right" aria-label="Toolbar">
        <div className="stl-toolbar">
          {showNotifications ? (
            <IconButton
              label="Notifications"
              icon="bell"
              badge={unread > 0}
              onClick={() => setOpen(true)}
            />
          ) : null}
        </div>
      </div>

      <NotificationsModal
        open={open}
        onClose={() => setOpen(false)}
        notifications={notifications}
      />
    </div>
  );
}

