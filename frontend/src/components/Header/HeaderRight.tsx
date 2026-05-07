import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { notificationService } from '../../api/services/appService';

const HeaderRight: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const count = await notificationService.getNotificationCount(token);
          setNotificationCount(count);
        }
      } catch (error) {
        console.error('Lỗi lấy số thông báo:', error);
      }
    };

    fetchNotificationCount();
    // Cập nhật mỗi 30 giây
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
    navigate('/');
  };

  const userName = user?.full_name || 'User';
  const userHandle = user?.email?.split('@')[0] || 'user';

  return (
    <div className='header-right no-select'>
      <div className='flex flex-center'>
        <ul className='header-menu nowrap'>
          <li>
            <Link
              to='/market'
              className={location.pathname.toLowerCase().includes('/market') ? 'active' : 'passive'}
            >
              Market
            </Link>
          </li>
          <li>
            <Link
              to='/data'
              className={location.pathname.toLowerCase().includes('/data') ? 'active' : 'passive'}
            >
              Data
            </Link>
          </li>
          <li>
            <Link
              to='/blockchain-explorer'
              className={location.pathname.toLowerCase().includes('/blockchain-explorer') ? 'active' : 'passive'}
            >
              Blockchain Explorer
            </Link>
          </li>
          <li>
            <Link
              to='/docs'
              className={location.pathname.toLowerCase().includes('/docs') ? 'active' : 'passive'}
            >
              Docs
            </Link>
          </li>
          <li>
            <Link
              to='/api'
              className={location.pathname.toLowerCase().includes('/api') ? 'active' : 'passive'}
            >
              API
            </Link>
          </li>
        </ul>
        <ul className='header-icons nowrap'>
          <li>
            <Link to='/search'>
              <i className='material-icons'>search</i>
            </Link>
          </li>
          <li>
            <Link to='/members/notifications'>
              <span className='notification-badge'>{notificationCount}</span>
              <i className='material-icons'>notifications</i>
            </Link>
          </li>
        </ul>
        <ul className='header-user nowrap'>
          {isAuthenticated && user ? (
            <>
              <li>
                <Link to='/members'>
                  <span>{userName}</span>
                  <span>@{userHandle}</span>
                </Link>
              </li>
              <li>
                <Link to='/members'>
                  <div
                    className='profile-picture cover'
                    style={{
                      backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}')`,
                    }}
                  />
                </Link>
              </li>
              <li className='responsive-hide'>
                <button onClick={handleLogout} className='signout' style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <i className='material-icons'>power_settings_new</i>
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link to='/'>
                <span>Sign In</span>
              </Link>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default HeaderRight;
