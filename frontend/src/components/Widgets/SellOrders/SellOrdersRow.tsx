interface IProps {
  item: {
    price: number;
    amount: number;
    total: number;
  };
}

const SellOrdersRow: React.FC<IProps> = ({ item }) => {
  return (
    <tr className='red'>
      <td className='left'>
        {item.price.toLocaleString('en-US', { maximumFractionDigits: 8 })} USDT
      </td>
      <td className='center'>
        {item.amount.toLocaleString('en-US', { maximumFractionDigits: 8 })} BTC
      </td>
      <td className='right'>
        {item.total.toLocaleString('en-US', { maximumFractionDigits: 2 })} USDT
      </td>
    </tr>
  );
};

export default SellOrdersRow;
