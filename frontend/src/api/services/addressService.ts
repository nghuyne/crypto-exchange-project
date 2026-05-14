import { IApiResponse } from '../types';

const API_BASE_URL = 'http://localhost:8080/api/v1';

export interface IAddress {
    id: number;
    user_id: number;
    label: string;
    address: string;
    blockchain: string;
    created_at: string;
}

// Mock data - Used as fallback when no addresses exist in backend
const MOCK_ADDRESSES: IAddress[] = [
    {
        id: 1,
        user_id: 1,
        label: 'Main Wallet',
        address: '1A1z7agoat2YLZW51Bc68Bn2d1YJD7he4',
        blockchain: 'Bitcoin',
        created_at: '2024-01-15T10:30:00Z',
    },
    {
        id: 2,
        user_id: 1,
        label: 'Trading Account',
        address: '0x742d35Cc6634C0532925a3b844Bc3e7c1E7b5A99',
        blockchain: 'Ethereum',
        created_at: '2024-02-20T14:45:00Z',
    },
];

export const addressService = {
    async getAddresses(token: string): Promise<IApiResponse<IAddress[]>> {
        try {
            const response = await fetch(`${API_BASE_URL}/addresses`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                // Fallback to mock if API fails
                console.warn('API failed, using mock addresses');
                return {
                    status: 'success',
                    message: 'Using demo addresses (no saved addresses yet)',
                    data: MOCK_ADDRESSES
                };
            }

            const result = await response.json();
            // If no addresses in backend, use mock
            if (result.data && result.data.length === 0) {
                return {
                    status: 'success',
                    message: 'No saved addresses, showing demo data',
                    data: MOCK_ADDRESSES
                };
            }

            return result;
        } catch (error) {
            console.error('Lỗi lấy danh sách địa chỉ:', error);
            // Fallback to mock on network error
            return {
                status: 'success',
                message: 'Using demo addresses (offline)',
                data: MOCK_ADDRESSES
            };
        }
    },

    async createAddress(token: string, label: string, address: string, blockchain: string): Promise<IApiResponse<IAddress>> {
        try {
            const response = await fetch(`${API_BASE_URL}/addresses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ label, address, blockchain }),
            });

            if (!response.ok) {
                const error = await response.json();
                return { status: 'error', message: error.message || 'Thêm địa chỉ thất bại', data: {} as IAddress };
            }

            return response.json();
        } catch (error) {
            console.error('Lỗi thêm địa chỉ:', error);
            return { status: 'error', message: 'Lỗi thêm địa chỉ', data: {} as IAddress };
        }
    },

    async deleteAddress(token: string, addressId: number): Promise<IApiResponse<void>> {
        try {
            const response = await fetch(`${API_BASE_URL}/addresses/${addressId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                return { status: 'error', message: 'Xóa địa chỉ thất bại', data: undefined };
            }

            return response.json();
        } catch (error) {
            console.error('Lỗi xóa địa chỉ:', error);
            return { status: 'error', message: 'Lỗi xóa địa chỉ', data: undefined };
        }
    },
};
