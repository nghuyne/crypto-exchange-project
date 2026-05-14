import { useRef, useState } from 'react';

import { Link } from 'react-router-dom';

// hooks
import useClickOutside from '../../../hooks/useClickOutside';
import { useAuth } from '../../../hooks/useAuth';

// components
import Box from '../../Common/Box';

const Profile: React.FC = () => {
  const ref = useRef<any>(null);
  const { user } = useAuth();

  const [menuOpened, setMenuOpened] = useState<boolean>(false);
  const displayName = user?.full_name?.trim() || (user?.email ? user.email.split('@')[0] : 'Guest User');

  useClickOutside(ref, () => setMenuOpened(false));

  /**
   * Toggles the state of the menu to open or close.
   */
  const handleMenuOpen = (): void => setMenuOpened(!menuOpened);

  const displayName = user?.full_name || 'User';

  return (
    <Box>
      <div className='box-title box-vertical-padding box-horizontal-padding no-select'>
        <div ref={ref} className='flex flex-center flex-space-between'>
          <p>My profile</p>
          <button type='button' className='box-icon pointer' onClick={() => handleMenuOpen()}>
            <i className='material-icons'>more_vert</i>
          </button>

          {menuOpened && (
            <div className='box-dropdown'>
              <ul>
                <li>
                  <button type='button'>
                    <i className='material-icons'>settings</i>
                    Settings
                  </button>
                </li>
                <li>
                  <button type='button'>
                    <i className='material-icons'>security</i>
                    Security
                  </button>
                </li>
                <li>
                  <button type='button'>
                    <i className='material-icons'>info</i>
                    Information
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
            <strong>Level 1</strong>
            <p>Email: {user?.email || 'N/A'}</p>
            <p>You must be Level 2 to increase your limits.</p>
            <Link to='/members/application'>Level 2 application</Link>
          </div>
        </div>
      </div>
    </Box>
  );
};

export default Profile;
