import SiteLayout from '../../layouts/SiteLayout';
import Header from '../../components/Header/Header';

const LevelApplicationScreen: React.FC = () => (
    <SiteLayout>
        <Header icon='security' title='Level 2 Application' />
        <div className='flex flex-center' style={{ padding: '40px', textAlign: 'center' }}>
            <div>
                <p>Level 2 application form coming soon...</p>
            </div>
        </div>
    </SiteLayout>
);

export default LevelApplicationScreen;
