import SiteLayout from '../../layouts/SiteLayout';
import Header from '../../components/Header/Header';

const SearchScreen: React.FC = () => (
    <SiteLayout>
        <Header icon='search' title='Search' />
        <div className='flex flex-center' style={{ padding: '40px', textAlign: 'center' }}>
            <div>
                <p>Search functionality coming soon...</p>
            </div>
        </div>
    </SiteLayout>
);

export default SearchScreen;
