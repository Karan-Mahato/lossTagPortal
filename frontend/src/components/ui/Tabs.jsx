import React from 'react';

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="stl-tabs" role="tablist" aria-label="Sections">
      {tabs.map((t) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={['stl-tab', isActive ? 'is-active' : ''].filter(Boolean).join(' ')}
            onClick={() => onChange?.(t.id)}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

