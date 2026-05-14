import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const authContext = useContext(AuthContext);

  if (!authContext?.token) {
    return <Navigate to='/' replace />;
  }

  // TODO: Add role checking - verify user is admin
  // For now, just check authentication

  return <>{children}</>;
};

export default AdminRoute;
