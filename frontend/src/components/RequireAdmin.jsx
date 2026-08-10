import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

export default function RequireAdmin({ children }) {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <LoadingScreen />;

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: `${location.pathname}${location.search}${location.hash}` }} replace />;
  }

  if (!user.is_admin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
