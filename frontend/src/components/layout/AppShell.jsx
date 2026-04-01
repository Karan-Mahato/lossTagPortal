import React from 'react';
import { Sidebar } from './Sidebar.jsx';
import { TopBar } from './TopBar.jsx';

export function AppShell({
  activeSidebarLabel = 'Purchase',
  userName = 'Josiah',
  subtitle,
  sidebarItems,
  topbar,
  notifications,
  children,
}) {
  return (
    <div className="stl-app">
      <div className="stl-frame">
        <Sidebar activeLabel={activeSidebarLabel} items={sidebarItems} />
        <main className="stl-main">
          <TopBar userName={userName} subtitle={subtitle} notifications={notifications} {...topbar} />
          <div className="stl-content">{children}</div>
        </main>
      </div>
    </div>
  );
}

