import { useState, useEffect } from 'react';
import SiteLayout from '../../layouts/SiteLayout';
import Header from '../../components/Header/Header';
import { useNavigate } from 'react-router-dom';
import Box from '../../components/Common/Box';
import { CRYPTO_ASSETS } from '../../config/assets';
import { orderService, marketService } from '../../api/services/appService';
import { useAuth } from '../../hooks/useAuth';

interface BuyOrder {
    symbol: string;
    amount: number;
    price: number;
    total: number;
}

const BuyCryptoScreen: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [selectedAsset, setSelectedAsset] = useState('BTC');
    const [amount, setAmount] = useState('');
    const [buyOrder, setBuyOrder] = useState<BuyOrder | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [prices, setPrices] = useState<Record<string, number>>({
        BTC: 42000,
        ETH: 2300,
        USDT: 1,
        XRP: 0.52,
        DOGE: 0.08,
        ADA: 0.98,
        SOL: 140,
        BNB: 590,
        LTC: 680,
    });

    // Lấy giá tiền từ API mỗi 5 giây (real-time)
    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const response = await marketService.getOrderbook();
                if (response.status === 'success' && response.data?.bids && response.data.bids.length > 0) {
                    const btcPrice = parseFloat(response.data.bids[0].price) || 42000;
                    setPrices(prev => ({ ...prev, BTC: btcPrice }));
                }
            } catch (err) {
                console.error('Lỗi fetch prices:', err);
            }
        };

        fetchPrices();
        const interval = setInterval(fetchPrices, 5000); // Cập nhật mỗi 5 giây
        return () => clearInterval(interval);
    }, []);

    const currentPrice = prices[selectedAsset] || 0;
    const total = (parseFloat(amount) || 0) * currentPrice;

    const handleBuy = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            setError('Vui lòng nhập số lượng hợp lệ');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                setError('Vui lòng đăng nhập');
                return;
            }

            // Gọi API thực tế để đặt lệnh
            const response = await orderService.placeOrder(token, {
                symbol: `${selectedAsset}_USDT`,
                side: 'BUY',
                order_type: 'MARKET',
                quantity: parseFloat(amount),
                price: currentPrice,
            });

            if (response.status === 'success') {
                setBuyOrder({
                    symbol: selectedAsset,
                    amount: parseFloat(amount),
                    price: currentPrice,
                    total: total,
                });
            } else {
                setError('Đặt lệnh thất bại. Vui lòng thử lại.');
            }
        } catch (err: any) {
            setError(err.message || 'Đặt lệnh thất bại');
        } finally {
            setLoading(false);
        }
    };

    if (buyOrder) {
        return (
            <SiteLayout>
                <Header icon='shopping_cart' title='Mua tiền mã hóa' />
                <div style={{ padding: '20px' }}>
                    <Box>
                        <div style={{ padding: '40px', textAlign: 'center' }}>
                            <i className='material-icons' style={{ fontSize: '64px', color: '#4caf50', marginBottom: '20px', display: 'block' }}>
                                check_circle
                            </i>
                            <h2>Lệnh đặt thành công!</h2>
                            <p style={{ marginTop: '20px', fontSize: '16px' }}>
                                {buyOrder.amount} {buyOrder.symbol} @ ${buyOrder.price.toLocaleString('vi-VN')}
                            </p>
                            <p style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '10px' }}>
                                Tổng cộng: ${buyOrder.total.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}
                            </p>
                            <p style={{ marginTop: '30px', color: '#999', fontSize: '14px' }}>
                                Lệnh của bạn đang được xử lý. Kiểm tra ví của bạn trong vài phút.
                            </p>
                            <button
                                style={{
                                    marginTop: '30px',
                                    padding: '10px 20px',
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                }}
                                onClick={() => setBuyOrder(null)}
                            >
                                Mua thêm
                            </button>
                            <button
                                onClick={() => navigate('/market')}
                                style={{
                                    marginLeft: '10px',
                                    padding: '10px 20px',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                }}
                            >
                                Quay lại thị trường
                            </button>
                        </div>
                    </Box>
                </div>
            </SiteLayout>
        );
    }

    return (
        <SiteLayout>
            <Header icon='shopping_cart' title='Mua tiền mã hóa' />
            <div style={{ padding: '20px' }}>
                <Box>
                    <div style={{ padding: '20px' }}>
                        {error && (
                            <div style={{ padding: '12px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '20px' }}>
                                {error}
                            </div>
                        )}

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleBuy();
                            }}
                        >
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                    Chọn tiền mã hóa
                                </label>
                                <select
                                    value={selectedAsset}
                                    onChange={(e) => setSelectedAsset(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '4px',
                                        border: '1px solid #ddd',
                                        fontSize: '16px',
                                        boxSizing: 'border-box',
                                    }}
                                >
                                    {Object.keys(CRYPTO_ASSETS).map(symbol => (
                                        <option key={symbol} value={symbol}>
                                            {CRYPTO_ASSETS[symbol].name} ({symbol})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                    Số lượng ({selectedAsset})
                                </label>
                                <input
                                    type='number'
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder='Nhập số lượng'
                                    step='0.00000001'
                                    min='0'
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '4px',
                                        border: '1px solid #ddd',
                                        fontSize: '16px',
                                        boxSizing: 'border-box',
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span>Giá hiện tại:</span>
                                    <strong>${currentPrice.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>
                                    <span>Tổng cộng:</span>
                                    <span>${total.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    type='submit'
                                    disabled={loading}
                                    style={{
                                        flex: 1,
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
                                    {loading ? 'Đang xử lý...' : 'Đặt lệnh mua'}
                                </button>
                                <button
                                    type='button'
                                    onClick={() => navigate('/market')}
                                    style={{
                                        padding: '12px 20px',
                                        backgroundColor: '#6c757d',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                    }}
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </Box>
            </div>
        </SiteLayout>
    );
};

export default BuyCryptoScreen;
