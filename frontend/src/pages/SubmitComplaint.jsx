import React, { useState } from 'react';
import axios from 'axios';
import { supabase } from '../lib/supabase.js';
import { AppShell } from '../components/layout/AppShell.jsx';
import { Button } from '../components/ui/Button.jsx';
import { FilePicker } from '../components/ui/FilePicker.jsx';
import { useNotifications } from '../hooks/useNotifications.js';

export default function SubmitComplaint() {
  const user = JSON.parse(localStorage.getItem('fastag_user'));
  const [form, setForm] = useState({
    fastag_id: '',
    vrn: '',
    lane_id: '',
    crossing_date: '',
    crossing_time: '',
    image: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const notifications = useNotifications({ role: 'plaza', userId: user?.id });

  const uploadImage = async (file) => {
    const path = `complaints/${Date.now()}-${file.name}`;
    await supabase.storage.from('complaint_images').upload(path, file);
    const { data } = supabase.storage.from('complaint_images').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.image) return;
    setSubmitting(true);
    try {
      const imageUrl = await uploadImage(form.image);
      const crossing_datetime = `${form.crossing_date}T${form.crossing_time}`;
      await axios.post(`${import.meta.env.VITE_API_URL}/complaints`, {
        fastag_id: form.fastag_id,
        vrn: form.vrn,
        lane_id: form.lane_id,
        crossing_datetime,
        toll_plaza_id: user.id,
        image_url: imageUrl,
      });
      setForm({ fastag_id: '', vrn: '', lane_id: '', crossing_date: '', crossing_time: '', image: null });
      alert('Complaint submitted.');
    } catch (err) {
      alert('Failed to submit complaint.');
    }
    setSubmitting(false);
  };

  const sidebarItems = [
    { label: 'Submit Complaint', icon: 'plus', to: '/plaza/submit' },
    { label: 'Reports', icon: 'report', to: '/plaza/reports' },
  ];

  return (
    <AppShell
      activeSidebarLabel="Submit Complaint"
      userName={user?.label?.split('—')?.[0]?.trim() || 'Toll Plaza'}
      subtitle="Submit a new complaint with evidence image."
      sidebarItems={sidebarItems}
      topbar={{ showNotifications: true, showCalendar: false }}
      notifications={notifications}
    >
      <section className="stl-panel" aria-label="Submit complaint">
        <div className="stl-panel__header">
          <div className="stl-panel__title">Submit Complaint</div>
          <div className="stl-panel__toolbar" />
        </div>

        <form onSubmit={handleSubmit} className="stl-form">
          <div className="stl-grid-2x2">
            <label className="stl-field">
              <span className="stl-field__label">FASTag ID</span>
              <input
                className="stl-input stl-input--lg"
                placeholder="Enter FASTag ID"
                required
                value={form.fastag_id}
                onChange={(e) => setForm((f) => ({ ...f, fastag_id: e.target.value }))}
              />
            </label>

            <label className="stl-field">
              <span className="stl-field__label">VRN</span>
              <input
                className="stl-input stl-input--lg"
                placeholder="Enter Vehicle Registration Number"
                required
                value={form.vrn}
                onChange={(e) => setForm((f) => ({ ...f, vrn: e.target.value }))}
              />
            </label>

            <label className="stl-field">
              <span className="stl-field__label">Lane ID</span>
              <input
                className="stl-input stl-input--lg"
                placeholder="Enter Lane ID"
                required
                value={form.lane_id}
                onChange={(e) => setForm((f) => ({ ...f, lane_id: e.target.value }))}
              />
            </label>

            <label className="stl-field">
              <span className="stl-field__label">Crossing date & time</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input
                  className="stl-input stl-input--lg"
                  required
                  type="date"
                  value={form.crossing_date}
                  onChange={(e) => setForm((f) => ({ ...f, crossing_date: e.target.value }))}
                  aria-label="Crossing date"
                />
                <input
                  className="stl-input stl-input--lg"
                  required
                  type="time"
                  step="60"
                  value={form.crossing_time}
                  onChange={(e) => setForm((f) => ({ ...f, crossing_time: e.target.value }))}
                  aria-label="Crossing time"
                />
              </div>
            </label>
          </div>

          <div className="stl-row-full">
            <FilePicker
              label="Vehicle photo"
              accept="image/*"
              required
              value={form.image}
              onChange={(file) => setForm((f) => ({ ...f, image: file }))}
            />
          </div>

          <div className="stl-form__actions">
            <Button type="submit" disabled={submitting} style={{ height: 44, paddingInline: 18, fontSize: 14 }}>
              {submitting ? 'Submitting…' : 'Submit Complaint'}
            </Button>
          </div>
        </form>
      </section>
    </AppShell>
  );
}

