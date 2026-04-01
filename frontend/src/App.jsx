import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import BankDashboard from './pages/BankDashboard';
import IHMCLDashboard from './pages/IHMCLDashboard';
import SubmitComplaint from './pages/SubmitComplaint.jsx';
import PlazaReports from './pages/PlazaReports.jsx';

function App() {
  const user = JSON.parse(localStorage.getItem('fastag_user'));

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route
          path="/plaza"
          element={user?.role === 'plaza' ? <Navigate to="/plaza/reports" /> : <Navigate to="/" />}
        />
        <Route
          path="/plaza/submit"
          element={user?.role === 'plaza' ? <SubmitComplaint /> : <Navigate to="/" />}
        />
        <Route
          path="/plaza/reports"
          element={user?.role === 'plaza' ? <PlazaReports /> : <Navigate to="/" />}
        />
        <Route path='/bank'
          element={user?.role === 'bank' ? <BankDashboard /> : <Navigate to='/' />} />
        <Route path='/ihmcl'
          element={user?.role === 'admin' ? <IHMCLDashboard /> : <Navigate to='/' />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
