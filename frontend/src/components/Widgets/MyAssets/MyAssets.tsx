import { useWallet } from '../../../hooks/useWallet';
import MyAssetsRow from './MyAssetsRow';
import './MyAssets.css';

// Crypto icons mapping
const cryptoIcons: Record<string, string> = {
  BTC: 'https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/256/Bitcoin-BTC-icon.png',
  ETH: 'https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Ethereum-ETH-icon.png',
  USDT: 'https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Tether-USDT-icon.png',
  USDC: 'https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/USD-Coin-USDC-icon.png',
  BNB: 'https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/256/Binance-Coin-BNB-icon.png',
  XRP: 'https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Ripple-XRP-icon.png',
  SOL: 'https://cryptologos.cc/logos/solana-sol-logo.png',
  ADA: 'https://cdn4.iconfinder.com/data/icons/crypto-currency-and-coin-2/256/cardano_ada-512.png',
  DOGE: 'https://www.kindpng.com/picc/m/202-2028344_dogecoin-doge-icon-metro-symbole-hd-png-download.png',
  DOT: 'https://cryptologos.cc/logos/polkadot-dot-logo.png',
};

const MyAssets: React.FC = () => {
  const { wallets, isLoading, error } = useWallet();

  return (
    <div className='myassets-card'>
      <div className='myassets-header'>
        <h2>My Assets</h2>
      </div>

      <div className='myassets-content'>
        {isLoading && (
          <div className='myassets-loading'>
            <p className='myassets-loading-text'>Loading wallets...</p>
          </div>
        )}

        {error && (
          <div className='myassets-error'>
            <p className='myassets-error-text'>Error: {error}</p>
          </div>
        )}

        {!isLoading && !error && wallets.length > 0 && (
          wallets.map((wallet) => (
            <MyAssetsRow
              key={`${wallet.asset}-${wallet.id}`}
              item={{
                id: wallet.id,
                name: wallet.asset,
                symbol: wallet.asset,
                icon: cryptoIcons[wallet.asset] || `https://via.placeholder.com/256?text=${wallet.asset}`,
                amount: wallet.balance,
                locked_balance: wallet.locked_balance,
              }}
            />
          ))
        )}

        {!isLoading && !error && wallets.length === 0 && (
          <div className='myassets-empty'>
            <div className='myassets-empty-icon'>
              <i className='material-icons' style={{ fontSize: '2.5rem' }}>
                account_balance_wallet
              </i>
            </div>
            <p className='myassets-empty-text'>No assets yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAssets;
