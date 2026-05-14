import { useCallback, useEffect, useMemo, useState } from 'react';

import SiteLayout from '../../layouts/SiteLayout';
import Header from '../../components/Header/Header';
import Box from '../../components/Common/Box';
import './DataScreen.css';

interface PairSummary {
  symbol: string;
  base_asset: string;
  quote_asset: string;
  last_price: number;
  open_price_24h: number;
  high_24h: number;
  low_24h: number;
  change_24h: number;
  volume_24h: number;
  trade_count_24h: number;
  direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  intensity: number;
  updated_at: string;
}

interface OverviewData {
  generated_at: string;
  window_hours: number;
  total_pairs: number;
  total_orders: number;
  open_orders: number;
  total_trades: number;
  active_users: number;
  total_volume: number;
  bullish_pairs: number;
  bearish_pairs: number;
  neutral_pairs: number;
  fear_greed_index: number;
  average_risk_score: number;
  high_risk_records: number;
  audit_records: number;
  audit_blocks: number;
  latest_audit_block: number;
  top_gainers: PairSummary[];
  top_losers: PairSummary[];
}

interface SentimentData {
  fear_greed_index: number;
  market_mood: 'GREED' | 'NEUTRAL' | 'FEAR';
  bullish_percent: number;
  bearish_percent: number;
  neutral_percent: number;
  average_risk_score: number;
  high_risk_records: number;
  audit_records: number;
  audit_blocks: number;
}

interface AuditTransaction {
  OrderID?: string;
  UserID?: string;
  Symbol?: string;
  Amount?: number;
  RiskScore?: number;
  Action?: string;
}

interface AuditBlock {
  Index: number;
  Hash: string;
  PrevHash: string;
  Timestamp: string;
  Transactions: AuditTransaction[];
}

const API = {
  overview: '/api/v1/data/overview',
  coins: '/api/v1/data/coins',
  heatmap: '/api/v1/data/heatmap',
  sentiment: '/api/v1/data/sentiment',
  blocks: '/api/v1/blockchain/blocks',
};

const numberFormat = new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: 2,
});

const currencyFormat = new Intl.NumberFormat('vi-VN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 8,
});

function shortenHash(value: string): string {
  if (!value || value.length <= 14) return value;
  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

function formatChange(change: number): string {
  const sign = change > 0 ? '+' : '';
  return `${sign}${numberFormat.format(change)}%`;
}

function formatCompact(value: number): string {
  if (value >= 1_000_000_000) {
    return `${numberFormat.format(value / 1_000_000_000)}B`;
  }
  if (value >= 1_000_000) {
    return `${numberFormat.format(value / 1_000_000)}M`;
  }
  if (value >= 1_000) {
    return `${numberFormat.format(value / 1_000)}K`;
  }
  return numberFormat.format(value);
}

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  });
}

