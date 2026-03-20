import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Replace each UUID with the actual value from your Supabase Table Editor
const DEMO_USERS = [
  { label: 'Toll Plaza — DME-001',  role: 'plaza', id: '260a64bd-b3af-405c-934f-187dcec4f3bd' },
  { label: 'Toll Plaza — NH48-GGN', role: 'plaza', id: '06abec52-43b2-439b-b230-ef5e913e5e7b' },
  { label: 'ICICI Bank',             role: 'bank',  id: '3f8bedaf-22d0-4309-86e1-a85df3025671' },
  { label: 'HDFC Bank',              role: 'bank',  id: 'c475f659-988c-4e9c-b1b4-f909645e2eeb' },
  { label: 'State Bank of India',    role: 'bank',  id: '0306c341-b672-49e0-8ff0-6bcd4319cb91' },
  { label: 'Axis Bank',              role: 'bank',  id: '1597ce7d-2799-40e3-ba98-595cf7d8f7f3' },
  { label: 'IHMCL Admin',            role: 'admin', id: 'admin' },
];

export default function Login() {
  const [selected, setSelected] = useState(DEMO_USERS[0]);
  const navigate = useNavigate();

  const handleLogin = () => {
    localStorage.setItem('fastag_user', JSON.stringify(selected));
    console.log('Logging in as', selected);
    if (selected.role === 'plaza') navigate('/plaza');
    if (selected.role === 'bank')  navigate('/bank');
    if (selected.role === 'admin') navigate('/ihmcl');
    window.location.reload();       //update this logic for production - this is just to ensure all components re-read the user from localStorage
  };

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', fontFamily: 'Arial' }}>
      <h2>FASTag Portal — Login</h2>
      <select
        value={selected.label}
        onChange={e => setSelected(DEMO_USERS.find(u => u.label === e.target.value))}
        style={{ width: '100%', padding: '8px', marginBottom: '12px' }}
      >
        {DEMO_USERS.map(u => <option key={u.label}>{u.label}</option>)}
      </select>
      <button onClick={handleLogin} style={{ width: '100%', padding: '10px' }}>
        Login
      </button>
    </div>
  );
}
