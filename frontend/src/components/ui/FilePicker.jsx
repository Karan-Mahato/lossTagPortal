import React, { useId, useRef } from 'react';

export function FilePicker({ label, accept, required, value, onChange }) {
  const id = useId();
  const inputRef = useRef(null);

  return (
    <div className="stl-field">
      <label className="stl-field__label" htmlFor={id}>
        {label}
      </label>
      <div className="stl-file" role="group" aria-label={label}>
        <div className="stl-file__name">{value?.name || 'No file selected'}</div>
        <button
          type="button"
          className="stl-file__btn"
          onClick={() => inputRef.current?.click()}
        >
          Choose file
        </button>
        <input
          id={id}
          ref={inputRef}
          className="stl-file__input"
          type="file"
          accept={accept}
          required={required}
          onChange={(e) => onChange?.(e.target.files?.[0] || null)}
        />
      </div>
    </div>
  );
}