export default function DataScreen() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [coins, setCoins] = useState<PairSummary[]>([]);
  const [heatmap, setHeatmap] = useState<PairSummary[]>([]);
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [blocks, setBlocks] = useState<AuditBlock[]>([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewRes, coinsRes, heatmapRes, sentimentRes, blocksRes] = await Promise.all([
        fetch(API.overview),
        fetch(API.coins),
        fetch(API.heatmap),
        fetch(API.sentiment),
        fetch(API.blocks),
      ]);

      if (!overviewRes.ok || !coinsRes.ok || !heatmapRes.ok || !sentimentRes.ok || !blocksRes.ok) {
        throw new Error('Không thể tải dữ liệu dashboard');
      }

      const overviewJson = await overviewRes.json();
      const coinsJson = await coinsRes.json();
      const heatmapJson = await heatmapRes.json();
      const sentimentJson = await sentimentRes.json();
      const blocksJson = await blocksRes.json();

      setOverview(overviewJson.data as OverviewData);
      setCoins((coinsJson.data?.items ?? []) as PairSummary[]);
      setHeatmap((heatmapJson.data?.items ?? []) as PairSummary[]);
      setSentiment(sentimentJson.data as SentimentData);
      setBlocks(Array.isArray(blocksJson) ? blocksJson : []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải dữ liệu';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredCoins = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) return coins;

    return coins.filter((item) => {
      return (
        item.symbol.toLowerCase().includes(normalized) ||
        item.base_asset.toLowerCase().includes(normalized) ||
        item.quote_asset.toLowerCase().includes(normalized)
      );
    });
  }, [coins, keyword]);

  const latestBlocks = useMemo(() => {
    return [...blocks].sort((a, b) => b.Index - a.Index).slice(0, 4);
  }, [blocks]);

  const safeOverview = useMemo<OverviewData>(
    () =>
      overview ?? {
        generated_at: '',
        window_hours: 24,
        total_pairs: 0,
        total_orders: 0,
        open_orders: 0,
        total_trades: 0,
        active_users: 0,
        total_volume: 0,
        bullish_pairs: 0,
        bearish_pairs: 0,
        neutral_pairs: 0,
        fear_greed_index: 0,
        average_risk_score: 0,
        high_risk_records: 0,
        audit_records: 0,
        audit_blocks: 0,
        latest_audit_block: 0,
        top_gainers: [],
        top_losers: [],
      },
    [overview]
  );

  const safeSentiment = useMemo<SentimentData>(
    () =>
      sentiment ?? {
        fear_greed_index: 0,
        market_mood: 'NEUTRAL',
        bullish_percent: 0,
        bearish_percent: 0,
        neutral_percent: 0,
        average_risk_score: 0,
        high_risk_records: 0,
        audit_records: 0,
        audit_blocks: 0,
      },
    [sentiment]
  );

  const downloadCsv = () => {
    const header = [
      'symbol',
      'last_price',
      'change_24h',
      'volume_24h',
      'trade_count_24h',
      'direction',
    ];

    const rows = filteredCoins.map((item) => [
      item.symbol,
      item.last_price,
      item.change_24h,
      item.volume_24h,
      item.trade_count_24h,
      item.direction,
    ]);

    const csv = [header.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data-overview.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <SiteLayout>
      <div className='content data-screen'>
        <Header icon='insights' title='Data Overview' />

        <div className='data-hero'>
          <div className='data-hero-copy'>
            <div className='data-kicker'>MARKET INTELLIGENCE & SYSTEM DATA</div>
            <h1>Toàn cảnh thị trường, dữ liệu khớp lệnh và tín hiệu AI.</h1>
            <p>
              Trang Data được thiết kế như một lớp quan sát tổng hợp. Nội dung hiển thị lấy trực
              tiếp từ API backend Go, gồm market summary, danh sách cặp giao dịch, heatmap, sentiment
              và audit chain.
            </p>
          </div>
          <div className='data-hero-actions'>
            <span className='data-badge'>API: /api/v1/data/overview</span>
            <span className='data-badge'>API: /api/v1/blockchain/blocks</span>
            <button type='button' className='button button-purple button-large' onClick={loadData}>
              <i className='material-icons button-icon-left'>refresh</i>
              Refresh
            </button>
          </div>
        </div>

        {error && <div className='data-alert error'>{error}</div>}
        {loading && <div className='data-alert'>Đang đồng bộ dữ liệu backend...</div>}

        <div className='data-stats-grid'>
          <div className='data-stat-card'>
            <div className='data-stat-label'>Trading Pairs</div>
            <div className='data-stat-value'>{numberFormat.format(safeOverview.total_pairs)}</div>
            <div className='data-stat-foot'>24h window</div>
          </div>
          <div className='data-stat-card'>
            <div className='data-stat-label'>24h Volume</div>
            <div className='data-stat-value'>{formatCompact(safeOverview.total_volume)}</div>
            <div className='data-stat-foot'>Notional trade volume</div>
          </div>
          <div className='data-stat-card'>
            <div className='data-stat-label'>Open Orders</div>
            <div className='data-stat-value'>{numberFormat.format(safeOverview.open_orders)}</div>
            <div className='data-stat-foot'>Pending / partial orders</div>
          </div>
          <div className='data-stat-card'>
            <div className='data-stat-label'>Fear & Greed</div>
            <div className='data-stat-value'>{numberFormat.format(safeSentiment.fear_greed_index)}</div>
            <div className='data-stat-foot'>{safeSentiment.market_mood} sentiment</div>
          </div>
        </div>

        <div className='data-layout'>
          <div className='data-main'>
            <Box>
              <div className='box-title box-vertical-padding box-horizontal-padding no-select'>
                <div className='data-panel-head'>
                  <div>
                    <div className='data-panel-kicker'>Market Data</div>
                    <div className='data-panel-title'>Cryptocurrency Details</div>
                    <div className='data-panel-subtitle'>Source: GET /api/v1/data/coins</div>
                  </div>
                  <div className='data-toolbar'>
                    <input
                      className='data-search'
                      type='text'
                      value={keyword}
                      placeholder='Search symbol...'
                      onChange={(e) => setKeyword(e.target.value)}
                    />
                    <button type='button' className='button button-white button-large' onClick={downloadCsv}>
                      <i className='material-icons button-icon-left'>download</i>
                      Export CSV
                    </button>
                  </div>
                </div>
              </div>
              <div className='box-content box-horizontal-padding data-box-content data-box-content-tall'>
                <div className='data-table-wrap'>
                  <table className='data-table'>
                    <thead>
                      <tr>
                        <th>Pair</th>
                        <th>Last Price</th>
                        <th>24h Change</th>
                        <th>24h Volume</th>
                        <th>Trades</th>
                        <th>Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCoins.map((item) => (
                        <tr key={item.symbol}>
                          <td>
                            <div className='data-pair'>
                              <strong>{item.symbol.toUpperCase()}</strong>
                              <span>{item.base_asset.toUpperCase()} / {item.quote_asset.toUpperCase()}</span>
                            </div>
                          </td>
                          <td>{currencyFormat.format(item.last_price)}</td>
                          <td>
                            <span className={item.change_24h >= 0 ? 'data-change up' : 'data-change down'}>
                              {formatChange(item.change_24h)}
                            </span>
                          </td>
                          <td>{formatCompact(item.volume_24h)}</td>
                          <td>{numberFormat.format(item.trade_count_24h)}</td>
                          <td>
                            <div className='data-trend-cell'>
                              <span className={`data-direction ${item.direction.toLowerCase()}`}>{item.direction}</span>
                              <div className='data-bar'>
                                <span
                                  style={{
                                    width: `${Math.max(item.intensity, 4)}%`,
                                    background:
                                      item.direction === 'BULLISH'
                                        ? 'linear-gradient(90deg, #10b981, #34d399)'
                                        : item.direction === 'BEARISH'
                                        ? 'linear-gradient(90deg, #ef4444, #f97316)'
                                        : 'linear-gradient(90deg, #94a3b8, #cbd5e1)',
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredCoins.length === 0 && (
                        <tr>
                          <td colSpan={6} className='data-empty'>
                            Không tìm thấy cặp giao dịch phù hợp.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </Box>

            <div className='data-inline-grid'>
              <Box>
                <div className='box-title box-vertical-padding box-horizontal-padding no-select'>
                  <div className='data-panel-kicker'>Top Movers</div>
                  <div className='data-panel-title'>Gainers / Losers</div>
                  <div className='data-panel-subtitle'>Source: GET /api/v1/data/overview</div>
                </div>
                <div className='box-content box-horizontal-padding data-box-content data-box-content-medium'>
                  <div className='data-list'>
                    {safeOverview.top_gainers.slice(0, 3).map((item) => (
                      <div key={`gain-${item.symbol}`} className='data-list-item positive'>
                        <div>
                          <strong>{item.symbol.toUpperCase()}</strong>
                          <div className='data-mini'>Top gainers</div>
                        </div>
                        <span className='data-change up'>{formatChange(item.change_24h)}</span>
                      </div>
                    ))}
                    {safeOverview.top_losers.slice(0, 3).map((item) => (
                      <div key={`loss-${item.symbol}`} className='data-list-item negative'>
                        <div>
                          <strong>{item.symbol.toUpperCase()}</strong>
                          <div className='data-mini'>Top losers</div>
                        </div>
                        <span className='data-change down'>{formatChange(item.change_24h)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Box>

              <Box>
                <div className='box-title box-vertical-padding box-horizontal-padding no-select'>
                  <div className='data-panel-kicker'>System View</div>
                  <div className='data-panel-title'>System Snapshot</div>
                  <div className='data-panel-subtitle'>Orders, trades, active users and audit blocks</div>
                </div>
                <div className='box-content box-horizontal-padding data-box-content data-box-content-medium'>
                  <div className='data-snapshot-grid'>
                    <div>
                      <span>Total orders</span>
                      <strong>{numberFormat.format(safeOverview.total_orders)}</strong>
                    </div>
                    <div>
                      <span>Total trades</span>
                      <strong>{numberFormat.format(safeOverview.total_trades)}</strong>
                    </div>
                    <div>
                      <span>Active users</span>
                      <strong>{numberFormat.format(safeOverview.active_users)}</strong>
                    </div>
                    <div>
                      <span>Audit records</span>
                      <strong>{numberFormat.format(safeOverview.audit_records)}</strong>
                    </div>
                  </div>
                </div>
              </Box>
            </div>
          </div>

          <div className='data-side'>
            <Box>
              <div className='box-title box-vertical-padding box-horizontal-padding no-select'>
                <div className='data-panel-kicker'>AI Signal</div>
                <div className='data-panel-title'>Market Sentiment</div>
                <div className='data-panel-subtitle'>Source: GET /api/v1/data/sentiment</div>
              </div>
              <div className='box-content box-horizontal-padding data-box-content data-box-content-medium'>
                <div className='data-sentiment-meter'>
                  <div
                    className='data-ring'
                    style={{
                      background: `conic-gradient(${safeSentiment.market_mood === 'GREED' ? '#10b981' : safeSentiment.market_mood === 'FEAR' ? '#ef4444' : '#f59e0b'} ${safeSentiment.fear_greed_index}%, #e2e8f0 0)`,
                    }}
                  >
                    <span>{numberFormat.format(safeSentiment.fear_greed_index)}</span>
                  </div>
                  <div className='data-sentiment-copy'>
                    <strong>{safeSentiment.market_mood}</strong>
                    <p>AI suy ra tâm lý thị trường từ biến động 24h và audit risk score.</p>
                  </div>
                </div>

                <div className='data-progress-list'>
                  <div>
                    <div className='data-progress-label'>Bullish {numberFormat.format(safeSentiment.bullish_percent)}%</div>
                    <div className='data-bar'><span style={{ width: `${safeSentiment.bullish_percent}%`, background: 'linear-gradient(90deg, #10b981, #34d399)' }} /></div>
                  </div>
                  <div>
                    <div className='data-progress-label'>Bearish {numberFormat.format(safeSentiment.bearish_percent)}%</div>
                    <div className='data-bar'><span style={{ width: `${safeSentiment.bearish_percent}%`, background: 'linear-gradient(90deg, #ef4444, #f97316)' }} /></div>
                  </div>
                  <div>
                    <div className='data-progress-label'>Neutral {numberFormat.format(safeSentiment.neutral_percent)}%</div>
                    <div className='data-bar'><span style={{ width: `${safeSentiment.neutral_percent}%`, background: 'linear-gradient(90deg, #94a3b8, #cbd5e1)' }} /></div>
                  </div>
                </div>

                <div className='data-mini-grid'>
                  <div>
                    <span>Avg Risk</span>
                    <strong>{numberFormat.format(safeSentiment.average_risk_score)}</strong>
                  </div>
                  <div>
                    <span>High Risk</span>
                    <strong>{numberFormat.format(safeSentiment.high_risk_records)}</strong>
                  </div>
                  <div>
                    <span>Audit Blocks</span>
                    <strong>{numberFormat.format(safeSentiment.audit_blocks)}</strong>
                  </div>
                </div>
              </div>
            </Box>

            <Box>
              <div className='box-title box-vertical-padding box-horizontal-padding no-select'>
                <div className='data-panel-kicker'>Heatmap</div>
                <div className='data-panel-title'>Trading Heatmap</div>
                <div className='data-panel-subtitle'>Source: GET /api/v1/data/heatmap</div>
              </div>
              <div className='box-content box-horizontal-padding data-box-content data-box-content-medium'>
                <div className='data-list compact'>
                  {heatmap.slice(0, 6).map((item) => (
                    <div key={`heat-${item.symbol}`} className='data-list-item heat-item'>
                      <div className='data-list-head'>
                        <div>
                          <strong>{item.symbol.toUpperCase()}</strong>
                          <div className='data-mini'>Volume {formatCompact(item.volume_24h)}</div>
                        </div>
                        <span className={item.change_24h >= 0 ? 'data-change up' : 'data-change down'}>
                          {formatChange(item.change_24h)}
                        </span>
                      </div>
                      <div className='data-bar'>
                        <span
                          style={{
                            width: `${Math.max(item.intensity, 4)}%`,
                            background: 'linear-gradient(90deg, #2563eb, #38bdf8)',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Box>

            <Box>
              <div className='box-title box-vertical-padding box-horizontal-padding no-select'>
                <div className='data-panel-kicker'>Blockchain</div>
                <div className='data-panel-title'>Audit Trail</div>
                <div className='data-panel-subtitle'>Source: GET /api/v1/blockchain/blocks</div>
              </div>
              <div className='box-content box-horizontal-padding data-box-content data-box-content-medium'>
                <div className='data-list compact'>
                  {latestBlocks.map((block) => {
                    const latestTx = block.Transactions?.[block.Transactions.length - 1];
                    const riskScore = latestTx?.RiskScore ?? 0;
                    return (
                      <div key={block.Hash} className='data-list-item audit-item'>
                        <div className='data-list-head'>
                          <div>
                            <strong>Block #{block.Index}</strong>
                            <div className='data-mini'>{formatTimestamp(block.Timestamp)}</div>
                          </div>
                          <span className='data-chip muted'>{block.Transactions?.length ?? 0} tx</span>
                        </div>
                        <div className='data-mini'>Hash: {shortenHash(block.Hash)}</div>
                        <div className='data-mini'>Risk score: {riskScore}</div>
                      </div>
                    );
                  })}
                  {latestBlocks.length === 0 && <div className='data-empty compact'>Chưa có audit block nào.</div>}
                </div>
              </div>
            </Box>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
