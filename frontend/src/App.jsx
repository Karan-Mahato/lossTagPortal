import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import BankDashboard from './pages/BankDashboard';
import IHMCLDashboard from './pages/IHMCLDashboard';
import SubmitComplaint from './pages/SubmitComplaint.jsx';
import PlazaReports from './pages/PlazaReports.jsx';
import PlazaDashboard from './pages/PlazaDashboard.jsx';
import BankMetricsDashboard from './pages/BankMetricsDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

function App() {
  const user = JSON.parse(localStorage.getItem('fastag_user'));

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route
          path="/plaza"
          element={user?.role === 'plaza' ? <Navigate to="/plaza/dashboard" /> : <Navigate to="/" />}
        />
        <Route
          path="/plaza/dashboard"
          element={user?.role === 'plaza' ? <PlazaDashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/plaza/submit"
          element={user?.role === 'plaza' ? <SubmitComplaint /> : <Navigate to="/" />}
        />
        <Route
          path="/plaza/reports"
          element={user?.role === 'plaza' ? <PlazaReports /> : <Navigate to="/" />}
        />
        <Route
          path="/bank"
          element={user?.role === 'bank' ? <Navigate to="/bank/dashboard" /> : <Navigate to="/" />}
        />
        <Route
          path="/bank/dashboard"
          element={user?.role === 'bank' ? <BankMetricsDashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/bank/reports"
          element={user?.role === 'bank' ? <BankDashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/ihmcl"
          element={user?.role === 'admin' ? <Navigate to="/ihmcl/dashboard" /> : <Navigate to="/" />}
        />
        <Route
          path="/ihmcl/dashboard"
          element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/ihmcl/reports"
          element={user?.role === 'admin' ? <IHMCLDashboard /> : <Navigate to="/" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
