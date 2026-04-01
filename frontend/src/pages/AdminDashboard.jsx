import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AppShell } from '../components/layout/AppShell.jsx';
import { useNotifications } from '../hooks/useNotifications.js';

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const notifications = useNotifications({ role: 'admin', userId: 'admin' });

  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/complaints`);
        setComplaints(res.data || []);
      } catch {
        setComplaints([]);
      }
      setLoading(false);
    };
    fetchComplaints();
  }, []);

  const metrics = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter((c) => c.status === 'Pending').length;
    const resolved = complaints.filter((c) => c.status !== 'Pending').length;
    const uniqueBanks = new Set(complaints.map((c) => c.issuer_banks?.name).filter(Boolean)).size;
    const uniquePlazas = new Set(complaints.map((c) => c.toll_plazas?.name).filter(Boolean)).size;
    const resolutionRate = total ? ((resolved / total) * 100).toFixed(1) : '0.0';
    return { total, pending, resolved, uniqueBanks, uniquePlazas, resolutionRate };
  }, [complaints]);

  const topBanks = useMemo(() => {
    const map = new Map();
    for (const c of complaints) {
      const label = c.issuer_banks?.name || 'Unmapped';
      const entry = map.get(label) || { label, total: 0, pending: 0, resolved: 0 };
      entry.total += 1;
      if (c.status === 'Pending') entry.pending += 1;
      else entry.resolved += 1;
      map.set(label, entry);
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total).slice(0, 8);
  }, [complaints]);

  const topPlazas = useMemo(() => {
    const map = new Map();
    for (const c of complaints) {
      const label = c.toll_plazas?.name || 'Unknown plaza';
      const entry = map.get(label) || { label, total: 0, pending: 0, resolved: 0 };
      entry.total += 1;
      if (c.status === 'Pending') entry.pending += 1;
      else entry.resolved += 1;
      map.set(label, entry);
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total).slice(0, 8);
  }, [complaints]);

  return (
    <AppShell
      activeSidebarLabel="Dashboard"
      userName="IHMCL"
      subtitle="Network-wide FASTag complaint intelligence."
      sidebarItems={[
        { label: 'Dashboard', icon: 'grid', to: '/ihmcl/dashboard' },
        { label: 'Reports', icon: 'report', to: '/ihmcl/reports' },
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
              <div className="stl-metric"><div className="stl-metric__k">Total complaints</div><div className="stl-metric__v">{metrics.total}</div></div>
              <div className="stl-metric"><div className="stl-metric__k">Pending</div><div className="stl-metric__v">{metrics.pending}</div></div>
              <div className="stl-metric"><div className="stl-metric__k">Resolved</div><div className="stl-metric__v">{metrics.resolved}</div></div>
              <div className="stl-metric"><div className="stl-metric__k">Resolution rate</div><div className="stl-metric__v">{metrics.resolutionRate}%</div></div>
              <div className="stl-metric"><div className="stl-metric__k">Active banks</div><div className="stl-metric__v">{metrics.uniqueBanks}</div></div>
              <div className="stl-metric"><div className="stl-metric__k">Active plazas</div><div className="stl-metric__v">{metrics.uniquePlazas}</div></div>
            </div>

            <div className="stl-grid-2x2" style={{ marginTop: 14 }}>
              <div className="stl-subpanel">
                <div className="stl-subpanel__title">By Issuer Bank</div>
                <div className="stl-mini-table stl-mini-table--4">
                  <div className="stl-mini-head"><div>Bank</div><div>Total</div><div>Pending</div><div>Resolved</div></div>
                  {topBanks.map((b) => (
                    <div className="stl-mini-row" key={b.label}>
                      <div>{b.label}</div><div>{b.total}</div><div>{b.pending}</div><div>{b.resolved}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="stl-subpanel">
                <div className="stl-subpanel__title">By Toll Plaza</div>
                <div className="stl-mini-table stl-mini-table--4">
                  <div className="stl-mini-head"><div>Plaza</div><div>Total</div><div>Pending</div><div>Resolved</div></div>
                  {topPlazas.map((p) => (
                    <div className="stl-mini-row" key={p.label}>
                      <div>{p.label}</div><div>{p.total}</div><div>{p.pending}</div><div>{p.resolved}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </AppShell>
  );
}

