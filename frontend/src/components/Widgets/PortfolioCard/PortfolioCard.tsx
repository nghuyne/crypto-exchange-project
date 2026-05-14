import { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { useWallet } from '../../../hooks/useWallet';
import './PortfolioCard.css';

// Fixed prices for USD conversion
const CRYPTO_PRICES: Record<string, number> = {
  BTC: 67000,
  ETH: 3500,
  USDT: 1,
  USDC: 1,
  BNB: 650,
  XRP: 2.5,
  SOL: 200,
  ADA: 1.2,
  DOGE: 0.35,
  DOT: 8.5,
};

const PortfolioCard: React.FC = () => {
  const auth = useContext(AuthContext);
  const { wallets, isLoading } = useWallet();

  // Return null if not authenticated
  if (!auth?.isAuthenticated) {
    return null;
  }

  // Calculate total USD value
  const calculateTotalValue = (): number => {
    return wallets.reduce((total, wallet) => {
      const price = CRYPTO_PRICES[wallet.asset] || 0;
      return total + wallet.balance * price;
    }, 0);
  };

  const totalValue = calculateTotalValue();

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatBalance = (balance: number, decimals: number = 4): string => {
    return balance.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    });
  };

  return (
    <div className='portfolio-card'>
      <div className='portfolio-card-header'>
        <h2>Portfolio</h2>
        <span className='portfolio-badge'>
          <i className='material-icons'>fiber_manual_record</i>
          LIVE
        </span>
      </div>

      <div className='portfolio-card-total'>
        {isLoading ? (
          <div className='portfolio-skeleton'></div>
        ) : (
          <>
            <div className='portfolio-total-label'>Total Value</div>
            <div className='portfolio-total-value'>{formatCurrency(totalValue)}</div>
          </>
        )}
      </div>

      <div className='portfolio-card-assets'>
        {isLoading ? (
          <div className='portfolio-loading'>
            <p>Loading wallets...</p>
          </div>
        ) : wallets.length === 0 ? (
          <div className='portfolio-empty'>
            <p>No assets yet</p>
          </div>
        ) : (
          wallets.map((wallet) => {
            const price = CRYPTO_PRICES[wallet.asset] || 0;
            const usdValue = wallet.balance * price;

            return (
              <div key={wallet.asset} className='portfolio-asset-row'>
                <div className='portfolio-asset-symbol'>{wallet.asset}</div>
                <div className='portfolio-asset-amount'>
                  {formatBalance(wallet.balance, wallet.asset === 'USDT' || wallet.asset === 'USDC' ? 2 : 4)}
                </div>
                <div className='portfolio-asset-value'>≈{formatCurrency(usdValue)}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PortfolioCard;
