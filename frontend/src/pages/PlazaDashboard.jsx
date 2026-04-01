import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AppShell } from '../components/layout/AppShell.jsx';
import { StatusPill } from '../components/ui/Pill.jsx';
import { useNotifications } from '../hooks/useNotifications.js';

function daysBetween(from, to) {
  const a = new Date(from).getTime();
  const b = new Date(to).getTime();
  if (Number.isNaN(a) || Number.isNaN(b) || b < a) return null;
  return (b - a) / (1000 * 60 * 60 * 24);
}

export default function PlazaDashboard() {
  const user = JSON.parse(localStorage.getItem('fastag_user'));
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const notifications = useNotifications({ role: 'plaza', userId: user?.id });

  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/complaints?plaza_id=${user.id}`);
        setComplaints(res.data || []);
      } catch {
        setComplaints([]);
      }
      setLoading(false);
    };
    fetchComplaints();
  }, [user.id]);

  const metrics = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter((c) => c.status === 'Pending').length;
    const resolved = complaints.filter((c) => c.status !== 'Pending').length;
    const today = complaints.filter((c) => {
      const d = new Date(c.created_at);
      const n = new Date();
      return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
    }).length;
    const fined = complaints.filter((c) => c.status === 'Fined').length;
    const blocked = complaints.filter((c) => c.status === 'Blocked').length;
    const noIssue = complaints.filter((c) => c.status === 'No Issue').length;
    const resolvedWithActionTime = complaints
      .filter((c) => c.bank_acted_at)
      .map((c) => daysBetween(c.created_at, c.bank_acted_at))
      .filter((v) => v !== null);
    const avgDays = resolvedWithActionTime.length
      ? (resolvedWithActionTime.reduce((a, b) => a + b, 0) / resolvedWithActionTime.length).toFixed(2)
      : '0.00';

    return { total, pending, resolved, today, fined, blocked, noIssue, avgDays };
  }, [complaints]);

  const recent = useMemo(
    () =>
      [...complaints]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 8),
    [complaints]
  );

  const sidebarItems = [
    { label: 'Dashboard', icon: 'grid', to: '/plaza/dashboard' },
    { label: 'Submit Complaint', icon: 'plus', to: '/plaza/submit' },
    { label: 'Reports', icon: 'report', to: '/plaza/reports' },
  ];

  return (
    <AppShell
      activeSidebarLabel="Dashboard"
      userName={user?.label?.split('—')?.[0]?.trim() || 'Toll Plaza'}
      subtitle="Complaint performance overview for your plaza."
      sidebarItems={sidebarItems}
      topbar={{ showNotifications: true, showCalendar: true }}
      notifications={notifications}
    >
      <section className="stl-panel">
        <div className="stl-panel__header">
          <div className="stl-panel__title">Dashboard</div>
        </div>
        {loading ? (
          <div className="stl-table__empty">Loading metrics…</div>
        ) : (
          <>
            <div className="stl-metrics">
              <div className="stl-metric"><div className="stl-metric__k">Total complaints</div><div className="stl-metric__v">{metrics.total}</div></div>
              <div className="stl-metric"><div className="stl-metric__k">Pending</div><div className="stl-metric__v">{metrics.pending}</div></div>
              <div className="stl-metric"><div className="stl-metric__k">Resolved</div><div className="stl-metric__v">{metrics.resolved}</div></div>
              <div className="stl-metric"><div className="stl-metric__k">Submitted today</div><div className="stl-metric__v">{metrics.today}</div></div>
              <div className="stl-metric"><div className="stl-metric__k">Fined / Blocked</div><div className="stl-metric__v">{metrics.fined} / {metrics.blocked}</div></div>
              <div className="stl-metric"><div className="stl-metric__k">No issue</div><div className="stl-metric__v">{metrics.noIssue}</div></div>
              <div className="stl-metric"><div className="stl-metric__k">Avg resolution (days)</div><div className="stl-metric__v">{metrics.avgDays}</div></div>
            </div>

            <div className="stl-subpanel">
              <div className="stl-subpanel__title">Recent complaints</div>
              <div className="stl-mini-table">
                <div className="stl-mini-head">
                  <div>Case ID</div><div>FASTag</div><div>VRN</div><div>Status</div><div>Submitted</div>
                </div>
                {recent.map((c) => (
                  <div className="stl-mini-row" key={c.id}>
                    <div>{c.case_id}</div>
                    <div>{c.fastag_id}</div>
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

