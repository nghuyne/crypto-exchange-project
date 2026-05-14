import { useState, useEffect } from 'react';
import SiteLayout from '../../layouts/SiteLayout';
import Header from '../../components/Header/Header';
import BalanceCard from '../../components/Widgets/BalanceCard/BalanceCard';
import CoinHoldingsGrid from '../../components/Widgets/CoinHoldingsGrid/CoinHoldingsGrid';
import { useUserBalance } from '../../hooks/useUserBalance';

import './DashboardScreen.css';

const DashboardScreen: React.FC = () => {
  const { balance, isLoading, error } = useUserBalance({
    refreshInterval: 30000,
  });

  const [showMockData, setShowMockData] = useState(false);

  const mockBalance = {
    fiatBalance: 15000,
    currency: 'USD',
    totalPortfolioValue: 45000,
    coins: [
      {
        id: '1',
        symbol: 'BTC',
        name: 'Bitcoin',
        amount: 0.5,
        currentPrice: 42000,
        totalValue: 21000,
        icon: 'https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/256/Bitcoin-BTC-icon.png',
        change24h: 3.5,
      },
      {
        id: '2',
        symbol: 'ETH',
        name: 'Ethereum',
        amount: 5,
        currentPrice: 2200,
        totalValue: 11000,
        icon: 'https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Ethereum-ETH-icon.png',
        change24h: 2.8,
      },
      {
        id: '3',
        symbol: 'USDT',
        name: 'Tether',
        amount: 6000,
        currentPrice: 1,
        totalValue: 6000,
        icon: 'https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Tether-USDT-icon.png',
        change24h: 0.1,
      },
      {
        id: '4',
        symbol: 'SOL',
        name: 'Solana',
        amount: 25,
        currentPrice: 148,
        totalValue: 3700,
        icon: 'https://cryptologos.cc/logos/solana-sol-logo.png',
        change24h: -1.2,
      },
      {
        id: '5',
        symbol: 'XRP',
        name: 'Ripple',
        amount: 1000,
        currentPrice: 2.5,
        totalValue: 2500,
        icon: 'https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Ripple-XRP-icon.png',
        change24h: 5.4,
      },
    ],
  };

  const displayBalance = showMockData ? mockBalance : balance;

  return (
    <SiteLayout>
      <Header icon='account_balance' title='Dashboard' />

      <div className='dashboard-container'>
        <div className='dashboard-balance-section'>
          {displayBalance && (
            <BalanceCard
              fiatBalance={displayBalance.fiatBalance}
              currency={displayBalance.currency}
              totalPortfolioValue={displayBalance.totalPortfolioValue}
              isLoading={isLoading}
            />
          )}
        </div>

        {error && !showMockData && (
          <div className='dashboard-error-banner'>
            <i className='material-icons'>warning</i>
            <div>
              <p>Unable to load balance data</p>
              <span>{error}</span>
            </div>
            <button
              className='dashboard-error-action'
              onClick={() => setShowMockData(true)}
            >
              Use Demo Data
            </button>
          </div>
        )}

        <div className='dashboard-holdings-section'>
          {displayBalance && (
            <CoinHoldingsGrid
              coins={displayBalance.coins}
              isLoading={isLoading}
              error={error && !showMockData ? error : null}
            />
          )}
        </div>

        {showMockData && (
          <div className='dashboard-demo-notice'>
            <i className='material-icons'>info</i>
            <span>Displaying demo data. Connect your wallet to see real holdings.</span>
            <button onClick={() => setShowMockData(false)}>Dismiss</button>
          </div>
        )}
      </div>
    </SiteLayout>
  );
};

export default DashboardScreen;
