import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

/**
 * Protected Route component - redirects to login if not authenticated
 */
export function ProtectedRoute({ children, requiredRole = null }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
