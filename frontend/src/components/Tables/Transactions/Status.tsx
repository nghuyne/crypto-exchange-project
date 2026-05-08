// interfaces
interface IProps {
  status: number;
}

const Status: React.FC<IProps> = ({ status }) => {
  if (status === 1) {
    return <span className='status green'>ĐÃ HOÀN THÀNH</span>;
  }

  if (status === 2) {
    return <span className='status red'>ĐÃ HỦY</span>;
  }

  return <span className='status gray'>ĐANG CHỜ</span>;
};

export default Status;
