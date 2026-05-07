import { useState } from 'react';
import SiteLayout from '../../layouts/SiteLayout';
import Header from '../../components/Header/Header';
import Box from '../../components/Common/Box';

interface Message {
    id: number;
    from: string;
    subject: string;
    preview: string;
    timestamp: string;
    read: boolean;
}

const MessagesScreen: React.FC = () => {
    const [messages] = useState<Message[]>([
        { id: 1, from: 'Đội hỗ trợ', subject: 'Chào mừng đến Sàn giao dịch Tiền mã hóa', preview: 'Cảm ơn bạn đã tham gia nền tảng của chúng tôi...', timestamp: '2 giờ trước', read: true },
        { id: 2, from: 'Bot giao dịch', subject: 'Cảnh báo giá: BTC đạt $42.000', preview: 'Cảnh báo giá của bạn đã được kích hoạt...', timestamp: '5 giờ trước', read: true },
        { id: 3, from: 'Quản trị viên', subject: 'Các tính năng mới có sẵn', preview: 'Kiểm tra các tính năng giao dịch mới của chúng tôi...', timestamp: '1 ngày trước', read: false },
        { id: 4, from: 'Cộng đồng', subject: 'Cuộc thi giao dịch - Giành giải thưởng', preview: 'Tham gia cuộc thi giao dịch của chúng tôi và giành giải thưởng...', timestamp: '2 ngày trước', read: false },
    ]);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

    if (selectedMessage) {
        return (
            <SiteLayout>
                <Header icon='mail' title='Tin nhắn' />
                <div style={{ padding: '20px' }}>
                    <Box>
                        <div style={{ padding: '20px' }}>
                            <button
                                onClick={() => setSelectedMessage(null)}
                                style={{
                                    marginBottom: '20px',
                                    padding: '8px 16px',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                }}
                            >
                                ← Quay lại tin nhắn
                            </button>
                            <div style={{ borderBottom: '1px solid #eee', paddingBottom: '16px', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 4px 0' }}>{selectedMessage.subject}</h3>
                                        <div style={{ color: '#666', fontSize: '14px' }}>Từ: {selectedMessage.from}</div>
                                    </div>
                                    <div style={{ color: '#999', fontSize: '12px' }}>{selectedMessage.timestamp}</div>
                                </div>
                            </div>
                            <div style={{ color: '#333', lineHeight: '1.6' }}>
                                <p>Cảm ơn bạn đã là một phần của cộng đồng của chúng tôi. Chúng tôi có những cập nhật và thông tin quan trọng cho bạn về hoạt động giao dịch và tài khoản của bạn.</p>
                                <p>Nếu bạn có bất kỳ câu hỏi nào hoặc cần sự trợ giúp, vui lòng liên hệ với đội hỗ trợ của chúng tôi.</p>
                                <p>Trân trọng,<br />{selectedMessage.from}</p>
                            </div>
                        </div>
                    </Box>
                </div>
            </SiteLayout>
        );
    }

    return (
        <SiteLayout>
            <Header icon='mail' title='Tin nhắn' />
            <div style={{ padding: '20px' }}>
                <Box>
                    <div style={{ padding: '20px' }}>
                        <h3 style={{ marginBottom: '16px' }}>Hộp thư ({messages.length})</h3>
                        {messages.map(msg => (
                            <div
                                key={msg.id}
                                onClick={() => setSelectedMessage(msg)}
                                style={{
                                    padding: '12px',
                                    marginBottom: '8px',
                                    borderLeft: `4px solid ${msg.read ? '#ddd' : '#007bff'}`,
                                    backgroundColor: msg.read ? '#f9f9f9' : '#f0f8ff',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = msg.read ? '#f0f0f0' : '#e3f2fd')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = msg.read ? '#f9f9f9' : '#f0f8ff')}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '4px' }}>
                                    <div style={{ fontWeight: msg.read ? 'normal' : 'bold' }}>{msg.from}</div>
                                    <div style={{ fontSize: '12px', color: '#999' }}>{msg.timestamp}</div>
                                </div>
                                <div style={{ fontWeight: msg.read ? 'normal' : 'bold', marginBottom: '4px' }}>{msg.subject}</div>
                                <div style={{ fontSize: '13px', color: '#666' }}>{msg.preview}</div>
                            </div>
                        ))}
                    </div>
                </Box>
            </div>
        </SiteLayout>
    );
};

export default MessagesScreen;
