import { Routes, Route } from 'react-router-dom';

// components
import { ProtectedRoute } from '../components/ProtectedRoute';

// pages
import MarketScreen from '../screens/Market/MarketScreen';
import BuyCryptoScreen from '../screens/Market/BuyCryptoScreen';
import SigninScreen from '../screens/Members/SigninScreen';
import SignupScreen from '../screens/Members/SignupScreen';
import ForgotScreen from '../screens/Members/ForgotScreen';
import ProfileScreen from '../screens/Members/ProfileScreen';
import NotificationsScreen from '../screens/Members/NotificationsScreen';
import LevelApplicationScreen from '../screens/Members/LevelApplicationScreen';
import AddressesScreen from '../screens/Members/AddressesScreen';
import MessagesScreen from '../screens/Members/MessagesScreen';
import SettingsScreen from '../screens/Members/SettingsScreen';
import CapitalScreen from '../screens/Capital/CapitalScreen';
import NotFoundScreen from '../screens/NotFound/NotFoundScreen';
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import TransactionsScreen from '../screens/Transactions/TransactionsScreen';
import DataScreen from '../screens/Data/DataScreen';
import WalletScreen from '../screens/Wallet/WalletScreen';
import DocsScreen from '../screens/Docs/DocsScreen';
import ApiScreen from '../screens/Api/ApiScreen';
import SearchScreen from '../screens/Search/SearchScreen';
import BlockchainExplorer from '../pages/BlockchainExplorer';

const Navigation: React.FC = () => (
  <Routes>
    <Route path='/' element={<SigninScreen />} />
    <Route path='/members/signup' element={<SignupScreen />} />
    <Route path='/members/forgot-password' element={<ForgotScreen />} />

    {/* Protected Routes - yêu cầu đăng nhập */}
    <Route
      path='/market'
      element={
        <ProtectedRoute>
          <MarketScreen />
        </ProtectedRoute>
      }
    />
    <Route
      path='/members'
      element={
        <ProtectedRoute>
          <ProfileScreen />
        </ProtectedRoute>
      }
    />
    <Route
      path='/capital'
      element={
        <ProtectedRoute>
          <CapitalScreen />
        </ProtectedRoute>
      }
    />
    <Route
      path='/dashboard'
      element={
        <ProtectedRoute>
          <DashboardScreen />
        </ProtectedRoute>
      }
    />
    <Route
      path='/data'
      element={
        <ProtectedRoute>
          <DataScreen />
        </ProtectedRoute>
      }
    />
    <Route
      path='/transactions'
      element={
        <ProtectedRoute>
          <TransactionsScreen />
        </ProtectedRoute>
      }
    />
    <Route
      path='/blockchain-explorer'
      element={
        <ProtectedRoute>
          <BlockchainExplorer />
        </ProtectedRoute>
      }
    />

    <Route
      path='/blockchain'
      element={
        <ProtectedRoute>
          <BlockchainExplorer />
        </ProtectedRoute>
      }
    />

    <Route path='/wallet'
      element={
        <ProtectedRoute>
          <WalletScreen />
        </ProtectedRoute>
      }
    />

    <Route
      path='/search'
      element={
        <ProtectedRoute>
          <SearchScreen />
        </ProtectedRoute>
      }
    />

    <Route
      path='/buy-crypto'
      element={
        <ProtectedRoute>
          <BuyCryptoScreen />
        </ProtectedRoute>
      }
    />

    <Route
      path='/members/notifications'
      element={
        <ProtectedRoute>
          <NotificationsScreen />
        </ProtectedRoute>
      }
    />

    <Route
      path='/members/application'
      element={
        <ProtectedRoute>
          <LevelApplicationScreen />
        </ProtectedRoute>
      }
    />

    <Route
      path='/contacts'
      element={
        <ProtectedRoute>
          <AddressesScreen />
        </ProtectedRoute>
      }
    />

    <Route
      path='/messages'
      element={
        <ProtectedRoute>
          <MessagesScreen />
        </ProtectedRoute>
      }
    />

    <Route
      path='/settings'
      element={
        <ProtectedRoute>
          <SettingsScreen />
        </ProtectedRoute>
      }
    />

    <Route
      path='/docs'
      element={
        <ProtectedRoute>
          <DocsScreen />
        </ProtectedRoute>
      }
    />

    <Route
      path='/api'
      element={
        <ProtectedRoute>
          <ApiScreen />
        </ProtectedRoute>
      }
    />

    {/* 404 */}
    <Route path='*' element={<NotFoundScreen />} />
  </Routes>
);

export default Navigation;

