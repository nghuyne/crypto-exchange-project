import { useRef, useState } from 'react';

// hooks
import useClickOutside from '../../../hooks/useClickOutside';
import { useOrderBook } from '../../../hooks/useOrderBook';

// components
import Box from '../../Common/Box';
import BuyOrdersRow from './BuyOrdersRow';

const BuyOrders: React.FC = () => {
  const ref = useRef<any>(null);
  const [menuOpened, setMenuOpened] = useState<boolean>(false);
  const { bids, isLoading } = useOrderBook({ symbol: 'btc_usdt' });

  useClickOutside(ref, () => setMenuOpened(false));

  /**
   * Toggles the state of the menu to open or close.
   */
  const handleMenuOpen = (): void => setMenuOpened(!menuOpened);

  return (
    <Box>
      <div className='box-title box-vertical-padding box-horizontal-padding no-select'>
        <div ref={ref} className='flex flex-center flex-space-between'>
          <p>Buy orders</p>
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
        <div className='orders-row'>
          {bids.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th className='left no-select'>Price</th>
                  <th className='center no-select'>Amount</th>
                  <th className='right no-select'>Total</th>
                </tr>
              </thead>
              <tbody>
                {bids.slice(0, 20).map((item, index) => (
                  <BuyOrdersRow
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
          {!isLoading && bids.length === 0 && <div className='box-horizontal-padding'>Chua co lenh mua.</div>}
        </div>
      </div>
    </Box>
  );
};

export default BuyOrders;
