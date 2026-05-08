import { useState, useEffect } from 'react';
import SiteLayout from '../../layouts/SiteLayout';
import Header from '../../components/Header/Header';
import BalanceCard from '../../components/Widgets/BalanceCard/BalanceCard';
import CoinHoldingsGrid from '../../components/Widgets/CoinHoldingsGrid/CoinHoldingsGrid';
import { useUserBalance } from '../../hooks/useUserBalance';

<<<<<<< HEAD
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
=======
const DashboardScreen: React.FC = () => (
  <SiteLayout>
    <Header icon='sort' title='Nạp / Rút tiền' />
    <div className='flex flex-destroy flex-space-between'>
      <div className='flex-1 box-right-padding'>
        <BankProcess />
      </div>
      <div className='flex-1'>
        <Box>
          <div className='box-title box-vertical-padding box-horizontal-padding no-select'>
            <div className='flex flex-center flex-space-between'>
              <p>Thông tin quan trọng</p>
>>>>>>> d2e22ac (chuyển ngôn ngữ hiển thị sang tiếng việt)
            </div>
            <button
              className='dashboard-error-action'
              onClick={() => setShowMockData(true)}
            >
              Use Demo Data
            </button>
          </div>
<<<<<<< HEAD
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
=======
          <div className='box-content box-text box-horizontal-padding box-content-height-nobutton'>
            <p>
              &bull; Đối với các giao dịch chuyển khoản EFT, phần người nhận/thụ hưởng phải bao gồm "Sàn giao dịch tiền mã hóa".
            </p>
            <p>
              &bull; Bạn có thể thực hiện giao dịch Chuyển khoản/EFT từ tất cả các tài khoản cá nhân, không kỳ hạn, Đồng Lira Thổ Nhĩ Kỳ của bạn đến các tài khoản được liệt kê. Không chấp nhận chuyển khoản từ các tài khoản của những cá nhân khác.
            </p>
            <p>
              &bull; Giao dịch chuyển khoản qua ATM (có hoặc không có thẻ) sẽ không được chấp nhận vì không thể xác minh thông tin người gửi.
            </p>
            <p>
              &bull; Số tiền bạn gửi sẽ được tự động phản ánh vào tài khoản của bạn sau các kiểm tra, và không cần thông báo thêm.
            </p>
            <p>
              &bull; Vì bạn đã hoàn thành xác minh danh tính của mình, bạn không cần nhập mã định kỳ trong phần mô tả.
            </p>
>>>>>>> d2e22ac (chuyển ngôn ngữ hiển thị sang tiếng việt)
          </div>
        )}
      </div>
<<<<<<< HEAD
    </SiteLayout>
  );
};
=======
    </div>
    <div className='flex flex-destroy flex-space-between'>
      <div className='flex-1 box-right-padding'>
        <RecentActivity />
      </div>
      <div className='flex-1'>
        <Box>
          <div className='box-title box-vertical-padding box-horizontal-padding no-select'>
            <div className='flex flex-center flex-space-between'>
              <p>Thông tin quan trọng</p>
            </div>
          </div>
          <div className='box-content box-text box-horizontal-padding box-content-height-nobutton'>
            <p>
              &bull; Bạn có thể rút tiền từ tất cả các tài khoản ngân hàng được mở theo tên bạn (cá nhân, không kỳ hạn, TL). Chuyển khoản cho người khác sẽ không được xử lý.
            </p>
            <p>&bull; Số tiền rút tối thiểu là 10 TL.</p>
            <p>&bull; Phí xử lý 3 TL sẽ được tính cho giao dịch rút tiền.</p>
            <p>
              &bull; Khi bạn đưa ra hướng dẫn rút tiền, số tiền sẽ được khấu trừ từ số dư khả dụng của bạn.
            </p>
            <p>
              &bull; Bạn có thể hủy bất kỳ hướng dẫn nào chưa được xử lý. Trong trường hợp này, số tiền hướng dẫn sẽ được trả lại để có sẵn số dư của bạn.
            </p>
            <p>
              &bull; Các hướng dẫn rút tiền được đưa ra ngoài giờ làm việc của ngân hàng sẽ được xử lý khi các ngân hàng bắt đầu giờ làm việc của họ.
            </p>
          </div>
        </Box>
      </div>
    </div>
  </SiteLayout>
);
>>>>>>> d2e22ac (chuyển ngôn ngữ hiển thị sang tiếng việt)

export default DashboardScreen;
