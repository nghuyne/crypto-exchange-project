import { useEffect, useState, useCallback } from 'react';
import './Admin.css';

interface DashboardStats {
  total_users: number;
  active_users: number;
  total_orders: number;
  total_trades: number;
  total_volume: number;
  suspended_count: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/v1/admin/dashboard', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const json = await response.json();
      setStats(json.data as DashboardStats);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (error) {
    return (
      <div className='admin-container'>
        <h1>Dashboard</h1>
        <div className='admin-error'>{error}</div>
      </div>
    );
  }

  if (loading || !stats) {
    return (
      <div className='admin-container'>
        <h1>Dashboard</h1>
        <div className='admin-loading'>Loading stats...</div>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(num);
  };

  const formatVolume = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      compactDisplay: 'short',
    }).format(num);
  };

  return (
    <div className='admin-container'>
      <h1 style={{ marginTop: 0, marginBottom: '24px', fontSize: '24px', fontWeight: 700 }}>Dashboard</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '20px',
        }}
      >
        {/* Total Users */}
        <div className='admin-stat-card'>
          <div className='admin-stat-label'>Total Users</div>
          <div className='admin-stat-value' style={{ color: '#60a5fa' }}>
            {formatNumber(stats.total_users)}
          </div>
          <div className='admin-stat-subtitle'>Registered accounts</div>
          <div className='admin-stat-icon'>👤</div>
        </div>

        {/* Active Users */}
        <div className='admin-stat-card'>
          <div className='admin-stat-label'>Active Users</div>
          <div className='admin-stat-value' style={{ color: '#10b981' }}>
            {formatNumber(stats.active_users)}
          </div>
          <div className='admin-stat-subtitle'>
            {((stats.active_users / stats.total_users) * 100).toFixed(1)}% active
          </div>
          <div className='admin-stat-icon'>✓</div>
        </div>

        {/* Suspended Users */}
        <div className='admin-stat-card'>
          <div className='admin-stat-label'>Suspended Users</div>
          <div className='admin-stat-value' style={{ color: '#ef4444' }}>
            {formatNumber(stats.suspended_count)}
          </div>
          <div className='admin-stat-subtitle'>
            {((stats.suspended_count / stats.total_users) * 100).toFixed(1)}% suspended
          </div>
          <div className='admin-stat-icon'>🔒</div>
        </div>

        {/* Total Orders */}
        <div className='admin-stat-card'>
          <div className='admin-stat-label'>Total Orders</div>
          <div className='admin-stat-value' style={{ color: '#8b5cf6' }}>
            {formatNumber(stats.total_orders)}
          </div>
          <div className='admin-stat-subtitle'>All-time orders</div>
          <div className='admin-stat-icon'>📊</div>
        </div>

        {/* Total Trades */}
        <div className='admin-stat-card'>
          <div className='admin-stat-label'>Total Trades</div>
          <div className='admin-stat-value' style={{ color: '#ec4899' }}>
            {formatNumber(stats.total_trades)}
          </div>
          <div className='admin-stat-subtitle'>Executed trades</div>
          <div className='admin-stat-icon'>🔄</div>
        </div>

        {/* Total Volume */}
        <div className='admin-stat-card'>
          <div className='admin-stat-label'>Total Volume</div>
          <div className='admin-stat-value' style={{ color: '#f59e0b', fontSize: '24px' }}>
            {formatVolume(stats.total_volume)}
          </div>
          <div className='admin-stat-subtitle'>Trading volume</div>
          <div className='admin-stat-icon'>💰</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px', color: 'rgba(226, 232, 240, 0.5)', fontSize: '12px' }}>
        <p>Last updated: {new Date().toLocaleString('en-US')}</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
