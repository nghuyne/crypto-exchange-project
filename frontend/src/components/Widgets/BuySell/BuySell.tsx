import { useState, useContext } from 'react';

// components
import Box from '../../Common/Box';
import { AuthContext } from '../../../context/AuthContext';
import { useWallet } from '../../../hooks/useWallet';

// ============================================================
// BuySell — Widget dat lenh mua/ban tich hop AI Risk Engine
//
// Flow:
//   1. User nhap gia + so luong, nhan "Place order"
//   2. Goi POST /api/v1/orders voi JWT token tu AuthContext
//   3. Backend chay AI Risk Engine truoc khi tao lenh
//   4. Neu OK (200): hien thi risk_score + xac nhan
//   5. Neu bi block (403): hien thi risk_score + danh sach rules vi pham
//   6. Neu loi khac: hien thi thong bao loi
//
// Symbol mac dinh: btc_usdt
// Co the bien thanh prop sau khi tich hop voi MarketScreen multi-pair.
// ============================================================

// Kieu du lieu tra ve tu backend khi dat lenh thanh cong hoac bi block
interface OrderFeedback {
  type: 'success' | 'error' | 'blocked';
  message: string;
  riskScore?: number;
  riskLevel?: string;
  triggeredRules?: string[];
}

const DEFAULT_SYMBOL = 'btc_usdt';

