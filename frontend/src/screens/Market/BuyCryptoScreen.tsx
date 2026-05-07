import SiteLayout from '../../layouts/SiteLayout';
import Header from '../../components/Header/Header';
import { useNavigate } from 'react-router-dom';

const BuyCryptoScreen: React.FC = () => {
    const navigate = useNavigate();

    return (
        <SiteLayout>
            <Header icon='shopping_cart' title='Buy Crypto' />
            <div className='flex flex-center' style={{ padding: '40px', textAlign: 'center' }}>
                <div>
                    <p>Buy crypto interface coming soon...</p>
                    <button
                        onClick={() => navigate('/market')}
                        className='button button-purple button-medium'
                        style={{ marginTop: '20px' }}
                    >
                        Back to Market
                    </button>
                </div>
            </div>
        </SiteLayout>
    );
};

export default BuyCryptoScreen;
