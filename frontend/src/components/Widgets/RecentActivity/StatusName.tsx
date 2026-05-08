// interfaces
interface IProps {
  status: number;
}

const StatusName: React.FC<IProps> = ({ status }) => {
  if (status === 1) {
    return <span className='green'>Đã hoàn thành</span>;
  }

  if (status === 2) {
    return <span className='red'>Đã hủy</span>;
  }

  return <span className='gray'>Đang chờ</span>;
};

export default StatusName;