const BuySell: React.FC = () => {
  // Lay token tu AuthContext — khong can prop drilling
  // Tai sao useContext thay vi prop? Vi BuySell nam sau nhieu lop component,
  // truyen token qua prop se tao prop-drilling khong can thiet.
  const authCtx = useContext(AuthContext);

  // primaryTab: 0 = BUY, 1 = SELL
  const [primaryTab, setPrimaryTab] = useState<number>(0);
  // secondaryTab: 0 = Market, 1 = Limit
  const [secondaryTab, setSecondaryTab] = useState<number>(0);

  // Controlled inputs — quan trong de lay gia tri chinh xac khi submit
  // Tai sao string thay vi number? Tranh NaN khi input chua hoan chinh (vd: "0.")
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<OrderFeedback | null>(null);
  const { wallets, refetch: refetchWallet } = useWallet();

  const usdtWallet = wallets.find((wallet) => wallet.asset.toUpperCase() === 'USDT');
  const btcWallet = wallets.find((wallet) => wallet.asset.toUpperCase() === 'BTC');

  const handlePrimaryTab = (tabNum: number): void => {
    setPrimaryTab(tabNum);
    setSecondaryTab(0);
    setFeedback(null); // Xoa feedback cu khi doi BUY <-> SELL
  };

  const handleSecondaryTab = (tabNum: number): void => {
    setSecondaryTab(tabNum);
    setFeedback(null); // Xoa feedback cu khi doi Market <-> Limit
  };

  // placeOrder — goi POST /api/v1/orders
  const placeOrder = async () => {
    // Guard: dam bao da dang nhap truoc khi dat lenh
    const token = authCtx?.token;
    if (!token) {
      setFeedback({ type: 'error', message: 'Ban chua dang nhap' });
      return;
    }

    // Validate inputs truoc khi goi API (tranh round-trip thua)
    const parsedQty = parseFloat(quantity);
    const parsedPrice = parseFloat(price);

    if (isNaN(parsedQty) || parsedQty <= 0) {
      setFeedback({ type: 'error', message: 'So luong khong hop le — phai lon hon 0' });
      return;
    }
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setFeedback({ type: 'error', message: 'Gia dat lenh khong hop le — phai lon hon 0' });
      return;
    }

    const side = primaryTab === 0 ? 'buy' : 'sell';
    // secondaryTab 0 = Market, 1 = Limit
    // Doi voi Market order: van can truyen price (backend binding:"required").
    // Trong san thuc, market order lay best bid/ask tu order book.
    // O day dung gia nguoi dung nhap — hoi dong co the hoi ve dieu nay.
    const type = secondaryTab === 0 ? 'market' : 'limit';

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          symbol: DEFAULT_SYMBOL,
          side,
          type,
          price: parsedPrice,
          quantity: parsedQty,
        }),
      });

      const data = await res.json();

      if (res.status === 403) {
        // AI Risk Engine chặn lệnh — hien thi day du thong tin de user hieu
        // Tai sao show triggered_rules? De minh bach — user biet vi sao bi block,
        // khong phai bi tu choi vo ly. Day cung la yeu cau compliance trong fintech.
        setFeedback({
          type: 'blocked',
          message: data.message || 'Lenh bi chan boi AI Risk Engine',
          riskScore: data.risk_score,
          riskLevel: data.risk_level,
          triggeredRules: Array.isArray(data.triggered_rules) ? data.triggered_rules : [],
        });
      } else if (res.ok) {
        // Dat lenh thanh cong — hien thi risk_score de user thay AI da chay
        setFeedback({
          type: 'success',
          message: `Dat lenh thanh cong`,
          riskScore: data.risk_score,
          riskLevel: data.risk_level,
        });
        // Reset form sau khi dat thanh cong
        setPrice('');
        setQuantity('');
        await refetchWallet();
      } else {
        // Loi server khac (400 bad request, 500, ...)
        setFeedback({ type: 'error', message: data.message || 'Dat lenh that bai' });
      }
    } catch {
      // Network error — server chua chay hoac mat ket noi
      setFeedback({ type: 'error', message: 'Loi ket noi — kiem tra server dang chay khong?' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBuy = primaryTab === 0;
  const btnClass = `button ${isBuy ? 'button-green' : 'button-red'} button-medium button-block`;
  const btnLabel = isSubmitting ? 'Đang xử lý...' : `Đặt lệnh ${isBuy ? 'mua' : 'bán'}`;

  return (
    <Box>
      <div className='box-title box-vertical-padding box-horizontal-padding no-select'>
        <div className='flex flex-center flex-space-between'>
          <p>Mua-bán</p>
          <span style={{ fontSize: '11px', opacity: 0.5, textTransform: 'uppercase', letterSpacing: 1 }}>
            {DEFAULT_SYMBOL.replace('_', '/')}
          </span>
        </div>
      </div>

      <div className='box-horizontal-padding box-content-height-nobutton'>

        <div
          style={{
            margin: '10px 0 12px',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '6px',
            padding: '8px 10px',
            fontSize: '11px',
            opacity: 0.88,
          }}
        >
          <div className='flex flex-center flex-space-between'>
            <strong>USDT</strong>
            <span>
              Có sẵn: {(usdtWallet?.balance ?? 0).toLocaleString('en-US', { maximumFractionDigits: 2 })} | Bị khóa:{' '}
              {(usdtWallet?.locked_balance ?? 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className='flex flex-center flex-space-between' style={{ marginTop: 4 }}>
            <strong>BTC</strong>
            <span>
              Có sẵn: {(btcWallet?.balance ?? 0).toLocaleString('en-US', { maximumFractionDigits: 8 })} | Bị khóa:{' '}
              {(btcWallet?.locked_balance ?? 0).toLocaleString('en-US', { maximumFractionDigits: 8 })}
            </span>
          </div>
        </div>

        {/* Primary tabs: BUY / SELL */}
        <div className='tabs no-select'>
          <button
            type='button'
            onClick={() => handlePrimaryTab(0)}
            className={primaryTab === 0 ? 'active' : 'passive'}
          >
            MUA
          </button>
          <button
            type='button'
            onClick={() => handlePrimaryTab(1)}
            className={primaryTab === 1 ? 'active' : 'passive'}
          >
            BÁN
          </button>
        </div>

        {/* Secondary tabs: Market / Limit */}
        <div className='secondary-tabs flex flex-center flex-space-between no-select'>
          <button
            type='button'
            onClick={() => handleSecondaryTab(0)}
            className={secondaryTab === 0 ? 'active' : 'passive'}
          >
            Thị trường
          </button>
          <button
            type='button'
            onClick={() => handleSecondaryTab(1)}
            className={secondaryTab === 1 ? 'active' : 'passive'}
          >
            Giới hạn
          </button>
        </div>

        {/* Input: Price */}
        <div className='buy-sell-line flex flex-center flex-space-between no-select'>
          <div>
            <strong>{secondaryTab === 0 ? 'Giá' : 'Giá giới hạn'}</strong>
            <i
              className='material-icons'
              title={
                secondaryTab === 0
                  ? 'Gia dat lenh thi truong'
                  : 'Gia toi da ban san san muon mua (BUY) hoac toi thieu ban san muon ban (SELL)'
              }
            >
              info
            </i>
          </div>
          <div className='right'>
            <input
              type='number'
              placeholder='0'
              value={price}
              min='0'
              step='1'
              onChange={(e) => setPrice(e.target.value)}
              disabled={isSubmitting}
            />
            <strong>USDT</strong>
          </div>
        </div>

        {/* Input: Quantity */}
        <div className='buy-sell-line flex flex-center flex-space-between no-select'>
          <div>
            <strong>Số lượng</strong>
            <i className='material-icons' title='So luong BTC muon mua hoac ban'>
              info
            </i>
          </div>
          <div className='right'>
            <input
              type='number'
              placeholder='0'
              value={quantity}
              min='0'
              step='0.0001'
              onChange={(e) => setQuantity(e.target.value)}
              disabled={isSubmitting}
            />
            <strong>BTC</strong>
          </div>
        </div>

        {/* Total preview */}
        {price && quantity && !isNaN(parseFloat(price)) && !isNaN(parseFloat(quantity)) && (
          <div
            className='flex flex-center flex-space-between no-select'
            style={{ fontSize: '12px', opacity: 0.65, margin: '6px 0' }}
          >
            <span>Tổng cộng</span>
            <span>
              {(parseFloat(price) * parseFloat(quantity)).toLocaleString('en-US', {
                maximumFractionDigits: 2,
              })}{' '}
              USDT
            </span>
          </div>
        )}

        {/* Submit button */}
        <div className='box-button box-vertical-padding'>
          <button
            type='button'
            className={btnClass}
            onClick={placeOrder}
            disabled={isSubmitting}
            style={{ opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
          >
            {btnLabel}
          </button>
        </div>

        {/* ============================================================
            Feedback Panel — hien thi ket qua dat lenh
            3 trang thai:
              success: lenh duoc chap nhan, show risk_score
              error:   loi he thong hoac du lieu
              blocked: AI Risk Engine chặn, show risk_score + triggered_rules
            ============================================================ */}
        {feedback && (
          <div
            style={{
              marginTop: '8px',
              padding: '10px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              lineHeight: '1.6',
              background:
                feedback.type === 'success'
                  ? 'rgba(40, 167, 69, 0.12)'
                  : 'rgba(220, 53, 69, 0.12)',
              border: `1px solid ${feedback.type === 'success' ? '#28a745' : '#dc3545'}`,
              color: feedback.type === 'success' ? '#28a745' : '#e05260',
            }}
          >
            {/* Header dong */}
            {feedback.type === 'success' && (
              <div style={{ fontWeight: 700, marginBottom: 4 }}>
                ✅ {feedback.message}
              </div>
            )}
            {feedback.type === 'error' && (
              <div style={{ fontWeight: 700 }}>❌ {feedback.message}</div>
            )}
            {feedback.type === 'blocked' && (
              <div style={{ fontWeight: 700, marginBottom: 6 }}>
                AI Risk Engine đã chặn đơn hàng của bạn
              </div>
            )}

            {/* Risk score — show khi co (ca success lan blocked) */}
            {feedback.riskScore !== undefined && (
              <div style={{ marginTop: 2 }}>
                Risk Score:{' '}
                <strong>{feedback.riskScore}</strong>
                {' — '}
                Level:{' '}
                <strong
                  style={{
                    color:
                      feedback.riskLevel === 'HIGH'
                        ? '#dc3545'
                        : feedback.riskLevel === 'MEDIUM'
                          ? '#fd7e14'
                          : '#28a745',
                  }}
                >
                  {feedback.riskLevel}
                </strong>
              </div>
            )}

            {/* Triggered rules — chi hien thi khi bi block */}
            {feedback.type === 'blocked' &&
              feedback.triggeredRules &&
              feedback.triggeredRules.length > 0 && (
                <ul
                  style={{
                    margin: '8px 0 0 0',
                    paddingLeft: '16px',
                    opacity: 0.9,
                  }}
                >
                  {feedback.triggeredRules.map((rule, idx) => (
                    <li key={idx} style={{ marginBottom: 2 }}>
                      {rule}
                    </li>
                  ))}
                </ul>
              )}
          </div>
        )}

      </div>
    </Box>
  );
};

export default BuySell;
