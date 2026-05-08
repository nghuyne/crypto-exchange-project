import { useRef, useState } from 'react';

// hooks
import useClickOutside from '../../../hooks/useClickOutside';
import { useOrderBook } from '../../../hooks/useOrderBook';

// components
import Box from '../../Common/Box';
import SellOrdersRow from './SellOrdersRow';

const SellOrders: React.FC = () => {
  const ref = useRef<any>(null);
  const [menuOpened, setMenuOpened] = useState<boolean>(false);
  const { asks, isLoading } = useOrderBook({ symbol: 'btc_usdt' });

  useClickOutside(ref, () => setMenuOpened(false));

  /**
   * Toggles the state of the menu to open or close.
   */
  const handleMenuOpen = (): void => setMenuOpened(!menuOpened);

  return (
    <Box>
      <div className='box-title box-vertical-padding box-horizontal-padding no-select'>
        <div ref={ref} className='flex flex-center flex-space-between'>
          <p>Lệnh bán</p>
          <button type='button' className='box-icon pointer' onClick={() => handleMenuOpen()}>
            <i className='material-icons'>more_vert</i>
          </button>

          {menuOpened && (
            <div className='box-dropdown'>
              <ul>
                <li>
                  <button type='button'>
                    <i className='material-icons'>settings</i>
                    Tùy chọn 1
                  </button>
                </li>
                <li>
                  <button type='button'>
                    <i className='material-icons'>favorite</i>
                    Tùy chọn 2
                  </button>
                </li>
                <li>
                  <button type='button'>
                    <i className='material-icons'>info</i>
                    Tùy chọn 3
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      <div className='box-content box-content-height-nobutton'>
        <div className='orders-row'>
          {asks.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th className='left no-select'>Giá</th>
                  <th className='center no-select'>Số lượng</th>
                  <th className='right no-select'>Tổng cộng</th>
                </tr>
              </thead>
              <tbody>
                {asks.slice(0, 20).map((item, index) => (
                  <SellOrdersRow
                    key={`${item.Price}-${index}`}
                    item={{
                      price: item.Price,
                      amount: Math.max(item.Quantity, 0),
                      total: Math.max(item.Total, 0),
                    }}
                  />
                ))}
              </tbody>
            </table>
          )}
          {!isLoading && asks.length === 0 && <div className='box-horizontal-padding'>Chưa có lệnh bán.</div>}
        </div>
      </div>
    </Box>
  );
};

export default SellOrders;
