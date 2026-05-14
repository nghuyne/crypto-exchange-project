import { ITrade, IOrder, IApiResponse } from '../types';

const API_BASE_URL = 'http://localhost:8080/api/v1';

export interface IOrderBook {
    bids: IOrder[];
    asks: IOrder[];
}

export const marketService = {
    async getOrderBook(symbol: string = 'btc_usdt'): Promise<IApiResponse<IOrderBook>> {
        const response = await fetch(`${API_BASE_URL}/market/orderbook?symbol=${symbol}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch orderbook');
        }

        return response.json();
    },

    async getTrades(symbol: string = 'btc_usdt'): Promise<IApiResponse<ITrade[]>> {
        const response = await fetch(`${API_BASE_URL}/market/trades?symbol=${symbol}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch trades');
        }

        return response.json();
    },
};
