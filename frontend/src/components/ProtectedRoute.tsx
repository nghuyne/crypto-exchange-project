import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Nếu đang kiểm tra auth, hiển thị loading
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Nếu không authenticated, redirect tới login
  if (!isAuthenticated) {
    return <Navigate to='/' replace />;
  }

  // Nếu authenticated, hiển thị component
  return <>{children}</>;
};
