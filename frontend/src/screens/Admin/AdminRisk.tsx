import { useEffect, useState, useCallback } from 'react';
import './Admin.css';

interface AdminLog {
  id: number;
  admin_id: number;
  admin_name: string;
  action: string;
  target_id: number;
  details: Record<string, unknown> | null;
  created_at: string;
}

const AdminRisk: React.FC = () => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLog, setExpandedLog] = useState<number | null>(null);

  const ITEMS_PER_PAGE = 50;

  const fetchLogs = useCallback(async () => {
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
      });

      const response = await fetch(`/api/v1/admin/logs?${params}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch logs');

      const json = await response.json();
      setLogs(json.data.logs);
      setTotal(json.data.total);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  if (error) {
    return (
      <div className='admin-container'>
        <h1>Audit Logs</h1>
        <div className='admin-error'>{error}</div>
      </div>
    );
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className='admin-container'>
      <h1 style={{ marginTop: 0, marginBottom: '24px', fontSize: '24px', fontWeight: 700 }}>Audit Logs</h1>

      {/* Table */}
      <div className='admin-card'>
        {loading ? (
          <div className='admin-loading'>Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className='admin-empty'>No audit logs found</div>
        ) : (
          <>
            <div className='admin-table-container'>
              <table className='admin-table'>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Admin</th>
                    <th>Action</th>
                    <th>Target ID</th>
                    <th>Details</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id}>
                      <td className='admin-table-mono'>{log.id}</td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{log.admin_name}</span>
                        <br />
                        <span style={{ fontSize: '11px', color: 'rgba(226, 232, 240, 0.5)' }}>
                          ID: {log.admin_id}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            background: 'rgba(59, 130, 246, 0.15)',
                            color: '#60a5fa',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                          }}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className='admin-table-mono'>{log.target_id}</td>
                      <td>
                        {log.details ? (
                          <button
                            onClick={() =>
                              setExpandedLog(expandedLog === log.id ? null : log.id)
                            }
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#8b5cf6',
                              cursor: 'pointer',
                              fontSize: '12px',
                              textDecoration: 'underline',
                            }}
                            title={JSON.stringify(log.details, null, 2)}
                          >
                            {expandedLog === log.id ? '▼ Hide' : '▶ Show'}
                          </button>
                        ) : (
                          <span style={{ color: 'rgba(226, 232, 240, 0.4)' }}>—</span>
                        )}
                      </td>
                      <td style={{ fontSize: '12px' }}>
                        {new Date(log.created_at).toLocaleString('en-US', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Expanded Details */}
              {expandedLog !== null && (
                <div
                  style={{
                    padding: '16px',
                    backgroundColor: 'rgba(59, 130, 246, 0.05)',
                    borderTop: '1px solid rgba(148, 163, 184, 0.08)',
                  }}
                >
                  <pre
                    style={{
                      margin: 0,
                      fontSize: '11px',
                      color: '#60a5fa',
                      fontFamily: "'Courier New', monospace",
                      overflow: 'auto',
                      maxHeight: '200px',
                      padding: '8px',
                      background: 'rgba(15, 23, 42, 0.5)',
                      borderRadius: '4px',
                    }}
                  >
                    {JSON.stringify(
                      logs.find(l => l.id === expandedLog)?.details,
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}
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

export default AdminRisk;
