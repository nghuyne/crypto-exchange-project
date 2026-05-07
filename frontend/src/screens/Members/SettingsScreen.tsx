import { useState } from 'react';
import SiteLayout from '../../layouts/SiteLayout';
import Header from '../../components/Header/Header';
import Box from '../../components/Common/Box';

const SettingsScreen: React.FC = () => {
    const [settings, setSettings] = useState({
        emailNotifications: true,
        pushNotifications: true,
        priceAlerts: true,
        twoFactorAuth: false,
        darkMode: false,
    });
    const [saved, setSaved] = useState(false);

    const handleToggle = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
        setSaved(false);
    };

    const handleSave = () => {
        // Gọi API thực tế để lưu cài đặt
        // const token = localStorage.getItem('auth_token');
        // await userService.updateSettings(token, settings);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <SiteLayout>
            <Header icon='settings' title='Cài đặt' />
            <div style={{ padding: '20px' }}>
                <Box>
                    <div style={{ padding: '20px' }}>
                        <h3 style={{ marginBottom: '20px' }}>Tùy chọn</h3>

                        {saved && (
                            <div style={{ padding: '12px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px', marginBottom: '20px' }}>
                                Cài đặt đã lưu thành công!
                            </div>
                        )}

                        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>Thông báo qua email</div>
                                <div style={{ fontSize: '12px', color: '#999' }}>Nhận cập nhật qua email</div>
                            </div>
                            <input
                                type='checkbox'
                                checked={settings.emailNotifications}
                                onChange={() => handleToggle('emailNotifications')}
                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>Thông báo Push</div>
                                <div style={{ fontSize: '12px', color: '#999' }}>Nhận thông báo đẩy</div>
                            </div>
                            <input
                                type='checkbox'
                                checked={settings.pushNotifications}
                                onChange={() => handleToggle('pushNotifications')}
                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>Cảnh báo giá</div>
                                <div style={{ fontSize: '12px', color: '#999' }}>Nhận cảnh báo khi giá thay đổi</div>
                            </div>
                            <input
                                type='checkbox'
                                checked={settings.priceAlerts}
                                onChange={() => handleToggle('priceAlerts')}
                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                            />
                        </div>

                        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>Xác thực hai yếu tố</div>
                                <div style={{ fontSize: '12px', color: '#999' }}>Bảo mật nâng cao</div>
                            </div>
                            <input
                                type='checkbox'
                                checked={settings.twoFactorAuth}
                                onChange={() => handleToggle('twoFactorAuth')}
                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>Chế độ tối</div>
                                <div style={{ fontSize: '12px', color: '#999' }}>Nhẹ hơn cho mắt</div>
                            </div>
                            <input
                                type='checkbox'
                                checked={settings.darkMode}
                                onChange={() => handleToggle('darkMode')}
                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                            />
                        </div>

                        <button
                            onClick={handleSave}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold',
                            }}
                        >
                            Lưu cài đặt
                        </button>
                    </div>
                </Box>
            </div>
        </SiteLayout>
    );
};

export default SettingsScreen;
