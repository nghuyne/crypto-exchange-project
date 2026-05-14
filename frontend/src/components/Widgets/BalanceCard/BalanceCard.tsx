import './BalanceCard.css';

interface BalanceCardProps {
  fiatBalance: number;
  currency: string;
  totalPortfolioValue: number;
  isLoading?: boolean;
}

const BalanceCard: React.FC<BalanceCardProps> = ({
  fiatBalance,
  currency,
  totalPortfolioValue,
  isLoading = false,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const cryptoValue = totalPortfolioValue - fiatBalance;

  return (
    <div className='balance-card'>
      <div className='balance-card-content'>
        <div className='balance-card-label'>Total Balance</div>

        <div className='balance-card-amount'>
          {isLoading ? (
            <span className='skeleton skeleton-text'>Loading...</span>
          ) : (
            formatCurrency(totalPortfolioValue)
          )}
        </div>

        <div className='balance-card-breakdown'>
          <div className='balance-card-item'>
            <span className='balance-card-item-label'>Fiat Balance</span>
            <span className='balance-card-item-value fiat'>
              {isLoading ? '---' : formatCurrency(fiatBalance)}
            </span>
          </div>

          <div className='balance-card-divider'></div>

          <div className='balance-card-item'>
            <span className='balance-card-item-label'>Crypto Holdings</span>
            <span className='balance-card-item-value crypto'>
              {isLoading ? '---' : formatCurrency(cryptoValue)}
            </span>
          </div>
        </div>

        <div className='balance-card-accent'></div>
      </div>
    </div>
  );
};

export default BalanceCard;
