import React from 'react';

const common = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function Icon({ name, size = 18, className = '' }) {
  const props = { width: size, height: size, viewBox: '0 0 24 24', className };

  switch (name) {
    case 'grid':
      return (
        <svg {...props} {...common}>
          <path d="M4 4h7v7H4z" />
          <path d="M13 4h7v7h-7z" />
          <path d="M4 13h7v7H4z" />
          <path d="M13 13h7v7h-7z" />
        </svg>
      );
    case 'cart':
      return (
        <svg {...props} {...common}>
          <path d="M6 6h15l-1.5 9h-12z" />
          <path d="M6 6 5 3H2" />
          <path d="M8 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
          <path d="M17 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
        </svg>
      );
    case 'pos':
      return (
        <svg {...props} {...common}>
          <path d="M7 7h10v10H7z" />
          <path d="M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
          <path d="M9 11h6" />
          <path d="M9 14h4" />
        </svg>
      );
    case 'sales':
      return (
        <svg {...props} {...common}>
          <path d="M4 19V5" />
          <path d="M20 19H4" />
          <path d="M7 15l4-4 3 3 5-6" />
        </svg>
      );
    case 'accounting':
      return (
        <svg {...props} {...common}>
          <path d="M7 3h10v18H7z" />
          <path d="M9.5 7h5" />
          <path d="M9.5 11h5" />
          <path d="M9.5 15h5" />
        </svg>
      );
    case 'users':
      return (
        <svg {...props} {...common}>
          <path d="M16 11a4 4 0 1 0-8 0" />
          <path d="M12 11a4 4 0 0 0 4-4" />
          <path d="M6 21a6 6 0 0 1 12 0" />
        </svg>
      );
    case 'payroll':
      return (
        <svg {...props} {...common}>
          <path d="M12 1v22" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case 'report':
      return (
        <svg {...props} {...common}>
          <path d="M8 3h8l4 4v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
          <path d="M16 3v4h4" />
          <path d="M9 13h6" />
          <path d="M9 17h6" />
          <path d="M9 9h3" />
        </svg>
      );
    case 'settings':
      return (
        <svg {...props} {...common}>
          <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
          <path d="M19.4 15a7.8 7.8 0 0 0 .1-1l2-1.2-2-3.5-2.3.6a7.4 7.4 0 0 0-1.7-1l-.3-2.3H10.8l-.3 2.3a7.4 7.4 0 0 0-1.7 1l-2.3-.6-2 3.5 2 1.2a7.8 7.8 0 0 0 .1 1 7.8 7.8 0 0 0-.1 1l-2 1.2 2 3.5 2.3-.6a7.4 7.4 0 0 0 1.7 1l.3 2.3h4.4l.3-2.3a7.4 7.4 0 0 0 1.7-1l2.3.6 2-3.5-2-1.2a7.8 7.8 0 0 0-.1-1Z" />
        </svg>
      );
    case 'help':
      return (
        <svg {...props} {...common}>
          <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" />
          <path d="M9.5 9a2.5 2.5 0 1 1 4.3 1.7c-.8.8-1.8 1.3-1.8 2.8" />
          <path d="M12 17h.01" />
        </svg>
      );
    case 'search':
      return (
        <svg {...props} {...common}>
          <path d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
      );
    case 'moon':
      return (
        <svg {...props} {...common}>
          <path d="M21 13.5A8.5 8.5 0 0 1 10.5 3a7 7 0 1 0 10.5 10.5Z" />
        </svg>
      );
    case 'sun':
      return (
        <svg {...props} {...common}>
          <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="M4.9 4.9l1.4 1.4" />
          <path d="M17.7 17.7l1.4 1.4" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="M4.9 19.1l1.4-1.4" />
          <path d="M17.7 6.3l1.4-1.4" />
        </svg>
      );
    case 'bell':
      return (
        <svg {...props} {...common}>
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
      );
    case 'calendar':
      return (
        <svg {...props} {...common}>
          <path d="M8 2v4" />
          <path d="M16 2v4" />
          <path d="M3 10h18" />
          <path d="M5 6h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
        </svg>
      );
    case 'chevronDown':
      return (
        <svg {...props} {...common}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );
    case 'dots':
      return (
        <svg {...props} {...common}>
          <path d="M12 12h.01" />
          <path d="M19 12h.01" />
          <path d="M5 12h.01" />
        </svg>
      );
    case 'plus':
      return (
        <svg {...props} {...common}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );
    case 'logout':
      return (
        <svg {...props} {...common}>
          <path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
          <path d="M14 8l4 4-4 4" />
          <path d="M18 12H8" />
        </svg>
      );
    default:
      return <span className={className} style={{ width: size, height: size, display: 'inline-block' }} />;
  }
}

