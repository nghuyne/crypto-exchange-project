interface IProps {
  item: any;
}

const MyAssetsRow: React.FC<IProps> = ({ item }) => {
  const formatBalance = (balance: string | number): string => {
    const num = typeof balance === 'string' ? parseFloat(balance) : balance;
    if (num === 0) return '0';
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 8,
    });
  };

  return (
    <div className='myassets-row'>
      <div className='myassets-icon-container'>
        <img src={item.icon} alt={item.symbol} className='myassets-icon' />
      </div>

      <div className='myassets-info'>
        <div className='myassets-name'>{item.name}</div>
        <div className='myassets-symbol'>{item.symbol}</div>
      </div>

      <div className='myassets-balance-container'>
        <div className='myassets-amount'>{formatBalance(item.amount)}</div>
        <div className='myassets-locked'>
          {item.locked_balance ? `Locked: ${formatBalance(item.locked_balance)}` : 'No locked'}
        </div>
      </div>
    </div>
  );
};

export default MyAssetsRow;
