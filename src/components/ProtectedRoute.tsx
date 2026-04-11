// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  // Agar loading ho rahi hai (e.g., checking auth status)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Agar user login nahi hai to login par bhejo
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Agar user login hai to route render karo
  return <Outlet />;
}