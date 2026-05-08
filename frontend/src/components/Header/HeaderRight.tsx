import { Link, useLocation } from 'react-router-dom';
import { useAuthLogout } from '../../hooks/useAuthLogout';
import { useAuth } from '../../hooks/useAuth';

const HeaderRight: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuthLogout();
  const { user } = useAuth();

  const displayName = user?.full_name?.trim() || (user?.email ? user.email.split('@')[0] : 'Guest');
  const displayHandle = user?.email ? `@${user.email.split('@')[0]}` : '@guest';

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
  };

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
              <span className='notification-badge'>23</span>
              <i className='material-icons'>notifications</i>
            </Link>
          </li>
        </ul>
        <ul className='header-user nowrap'>
          <li>
            <Link to='/members'>
              <span>{displayName}</span>
              <span>{displayHandle}</span>
            </Link>
          </li>
          <li>
            <Link to='/members'>
              <div
                className='profile-picture cover'
                style={{
                  backgroundImage: `url('https://www.cenksari.com/content/profile.jpg')`,
                }}
              />
            </Link>
          </li>
          <li className='responsive-hide'>
            <button onClick={handleLogout} className='signout' style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <i className='material-icons'>power_settings_new</i>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HeaderRight;
