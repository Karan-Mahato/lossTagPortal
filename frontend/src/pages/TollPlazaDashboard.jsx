import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import axios from 'axios';

function TollPlazaDashboard() {
  const user = JSON.parse(localStorage.getItem('fastag_user'));
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ fastag_id: '', vrn: '', lane_id: '', crossing_datetime: '', image: null });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/complaints?plaza_id=${user.id}`);
      setComplaints(res.data || []);
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
      await axios.post(`${import.meta.env.VITE_API_URL}/complaints`, {
        fastag_id: form.fastag_id,
        vrn: form.vrn,
        lane_id: form.lane_id,
        crossing_datetime: form.crossing_datetime,
        toll_plaza_id: user.id,
        image_url: imageUrl
      });
      setForm({ fastag_id: '', vrn: '', lane_id: '', crossing_datetime: '', image: null });
      fetchComplaints();
    } catch (err) {
      alert('Failed to submit complaint.');
    }
    setSubmitting(false);
  };

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', fontFamily: 'Arial' }}>
      <h2>Toll Plaza Dashboard</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 32, border: '1px solid #ccc', padding: 16 }}>
        <div style={{ marginBottom: 8 }}>
          <label>FASTag ID: <input required value={form.fastag_id} onChange={e => setForm(f => ({ ...f, fastag_id: e.target.value }))} /></label>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>VRN: <input required value={form.vrn} onChange={e => setForm(f => ({ ...f, vrn: e.target.value }))} /></label>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Lane ID: <input required value={form.lane_id} onChange={e => setForm(f => ({ ...f, lane_id: e.target.value }))} /></label>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Date & Time: <input required type='datetime-local' value={form.crossing_datetime} onChange={e => setForm(f => ({ ...f, crossing_datetime: e.target.value }))} /></label>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Vehicle Photo: <input required type='file' accept='image/*' onChange={e => setForm(f => ({ ...f, image: e.target.files[0] }))} /></label>
        </div>
        <button type='submit' disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Complaint'}</button>
      </form>
      <h3>My Submitted Complaints</h3>
      {loading ? <p>Loading...</p> : (
        <table border="1" cellPadding="6" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Case ID</th>
              <th>FASTag ID</th>
              <th>VRN</th>
              <th>Lane</th>
              <th>Date/Time</th>
              <th>Status</th>
              <th>Bank</th>
              <th>Image</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map(c => (
              <tr key={c.id}>
                <td>{c.case_id}</td>
                <td>{c.fastag_id}</td>
                <td>{c.vrn}</td>
                <td>{c.lane_id}</td>
                <td>{new Date(c.crossing_datetime).toLocaleString()}</td>
                <td>{c.status}</td>
                <td>{c.issuer_banks?.name || 'Unmapped'}</td>
                <td>{c.image_url ? <a href={c.image_url} target='_blank' rel='noopener noreferrer'>View</a> : ''}</td>
                <td>{c.bank_action_reason || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TollPlazaDashboard;