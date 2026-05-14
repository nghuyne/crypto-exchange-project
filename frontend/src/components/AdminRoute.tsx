import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

  if (isLoading) {
    return <div style={{ padding: '20px', color: '#e2e8f0' }}>Loading...</div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to='/market' replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
