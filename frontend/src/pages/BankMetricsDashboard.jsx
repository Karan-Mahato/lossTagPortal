import React, { useEffect, useMemo, useState } from 'react';
import { apiGet } from '../lib/apiClient.js';
import { AppShell } from '../components/layout/AppShell.jsx';
import { StatusPill } from '../components/ui/Pill.jsx';
import { useNotifications } from '../hooks/useNotifications.js';

export default function BankMetricsDashboard() {
  const user = JSON.parse(localStorage.getItem('fastag_user'));
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const notifications = useNotifications({ role: 'BANK', userId: user?.bank_id });

  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      try {
        const res = await apiGet(`/complaints?bank_id=${user?.bank_id}`);
        setComplaints(res || []);
      } catch {
        setComplaints([]);
      }
      setLoading(false);
    };
    fetchComplaints();
  }, [user?.bank_id]);

  const metrics = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter((c) => c.status === 'Pending').length;
    const resolved = complaints.filter((c) => c.status !== 'Pending').length;
    const fined = complaints.filter((c) => c.status === 'Fined').length;
    const blocked = complaints.filter((c) => c.status === 'Blocked').length;
    const noIssue = complaints.filter((c) => c.status === 'No Issue').length;
    const resolutionRate = total ? ((resolved / total) * 100).toFixed(1) : '0.0';
    return { total, pending, resolved, fined, blocked, noIssue, resolutionRate };
  }, [complaints]);

  const recent = useMemo(
    () =>
      [...complaints]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 8),
    [complaints]
  );

  return (
    <AppShell
      activeSidebarLabel="Dashboard"
      userName={user?.label || 'Bank'}
      subtitle="Operational metrics for your assigned complaints."
      sidebarItems={[
        { label: 'Dashboard', icon: 'grid', to: '/bank/dashboard' },
        { label: 'Reports', icon: 'report', to: '/bank/reports' },
      ]}
      topbar={{ showNotifications: true, showCalendar: true }}
      notifications={notifications}
    >
      <section className="stl-panel">
        <div className="stl-panel__header"><div className="stl-panel__title">Dashboard</div></div>
        {loading ? (
          <div className="stl-table__empty">Loading metrics…</div>
        ) : (
          <>
            <div className="stl-metrics">
              <div className="stl-metric"><div className="stl-metric__k">Assigned complaints</div><div className="stl-metric__v">{metrics.total}</div></div>
              <div className="stl-metric"><div className="stl-metric__k">Pending</div><div className="stl-metric__v">{metrics.pending}</div></div>
              <div className="stl-metric"><div className="stl-metric__k">Resolved</div><div className="stl-metric__v">{metrics.resolved}</div></div>
              <div className="stl-metric"><div className="stl-metric__k">Resolution rate</div><div className="stl-metric__v">{metrics.resolutionRate}%</div></div>
              <div className="stl-metric"><div className="stl-metric__k">Fined</div><div className="stl-metric__v">{metrics.fined}</div></div>
              <div className="stl-metric"><div className="stl-metric__k">Blocked</div><div className="stl-metric__v">{metrics.blocked}</div></div>
              <div className="stl-metric"><div className="stl-metric__k">No issue</div><div className="stl-metric__v">{metrics.noIssue}</div></div>
            </div>

            <div className="stl-subpanel">
              <div className="stl-subpanel__title">Recent assigned complaints</div>
              <div className="stl-mini-table">
                <div className="stl-mini-head">
                  <div>Case ID</div><div>Plaza</div><div>VRN</div><div>Status</div><div>Submitted</div>
                </div>
                {recent.map((c) => (
                  <div className="stl-mini-row" key={c.id}>
                    <div>{c.case_id}</div>
                    <div>{c.toll_plazas?.name || '—'}</div>
                    <div>{c.vrn}</div>
                    <div><StatusPill status={c.status} /></div>
                    <div>{new Date(c.created_at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </section>
    </AppShell>
  );
}

