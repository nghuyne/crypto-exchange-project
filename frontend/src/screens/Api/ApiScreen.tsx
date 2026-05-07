import SiteLayout from '../../layouts/SiteLayout';
import Header from '../../components/Header/Header';
import Box from '../../components/Common/Box';

const ApiScreen: React.FC = () => {
    const endpoints = [
        { method: 'GET', path: '/api/v1/markets', desc: 'Lấy tất cả các cặp giao dịch có sẵn' },
        { method: 'GET', path: '/api/v1/ticker/:symbol', desc: 'Lấy dữ liệu ticker cho một ký hiệu' },
        { method: 'POST', path: '/api/v1/orders', desc: 'Đặt lệnh mới' },
        { method: 'GET', path: '/api/v1/orders', desc: 'Lấy danh sách lệnh của bạn' },
        { method: 'DELETE', path: '/api/v1/orders/:id', desc: 'Hủy lệnh' },
        { method: 'GET', path: '/api/v1/wallet', desc: 'Lấy số dư ví' },
        { method: 'GET', path: '/api/v1/trades', desc: 'Lấy lịch sử giao dịch' },
        { method: 'GET', path: '/api/v1/notifications', desc: 'Lấy thông báo' },
    ];

    const getMethodColor = (method: string): string => {
        switch (method) {
            case 'GET': return '#61affe';
            case 'POST': return '#49cc90';
            case 'DELETE': return '#f93e3e';
            case 'PUT': return '#fca130';
            default: return '#999';
        }
    };

    return (
        <SiteLayout>
            <Header icon='code' title='Tài liệu API' />
            <div style={{ padding: '20px' }}>
                <Box>
                    <div style={{ padding: '20px' }}>
                        <h3 style={{ marginBottom: '16px' }}>Điểm cuối API REST</h3>
                        <p style={{ color: '#666', marginBottom: '20px' }}>
                            URL cơ sở: <code style={{ backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '3px' }}>http://localhost:8080/api/v1</code>
                        </p>
                        <p style={{ color: '#666', marginBottom: '20px' }}>
                            Xác thực: Sử dụng token Bearer trong tiêu đề Ủy quyền
                        </p>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #ddd' }}>
                                        <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold' }}>Phương thức</th>
                                        <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold' }}>Điểm cuối</th>
                                        <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold' }}>Mô tả</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {endpoints.map((endpoint, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '12px' }}>
                                                <span
                                                    style={{
                                                        padding: '4px 8px',
                                                        backgroundColor: getMethodColor(endpoint.method),
                                                        color: 'white',
                                                        borderRadius: '3px',
                                                        fontSize: '12px',
                                                        fontWeight: 'bold',
                                                    }}
                                                >
                                                    {endpoint.method}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '13px' }}>{endpoint.path}</td>
                                            <td style={{ padding: '12px', color: '#666' }}>{endpoint.desc}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ marginTop: '30px', padding: '16px', backgroundColor: '#f0f8ff', borderRadius: '4px' }}>
                            <h4 style={{ marginTop: 0 }}>Ví dụ xác thực</h4>
                            <pre style={{ backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '4px', overflowX: 'auto' }}>
                                {`curl -H "Authorization: Bearer YOUR_TOKEN" \\
  http://localhost:8080/api/v1/wallet`}
                            </pre>
                        </div>
                    </div>
                </Box>
            </div>
        </SiteLayout>
    );
};

export default ApiScreen;
