import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Box from '../../../components/Common/Box';

interface Trade {
  id: number;
  symbol: string;
  price: number;
  quantity: number;
  created_at: string;
  user_side: string;
  counterparty: string;
  buy_order_id: number;
  sell_order_id: number;
}

interface RiskAssessment {
  risk_score: number;
  risk_level: string;
  insights: string[];
  trade_count_7d: number;
}

const WalletFooter: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'history' | 'insights'>('history');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch user's trades
  useEffect(() => {
    if (!token) return;

    setLoading(true);
    fetch('/api/v1/wallet/user-trades', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.ok ? res.json() : null)
      .then((result) => {
        if (result?.data && Array.isArray(result.data)) {
          setTrades(result.data);
        }
      })
      .catch(() => {
        console.log('Lỗi lấy lịch sử giao dịch');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  // Fetch risk assessment
  useEffect(() => {
    if (!token) return;

    fetch('/api/v1/wallet/risk-assessment', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.ok ? res.json() : null)
      .then((result) => {
        if (result?.data) {
          setRiskAssessment(result.data);
        }
      })
      .catch(() => {
        console.log('Lỗi lấy đánh giá rủi ro');
      });
  }, [token]);

  const handleTxIDClick = (tradeId: number) => {
    // Navigate to blockchain explorer with trade ID (or convert to tx hash)
    // For now, navigate with trade ID as anchor
    navigate(`/blockchain-explorer?txid=${tradeId}`);
  };

  return (
    <Box>
      <div className='box-title box-vertical-padding box-horizontal-padding no-select'>
        <div className='tab-navigation'>
          <button
            type='button'
            className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <i className='material-icons'>history</i>
            Lịch sử giao dịch
          </button>
          <button
            type='button'
            className={`tab-button ${activeTab === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveTab('insights')}
          >
            <i className='material-icons'>lightbulb</i>
            AI Insights
          </button>
        </div>
      </div>

      <div className='box-content'>
        {/* Transaction History Tab */}
        {activeTab === 'history' && (
          <div className='tab-content'>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p>Đang tải lịch sử giao dịch...</p>
              </div>
            ) : trades.length > 0 ? (
              <table className='transaction-table'>
                <thead>
                  <tr>
                    <th className='left'>Pair</th>
                    <th className='center'>Type</th>
                    <th className='center'>Price</th>
                    <th className='center'>Quantity</th>
                    <th className='center'>Date/Time</th>
                    <th className='center'>TxID</th>
                    <th className='center'>Counterparty</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.slice(0, 10).map((trade) => (
                    <tr key={trade.id} className='transaction-row'>
                      <td className='left'>
                        <strong>{trade.symbol.toUpperCase()}</strong>
                      </td>
                      <td className='center'>
                        <span className={`badge badge-${trade.user_side.toLowerCase()}`}>
                          {trade.user_side === 'BUY' ? 'Mua' : 'Bán'}
                        </span>
                      </td>
                      <td className='center'>
                        {Number(trade.price).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 8,
                        })}
                      </td>
                      <td className='center'>
                        {Number(trade.quantity).toLocaleString('en-US', {
                          minimumFractionDigits: 4,
                          maximumFractionDigits: 8,
                        })}
                      </td>
                      <td className='center'>
                        {new Date(trade.created_at).toLocaleString('vi-VN')}
                      </td>
                      <td className='center'>
                        <button
                          type='button'
                          className='tx-link'
                          onClick={() => handleTxIDClick(trade.id)}
                          title={`Trade ID: ${trade.id}`}
                        >
                          <strong>#{trade.id}</strong>
                          <i className='material-icons'>open_in_new</i>
                        </button>
                      </td>
                      <td className='center'>
                        <span className='counterparty'>{trade.counterparty}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p>Chưa có giao dịch nào</p>
              </div>
            )}
          </div>
        )}

        {/* AI Insights Tab */}
        {activeTab === 'insights' && (
          <div className='tab-content insights-content'>
            {riskAssessment ? (
              <div className='insights-list'>
                {riskAssessment.insights.length > 0 ? (
                  riskAssessment.insights.map((insight, index) => (
                    <div key={index} className='insight-card'>
                      <div className='insight-icon'>
                        <i className='material-icons'>
                          {insight.includes('login') ? 'security' : 'trending_up'}
                        </i>
                      </div>
                      <div className='insight-text'>{insight}</div>
                      <div className='insight-action'>
                        <i className='material-icons'>arrow_forward</i>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <p>Không có gợi ý nào</p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p>Đang tải AI gợi ý...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Box>
  );
};

export default WalletFooter;
