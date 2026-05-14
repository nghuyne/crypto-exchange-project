import { IWallet, IApiResponse } from '../types';

const API_BASE_URL = 'http://localhost:8080/api/v1';

export const walletService = {
    async getWallets(token: string): Promise<IApiResponse<IWallet[]>> {
        const response = await fetch(`${API_BASE_URL}/wallet`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch wallets');
        }

        return response.json();
    },

    async deposit(token: string, asset: string, amount: number): Promise<IApiResponse<IWallet>> {
        const response = await fetch(`${API_BASE_URL}/deposit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ asset, amount }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Deposit failed');
        }

        return response.json();
    },
};
