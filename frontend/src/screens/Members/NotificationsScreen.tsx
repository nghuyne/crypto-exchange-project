import { useEffect, useState } from 'react';
import SiteLayout from '../../layouts/SiteLayout';
import Header from '../../components/Header/Header';
import Box from '../../components/Common/Box';
import { notificationService, INotification } from '../../api/services/appService';
import { useAuth } from '../../hooks/useAuth';

const NotificationsScreen: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    setError('Vui lòng đăng nhập');
                    setLoading(false);
                    return;
                }

                const response = await notificationService.getNotifications(token);
                if (response.status === 'success' && Array.isArray(response.data)) {
                    setNotifications(response.data);
                    setError(null);
                } else {
                    setNotifications([]);
                    setError(null);
                }
            } catch (err) {
                console.error('Lỗi lấy thông báo:', err);
                setError('Không thể tải thông báo');
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchNotifications();

            // Cập nhật notifications mỗi 30 giây (real-time)
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    const getIconForType = (type: string): string => {
        switch (type) {
            case 'success': return 'check_circle';
            case 'error': return 'error';
            case 'warning': return 'warning';
            default: return 'info';
        }
    };

    const getColorForType = (type: string): string => {
        switch (type) {
            case 'success': return '#4caf50';
            case 'error': return '#f44336';
            case 'warning': return '#ff9800';
            default: return '#2196f3';
        }
    };

    return (
        <SiteLayout>
            <Header icon='notifications' title='Thông báo' />
            <div style={{ padding: '20px' }}>
                <Box>
                    <div style={{ padding: '20px' }}>
                        {error && (
                            <div style={{ padding: '12px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '20px' }}>
                                {error}
                            </div>
                        )}

                        {loading ? (
                            <p style={{ textAlign: 'center', color: '#999' }}>Đang tải thông báo...</p>
                        ) : notifications.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                                <i className='material-icons' style={{ fontSize: '48px', marginBottom: '10px', display: 'block' }}>
                                    notifications_none
                                </i>
                                <p>Chưa có thông báo nào</p>
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    style={{
                                        padding: '16px',
                                        marginBottom: '12px',
                                        borderLeft: `4px solid ${getColorForType(notif.type)}`,
                                        backgroundColor: notif.read ? '#f9f9f9' : '#f0f8ff',
                                        borderRadius: '4px',
                                        display: 'flex',
                                        gap: '12px',
                                    }}
                                >
                                    <i
                                        className='material-icons'
                                        style={{ color: getColorForType(notif.type), fontSize: '24px', flexShrink: 0 }}
                                    >
                                        {getIconForType(notif.type)}
                                    </i>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{notif.title}</div>
                                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>{notif.message}</div>
                                        <div style={{ fontSize: '12px', color: '#999' }}>{notif.timestamp}</div>
                                    </div>
                                    {!notif.read && (
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2196f3', marginTop: '4px' }} />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </Box>
            </div>
        </SiteLayout>
    );
};

export default NotificationsScreen;
