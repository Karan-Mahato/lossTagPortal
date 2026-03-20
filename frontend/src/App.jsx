import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import TollPlazaDashboard from './pages/TollPlazaDashboard';
import BankDashboard from './pages/BankDashboard';
import IHMCLDashboard from './pages/IHMCLDashboard';

function App() {
  const user = JSON.parse(localStorage.getItem('fastag_user'));

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/plaza'
          element={user?.role === 'plaza' ? <TollPlazaDashboard /> : <Navigate to='/' />} />
        <Route path='/bank'
          element={user?.role === 'bank' ? <BankDashboard /> : <Navigate to='/' />} />
        <Route path='/ihmcl'
          element={user?.role === 'admin' ? <IHMCLDashboard /> : <Navigate to='/' />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
