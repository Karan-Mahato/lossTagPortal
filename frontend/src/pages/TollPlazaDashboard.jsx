import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { apiGet, apiPost } from '../lib/apiClient.js';
import { AppShell } from '../components/layout/AppShell.jsx';
import { Button } from '../components/ui/Button.jsx';
import { DataTable } from '../components/ui/Table.jsx';
import { Pagination } from '../components/ui/Pagination.jsx';
import { StatusPill } from '../components/ui/Pill.jsx';
import { Modal } from '../components/ui/Modal.jsx';

function TollPlazaDashboard() {
  const user = JSON.parse(localStorage.getItem('fastag_user'));
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ fastag_id: '', vrn: '', lane_id: '', crossing_datetime: '', image: null });
  const [submitting, setSubmitting] = useState(false);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const pageSize = 7;
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await apiGet(`/complaints?plaza_id=${user?.plaza_id}`);
      setComplaints(res || []);
    } catch (err) {
      setComplaints([]);
    }
    setLoading(false);
  };

  const uploadImage = async (file) => {
    const path = `complaints/${Date.now()}-${file.name}`;
    await supabase.storage.from('complaint_images').upload(path, file);
    const { data } = supabase.storage
      .from('complaint_images')
      .getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const imageUrl = await uploadImage(form.image);
      await apiPost(`/complaints`, {
        fastag_id: form.fastag_id,
        vrn: form.vrn,
        lane_id: form.lane_id,
        crossing_datetime: form.crossing_datetime,
        toll_plaza_id: user?.plaza_id,
        image_url: imageUrl
      });
      setForm({ fastag_id: '', vrn: '', lane_id: '', crossing_datetime: '', image: null });
      fetchComplaints();
    } catch (err) {
      alert('Failed to submit complaint.');
    }
    setSubmitting(false);
  };

  const filtered = complaints
    .filter((c) => {
      if (status === 'All') return true;
      return c.status === status;
    })
    .filter((c) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      const hay = [c.case_id, c.fastag_id, c.vrn, c.lane_id, c.issuer_banks?.name]
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
  }, [query, status]);

  const columns = [
    { key: 'case', header: 'Case ID', cell: (c) => <span className="font-mono">{c.case_id}</span> },
    { key: 'fastag', header: 'FASTag ID', cell: (c) => <span className="font-mono">{c.fastag_id}</span> },
    { key: 'vrn', header: 'VRN', cell: (c) => <span className="font-mono">{c.vrn}</span> },
    { key: 'lane', header: 'Lane', cell: (c) => <span className="font-mono">{c.lane_id}</span> },
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
      activeSidebarLabel="Complaints"
      userName={user?.label?.split('—')?.[0]?.trim() || 'Toll Plaza'}
      subtitle="Create and track submitted cases."
    >
      <section className="stl-panel" aria-label="Submit complaint">
        <div className="stl-panel__header">
          <div className="stl-panel__title">Submit Complaint</div>
          <div className="stl-panel__toolbar" />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <input
            className="stl-input"
            placeholder="FASTag ID"
            required
            value={form.fastag_id}
            onChange={(e) => setForm((f) => ({ ...f, fastag_id: e.target.value }))}
          />
          <input
            className="stl-input"
            placeholder="VRN"
            required
            value={form.vrn}
            onChange={(e) => setForm((f) => ({ ...f, vrn: e.target.value }))}
          />
          <input
            className="stl-input"
            placeholder="Lane ID"
            required
            value={form.lane_id}
            onChange={(e) => setForm((f) => ({ ...f, lane_id: e.target.value }))}
          />
          <input
            className="stl-input"
            required
            type="datetime-local"
            value={form.crossing_datetime}
            onChange={(e) => setForm((f) => ({ ...f, crossing_datetime: e.target.value }))}
            style={{ gridColumn: 'span 2' }}
          />
          <input
            className="stl-input"
            required
            type="file"
            accept="image/*"
            onChange={(e) => setForm((f) => ({ ...f, image: e.target.files?.[0] || null }))}
          />

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Complaint'}
            </Button>
          </div>
        </form>
      </section>

      <section className="stl-panel" aria-label="My complaints table">
        <div className="stl-panel__header">
          <div className="stl-panel__title">My Submitted Complaints</div>
          <div className="stl-panel__toolbar">
            <input
              className="stl-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Case ID / FASTag / VRN"
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
              gridTemplateColumns="150px 190px 120px 90px 1fr 120px 90px"
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

export default TollPlazaDashboard;