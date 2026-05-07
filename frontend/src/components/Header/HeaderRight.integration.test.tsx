import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import HeaderRight from './HeaderRight';

// Mock useAuth hook
jest.mock('../../hooks/useAuth', () => ({
    useAuth: () => ({
        user: {
            id: 1,
            email: 'integration@example.com',
            full_name: 'Integration Test User',
            created_at: '2024-01-01',
        },
        token: 'integration-test-token',
        isAuthenticated: true,
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
    }),
}));

describe('HeaderRight Integration Tests', () => {
    it('should maintain avatar consistency across renders', () => {
        const { rerender } = render(
            <BrowserRouter>
                <AuthProvider>
                    <HeaderRight />
                </AuthProvider>
            </BrowserRouter>
        );

        let profilePicture = screen.getByRole('link', { name: /integration test user/i })?.querySelector('.profile-picture');
        const initialStyle = profilePicture?.getAttribute('style');

        // Rerender
        rerender(
            <BrowserRouter>
                <AuthProvider>
                    <HeaderRight />
                </AuthProvider>
            </BrowserRouter>
        );

        profilePicture = screen.getByRole('link', { name: /integration test user/i })?.querySelector('.profile-picture');
        const rerenderStyle = profilePicture?.getAttribute('style');

        expect(initialStyle).toBe(rerenderStyle);
    });

    it('should show consistent user information on multiple renders', () => {
        const { rerender } = render(
            <BrowserRouter>
                <AuthProvider>
                    <HeaderRight />
                </AuthProvider>
            </BrowserRouter>
        );

        expect(screen.getByText('Integration Test User')).toBeInTheDocument();
        expect(screen.getByText('@integration')).toBeInTheDocument();

        rerender(
            <BrowserRouter>
                <AuthProvider>
                    <HeaderRight />
                </AuthProvider>
            </BrowserRouter>
        );

        expect(screen.getByText('Integration Test User')).toBeInTheDocument();
        expect(screen.getByText('@integration')).toBeInTheDocument();
    });
});
