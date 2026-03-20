import React, { useEffect, useState } from 'react';
import axios from 'axios';

function IHMCLDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/complaints`);
        setComplaints(res.data || []);
      } catch (err) {
        setComplaints([]);
      }
      setLoading(false);
    };
    fetchComplaints();
  }, []);

  const summary = {
    total:   complaints.length,
    pending: complaints.filter(c => c.status === 'Pending').length,
    fined:   complaints.filter(c => c.status === 'Fined').length,
    blocked: complaints.filter(c => c.status === 'Blocked').length,
    noIssue: complaints.filter(c => c.status === 'No Issue').length,
  };

  const downloadCSV = () => {
    const headers = [
      'Case ID','FASTag ID','VRN','Toll Plaza','Toll Code',
      'Assigned Bank','Bank Code','Status','Reason','Submitted At','Actioned At'
    ];
    const rows = complaints.map(c => [
      c.case_id,
      c.fastag_id,
      c.vrn,
      c.toll_plazas?.name || 'Unknown',
      c.toll_plazas?.plaza_code || '',
      c.issuer_banks?.name || 'Unmapped',
      c.issuer_banks?.bank_code || '',
      c.status,
      c.bank_action_reason || '',
      new Date(c.created_at).toLocaleString(),
      c.bank_acted_at ? new Date(c.bank_acted_at).toLocaleString() : ''
    ]);
    const csv = [headers, ...rows]
      .map(row => row.map(v => `"${v}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `IHMCL_Report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', fontFamily: 'Arial' }}>
      <h2>IHMCL Admin Dashboard</h2>
      {loading ? <p>Loading...</p> : (
        <>
          <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
            <div>All Complaints: <b>{summary.total}</b></div>
            <div>Pending: <b>{summary.pending}</b></div>
            <div>Fined: <b>{summary.fined}</b></div>
            <div>Blocked: <b>{summary.blocked}</b></div>
            <div>No Issue: <b>{summary.noIssue}</b></div>
            <button onClick={downloadCSV}>Download CSV</button>
          </div>
          <table border="1" cellPadding="6" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Case ID</th>
                <th>FASTag ID</th>
                <th>VRN</th>
                <th>Toll Plaza</th>
                <th>Toll Code</th>
                <th>Assigned Bank</th>
                <th>Bank Code</th>
                <th>Status</th>
                <th>Reason</th>
                <th>Submitted At</th>
                <th>Image</th>
                <th>Actioned At</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map(c => (
                <tr key={c.id}>
                  <td>{c.case_id}</td>
                  <td>{c.fastag_id}</td>
                  <td>{c.vrn}</td>
                  <td>{c.toll_plazas?.name || 'Unknown'}</td>
                  <td>{c.toll_plazas?.plaza_code || ''}</td>
                  <td>{c.issuer_banks?.name || 'Unmapped'}</td>
                  <td>{c.issuer_banks?.bank_code || ''}</td>
                  <td>{c.status}</td>
                  <td>{c.bank_action_reason || ''}</td>
                  <td>{new Date(c.created_at).toLocaleString()}</td>
                  <td>{c.image_url ? <a href={c.image_url} target="_blank" rel="noopener noreferrer">View</a> : ''}</td>
                  <td>{c.bank_acted_at ? new Date(c.bank_acted_at).toLocaleString() : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default IHMCLDashboard;