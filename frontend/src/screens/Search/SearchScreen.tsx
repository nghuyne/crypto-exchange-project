import { useState } from 'react';
import SiteLayout from '../../layouts/SiteLayout';
import Header from '../../components/Header/Header';
import Box from '../../components/Common/Box';

interface SearchResult {
    id: string;
    type: 'trade' | 'asset' | 'user';
    title: string;
    description: string;
    timestamp?: string;
}

const SearchScreen: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = (query: string) => {
        setSearchQuery(query);

        if (query.trim().length < 2) {
            setResults([]);
            return;
        }

        setIsSearching(true);

        // Simulate API call - replace with: await searchService.search(query, token)
        setTimeout(() => {
            const mockResults: SearchResult[] = [
                { id: '1', type: 'asset', title: 'Bitcoin (BTC)', description: 'Tiền tệ kỹ thuật số', timestamp: '2 phút trước' },
                { id: '2', type: 'asset', title: 'Ethereum (ETH)', description: 'Nền tảng hợp đồng thông minh', timestamp: '5 phút trước' },
                { id: '3', type: 'trade', title: 'BTC/USDT tại $42.000', description: 'Giao dịch gần đây', timestamp: '10 phút trước' },
                { id: '4', type: 'trade', title: 'ETH/USDT tại $2.300', description: 'Giao dịch gần đây', timestamp: '15 phút trước' },
            ].filter(item =>
                item.title.toLowerCase().includes(query.toLowerCase()) ||
                item.description.toLowerCase().includes(query.toLowerCase())
            );

            setResults(mockResults);
            setIsSearching(false);
        }, 300);
    };

    return (
        <SiteLayout>
            <Header icon='search' title='Tìm kiếm' />
            <div style={{ padding: '20px' }}>
                <Box>
                    <div style={{ padding: '20px' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <input
                                type='text'
                                placeholder='Tìm kiếm tiền mã hóa, giao dịch, người dùng...'
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    fontSize: '16px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    boxSizing: 'border-box',
                                }}
                            />
                        </div>

                        {isSearching && <p style={{ textAlign: 'center', color: '#999' }}>Đang tìm kiếm...</p>}

                        {!isSearching && results.length === 0 && searchQuery && (
                            <p style={{ textAlign: 'center', color: '#999' }}>Không tìm thấy kết quả</p>
                        )}

                        {!isSearching && results.length > 0 && (
                            <div>
                                {results.map(result => (
                                    <div
                                        key={result.id}
                                        style={{
                                            padding: '12px',
                                            borderBottom: '1px solid #eee',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s',
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{result.title}</div>
                                                <div style={{ fontSize: '12px', color: '#999' }}>{result.description}</div>
                                            </div>
                                            <span style={{ fontSize: '12px', color: '#999' }}>{result.timestamp}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!isSearching && results.length === 0 && !searchQuery && (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                                <i className='material-icons' style={{ fontSize: '48px', marginBottom: '10px', display: 'block' }}>
                                    search
                                </i>
                                <p>Bắt đầu nhập để tìm kiếm tiền mã hóa, giao dịch hoặc người dùng</p>
                            </div>
                        )}
                    </div>
                </Box>
            </div>
        </SiteLayout>
    );
};

export default SearchScreen;
