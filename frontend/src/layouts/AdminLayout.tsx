import { Outlet, NavLink } from 'react-router-dom';

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
      <h2 style={{ marginTop: 0, marginBottom: '24px', fontSize: '16px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Admin Panel</h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        <li style={{ marginBottom: '12px' }}>
          <NavLink
            to='/admin'
            style={({ isActive }) => ({
              display: 'block',
              padding: '10px 12px',
              color: isActive ? '#60a5fa' : '#94a3b8',
              textDecoration: 'none',
              borderRadius: '6px',
              borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
              paddingLeft: isActive ? '9px' : '12px',
              transition: 'all 0.2s ease',
              fontSize: '14px',
              fontWeight: 600,
              backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
            })}
          >
            Dashboard
          </NavLink>
        </li>
        <li style={{ marginBottom: '12px' }}>
          <NavLink
            to='/admin/users'
            style={({ isActive }) => ({
              display: 'block',
              padding: '10px 12px',
              color: isActive ? '#60a5fa' : '#94a3b8',
              textDecoration: 'none',
              borderRadius: '6px',
              borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
              paddingLeft: isActive ? '9px' : '12px',
              transition: 'all 0.2s ease',
              fontSize: '14px',
              fontWeight: 600,
              backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
            })}
          >
            Users
          </NavLink>
        </li>
        <li style={{ marginBottom: '12px' }}>
          <NavLink
            to='/admin/orders'
            style={({ isActive }) => ({
              display: 'block',
              padding: '10px 12px',
              color: isActive ? '#60a5fa' : '#94a3b8',
              textDecoration: 'none',
              borderRadius: '6px',
              borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
              paddingLeft: isActive ? '9px' : '12px',
              transition: 'all 0.2s ease',
              fontSize: '14px',
              fontWeight: 600,
              backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
            })}
          >
            Orders
          </NavLink>
        </li>
        <li style={{ marginBottom: '12px' }}>
          <NavLink
            to='/admin/risk'
            style={({ isActive }) => ({
              display: 'block',
              padding: '10px 12px',
              color: isActive ? '#60a5fa' : '#94a3b8',
              textDecoration: 'none',
              borderRadius: '6px',
              borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
              paddingLeft: isActive ? '9px' : '12px',
              transition: 'all 0.2s ease',
              fontSize: '14px',
              fontWeight: 600,
              backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
            })}
          >
            Risk
          </NavLink>
        </li>
      </ul>
    </nav>

    {/* Main Content */}
    <main style={{ flex: 1, padding: '20px', color: '#e2e8f0', overflowY: 'auto' }}>
      <Outlet />
    </main>
  </div>
);

export default AdminLayout;
