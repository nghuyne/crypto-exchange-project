import SiteLayout from '../../layouts/SiteLayout';
import Header from '../../components/Header/Header';
import WalletHeader from './components/WalletHeader';
import WalletAssets from './components/WalletAssets';
import WalletFooter from './components/WalletFooter';
import './WalletScreen.css';

const WalletScreen: React.FC = () => {
  return (
    <SiteLayout>
      <Header icon='account_balance_wallet' title='Ví của tôi' />
      <div className='wallet-container'>
        <WalletHeader />
        <WalletAssets />
        <WalletFooter />
      </div>
    </SiteLayout>
  );
};

export default WalletScreen;
