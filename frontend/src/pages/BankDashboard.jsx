import React, { useEffect, useState } from 'react';
import axios from 'axios';

function BankDashboard() {
  console.log('Rendering BankDashboard');
  console.log(localStorage.getItem('fastag_user'));
  const user = JSON.parse(localStorage.getItem('fastag_user'));
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionState, setActionState] = useState({}); // { [complaintId]: {status, reason} }

  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/complaints?bank_id=${user.id}`);
      setComplaints(res.data || []);
    } catch (err) {
      setComplaints([]);
    }
    setLoading(false);
  };

  const handleAction = async (complaintId, status, reason) => {
    if ((status === 'Fined' || status === 'Blocked') && !reason.trim()) {
      alert('Please provide a reason for this action.');
      return;
    }
    await axios.patch(
      `${import.meta.env.VITE_API_URL}/complaints/${complaintId}`,
      { status, bank_action_reason: reason }
    );
    fetchComplaints();
  };

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', fontFamily: 'Arial' }}>
      <h2>Bank Dashboard</h2>
      {loading ? <p>Loading...</p> : (
        <table border="1" cellPadding="6" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Case ID</th>
              <th>FASTag ID</th>
              <th>VRN</th>
              <th>Toll Plaza</th>
              <th>Status</th>
              <th>Reason</th>
              <th>Submitted At</th>
              <th>Actioned At</th>
              <th>Image</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map(c => (
              <tr key={c.id}>
                <td>{c.case_id}</td>
                <td>{c.fastag_id}</td>
                <td>{c.vrn}</td>
                <td>{c.toll_plazas?.name || 'Unknown'}</td>
                <td>{c.status}</td>
                <td>{c.bank_action_reason || ''}</td>
                <td>{new Date(c.created_at).toLocaleString()}</td>
                <td>{c.bank_acted_at ? new Date(c.bank_acted_at).toLocaleString() : ''}</td>
                <td>{c.image_url ? <a href={c.image_url} target="_blank" rel="noopener noreferrer">View</a> : ''}</td>
                <td>
                  {c.status === 'Pending' ? (
                    <>
                      <select
                        value={actionState[c.id]?.status || ''}
                        onChange={e => setActionState(s => ({ ...s, [c.id]: { ...s[c.id], status: e.target.value } }))}
                      >
                        <option value=''>Select</option>
                        <option value='Fined'>Fine</option>
                        <option value='Blocked'>Block</option>
                        <option value='No Issue'>No Issue</option>
                      </select>
                      {(actionState[c.id]?.status === 'Fined' || actionState[c.id]?.status === 'Blocked') && (
                        <input
                          type='text'
                          placeholder='Reason'
                          value={actionState[c.id]?.reason || ''}
                          onChange={e => setActionState(s => ({ ...s, [c.id]: { ...s[c.id], reason: e.target.value } }))}
                          style={{ marginLeft: 4 }}
                        />
                      )}
                      <button
                        onClick={() => handleAction(
                          c.id,
                          actionState[c.id]?.status || '',
                          actionState[c.id]?.reason || ''
                        )}
                        style={{ marginLeft: 4 }}
                      >Submit</button>
                    </>
                  ) : (
                    <span style={{ color: '#888' }}>Action taken</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default BankDashboard;