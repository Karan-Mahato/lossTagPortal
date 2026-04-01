import React from 'react';

export function Pagination({ page, pageCount, onChange }) {
  if (pageCount <= 1) return null;

  const safeSet = (p) => {
    const next = Math.max(1, Math.min(pageCount, p));
    onChange?.(next);
  };

  const pages = [];
  for (let i = 1; i <= pageCount; i += 1) pages.push(i);

  return (
    <div className="stl-pagination" role="navigation" aria-label="Pagination">
      <button
        type="button"
        className="stl-page-btn stl-page-btn--nav"
        onClick={() => safeSet(page - 1)}
        aria-label="Previous page"
        disabled={page <= 1}
      >
        ‹
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={['stl-page-btn', p === page ? 'is-active' : ''].filter(Boolean).join(' ')}
          onClick={() => safeSet(p)}
          aria-current={p === page ? 'page' : undefined}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        className="stl-page-btn stl-page-btn--nav"
        onClick={() => safeSet(page + 1)}
        aria-label="Next page"
        disabled={page >= pageCount}
      >
        ›
      </button>
    </div>
  );
}

