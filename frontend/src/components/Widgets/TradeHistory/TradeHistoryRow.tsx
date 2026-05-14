interface ITradeRow {
  price: number;
  quantity: number;
  takerSide: string;
  makerUserMasked: string;
  takerUserMasked: string;
  createdAt: string;
}

interface IProps {
  item: ITradeRow;
}

const TradeHistoryRow: React.FC<IProps> = ({ item }) => (
  <tr className={item.takerSide === 'BUY' ? 'green' : 'red'}>
    <td className='left'>
      <strong>{item.price.toLocaleString('en-US', { maximumFractionDigits: 8 })}</strong>
    </td>
    <td className='center'>
      {item.quantity.toLocaleString('en-US', { maximumFractionDigits: 8 })}
    </td>
    <td className='center'>
      <span style={{ fontWeight: 'bold', marginRight: '8px' }}>
        {item.takerSide === 'BUY' ? '🟢' : '🔴'} {item.takerSide}
      </span>
      <span style={{ fontSize: '0.75em', color: '#999' }}>
        {item.makerUserMasked} → {item.takerUserMasked}
      </span>
    </td>
    <td className='right' style={{ fontSize: '0.8em', color: '#999' }}>
      {new Date(item.createdAt).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      })}
    </td>
  </tr>
);

export default TradeHistoryRow;
