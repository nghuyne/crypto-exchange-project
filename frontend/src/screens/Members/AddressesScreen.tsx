import { useState } from 'react';
import SiteLayout from '../../layouts/SiteLayout';
import Header from '../../components/Header/Header';
import Box from '../../components/Common/Box';

interface SavedAddress {
    id: number;
    label: string;
    address: string;
    blockchain: string;
}

const AddressesScreen: React.FC = () => {
    const [addresses, setAddresses] = useState<SavedAddress[]>([
        { id: 1, label: 'My BTC Wallet', address: '1A1z7agoat5NYX...', blockchain: 'Bitcoin' },
        { id: 2, label: 'My ETH Wallet', address: '0x742d35Cc6634C0532925a3b844Bc9e7595f...', blockchain: 'Ethereum' },
        { id: 3, label: 'Cold Storage', address: '3J98t1WpEZ73CNm...', blockchain: 'Bitcoin' },
    ]);
    const [showForm, setShowForm] = useState(false);
    const [newLabel, setNewLabel] = useState('');
    const [newAddress, setNewAddress] = useState('');
    const [newBlockchain, setNewBlockchain] = useState('Bitcoin');

    const handleAdd = () => {
        if (!newLabel.trim() || !newAddress.trim()) {
            alert('Vui lòng điền vào tất cả các trường');
            return;
        }
        setAddresses([...addresses, { id: Date.now(), label: newLabel, address: newAddress, blockchain: newBlockchain }]);
        setNewLabel('');
        setNewAddress('');
        setShowForm(false);
    };

    const handleDelete = (id: number) => {
        setAddresses(addresses.filter(addr => addr.id !== id));
    };

    return (
        <SiteLayout>
            <Header icon='home' title='Các địa chỉ được lưu' />
            <div style={{ padding: '20px' }}>
                <Box>
                    <div style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3>Địa chỉ tiền mã hóa của bạn</h3>
                            <button
                                onClick={() => setShowForm(!showForm)}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                }}
                            >
                                {showForm ? 'Hủy' : 'Thêm địa chỉ'}
                            </button>
                        </div>

                        {showForm && (
                            <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Nhãn</label>
                                    <input
                                        type='text'
                                        value={newLabel}
                                        onChange={(e) => setNewLabel(e.target.value)}
                                        placeholder='vd., Ví của tôi'
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Blockchain</label>
                                    <select
                                        value={newBlockchain}
                                        onChange={(e) => setNewBlockchain(e.target.value)}
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                                    >
                                        <option>Bitcoin</option>
                                        <option>Ethereum</option>
                                        <option>Litecoin</option>
                                    </select>
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Địa chỉ</label>
                                    <input
                                        type='text'
                                        value={newAddress}
                                        onChange={(e) => setNewAddress(e.target.value)}
                                        placeholder='Địa chỉ ví'
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <button
                                    onClick={handleAdd}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#4caf50',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Thêm địa chỉ
                                </button>
                            </div>
                        )}

                        {addresses.map(addr => (
                            <div key={addr.id} style={{ padding: '12px', marginBottom: '8px', borderLeft: '4px solid #007bff', backgroundColor: '#f9f9f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{addr.label}</div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>{addr.blockchain}</div>
                                    <div style={{ fontSize: '11px', color: '#999', fontFamily: 'monospace' }}>{addr.address}</div>
                                </div>
                                <button
                                    onClick={() => handleDelete(addr.id)}
                                    style={{
                                        padding: '6px 12px',
                                        backgroundColor: '#dc3545',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                    }}
                                >
                                    Xóa
                                </button>
                            </div>
                        ))}
                    </div>
                </Box>
            </div>
        </SiteLayout>
    );
};

export default AddressesScreen;
