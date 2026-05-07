import SiteLayout from '../../layouts/SiteLayout';
import Header from '../../components/Header/Header';

const AddressesScreen: React.FC = () => (
    <SiteLayout>
        <Header icon='contacts' title='Addresses' />
        <div className='flex flex-center' style={{ padding: '40px', textAlign: 'center' }}>
            <div>
                <p>Address management coming soon...</p>
            </div>
        </div>
    </SiteLayout>
);

export default AddressesScreen;
