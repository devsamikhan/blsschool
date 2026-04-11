import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext/AuthContext';
import { UserRole } from '../types';

interface RequireAuthProps {
  children: JSX.Element;
  allowedRoles?: UserRole[];
}

export function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Role not allowed, redirect to their appropriate dashboard
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
}
