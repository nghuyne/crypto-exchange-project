import { useWallet } from '../../../hooks/useWallet';
import { useNavigate } from 'react-router-dom';
import Box from '../../../components/Common/Box';

// Placeholder market prices (in production, fetch from API)
const MARKET_PRICES: Record<string, number> = {
  BTC: 45000,
  ETH: 2500,
  USDT: 1,
};

const cryptoIcons: Record<string, string> = {
  BTC: 'https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/256/Bitcoin-BTC-icon.png',
  ETH: 'https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Ethereum-ETH-icon.png',
  USDT: 'https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Tether-USDT-icon.png',
};

const WalletAssets: React.FC = () => {
  const { wallets, isLoading, error } = useWallet();
  const navigate = useNavigate();

  const handleTrade = (asset: string) => {
    // Navigate to market page with the selected pair
    navigate(`/market?pair=${asset.toLowerCase()}_usdt`);
  };

  return (
    <Box>
      <div className='box-title box-vertical-padding box-horizontal-padding no-select'>
        <p>Danh sách tài sản</p>
      </div>
      <div className='box-content'>
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

        {!isLoading && !error && wallets.length > 0 && (
          <table className='asset-table'>
            <thead>
              <tr>
                <th className='left'>Tài sản</th>
                <th className='center'>Tổng số dư</th>
                <th className='center'>Có sẵn</th>
                <th className='center'>Giá trị (USDT)</th>
                <th className='right'>Đào hàng</th>
              </tr>
            </thead>
            <tbody>
              {wallets.map((wallet) => {
                const price = MARKET_PRICES[wallet.asset] || 1;
                const lockedBalance = Number(wallet.locked_balance || 0);
                const totalBalance = Number(wallet.balance || 0);
                const availableBalance = totalBalance - lockedBalance;
                const usdtValue = totalBalance * price;

                return (
                  <tr key={wallet.id} className='asset-row'>
                    <td className='left asset-cell'>
                      <div className='asset-info'>
                        <img
                          src={cryptoIcons[wallet.asset] || `https://via.placeholder.com/32?text=${wallet.asset}`}
                          alt={wallet.asset}
                          className='asset-icon'
                        />
                        <div className='asset-name'>
                          <div className='symbol'>{wallet.asset}</div>
                          <div className='full-name'>{wallet.asset}</div>
                        </div>
                      </div>
                    </td>
                    <td className='center'>
                      {totalBalance.toLocaleString('en-US', {
                        minimumFractionDigits: 4,
                        maximumFractionDigits: 8,
                      })}
                      <span className='asset-unit'> {wallet.asset}</span>
                    </td>
                    <td className='center'>
                      <span className='available'>
                        {availableBalance.toLocaleString('en-US', {
                          minimumFractionDigits: 4,
                          maximumFractionDigits: 8,
                        })}
                      </span>
                    </td>
                    <td className='center'>
                      {usdtValue.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{' '}
                      <span className='usdt'>USDT</span>
                    </td>
                    <td className='right'>
                      <button
                        type='button'
                        className='button button-purple button-small'
                        onClick={() => handleTrade(wallet.asset)}
                      >
                        Giao dịch
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {!isLoading && !error && wallets.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>Chưa có tài sản nào</p>
          </div>
        )}
      </div>
    </Box>
  );
};

export default WalletAssets;
