import React from 'react';

export function DataTable({
  columns,
  rows,
  rowKey = (r) => r.id,
  emptyText = 'No data.',
  gridTemplateColumns,
}) {
  return (
    <div className="stl-table" style={gridTemplateColumns ? { '--stl-cols': gridTemplateColumns } : undefined}>
      <div className="stl-table__head">
        {columns.map((c) => (
          <div key={c.key} className="stl-th" style={c.style}>
            {c.header}
          </div>
        ))}
      </div>

      <div className="stl-table__body">
        {rows.length === 0 ? (
          <div className="stl-table__empty">{emptyText}</div>
        ) : (
          rows.map((r) => (
            <div key={rowKey(r)} className="stl-tr">
              {columns.map((c) => (
                <div key={c.key} className="stl-td" style={c.style}>
                  {c.cell ? c.cell(r) : r[c.key]}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

