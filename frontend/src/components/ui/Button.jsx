import React from 'react';
import { Icon } from './Icon.jsx';

export function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  className = '',
  children,
  ...props
}) {
  const classes = [
    'stl-btn',
    `stl-btn--${variant}`,
    `stl-btn--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} type="button" {...props}>
      {leftIcon ? <Icon name={leftIcon} size={18} className="stl-btn__icon" /> : null}
      <span className="stl-btn__label">{children}</span>
      {rightIcon ? <Icon name={rightIcon} size={18} className="stl-btn__icon" /> : null}
    </button>
  );
}

export function IconButton({ label, icon, badge, className = '', ...props }) {
  return (
    <button
      type="button"
      className={['stl-icon-btn', className].filter(Boolean).join(' ')}
      aria-label={label}
      title={label}
      {...props}
    >
      <Icon name={icon} size={18} />
      {badge ? <span className="stl-icon-btn__badge" aria-hidden="true" /> : null}
    </button>
  );
}

