import SiteLayout from '../../layouts/SiteLayout';
import Header from '../../components/Header/Header';

const NotificationsScreen: React.FC = () => (
    <SiteLayout>
        <Header icon='notifications' title='Notifications' />
        <div className='flex flex-center' style={{ padding: '40px', textAlign: 'center' }}>
            <div>
                <p>Notifications coming soon...</p>
            </div>
        </div>
    </SiteLayout>
);

export default NotificationsScreen;
