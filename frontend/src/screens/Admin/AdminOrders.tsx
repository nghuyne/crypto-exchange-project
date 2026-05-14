import { useEffect, useState, useCallback } from 'react';
import './Admin.css';

interface AdminOrder {
  id: number;
  user_id: number;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'LIMIT' | 'MARKET';
  price: number;
  quantity: number;
  filled: number;
  status: string;
  created_at: string;
}

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [symbolFilter, setSymbolFilter] = useState('');
  const [actionRow, setActionRow] = useState<number | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const ITEMS_PER_PAGE = 50;

  const fetchOrders = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        status: statusFilter,
        symbol: symbolFilter,
      });

      const response = await fetch(`/api/v1/admin/orders?${params}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch orders');

      const json = await response.json();
      setOrders(json.data.orders);
      setTotal(json.data.total);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, symbolFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancel = async (orderId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setSubmitting(true);
      const response = await fetch('/api/v1/admin/orders/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ order_id: orderId, reason: actionReason }),
      });

      if (!response.ok) throw new Error('Failed to cancel order');

      setOrders(orders.map(o => (o.id === orderId ? { ...o, status: 'CANCELLED' } : o)));
      setActionRow(null);
      setActionReason('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error cancelling order');
    } finally {
      setSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className='admin-container'>
        <h1>Orders</h1>
        <div className='admin-error'>{error}</div>
      </div>
    );
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const canCancelOrder = (status: string) => status === 'OPEN' || status === 'PARTIAL';

  return (
    <div className='admin-container'>
      <h1 style={{ marginTop: 0, marginBottom: '24px', fontSize: '24px', fontWeight: 700 }}>Orders</h1>

      {/* Filters */}
      <div className='admin-card' style={{ marginBottom: '20px' }}>
        <div className='admin-filter-bar'>
          <input
            type='text'
            placeholder='Search by symbol...'
            value={symbolFilter}
            onChange={e => {
              setSymbolFilter(e.target.value);
              setPage(1);
            }}
            className='admin-filter-input'
            style={{ flex: 1, minWidth: '150px' }}
          />
          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className='admin-filter-select'
          >
            <option value=''>All Status</option>
            <option value='OPEN'>Open</option>
            <option value='FILLED'>Filled</option>
            <option value='PARTIAL'>Partial</option>
            <option value='CANCELLED'>Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className='admin-card'>
        {loading ? (
          <div className='admin-loading'>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className='admin-empty'>No orders found</div>
        ) : (
          <>
            <div className='admin-table-container'>
              <table className='admin-table'>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>User ID</th>
                    <th>Symbol</th>
                    <th>Side</th>
                    <th>Type</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Filled</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td className='admin-table-mono'>{order.id}</td>
                      <td className='admin-table-mono'>{order.user_id}</td>
                      <td style={{ fontWeight: 600 }}>{order.symbol}</td>
                      <td>
                        <span className={`admin-badge admin-badge-${order.side.toLowerCase()}`}>
                          {order.side}
                        </span>
                      </td>
                      <td>{order.type}</td>
                      <td className='admin-table-mono'>
                        ${order.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                      </td>
                      <td className='admin-table-mono'>
                        {order.quantity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                      </td>
                      <td className='admin-table-mono'>
                        {order.filled.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                      </td>
                      <td>
                        <span
                          className={`admin-badge admin-badge-${order.status.toLowerCase()}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px' }}>
                        {new Date(order.created_at).toLocaleDateString('en-US')}
                      </td>
                      <td>
                        {actionRow === order.id ? (
                          <div className='admin-action-reason'>
                            <input
                              type='text'
                              placeholder='Reason (optional)'
                              value={actionReason}
                              onChange={e => setActionReason(e.target.value)}
                              disabled={submitting}
                            />
                            <button
                              className='admin-btn admin-btn-confirm'
                              onClick={() => handleCancel(order.id)}
                              disabled={submitting}
                            >
                              OK
                            </button>
                            <button
                              className='admin-btn admin-btn-secondary'
                              onClick={() => {
                                setActionRow(null);
                                setActionReason('');
                              }}
                              disabled={submitting}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : canCancelOrder(order.status) ? (
                          <button
                            className='admin-btn admin-btn-cancel'
                            onClick={() => setActionRow(order.id)}
                          >
                            Cancel
                          </button>
                        ) : (
                          <span style={{ color: 'rgba(226, 232, 240, 0.4)', fontSize: '12px' }}>N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className='admin-pagination'>
              <button
                className='admin-pagination-btn'
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                ← Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, page - 2), Math.min(totalPages, page + 1))
                .map(p => (
                  <button
                    key={p}
                    className={`admin-pagination-btn ${p === page ? 'active' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}

              <button
                className='admin-pagination-btn'
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Next →
              </button>

              <div className='admin-pagination-info'>
                Page {page} of {totalPages} ({total} total)
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
