import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '../ui/Icon.jsx';

const defaultItems = [
  { label: 'Complaints', icon: 'grid', to: '#' },
  { label: 'Reports', icon: 'report', to: '#' },
];

export function Sidebar({ activeLabel = 'Complaints', items = defaultItems, bottomItems }) {
  return (
    <aside className="stl-sidebar">
      <div className="stl-sidebar__brand">
        <div className="stl-brand-mark" aria-hidden="true">
          <span className="stl-star" />
        </div>
        <div className="stl-brand-text">
          <div className="stl-brand-name">FASTag Portal</div>
        </div>
      </div>

      <nav className="stl-sidebar__nav" aria-label="Primary">
        {items.map((it) => {
          const isActive = it.label === activeLabel;
          const cls = ['stl-nav-item', isActive ? 'is-active' : ''].filter(Boolean).join(' ');

          // Use a regular <a> for "#" placeholders so we don’t break router.
          if (it.to === '#') {
            return (
              <a key={it.label} className={cls} href="#" onClick={(e) => e.preventDefault()}>
                <Icon name={it.icon} size={18} className="stl-nav-item__icon" />
                <span className="stl-nav-item__label">{it.label}</span>
              </a>
            );
          }

          return (
            <NavLink key={it.label} to={it.to} className={cls}>
              <Icon name={it.icon} size={18} className="stl-nav-item__icon" />
              <span className="stl-nav-item__label">{it.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="stl-sidebar__bottom">
        {(bottomItems || [
          { label: 'Help', icon: 'help', to: '#' },
          { label: 'Logout', icon: 'logout', to: 'logout' },
        ]).map((it) => (
          it.to === 'logout' ? (
            <button
              key={it.label}
              type="button"
              className="stl-nav-item stl-nav-item--muted"
              onClick={() => {
                localStorage.removeItem('fastag_user');
                window.location.assign('/');
              }}
            >
              <Icon name={it.icon} size={18} className="stl-nav-item__icon" />
              <span className="stl-nav-item__label">{it.label}</span>
            </button>
          ) : (
            <a
              key={it.label}
              className="stl-nav-item stl-nav-item--muted"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              <Icon name={it.icon} size={18} className="stl-nav-item__icon" />
              <span className="stl-nav-item__label">{it.label}</span>
            </a>
          )
        ))}
      </div>
    </aside>
  );
}

