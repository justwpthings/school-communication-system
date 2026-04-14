import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, isBooting } = useAuth();
  const location = useLocation();

  if (isBooting) {
    return <div className="flex min-h-screen items-center justify-center text-muted">Loading…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles?.length && !roles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return children;
};
