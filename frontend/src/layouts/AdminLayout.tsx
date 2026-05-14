import { Outlet } from 'react-router-dom';

const AdminLayout: React.FC = () => (
  <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f172a' }}>
    {/* Sidebar */}
    <nav style={{
      width: '250px',
      backgroundColor: '#1e293b',
      borderRight: '1px solid rgba(99, 179, 237, 0.15)',
      padding: '20px',
      color: '#ffffff'
    }}>
      <h2>Admin Panel</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li style={{ marginBottom: '10px' }}>
          <a href='/admin' style={{ color: '#60a5fa', textDecoration: 'none' }}>Dashboard</a>
        </li>
        <li style={{ marginBottom: '10px' }}>
          <a href='/admin/orders' style={{ color: '#60a5fa', textDecoration: 'none' }}>Orders</a>
        </li>
        <li style={{ marginBottom: '10px' }}>
          <a href='/admin/risk' style={{ color: '#60a5fa', textDecoration: 'none' }}>Risk</a>
        </li>
        <li style={{ marginBottom: '10px' }}>
          <a href='/admin/users' style={{ color: '#60a5fa', textDecoration: 'none' }}>Users</a>
        </li>
      </ul>
    </nav>

    {/* Main Content */}
    <main style={{ flex: 1, padding: '20px', color: '#e2e8f0' }}>
      <Outlet />
    </main>
  </div>
);

export default AdminLayout;
