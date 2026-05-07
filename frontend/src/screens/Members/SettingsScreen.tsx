import SiteLayout from '../../layouts/SiteLayout';
import Header from '../../components/Header/Header';

const SettingsScreen: React.FC = () => (
    <SiteLayout>
        <Header icon='settings' title='Settings' />
        <div className='flex flex-center' style={{ padding: '40px', textAlign: 'center' }}>
            <div>
                <p>Settings coming soon...</p>
            </div>
        </div>
    </SiteLayout>
);

export default SettingsScreen;
