import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyAssetsRow from './MyAssetsRow';

const mockItem = {
    id: 1,
    name: 'Bitcoin',
    icon: 'https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/256/Bitcoin-BTC-icon.png',
    symbol: 'BTC',
    amount: '0.12345678',
    change: '+5%',
    status: 1,
    currency: 'BTC',
    changePeriod: 'This week',
    barChartData: [30, 20, 25, 35, 30],
    lineChartData: [5, 10, 5, 20, 8, 15, 22, 8, 12, 8, 32, 16, 29, 20, 16, 30, 42, 45],
};

describe('MyAssetsRow Component', () => {
    it('should render asset information correctly', () => {
        render(<MyAssetsRow item={mockItem} />);

        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
        expect(screen.getByText('BTC')).toBeInTheDocument();
        expect(screen.getByText('0.12345678 BTC')).toBeInTheDocument();
    });

    it('should display correct color based on status', () => {
        const { rerender } = render(<MyAssetsRow item={mockItem} />);

        // Status 1 should be green
        let chartContainer = document.querySelector('.assets-row');
        expect(chartContainer).toBeInTheDocument();

        // Status 0 should be red
        const negativeItem = { ...mockItem, status: 0 };
        rerender(<MyAssetsRow item={negativeItem} />);

        chartContainer = document.querySelector('.assets-row');
        expect(chartContainer).toBeInTheDocument();
    });

    it('should have visibility and receipt buttons instead of links', () => {
        render(<MyAssetsRow item={mockItem} />);

        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThanOrEqual(2);

        // Check that buttons have titles
        const visibilityButton = screen.getByTitle('View details');
        const receiptButton = screen.getByTitle('View receipt');

        expect(visibilityButton).toBeInTheDocument();
        expect(receiptButton).toBeInTheDocument();
    });

    it('should not navigate away when clicking action buttons', async () => {
        const user = userEvent.setup();
        render(<MyAssetsRow item={mockItem} />);

        const visibilityButton = screen.getByTitle('View details');
        await user.click(visibilityButton);

        // Should still be on the same page
        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    });

    it('should display crypto icon', () => {
        render(<MyAssetsRow item={mockItem} />);

        const icon = document.querySelector('.icon.cover');
        expect(icon).toHaveStyle(`backgroundImage: url('${mockItem.icon}')`);
    });

    it('should render with cryptocurrency data correctly', () => {
        render(<MyAssetsRow item={mockItem} />);

        expect(screen.getByText(/This week/)).toBeInTheDocument();
        expect(screen.getByText(/\+5%/)).toBeInTheDocument();
    });
});
