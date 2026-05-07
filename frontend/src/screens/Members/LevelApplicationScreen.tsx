import { useState } from 'react';
import SiteLayout from '../../layouts/SiteLayout';
import Header from '../../components/Header/Header';
import Box from '../../components/Common/Box';

const LevelApplicationScreen: React.FC = () => {
    const [formData, setFormData] = useState({ fullName: '', idNumber: '', country: '' });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.fullName || !formData.idNumber || !formData.country) {
            alert('Please fill in all fields');
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setSubmitted(true);
            setLoading(false);
        }, 1500);
    };

    if (submitted) {
        return (
            <SiteLayout>
                <Header icon='verified_user' title='Nâng cấp cấp độ' />
                <div style={{ padding: '20px' }}>
                    <Box>
                        <div style={{ padding: '40px', textAlign: 'center' }}>
                            <i className='material-icons' style={{ fontSize: '64px', color: '#4caf50', marginBottom: '20px', display: 'block' }}>check_circle</i>
                            <h2>Đơn xin đã được gửi!</h2>
                            <p style={{ marginTop: '20px', color: '#666' }}>Đơn xin Cấp độ 2 của bạn đã được gửi thành công. Chúng tôi sẽ xem xét và thông báo cho bạn trong vòng 24-48 giờ.</p>
                            <button
                                onClick={() => setSubmitted(false)}
                                style={{
                                    marginTop: '20px',
                                    padding: '10px 20px',
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                }}
                            >
                                Quay lại
                            </button>
                        </div>
                    </Box>
                </div>
            </SiteLayout>
        );
    }

    return (
        <SiteLayout>
            <Header icon='verified_user' title='Nâng cấp Cấp độ 2' />
            <div style={{ padding: '20px' }}>
                <Box>
                    <div style={{ padding: '20px' }}>
                        <h3 style={{ marginBottom: '10px' }}>Nâng cấp lên Cấp độ 2</h3>
                        <p style={{ color: '#666', marginBottom: '20px' }}>Xác minh danh tính của bạn để truy cập giới hạn giao dịch cao hơn và các tính năng độc quyền.</p>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Họ và tên đầy đủ</label>
                                <input
                                    type='text'
                                    name='fullName'
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Số ID</label>
                                <input
                                    type='text'
                                    name='idNumber'
                                    value={formData.idNumber}
                                    onChange={handleChange}
                                    placeholder='Số hộ chiếu hoặc ID'
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Quốc gia</label>
                                <select
                                    name='country'
                                    value={formData.country}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                                >
                                    <option value=''>Chọn quốc gia của bạn</option>
                                    <option>United States</option>
                                    <option>United Kingdom</option>
                                    <option>Canada</option>
                                    <option>Australia</option>
                                    <option>Germany</option>
                                    <option>France</option>
                                    <option>Singapore</option>
                                    <option>Vietnam</option>
                                </select>
                            </div>
                            <button
                                type='submit'
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: loading ? '#ccc' : '#4caf50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                }}
                            >
                                {loading ? 'Đang gửi...' : 'Gửi đơn xin'}
                            </button>
                        </form>
                    </div>
                </Box>
            </div>
        </SiteLayout>
    );
};

export default LevelApplicationScreen;
