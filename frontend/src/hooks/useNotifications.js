import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiGet } from '../lib/apiClient.js';

function storageKey(role, userId) {
  return `fastag_notifications:${role}:${userId}`;
}

function readState(role, userId) {
  try {
    const raw = localStorage.getItem(storageKey(role, userId));
    if (!raw) return { snapshot: {}, read: {} };
    const parsed = JSON.parse(raw);
    return {
      snapshot: parsed.snapshot || {},
      read: parsed.read || {},
    };
  } catch {
    return { snapshot: {}, read: {} };
  }
}

function writeState(role, userId, state) {
  localStorage.setItem(storageKey(role, userId), JSON.stringify(state));
}

function formatTs(iso) {
  try {
    return new Date(iso).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function buildComplaintUrl(role, userId) {
  if (role === 'PLAZA') return `/complaints?plaza_id=${userId}`;
  if (role === 'BANK') return `/complaints?bank_id=${userId}`;
  return '/complaints';
}

function toSnapshot(c) {
  return {
    status: c.status,
    bank_action_reason: c.bank_action_reason || '',
    bank_acted_at: c.bank_acted_at || '',
    created_at: c.created_at || '',
  };
}

function diffToNotifications(prevSnap, complaint) {
  const next = toSnapshot(complaint);
  const prev = prevSnap[complaint.id];
  const out = [];

  if (!prev) {
    out.push({
      id: `${complaint.id}:new:${formatTs(next.created_at)}`,
      complaintId: complaint.id,
      caseId: complaint.case_id,
      type: 'new',
      title: 'New complaint submitted',
      message: `${complaint.case_id} • ${complaint.vrn} • ${complaint.fastag_id}`,
      ts: next.created_at || new Date().toISOString(),
    });
    return out;
  }

  if (prev.status !== next.status) {
    out.push({
      id: `${complaint.id}:status:${formatTs(next.bank_acted_at || new Date().toISOString())}`,
      complaintId: complaint.id,
      caseId: complaint.case_id,
      type: 'status',
      title: 'Complaint status updated',
      message: `${complaint.case_id} • ${prev.status} → ${next.status}`,
      ts: next.bank_acted_at || new Date().toISOString(),
    });
  }

  if ((prev.bank_action_reason || '') !== (next.bank_action_reason || '')) {
    out.push({
      id: `${complaint.id}:reason:${formatTs(next.bank_acted_at || new Date().toISOString())}`,
      complaintId: complaint.id,
      caseId: complaint.case_id,
      type: 'reason',
      title: 'Action reason added',
      message: `${complaint.case_id} • ${complaint.bank_action_reason || ''}`,
      ts: next.bank_acted_at || new Date().toISOString(),
    });
  }

  return out;
}

export function useNotifications({ role, userId, pollMs = 15000 }) {
  const [items, setItems] = useState([]);
  const [readMap, setReadMap] = useState({});
  const inited = useRef(false);

  const refresh = useCallback(async () => {
    if (!role || !userId) return;

    try {
      const state = readState(role, userId);
      const prevSnapshot = state.snapshot || {};
      const prevRead = state.read || {};

      const endpoint = buildComplaintUrl(role, userId);
      console.log('📋 Fetching complaints from:', endpoint);
      
      const complaints = await apiGet(endpoint);
      console.log('✅ Complaints fetched:', complaints.length);

      const nextSnapshot = {};
      const nextItems = [];
      for (const c of complaints) {
        nextSnapshot[c.id] = toSnapshot(c);
        nextItems.push(...diffToNotifications(prevSnapshot, c));
      }

      // Merge: keep previous notifications, plus newly generated ones
      const merged = [...(state.items || []), ...nextItems]
        .filter(Boolean)
        .reduce((acc, n) => {
          acc.set(n.id, n);
          return acc;
        }, new Map());

      const mergedItems = Array.from(merged.values()).sort((a, b) => new Date(b.ts) - new Date(a.ts));

      const nextState = {
        snapshot: nextSnapshot,
        read: prevRead,
        items: mergedItems.slice(0, 50), // cap
      };
      writeState(role, userId, nextState);

      setItems(nextState.items);
      setReadMap(nextState.read);
    } catch (err) {
      console.error('❌ Error fetching notifications:', err);
    }
  }, [role, userId]);

  useEffect(() => {
    if (!role || !userId) return undefined;
    if (!inited.current) {
      const state = readState(role, userId);
      setItems(state.items || []);
      setReadMap(state.read || {});
      inited.current = true;
    }

    refresh().catch(() => {});
    const t = window.setInterval(() => refresh().catch(() => {}), pollMs);
    return () => window.clearInterval(t);
  }, [role, userId, pollMs, refresh]);

  const unreadCount = useMemo(() => items.filter((n) => !readMap[n.id]).length, [items, readMap]);

  const markAllRead = useCallback(() => {
    if (!role || !userId) return;
    const next = { ...readMap };
    for (const n of items) next[n.id] = true;
    const state = readState(role, userId);
    const nextState = { ...state, read: next };
    writeState(role, userId, nextState);
    setReadMap(next);
  }, [items, readMap, role, userId]);

  const markRead = useCallback(
    (id) => {
      if (!role || !userId) return;
      const next = { ...readMap, [id]: true };
      const state = readState(role, userId);
      const nextState = { ...state, read: next };
      writeState(role, userId, nextState);
      setReadMap(next);
    },
    [readMap, role, userId]
  );

  return { items, unreadCount, readMap, markAllRead, markRead, refresh };
}

