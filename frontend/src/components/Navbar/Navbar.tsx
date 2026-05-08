import { Link } from 'react-router-dom';

// Các components
import NavbarButton from './NavbarButton';

const Navbar: React.FC = () => (
  <nav className='navbar-inner no-select'>
    <div className='logo'>
      <Link to='/market'>
        <img
          draggable='false'
          alt='Trao đổi tiền mã hóa'
          src={`${process.env.PUBLIC_URL}/images/logo.png`}
        />
      </Link>
    </div>
    <h3>Menu chính</h3>
    <ul>
      <li>
        <NavbarButton url='/capital' icon='equalizer' title='Vốn' />
      </li>
      <li>
        <NavbarButton url='/wallet' icon='account_balance_wallet' title='Ví của tôi' />
      </li>
      <li>
        <NavbarButton url='/transactions' icon='sync' title='Giao dịch' />
      </li>
      <li>
        <NavbarButton
          url='/blockchain-explorer'
          icon='hub'
          title='Trình khám phá Blockchain'
        />
      </li>
      <li>
        <NavbarButton url='/dashboard' icon='dashboard' title='Nạp / Rút tiền' />
      </li>
    </ul>
    <h3>Khác</h3>
    <ul>
      <li>
        <NavbarButton url='/members' icon='account_circle' title='Hồ sơ của tôi' />
      </li>
      <li>
        <NavbarButton url='/contacts' icon='contacts' title='Địa chỉ' />
      </li>
      <li>
        <NavbarButton url='/messages' icon='chat' title='Tin nhắn' />
      </li>
      <li>
        <NavbarButton url='/settings' icon='settings' title='Cài đặt' />
      </li>
    </ul>
    <div className='copyright'>
      <strong>Trao đổi Tiền mã hóa</strong>
      <p>
        {new Date().getFullYear()} &copy; Tất cả các quyền được bảo lưu.
        <br />
        <br />
        Nền tảng giao dịch tiền mã hóa chuyên nghiệp
      </p>
    </div>
  </nav>
);

export default Navbar;
