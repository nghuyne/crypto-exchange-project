import { useRef, useState, useEffect } from 'react';

import { Link } from 'react-router-dom';

// hooks
import useClickOutside from '../../../hooks/useClickOutside';
import { useAuth } from '../../../hooks/useAuth';

// components
import Box from '../../Common/Box';

// config
import { USER_LEVEL_NAMES } from '../../../config/constants';

// services
import { userService } from '../../../api/services/appService';

const Profile: React.FC = () => {
  const ref = useRef<any>(null);
  const { user } = useAuth();
<<<<<<< HEAD
  const [menuOpened, setMenuOpened] = useState<boolean>(false);
  const [userLevel, setUserLevel] = useState(1);
  const [loading, setLoading] = useState(true);
=======

  const [menuOpened, setMenuOpened] = useState<boolean>(false);
  const displayName = user?.full_name?.trim() || (user?.email ? user.email.split('@')[0] : 'Guest User');
>>>>>>> 6e458ee (feat: implement admin API, faucet feature, user profile display, and project documentation)

  useClickOutside(ref, () => setMenuOpened(false));

  useEffect(() => {
    const fetchUserLevel = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const response = await userService.getProfile(token);
          if (response.data) {
            setUserLevel(response.data.level || 1);
          }
        }
      } catch (error) {
        console.error('Lỗi lấy thông tin người dùng:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserLevel();

    // Cập nhật user level mỗi 60 giây (real-time)
    const interval = setInterval(fetchUserLevel, 60000);
    return () => clearInterval(interval);
  }, [user]);

  /**
   * Bật/tắt menu tùy chọn
   */
  const handleMenuOpen = (): void => setMenuOpened(!menuOpened);

  const displayName = user?.full_name?.trim() || (user?.email ? user.email.split('@')[0] : 'Guest User');
  const levelName = USER_LEVEL_NAMES[userLevel] || 'Cấp độ 1 - Cơ bản';

  return (
    <Box>
      <div className='box-title box-vertical-padding box-horizontal-padding no-select'>
        <div ref={ref} className='flex flex-center flex-space-between'>
          <p>Hồ sơ của tôi</p>
          <button type='button' className='box-icon pointer' onClick={() => handleMenuOpen()}>
            <i className='material-icons'>more_vert</i>
          </button>

          {menuOpened && (
            <div className='box-dropdown'>
              <ul>
                <li>
                  <button type='button'>
                    <i className='material-icons'>settings</i>
                    Cài đặt
                  </button>
                </li>
                <li>
                  <button type='button'>
                    <i className='material-icons'>security</i>
                    Bảo mật
                  </button>
                </li>
                <li>
                  <button type='button'>
                    <i className='material-icons'>info</i>
                    Thông tin
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      <div className='widget-profile box-content box-content-height-nobutton'>
        <div className='center'>
          <form noValidate className='upload no-select'>
            <input type='file' name='file' id='file' accept='.jpg, .jpeg' />
            <label htmlFor='file'>
              <div
                className='icon cover pointer'
                style={{
                  backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}')`,
                }}
              />
              <div className='edit pointer'>
                <i className='material-icons'>edit</i>
              </div>
            </label>
          </form>
        </div>
        <div className='box-horizontal-padding'>
          <div className='center'>
            <h3>{displayName}</h3>
<<<<<<< HEAD
            <strong>{levelName}</strong>
            {loading ? <p>Đang tải...</p> :
              <>
                <p>Email: {user?.email || 'N/A'}</p>
                {userLevel < 2 && <p>Bạn phải là Cấp độ 2 để tăng giới hạn giao dịch.</p>}
                {userLevel < 2 && <Link to='/members/application'>Nâng cấp lên Cấp độ 2</Link>}
                {userLevel >= 2 && <p>Cấp độ {userLevel} Đã xác minh ✓</p>}
              </>
            }
=======
            <strong>Level 1</strong>
            <p>You must be Level 2 to increase your limits.</p>
            <Link to='/members/application'>Level 2 application</Link>
>>>>>>> 6e458ee (feat: implement admin API, faucet feature, user profile display, and project documentation)
          </div>
        </div>
      </div>
    </Box>
  );
};

export default Profile;
