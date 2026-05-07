import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import HeaderRight from './HeaderRight';

// Mock useAuth hook
jest.mock('../../hooks/useAuth', () => ({
    useAuth: () => ({
        user: {
            id: 1,
            email: 'test@example.com',
            full_name: 'Test User',
            created_at: '2024-01-01',
        },
        token: 'test-token',
        isAuthenticated: true,
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
    }),
}));

const renderWithProviders = (component: React.ReactElement) => {
    return render(
        <BrowserRouter>
            <AuthProvider>
                {component}
            </AuthProvider>
        </BrowserRouter>
    );
};

describe('HeaderRight Component', () => {
    it('should render user profile information', () => {
        renderWithProviders(<HeaderRight />);

        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('@test')).toBeInTheDocument();
    });

    it('should use consistent avatar source based on user email', () => {
        renderWithProviders(<HeaderRight />);

        const profilePicture = screen.getByRole('link', { name: /test user/i }).querySelector('.profile-picture');

        expect(profilePicture).toHaveStyle({
            backgroundImage: 'url(\'https://api.dicebear.com/7.x/avataaars/svg?seed=test@example.com\')',
        });
    });

    it('should navigate to /members when clicking profile picture', () => {
        renderWithProviders(<HeaderRight />);

        const profileLink = screen.getByRole('link', { name: /test user/i });
        expect(profileLink).toHaveAttribute('href', '/members');
    });

    it('should render all navigation links', () => {
        renderWithProviders(<HeaderRight />);

        expect(screen.getByRole('link', { name: /market/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /data/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /blockchain explorer/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /docs/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /api/i })).toBeInTheDocument();
    });

    it('should have logout button', () => {
        renderWithProviders(<HeaderRight />);

        const logoutButton = screen.getByRole('button', { name: '' }); // Material icon button
        expect(logoutButton).toBeInTheDocument();
    });
});
