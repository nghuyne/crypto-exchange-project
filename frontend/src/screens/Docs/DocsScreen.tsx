import SiteLayout from '../../layouts/SiteLayout';
import Header from '../../components/Header/Header';

const DocsScreen: React.FC = () => (
    <SiteLayout>
        <Header icon='description' title='Documentation' />
        <div className='flex flex-center' style={{ padding: '40px', textAlign: 'center' }}>
            <div>
                <p>Documentation coming soon...</p>
            </div>
        </div>
    </SiteLayout>
);

export default DocsScreen;
