import { useEffect, useState, useCallback } from 'react';
import './Admin.css';

interface AdminUser {
  id: number;
  email: string;
  full_name: string;
  role: string;
  status: string;
  kyc_status: string;
  tier: number;
  created_at: string;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [actionRow, setActionRow] = useState<number | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const ITEMS_PER_PAGE = 20;

  const fetchUsers = useCallback(async () => {
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
        search,
        status: statusFilter,
        role: roleFilter,
      });

      const response = await fetch(`/api/v1/admin/users?${params}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch users');

      const json = await response.json();
      setUsers(json.data.users);
      setTotal(json.data.total);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSuspend = async (userId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setSubmitting(true);
      const response = await fetch('/api/v1/admin/users/suspend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: userId, reason: actionReason }),
      });

      if (!response.ok) throw new Error('Failed to suspend user');

      setUsers(users.map(u => (u.id === userId ? { ...u, status: 'SUSPENDED' } : u)));
      setActionRow(null);
      setActionReason('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error suspending user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResume = async (userId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setSubmitting(true);
      const response = await fetch('/api/v1/admin/users/resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) throw new Error('Failed to resume user');

      setUsers(users.map(u => (u.id === userId ? { ...u, status: 'ACTIVE' } : u)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error resuming user');
    } finally {
      setSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className='admin-container'>
        <h1>Users</h1>
        <div className='admin-error'>{error}</div>
      </div>
    );
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className='admin-container'>
      <h1 style={{ marginTop: 0, marginBottom: '24px', fontSize: '24px', fontWeight: 700 }}>Users</h1>

      {/* Filters */}
      <div className='admin-card' style={{ marginBottom: '20px' }}>
        <div className='admin-filter-bar'>
          <input
            type='text'
            placeholder='Search by email or name...'
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className='admin-filter-input'
            style={{ flex: 1, minWidth: '200px' }}
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
            <option value='ACTIVE'>Active</option>
            <option value='SUSPENDED'>Suspended</option>
            <option value='BANNED'>Banned</option>
          </select>
          <select
            value={roleFilter}
            onChange={e => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className='admin-filter-select'
          >
            <option value=''>All Roles</option>
            <option value='USER'>User</option>
            <option value='ADMIN'>Admin</option>
            <option value='MODERATOR'>Moderator</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className='admin-card'>
        {loading ? (
          <div className='admin-loading'>Loading users...</div>
        ) : users.length === 0 ? (
          <div className='admin-empty'>No users found</div>
        ) : (
          <>
            <div className='admin-table-container'>
              <table className='admin-table'>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Full Name</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>KYC</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td className='admin-table-mono'>{user.id}</td>
                      <td>{user.email}</td>
                      <td>{user.full_name}</td>
                      <td>
                        <span className={`admin-badge admin-badge-${user.role.toLowerCase()}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`admin-badge admin-badge-${user.status.toLowerCase()}`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`admin-badge admin-badge-${user.kyc_status.toLowerCase()}`}
                        >
                          {user.kyc_status}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px' }}>
                        {new Date(user.created_at).toLocaleDateString('en-US')}
                      </td>
                      <td>
                        {actionRow === user.id ? (
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
                              onClick={() => handleSuspend(user.id)}
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
                        ) : user.status === 'ACTIVE' ? (
                          <button
                            className='admin-btn admin-btn-suspend'
                            onClick={() => setActionRow(user.id)}
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            className='admin-btn admin-btn-resume'
                            onClick={() => handleResume(user.id)}
                            disabled={submitting}
                          >
                            Resume
                          </button>
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

export default AdminUsers;
