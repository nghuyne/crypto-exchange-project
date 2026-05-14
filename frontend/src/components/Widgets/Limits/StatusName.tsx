// interfaces
interface IProps {
  status: number;
}

const StatusName: React.FC<IProps> = ({ status }) => {
  if (status === 1) {
    return <span className='green'>Giới hạn hợp lệ</span>;
  }

  return <span className='red'>Số dư không đủ</span>;
};

export default StatusName;
