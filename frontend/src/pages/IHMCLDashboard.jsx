import React, { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPatch } from '../lib/apiClient.js';
import { AppShell } from '../components/layout/AppShell.jsx';
import { DataTable } from '../components/ui/Table.jsx';
import { Pagination } from '../components/ui/Pagination.jsx';
import { StatusPill } from '../components/ui/Pill.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { useNotifications } from '../hooks/useNotifications.js';

function IHMCLDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const pageSize = 7;
  const [selected, setSelected] = useState(null);
  const [bankFilter, setBankFilter] = useState('');
  const [plazaFilter, setPlazaFilter] = useState('');
  const notifications = useNotifications({ role: 'IHMCL', userId: 'admin' });

  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      try {
        const res = await apiGet(`/complaints`);
        setComplaints(res || []);
      } catch (err) {
        setComplaints([]);
      }
      setLoading(false);
    };
    fetchComplaints();
  }, []);

  const bankOptions = useMemo(() => {
    const map = new Map();
    for (const c of complaints) {
      const id = c.assigned_bank_id;
      const label = c.issuer_banks?.name || 'Unmapped';
      const key = id ?? '__unmapped__';
      if (!map.has(key)) map.set(key, { value: id ?? '__unmapped__', label });
    }
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [complaints]);

  const plazaOptions = useMemo(() => {
    const map = new Map();
    for (const c of complaints) {
      const id = c.toll_plaza_id;
      if (!id) continue;
      const label = c.toll_plazas?.name || c.toll_plazas?.plaza_code || 'Unknown plaza';
      if (!map.has(id)) map.set(id, { value: id, label });
    }
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [complaints]);

  const filtered = complaints
    .filter((c) => {
      if (!bankFilter) return true;
      if (bankFilter === '__unmapped__') return !c.assigned_bank_id;
      return c.assigned_bank_id === bankFilter;
    })
    .filter((c) => {
      if (!plazaFilter) return true;
      return c.toll_plaza_id === plazaFilter;
    })
    .filter((c) => {
      if (status === 'All') return true;
      return c.status === status;
    })
    .filter((c) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      const hay = [
        c.case_id,
        c.fastag_id,
        c.vrn,
        c.toll_plazas?.name,
        c.toll_plazas?.plaza_code,
        c.issuer_banks?.name,
        c.issuer_banks?.bank_code,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const clampedPage = Math.min(page, pageCount);
  const pageRows = filtered.slice((clampedPage - 1) * pageSize, clampedPage * pageSize);

  useEffect(() => {
    setPage(1);
  }, [query, status, bankFilter, plazaFilter]);

  const columns = [
    { key: 'case', header: 'Case ID', cell: (c) => <span className="font-mono">{c.case_id}</span> },
    { key: 'fastag', header: 'FASTag ID', cell: (c) => <span className="font-mono">{c.fastag_id}</span> },
    { key: 'vrn', header: 'VRN', cell: (c) => <span className="font-mono">{c.vrn}</span> },
    { key: 'plaza', header: 'Toll Plaza', cell: (c) => c.toll_plazas?.name || '—' },
    { key: 'bank', header: 'Assigned Bank', cell: (c) => c.issuer_banks?.name || 'Unmapped' },
    { key: 'status', header: 'Status', cell: (c) => <StatusPill status={c.status} /> },
    {
      key: 'view',
      header: '',
      cell: (c) => (
        <Button variant="primary" onClick={() => setSelected(c)}>
          View
        </Button>
      ),
      style: { justifySelf: 'end' },
    },
  ];

  return (
    <AppShell
      activeSidebarLabel="Reports"
      userName="IHMCL"
      subtitle="Monitor all complaints across the network."
      sidebarItems={[
        { label: 'Dashboard', icon: 'grid', to: '/ihmcl/dashboard' },
        { label: 'Reports', icon: 'report', to: '/ihmcl/reports' },
      ]}
      topbar={{ showNotifications: true }}
      notifications={notifications}
    >
      <section className="stl-panel" aria-label="Admin complaints table">
        <div className="stl-panel__header">
          <div className="stl-panel__title">All Complaints</div>
          <div className="stl-panel__toolbar stl-panel__toolbar--wrap">
            <select
              className="stl-select"
              value={bankFilter}
              onChange={(e) => setBankFilter(e.target.value)}
              aria-label="Filter by bank"
            >
              <option value="">All banks</option>
              {bankOptions.map((o) => (
                <option key={String(o.value)} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              className="stl-select"
              value={plazaFilter}
              onChange={(e) => setPlazaFilter(e.target.value)}
              aria-label="Filter by toll plaza"
            >
              <option value="">All plazas</option>
              {plazaOptions.map((o) => (
                <option key={String(o.value)} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <input
              className="stl-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Case ID / FASTag / VRN / Plaza / Bank"
            />
            <select className="stl-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="All">Status</option>
              <option value="Pending">Pending</option>
              <option value="Fined">Fined</option>
              <option value="Blocked">Blocked</option>
              <option value="No Issue">No Issue</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="stl-table">
            <div className="stl-table__empty">Loading…</div>
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={pageRows}
              rowKey={(c) => c.id}
              gridTemplateColumns="150px 190px 120px 1fr 220px 120px 90px"
              emptyText="No complaints found."
            />
            <Pagination page={clampedPage} pageCount={pageCount} onChange={setPage} />
          </>
        )}
      </section>

      <Modal
        open={!!selected}
        title={selected ? `Complaint • ${selected.case_id}` : 'Complaint'}
        onClose={() => setSelected(null)}
        footer={
          selected ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <StatusPill status={selected.status} />
                {selected.bank_action_reason ? (
                  <span style={{ fontSize: 12.5, color: 'rgba(16,18,23,0.58)', fontWeight: 700 }}>
                    Reason: {selected.bank_action_reason}
                  </span>
                ) : null}
              </div>
              <div style={{ fontSize: 12.5, color: 'rgba(16,18,23,0.55)', fontWeight: 700 }}>
                Assigned bank: {selected.issuer_banks?.name || 'Unmapped'}
              </div>
            </div>
          ) : null
        }
      >
        {selected ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 14 }}>
            <div className="stl-image-card">
              {selected.image_url ? (
                <img src={selected.image_url} alt={`Vehicle image for ${selected.case_id}`} />
              ) : (
                <div style={{ padding: 18, color: 'rgba(16,18,23,0.55)', fontWeight: 700 }}>No image uploaded</div>
              )}
            </div>

            <div className="stl-kv" aria-label="Complaint details">
              <div className="stl-kv__k">FASTag ID</div>
              <div className="stl-kv__v font-mono">{selected.fastag_id}</div>

              <div className="stl-kv__k">VRN</div>
              <div className="stl-kv__v font-mono">{selected.vrn}</div>

              <div className="stl-kv__k">Toll Plaza</div>
              <div className="stl-kv__v">{selected.toll_plazas?.name || '—'}</div>

              <div className="stl-kv__k">Lane</div>
              <div className="stl-kv__v font-mono">{selected.lane_id}</div>

              <div className="stl-kv__k">Crossing time</div>
              <div className="stl-kv__v">{new Date(selected.crossing_datetime).toLocaleString()}</div>

              <div className="stl-kv__k">Submitted at</div>
              <div className="stl-kv__v">{new Date(selected.created_at).toLocaleString()}</div>

              <div className="stl-kv__k">Bank acted at</div>
              <div className="stl-kv__v">
                {selected.bank_acted_at ? new Date(selected.bank_acted_at).toLocaleString() : '—'}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </AppShell>
  );
}

export default IHMCLDashboard;