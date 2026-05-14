import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import SiteLayout from '../../layouts/SiteLayout';
import Header from '../../components/Header/Header';
import { AuthContext } from '../../context/AuthContext';
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

interface Order {
  id: number;
  user_id: number;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: string;
  price: number;
  quantity: number;
  filled: number;
  status: 'OPEN' | 'PARTIAL' | 'FILLED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
}

interface OrderBook {
  bids: Order[];
  asks: Order[];
}

interface OrderBookData {
  status: string;
  data: OrderBook;
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
  orders: '/api/v1/orders',
  orderbook: (symbol: string) => `/api/v1/market/orderbook?symbol=${symbol}`,
};

const numberFormat = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
});

const currencyFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 8,
});

const priceFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function shortenHash(value: string): string {
  if (!value || value.length <= 14) return value;
  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

function formatChange(change: number): string {
  if (Math.abs(change) > 50) return '--';
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
  return date.toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  });
}

export default function DataScreen() {
  const authContext = useContext(AuthContext);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [coins, setCoins] = useState<PairSummary[]>([]);
  const [heatmap, setHeatmap] = useState<PairSummary[]>([]);
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [blocks, setBlocks] = useState<AuditBlock[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [orderBook, setOrderBook] = useState<OrderBook>({ bids: [], asks: [] });
  const [keyword, setKeyword] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState('btc_usdt');
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

  const loadMyOrders = useCallback(async () => {
    if (!authContext?.token) return;
    try {
      const res = await fetch(API.orders, {
        headers: { Authorization: `Bearer ${authContext.token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setMyOrders((json.data ?? []) as Order[]);
      }
    } catch (err) {
      console.error('Error loading orders:', err);
    }
  }, [authContext?.token]);

  const loadOrderBook = useCallback(async () => {
    try {
      const res = await fetch(API.orderbook(selectedSymbol));
      if (res.ok) {
        const json = (await res.json()) as OrderBookData;
        setOrderBook(json.data ?? { bids: [], asks: [] });
      }
    } catch (err) {
      console.error('Error loading order book:', err);
    }
  }, [selectedSymbol]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadMyOrders();
    const interval = setInterval(loadMyOrders, 5000);
    return () => clearInterval(interval);
  }, [loadMyOrders]);

  useEffect(() => {
    loadOrderBook();
    const interval = setInterval(loadOrderBook, 3000);
    return () => clearInterval(interval);
  }, [loadOrderBook]);

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
            <h1>Market Data & Trading Overview</h1>
            <p>Real-time market data, order book, and AI risk assessment.</p>
          </div>
          <div className='data-hero-actions'>
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
            <div className='data-stat-value'>{safeSentiment.fear_greed_index === 0 ? 'N/A' : numberFormat.format(safeSentiment.fear_greed_index)}</div>
            <div className='data-stat-foot'>{safeSentiment.market_mood} sentiment</div>
          </div>
        </div>

        <div className='data-layout'>
          <div className='data-main'>
            <div className='data-card'>
              <div className='data-card-header'>
                <div className='data-panel-head'>
                  <div>
                    <div className='data-panel-title'>Cryptocurrency Details</div>
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
              <div className='data-card-content'>
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
            </div>

            <div className='data-inline-grid'>
              <div className='data-card'>
                <div className='data-card-header'>
                  <div>
                    <div className='data-panel-title'>Top Movers</div>
                  </div>
                </div>
                <div className='data-card-content'>
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
              </div>

              <div className='data-card'>
                <div className='data-card-header'>
                  <div>
                    <div className='data-panel-title'>System Snapshot</div>
                  </div>
                </div>
                <div className='data-card-content'>
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
              </div>
            </div>
          </div>

          <div className='data-side'>
            <div className='data-card'>
              <div className='data-card-header'>
                <div>
                  <div className='data-panel-title'>Market Sentiment</div>
                </div>
              </div>
              <div className='data-card-content'>
                <div className='data-sentiment-meter'>
                  <div
                    className='data-ring'
                    style={{
                      background: `conic-gradient(${safeSentiment.market_mood === 'GREED' ? '#10b981' : safeSentiment.market_mood === 'FEAR' ? '#ef4444' : '#f59e0b'} ${safeSentiment.fear_greed_index}%, #e2e8f0 0)`,
                    }}
                  >
                    <span>{safeSentiment.fear_greed_index === 0 ? 'N/A' : numberFormat.format(safeSentiment.fear_greed_index)}</span>
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
            </div>

            <div className='data-card'>
              <div className='data-card-header'>
                <div>
                  <div className='data-panel-title'>Trading Heatmap</div>
                </div>
              </div>
              <div className='data-card-content'>
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
            </div>

            <div className='data-card'>
              <div className='data-card-header'>
                <div>
                  <div className='data-panel-title'>Audit Trail</div>
                </div>
              </div>
              <div className='data-card-content'>
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
            </div>

            {authContext?.token && (
              <>
                <div className='data-card'>
                  <div className='data-card-header'>
                    <div>
                      <div className='data-panel-title'>My Orders</div>
                    </div>
                  </div>
                  <div className='data-card-content'>
                    {myOrders.length === 0 ? (
                      <div className='data-empty'>No active orders</div>
                    ) : (
                      <div className='data-orders-list'>
                        {myOrders.slice(0, 8).map((order) => (
                          <div key={order.id} className='data-order-item'>
                            <div className='data-order-header'>
                              <div>
                                <strong>{order.symbol.toUpperCase()}</strong>
                                <span className={`data-order-side ${order.side.toLowerCase()}`}>{order.side}</span>
                              </div>
                              <span className={`data-order-status ${order.status.toLowerCase()}`}>{order.status}</span>
                            </div>
                            <div className='data-order-grid'>
                              <div>
                                <div className='data-order-label'>Price</div>
                                <div className='data-order-value'>${priceFormat.format(order.price)}</div>
                              </div>
                              <div>
                                <div className='data-order-label'>Qty</div>
                                <div className='data-order-value'>{currencyFormat.format(order.quantity)}</div>
                              </div>
                              <div>
                                <div className='data-order-label'>Filled</div>
                                <div className='data-order-value'>{currencyFormat.format(order.filled)} / {currencyFormat.format(order.quantity)}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className='data-card'>
                  <div className='data-card-header'>
                    <div>
                      <div className='data-panel-title'>Order Book</div>
                    </div>
                    <select
                      className='data-symbol-select'
                      value={selectedSymbol}
                      onChange={(e) => setSelectedSymbol(e.target.value)}
                    >
                      <option value='btc_usdt'>BTC/USDT</option>
                      <option value='eth_usdt'>ETH/USDT</option>
                      <option value='sol_usdt'>SOL/USDT</option>
                      <option value='xrp_usdt'>XRP/USDT</option>
                    </select>
                  </div>
                  <div className='data-card-content'>
                    <div className='data-orderbook-side'>
                      <div className='data-orderbook-title'>Bids (BUY)</div>
                      {orderBook.bids.length === 0 ? (
                        <div className='data-empty'>No buy orders</div>
                      ) : (
                        <div className='data-orderbook-rows'>
                          {orderBook.bids.slice(0, 5).map((order) => (
                            <div key={`bid-${order.id}`} className='data-orderbook-row bid'>
                              <span className='data-ob-price'>${priceFormat.format(order.price)}</span>
                              <span className='data-ob-qty'>{currencyFormat.format(order.quantity)}</span>
                              <span className='data-ob-total'>${priceFormat.format(order.price * order.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className='data-orderbook-divider' />

                    <div className='data-orderbook-side'>
                      <div className='data-orderbook-title'>Asks (SELL)</div>
                      {orderBook.asks.length === 0 ? (
                        <div className='data-empty'>No sell orders</div>
                      ) : (
                        <div className='data-orderbook-rows'>
                          {orderBook.asks.slice(0, 5).map((order) => (
                            <div key={`ask-${order.id}`} className='data-orderbook-row ask'>
                              <span className='data-ob-price'>${priceFormat.format(order.price)}</span>
                              <span className='data-ob-qty'>{currencyFormat.format(order.quantity)}</span>
                              <span className='data-ob-total'>${priceFormat.format(order.price * order.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
