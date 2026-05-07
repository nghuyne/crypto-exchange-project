import SiteLayout from '../../layouts/SiteLayout';
import Header from '../../components/Header/Header';
import Box from '../../components/Common/Box';

const DocsScreen: React.FC = () => {
    const docs = [
        { title: 'Bắt đầu', content: 'Tìm hiểu cách giao dịch trên nền tảng của chúng tôi. Tạo tài khoản, xác minh danh tính của bạn, và thực hiện giao dịch đầu tiên.' },
        { title: 'Bảo mật tài khoản', content: 'Bảo vệ tài khoản của bạn bằng xác thực hai yếu tố, mật khẩu mạnh và các phương pháp đăng nhập an toàn.' },
        { title: 'Hướng dẫn giao dịch', content: 'Hiểu rõ về lệnh thị trường, lệnh giới hạn, lệnh dừng và các khái niệm giao dịch khác để tối đa hóa lợi nhuận.' },
        { title: 'Cấu trúc phí', content: 'Cấu trúc phí minh bạch của chúng tôi: Phí giao dịch (0.1%), Phí rút tiền khác nhau theo blockchain, Không có phí gửi tiền.' },
        { title: 'Xác minh KYC', content: 'Xác minh danh tính của bạn theo các cấp độ. Cấp 1: Thông tin cơ bản. Cấp 2: Xác minh đầy đủ. Cấp 3: Giới hạn giao dịch nâng cao.' },
        { title: 'Tài liệu API', content: 'Tích hợp API giao dịch của chúng tôi vào các ứng dụng của bạn. API RESTful với hỗ trợ WebSocket cho dữ liệu thực tế.' },
    ];

    return (
        <SiteLayout>
            <Header icon='description' title='Tài liệu' />
            <div style={{ padding: '20px' }}>
                <Box>
                    <div style={{ padding: '20px' }}>
                        <h3 style={{ marginBottom: '20px' }}>Trợ giúp và Tài liệu</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                            {docs.map((doc, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        padding: '16px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <h4 style={{ marginTop: 0, marginBottom: '8px' }}>{doc.title}</h4>
                                    <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{doc.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </Box>
            </div>
        </SiteLayout>
    );
};

export default DocsScreen;
