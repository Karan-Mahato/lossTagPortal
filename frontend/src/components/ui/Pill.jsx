import React from 'react';

const statusToTone = {
  Pending: 'pending',
  Fined: 'fined',
  Blocked: 'blocked',
  'No Issue': 'clear',
  Delivered: 'delivered',
};

export function Pill({ tone = 'neutral', children, className = '' }) {
  return (
    <span className={['stl-pill', `stl-pill--${tone}`, className].filter(Boolean).join(' ')}>
      {children}
    </span>
  );
}

export function StatusPill({ status, className = '' }) {
  const tone = statusToTone[status] || 'neutral';
  return <Pill tone={tone} className={className}>{status}</Pill>;
}

