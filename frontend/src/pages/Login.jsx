import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button.jsx';

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
    if (selected.role === 'plaza') navigate('/plaza/dashboard');
    if (selected.role === 'bank')  navigate('/bank/dashboard');
    if (selected.role === 'admin') navigate('/ihmcl/dashboard');
    window.location.reload();       //update this logic for production - this is just to ensure all components re-read the user from localStorage
  };

  return (
    <div className="stl-app" style={{ display: 'grid', placeItems: 'center' }}>
      <div
        className="stl-panel"
        style={{
          width: 'min(520px, 92vw)',
          padding: 22,
          borderRadius: 28,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div className="stl-brand-mark" aria-hidden="true">
            <span className="stl-star" />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>FASTag Portal</div>
            <div className="stl-subtitle">Choose a role to preview the dashboards.</div>
          </div>
        </div>

        <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
          <select
            className="stl-select"
            value={selected.label}
            onChange={(e) => setSelected(DEMO_USERS.find((u) => u.label === e.target.value))}
            aria-label="Select demo user"
            style={{ height: 40 }}
          >
            {DEMO_USERS.map((u) => (
              <option key={u.label}>{u.label}</option>
            ))}
          </select>

          <Button onClick={handleLogin} style={{ height: 40, justifyContent: 'center' }}>
            Login
          </Button>
        </div>
      </div>
    </div>
  );
}
