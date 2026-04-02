import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './lib/authService.js';
import Login from './pages/Login';
import BankDashboard from './pages/BankDashboard';
import IHMCLDashboard from './pages/IHMCLDashboard';
import SubmitComplaint from './pages/SubmitComplaint.jsx';
import PlazaReports from './pages/PlazaReports.jsx';
import PlazaDashboard from './pages/PlazaDashboard.jsx';
import BankMetricsDashboard from './pages/BankMetricsDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Read from localStorage on mount and when auth changes
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('fastag_user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          console.log('✓ User loaded from localStorage:', parsedUser);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error parsing user from localStorage:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial check
    checkAuth();

    // Listen for auth changes from authService
    const unsubscribe = authService.onAuthChange((newUser) => {
      console.log('🔄 Auth change event received:', newUser);
      setUser(newUser);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route
          path="/plaza"
          element={user?.role === 'PLAZA' ? <Navigate to="/plaza/dashboard" /> : <Navigate to="/" />}
        />
        <Route
          path="/plaza/dashboard"
          element={user?.role === 'PLAZA' ? <PlazaDashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/plaza/submit"
          element={user?.role === 'PLAZA' ? <SubmitComplaint /> : <Navigate to="/" />}
        />
        <Route
          path="/plaza/reports"
          element={user?.role === 'PLAZA' ? <PlazaReports /> : <Navigate to="/" />}
        />
        <Route
          path="/bank"
          element={user?.role === 'BANK' ? <Navigate to="/bank/dashboard" /> : <Navigate to="/" />}
        />
        <Route
          path="/bank/dashboard"
          element={user?.role === 'BANK' ? <BankMetricsDashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/bank/reports"
          element={user?.role === 'BANK' ? <BankDashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/ihmcl"
          element={user?.role === 'IHMCL' ? <Navigate to="/ihmcl/dashboard" /> : <Navigate to="/" />}
        />
        <Route
          path="/ihmcl/dashboard"
          element={user?.role === 'IHMCL' ? <AdminDashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/ihmcl/reports"
          element={user?.role === 'IHMCL' ? <IHMCLDashboard /> : <Navigate to="/" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
