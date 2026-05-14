import { useRef, useState, useEffect, useCallback } from 'react';

// hooks
import useClickOutside from '../../../hooks/useClickOutside';

// components
import Box from '../../Common/Box';
import TradeHistoryRow from './TradeHistoryRow';

interface IHistory {
  id: number;
  price: number;
  quantity: number;
  taker_side: string;
  maker_user_masked: string;
  taker_user_masked: string;
  created_at: string;
}

const TradeHistory: React.FC = () => {
  const ref = useRef<any>(null);

  const [data, setData] = useState<IHistory[]>([]);
  const [menuOpened, setMenuOpened] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useClickOutside(ref, () => setMenuOpened(false));

  const fetchTrades = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/market/trades?symbol=btc_usdt');
      if (!res.ok) return;
      const result = await res.json();
      const items = Array.isArray(result.data) ? result.data : [];

      setData(
        items.map((item: any) => ({
          id: Number(item.id ?? 0),
          price: Number(item.price ?? 0),
          quantity: Number(item.quantity ?? 0),
          taker_side: String(item.taker_side ?? 'BUY'),
          maker_user_masked: String(item.maker_user_masked ?? 'U***--'),
          taker_user_masked: String(item.taker_user_masked ?? 'U***--'),
          created_at: String(item.created_at ?? new Date().toISOString()),
        }))
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrades();
    const interval = setInterval(fetchTrades, 5000);
    return () => clearInterval(interval);
  }, [fetchTrades]);

  /**
   * Toggles the state of the menu to open or close.
   */
  const handleMenuOpen = (): void => setMenuOpened(!menuOpened);

  return (
    <Box>
      <div className='box-title box-vertical-padding box-horizontal-padding no-select'>
        <div ref={ref} className='flex flex-center flex-space-between'>
          <p>Market History</p>
          <button type='button' className='box-icon pointer' onClick={() => handleMenuOpen()}>
            <i className='material-icons'>more_vert</i>
          </button>
          {menuOpened && (
            <div className='box-dropdown'>
              <ul>
                <li>
                  <button type='button'>
                    <i className='material-icons'>settings</i>
                    Button 1
                  </button>
                </li>
                <li>
                  <button type='button'>
                    <i className='material-icons'>favorite</i>
                    Button 2
                  </button>
                </li>
                <li>
                  <button type='button'>
                    <i className='material-icons'>info</i>
                    Button 3
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      <div className='box-content box-content-height-nobutton'>
        <div className='trade-history-row'>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
              Loading trades...
            </div>
          ) : data && data.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th className='left no-select'>Price</th>
                  <th className='center no-select'>Amount</th>
                  <th className='center no-select'>Order / Counterpart</th>
                  <th className='right no-select'>Time</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item: IHistory) => (
                  <TradeHistoryRow
                    key={item.id.toString()}
                    item={{
                      price: item.price,
                      quantity: item.quantity,
                      takerSide: item.taker_side,
                      makerUserMasked: item.maker_user_masked,
                      takerUserMasked: item.taker_user_masked,
                      createdAt: item.created_at,
                    }}
                  />
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
              No trade history
            </div>
          )}
        </div>
      </div>
    </Box>
  );
};

export default TradeHistory;
