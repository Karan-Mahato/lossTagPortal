import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../lib/authService.js';
import { Button } from '../components/ui/Button.jsx';

export default function Login() {
  const [username, setUsername] = useState('admin_ihmcl');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('📝 Attempting login...');
      const data = await authService.login(username, password);
      
      console.log('✅ Login response received:', data);
      console.log('📊 User role:', data.user.role);
      console.log('💾 Checking localStorage...');
      
      // Verify data was stored
      const storedUser = JSON.parse(localStorage.getItem('fastag_user'));
      const storedToken = localStorage.getItem('token');
      console.log('✓ Stored user:', storedUser);
      console.log('✓ Stored token:', storedToken ? '(exists)' : '(missing)');
      
      // Route based on role
      const role = data.user.role;
      console.log(`🚀 Redirecting based on role: ${role}`);
      
      if (role === 'PLAZA') {
        console.log('➡️  Navigating to /plaza/dashboard');
        navigate('/plaza/dashboard');
      } else if (role === 'BANK') {
        console.log('➡️  Navigating to /bank/dashboard');
        navigate('/bank/dashboard');
      } else if (role === 'IHMCL') {
        console.log('➡️  Navigating to /ihmcl/dashboard');
        navigate('/ihmcl/dashboard');
      } else {
        console.log('⚠️  Unknown role, redirecting to home');
        navigate('/');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
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
            <div className="stl-subtitle">Login with your credentials</div>
          </div>
        </div>

        <form onSubmit={handleLogin} style={{ marginTop: 14, display: 'grid', gap: 10 }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="stl-input"
            style={{ padding: '10px 12px', borderRadius: 8 }}
            disabled={isLoading}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="stl-input"
            style={{ padding: '10px 12px', borderRadius: 8 }}
            disabled={isLoading}
          />

          {error && (
            <div style={{ color: '#d32f2f', fontSize: 14, padding: '10px 12px' }}>
              ❌ {error}
            </div>
          )}

          <Button 
            type="submit"
            disabled={isLoading}
            style={{ 
              height: 40, 
              justifyContent: 'center',
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <div style={{ marginTop: 20, fontSize: 12, color: '#666', borderTop: '1px solid #e0e0e0', paddingTop: 14 }}>
          <p style={{ margin: '0 0 8px 0' }}>📋 <strong>Test Credentials:</strong></p>
          <p style={{ margin: 4 }}>admin_ihmcl / admin@123</p>
          <p style={{ margin: 4 }}>plaza_dme001 / plaza@123</p>
          <p style={{ margin: 4 }}>bank_icici / bank@123</p>
        </div>
      </div>
    </div>
  );
}
