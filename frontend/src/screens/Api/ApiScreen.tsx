import SiteLayout from '../../layouts/SiteLayout';
import Header from '../../components/Header/Header';

const ApiScreen: React.FC = () => (
    <SiteLayout>
        <Header icon='api' title='API Reference' />
        <div className='flex flex-center' style={{ padding: '40px', textAlign: 'center' }}>
            <div>
                <p>API documentation coming soon...</p>
            </div>
        </div>
    </SiteLayout>
);

export default ApiScreen;
