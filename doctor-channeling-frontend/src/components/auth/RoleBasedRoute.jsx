import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from '../common/Loader';

export default function RoleBasedRoute({ children, roles }) {
  const { user, loading, isAuthenticated, getRolePath } = useAuth();

  if (loading) return <Loader fullScreen />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.role?.name || user?.role || '';
  const hasAccess = roles.some(
    (role) => userRole === role || userRole === `ROLE_${role}`
  );

  if (!hasAccess) {
    return <Navigate to={getRolePath()} replace />;
  }

  return children;
}
