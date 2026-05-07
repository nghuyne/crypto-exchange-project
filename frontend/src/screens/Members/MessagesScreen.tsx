import SiteLayout from '../../layouts/SiteLayout';
import Header from '../../components/Header/Header';

const MessagesScreen: React.FC = () => (
    <SiteLayout>
        <Header icon='chat' title='Messages' />
        <div className='flex flex-center' style={{ padding: '40px', textAlign: 'center' }}>
            <div>
                <p>Messages coming soon...</p>
            </div>
        </div>
    </SiteLayout>
);

export default MessagesScreen;
