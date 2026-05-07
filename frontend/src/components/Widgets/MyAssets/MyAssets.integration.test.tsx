import { render, screen, waitFor } from '@testing-library/react';
import MyAssets from './MyAssets';

// Mock useWallet hook
jest.mock('../../../hooks/useWallet', () => ({
    useWallet: () => ({
        wallets: [
            {
                id: 1,
                asset: 'BTC',
                balance: '0.5',
            },
            {
                id: 2,
                asset: 'ETH',
                balance: '2.5',
            },
            {
                id: 3,
                asset: 'USDT',
                balance: '1000',
            },
        ],
        isLoading: false,
        error: null,
    }),
}));

// Mock useClickOutside hook
jest.mock('../../../hooks/useClickOutside', () => ({
    __esModule: true,
    default: (ref: any, callback: Function) => { },
}));

describe('MyAssets Integration Tests', () => {
    it('should render all wallet assets', async () => {
        render(<MyAssets />);

        await waitFor(() => {
            expect(screen.getByText('Bitcoin')).toBeInTheDocument();
            expect(screen.getByText('Ethereum')).toBeInTheDocument();
            expect(screen.getByText('Tether')).toBeInTheDocument();
        });
    });

    it('should display correct balance for each asset', async () => {
        render(<MyAssets />);

        await waitFor(() => {
            expect(screen.getByText(/0.50000000 BTC/)).toBeInTheDocument();
            expect(screen.getByText(/2.50000000 ETH/)).toBeInTheDocument();
            expect(screen.getByText(/1000.00000000 USDT/)).toBeInTheDocument();
        });
    });

    it('should render action buttons for each asset', async () => {
        render(<MyAssets />);

        await waitFor(() => {
            const viewDetailButtons = screen.getAllByTitle('View details');
            const receiptButtons = screen.getAllByTitle('View receipt');

            expect(viewDetailButtons).toHaveLength(3);
            expect(receiptButtons).toHaveLength(3);
        });
    });

    it('should have a Buy crypto button', () => {
        render(<MyAssets />);

        expect(screen.getByRole('link', { name: /buy crypto/i })).toBeInTheDocument();
    });

    it('should display My assets title', () => {
        render(<MyAssets />);

        expect(screen.getByText('My assets')).toBeInTheDocument();
    });
});
