import { useState, useEffect } from 'react';
import { useWallet } from '../../../hooks/useWallet';
import { useAuth } from '../../../hooks/useAuth';
import Box from '../../../components/Common/Box';

interface RiskAssessment {
  risk_score: number;
  risk_level: string;
  insights: string[];
  trade_count_7d: number;
}

// Exchange rate (VNĐ per USD) - in production, this should come from API
const VND_RATE = 24000;

// Placeholder market prices (in production, fetch from API)
const MARKET_PRICES: Record<string, number> = {
  BTC: 45000,
  ETH: 2500,
  USDT: 1,
};

const WalletHeader: React.FC = () => {
  const { token } = useAuth();
  const { wallets, isLoading } = useWallet();
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [riskLoading, setRiskLoading] = useState(false);

  // Fetch risk assessment
  useEffect(() => {
    if (!token) return;
    
    setRiskLoading(true);
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
        console.log('Failed to fetch risk assessment');
      })
      .finally(() => {
        setRiskLoading(false);
      });
  }, [token]);

  // Calculate total balance in USDT
  const totalUSDT = wallets.reduce((acc, wallet) => {
    const price = MARKET_PRICES[wallet.asset] || 1;
    return acc + Number(wallet.balance) * price;
  }, 0);

  const totalVND = totalUSDT * VND_RATE;

  const getRiskColor = (score: number): string => {
    if (score >= 80) return '#27ae60'; // Green
    if (score >= 50) return '#f39c12'; // Yellow
    return '#e74c3c'; // Red
  };

  const getRiskLabel = (score: number): string => {
    if (score >= 80) return 'Safe';
    if (score >= 50) return 'Warning';
    return 'Risky';
  };

  return (
    <div className='wallet-header-section'>
      <div className='wallet-stats-grid'>
        {/* Total Balance Card */}
        <Box>
          <div className='box-title box-vertical-padding box-horizontal-padding'>
            <p>Total Balance</p>
          </div>
          <div className='box-content box-horizontal-padding'>
            {isLoading ? (
              <p className='loading-text'>Loading...</p>
            ) : (
              <div className='balance-display'>
                <div className='balance-main'>
                  {totalUSDT.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  USDT
                </div>
                <div className='balance-vnd'>
                  {(totalVND / 1000000).toLocaleString('en-US', {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}{' '}
                  M VND
                </div>
              </div>
            )}
          </div>
        </Box>

        {/* AI Risk Score Card */}
        <Box>
          <div className='box-title box-vertical-padding box-horizontal-padding'>
            <p>AI Risk Score</p>
          </div>
          <div className='box-content box-horizontal-padding'>
            {riskLoading ? (
              <p className='loading-text'>Assessing...</p>
            ) : riskAssessment ? (
              <div className='risk-score-display'>
                <div className='risk-bar-container'>
                  <div
                    className='risk-bar'
                    style={{
                      width: `${riskAssessment.risk_score}%`,
                      backgroundColor: getRiskColor(riskAssessment.risk_score),
                    }}
                  ></div>
                </div>
                <div className='risk-label'>
                  {getRiskLabel(riskAssessment.risk_score)} - {riskAssessment.risk_score}/100
                </div>
              </div>
            ) : (
              <p className='loading-text'>No data</p>
            )}
          </div>
        </Box>
      </div>

      {/* Action Buttons */}
      <div className='wallet-actions'>
        <button type='button' className='button button-primary button-action'>
          <i className='material-icons button-icon-left'>add_circle</i>
          Deposit
        </button>
        <button type='button' className='button button-secondary button-action'>
          <i className='material-icons button-icon-left'>remove_circle</i>
          Withdraw
        </button>
        <button type='button' className='button button-purple button-action'>
          <i className='material-icons button-icon-left'>send</i>
          Transfer
        </button>
      </div>
    </div>
  );
};

export default WalletHeader;
