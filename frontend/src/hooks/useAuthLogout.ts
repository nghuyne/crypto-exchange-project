import { useAuth } from './useAuth';
import { useWebSocket } from './useWebSocket';
import { useNavigate } from 'react-router-dom';

export const useAuthLogout = () => {
  const { logout: logoutContext } = useAuth();
  const { disconnectAll } = useWebSocket();
  const navigate = useNavigate();

  const logout = () => {
    // Ngắt tất cả WebSocket connections
    disconnectAll();

    // Xóa state login
    logoutContext();

    // Redirect về signin page
    navigate('/', { replace: true });
  };

  return { logout };
};
