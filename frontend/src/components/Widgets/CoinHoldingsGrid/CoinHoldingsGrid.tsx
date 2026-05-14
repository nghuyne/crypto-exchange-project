import './CoinHoldingsGrid.css';
import { CoinHolding } from '../../../hooks/useUserBalance';

interface CoinHoldingsGridProps {
  coins: CoinHolding[];
  isLoading?: boolean;
  error?: string | null;
}

const CoinHoldingsGrid: React.FC<CoinHoldingsGridProps> = ({
  coins,
  isLoading = false,
  error = null,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'positive' : 'negative';
  };

  if (error) {
    return (
      <div className='coin-holdings-grid'>
        <div className='coin-error'>
          <i className='material-icons'>error</i>
          <p>Unable to load coin holdings</p>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className='coin-holdings-grid'>
      <div className='coin-holdings-header'>
        <h2>Your Holdings</h2>
        <span className='coin-count'>
          {isLoading ? '...' : `${coins.length} assets`}
        </span>
      </div>

      <div className='coin-holdings-table-wrapper'>
        <table className='coin-holdings-table'>
          <thead>
            <tr>
              <th>Coin</th>
              <th>Amount</th>
              <th>Price</th>
              <th>Total Value</th>
              <th>24h Change</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className='skeleton-row'>
                    <td colSpan={5}>
                      <div className='skeleton-cell'></div>
                    </td>
                  </tr>
                ))
              : coins.map((coin, idx) => (
                  <tr
                    key={coin.id}
                    className='coin-row'
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <td className='coin-cell-name'>
                      <div className='coin-icon-container'>
                        {coin.icon ? (
                          <img src={coin.icon} alt={coin.name} className='coin-icon' />
                        ) : (
                          <div className='coin-icon-placeholder'>{coin.symbol[0]}</div>
                        )}
                      </div>
                      <div className='coin-info'>
                        <div className='coin-name'>{coin.name}</div>
                        <div className='coin-symbol'>{coin.symbol}</div>
                      </div>
                    </td>
                    <td className='coin-amount'>
                      {coin.amount.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 8,
                      })}
                    </td>
                    <td className='coin-price'>{formatCurrency(coin.currentPrice)}</td>
                    <td className='coin-total'>
                      <span className='total-value'>{formatCurrency(coin.totalValue)}</span>
                    </td>
                    <td className={`coin-change ${getChangeColor(coin.change24h)}`}>
                      <span className='change-badge'>
                        <i className='material-icons'>
                          {coin.change24h >= 0 ? 'trending_up' : 'trending_down'}
                        </i>
                        {formatChange(coin.change24h)}
                      </span>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {!isLoading && coins.length === 0 && (
        <div className='coin-empty'>
          <i className='material-icons'>wallet</i>
          <p>No coins in your portfolio</p>
          <span>Start trading to build your holdings</span>
        </div>
      )}
    </div>
  );
};

export default CoinHoldingsGrid;
