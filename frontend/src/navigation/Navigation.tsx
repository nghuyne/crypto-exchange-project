import { Routes, Route } from 'react-router-dom';

// components
import { ProtectedRoute } from '../components/ProtectedRoute';
import AdminRoute from '../components/AdminRoute';

// layouts
import AdminLayout from '../layouts/AdminLayout';

// pages
import MarketScreen from '../screens/Market/MarketScreen';
import AdminDashboard from '../screens/Admin/AdminDashboard';
import AdminOrders from '../screens/Admin/AdminOrders';
import AdminRisk from '../screens/Admin/AdminRisk';
import AdminUsers from '../screens/Admin/AdminUsers';
import SigninScreen from '../screens/Members/SigninScreen';
import SignupScreen from '../screens/Members/SignupScreen';
import ForgotScreen from '../screens/Members/ForgotScreen';
import ProfileScreen from '../screens/Members/ProfileScreen';
import CapitalScreen from '../screens/Capital/CapitalScreen';
import NotFoundScreen from '../screens/NotFound/NotFoundScreen';
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import TransactionsScreen from '../screens/Transactions/TransactionsScreen';
import DataScreen from '../screens/Data/DataScreen';
import WalletScreen from '../screens/Wallet/WalletScreen';
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

    <Route
      path='/wallet'
      element={
        <ProtectedRoute>
          <WalletScreen />
        </ProtectedRoute>
      }
    />

    {/* Admin Routes */}
    <Route
      path='/admin'
      element={
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      }
    >
      <Route index element={<AdminDashboard />} />
      <Route path='orders' element={<AdminOrders />} />
      <Route path='risk' element={<AdminRisk />} />
      <Route path='users' element={<AdminUsers />} />
    </Route>

    {/* 404 */}
    <Route path='*' element={<NotFoundScreen />} />
  </Routes>
);

export default Navigation;

