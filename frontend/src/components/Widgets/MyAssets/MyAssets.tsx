import { useRef, useState } from 'react';

import { Link } from 'react-router-dom';

// hooks
import useClickOutside from '../../../hooks/useClickOutside';
import { useWallet } from '../../../hooks/useWallet';

// components
import Box from '../../Common/Box';
import MyAssetsRow from './MyAssetsRow';

// interfaces
interface ICrypto {
  id: number;
  name: string;
  icon: string;
  symbol: string;
  amount: string;
  change: string;
  status: number;
  currency: string;
  changePeriod: string;
  barChartData: number[];
  lineChartData: number[];
}

// Crypto icons mapping
const cryptoIcons: Record<string, string> = {
  BTC: 'https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/256/Bitcoin-BTC-icon.png',
  ETH: 'https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Ethereum-ETH-icon.png',
  USDT: 'https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Tether-USDT-icon.png',
};

const MyAssets: React.FC = () => {
  const ref = useRef<any>(null);
  const [menuOpened, setMenuOpened] = useState<boolean>(false);

  // Fetch wallet data từ backend
  const { wallets, isLoading, error } = useWallet();

  // Transform wallet data thành ICrypto format
  const transformedData: ICrypto[] = wallets.map((wallet) => ({
    id: wallet.id,
    name: wallet.asset,
    symbol: wallet.asset,
    icon: cryptoIcons[wallet.asset] || `https://via.placeholder.com/256?text=${wallet.asset}`,
    amount: Number(wallet.balance ?? 0).toFixed(8),
    change: '0%',
    status: 1,
    currency: wallet.asset,
    changePeriod: 'This week',
    barChartData: [30, 20, 25, 35, 30],
    lineChartData: [5, 10, 5, 20, 8, 15, 22, 8, 12, 8, 32, 16, 29, 20, 16, 30, 42, 45],
  }));

  useClickOutside(ref, () => setMenuOpened(false));

  const handleMenuOpen = (): void => setMenuOpened(!menuOpened);

  return (
    <Box>
      <div className='box-title box-vertical-padding box-horizontal-padding no-select'>
        <div className='flex flex-center flex-space-between'>
          <p>My assets</p>
          <div ref={ref}>
            <Link to='/buy-crypto' type='button' className='button button-purple button-small'>
              Buy crypto
            </Link>
            <button type='button' className='box-icon pointer' onClick={() => handleMenuOpen()}>
              <i className='material-icons'>more_vert</i>
            </button>

            {menuOpened && (
              <div className='box-dropdown'>
                <ul>
                  <li>
                    <button type='button'>
                      <i className='material-icons'>settings</i>
                      Button 1
                    </button>
                  </li>
                  <li>
                    <button type='button'>
                      <i className='material-icons'>favorite</i>
                      Button 2
                    </button>
                  </li>
                  <li>
                    <button type='button'>
                      <i className='material-icons'>info</i>
                      Button 3
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className='box-content box-content-height-nobutton'>
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>Đang tải ví...</p>
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
            <p>Lỗi: {error}</p>
          </div>
        )}

        {!isLoading && !error && transformedData.length > 0 && (
          transformedData.map((item) => (
            <MyAssetsRow key={item.id.toString()} item={item} />
          ))
        )}

        {!isLoading && !error && transformedData.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>Không có ví nào</p>
          </div>
        )}
      </div>
    </Box>
  );
};

export default MyAssets;
