import { IApiResponse } from '../types';

const API_BASE_URL = 'http://localhost:8080/api/v1';

export interface INotification {
    id: number;
    type: 'success' | 'warning' | 'error' | 'info';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
}

export interface IUserProfile {
    id: number;
    full_name: string;
    email: string;
    level: number;
    created_at: string;
}

export interface IDataOverview {
    market_cap: number;
    volume_24h: number;
    btc_dominance: number;
    fear_greed_index: number;
}

export interface IOrderbookEntry {
    price: string;
    quantity: string;
}

export interface IOrderbook {
    bids: IOrderbookEntry[];
    asks: IOrderbookEntry[];
}

export const notificationService = {
    async getNotifications(token: string): Promise<IApiResponse<INotification[]>> {
        try {
            const response = await fetch(`${API_BASE_URL}/notifications`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                console.warn('Không thể lấy thông báo từ API');
                return { status: 'error', message: 'Không thể lấy thông báo', data: [] };
            }

            return response.json();
        } catch (error) {
            console.error('Lỗi khi lấy thông báo:', error);
            return { status: 'error', message: 'Lỗi lấy thông báo', data: [] };
        }
    },

    async getNotificationCount(token: string): Promise<number> {
        try {
            const response = await fetch(`${API_BASE_URL}/notifications/count`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                return 0;
            }

            const data = await response.json();
            return data.data?.count || 0;
        } catch (error) {
            console.error('Lỗi lấy số thông báo:', error);
            return 0;
        }
    },

    async markAsRead(token: string, notificationId: number): Promise<IApiResponse<void>> {
        try {
            const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Không thể đánh dấu thông báo');
            }

            return response.json();
        } catch (error) {
            console.error('Lỗi đánh dấu thông báo:', error);
            return { status: 'error', message: 'Lỗi đánh dấu thông báo', data: undefined as any };
        }
    },
};

export const userService = {
    async getProfile(token: string): Promise<IApiResponse<IUserProfile>> {
        try {
            const response = await fetch(`${API_BASE_URL}/me`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Không thể lấy hồ sơ người dùng');
            }

            const data = await response.json();
            // Transform /me response to match IUserProfile interface
            return {
                status: data.status,
                message: data.message,
                data: {
                    id: data.data?.id || 0,
                    full_name: data.data?.full_name || '',
                    email: data.data?.email || '',
                    level: 1, // /me endpoint doesn't return level, default to 1
                    created_at: data.data?.created_at || '',
                } as IUserProfile
            };
        } catch (error) {
            console.error('Lỗi lấy hồ sơ:', error);
            return { status: 'error', message: 'Lỗi lấy hồ sơ', data: {} as IUserProfile };
        }
    },

    async updateProfile(token: string, data: Partial<IUserProfile>): Promise<IApiResponse<IUserProfile>> {
        try {
            // Backend doesn't support profile updates yet, return success with current data
            console.warn('Profile update not supported by backend yet');
            return { status: 'error', message: 'Chức năng cập nhật hồ sơ chưa được hỗ trợ', data: {} as IUserProfile };
        } catch (error) {
            console.error('Lỗi cập nhật hồ sơ:', error);
            return { status: 'error', message: 'Lỗi cập nhật hồ sơ', data: {} as IUserProfile };
        }
    },
};

export const dataService = {
    async getDataOverview(token?: string): Promise<IApiResponse<IDataOverview>> {
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE_URL}/data/overview`, {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                throw new Error('Không thể lấy dữ liệu tổng quát');
            }

            return response.json();
        } catch (error) {
            console.error('Lỗi lấy dữ liệu tổng quát:', error);
            return { status: 'error', message: 'Lỗi lấy dữ liệu', data: {} as IDataOverview };
        }
    },

    async getCoinsData(token?: string) {
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE_URL}/data/coins`, {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                throw new Error('Không thể lấy dữ liệu xu hướng');
            }

            return response.json();
        } catch (error) {
            console.error('Lỗi lấy dữ liệu xu hướng:', error);
            return { status: 'error', message: 'Lỗi lấy dữ liệu', data: [] };
        }
    },

    async getHeatmapData(token?: string) {
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE_URL}/data/heatmap`, {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                throw new Error('Không thể lấy dữ liệu bản đồ nhiệt');
            }

            return response.json();
        } catch (error) {
            console.error('Lỗi lấy bản đồ nhiệt:', error);
            return { status: 'error', message: 'Lỗi lấy bản đồ', data: {} };
        }
    },
};

export const marketService = {
    async getOrderbook(token?: string): Promise<IApiResponse<IOrderbook>> {
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE_URL}/market/orderbook`, {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                throw new Error('Không thể lấy sổ lệnh');
            }

            return response.json();
        } catch (error) {
            console.error('Lỗi lấy sổ lệnh:', error);
            return { status: 'error', message: 'Lỗi lấy sổ lệnh', data: { bids: [], asks: [] } };
        }
    },

    async getTrades(token?: string) {
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE_URL}/market/trades`, {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                throw new Error('Không thể lấy giao dịch');
            }

            return response.json();
        } catch (error) {
            console.error('Lỗi lấy giao dịch:', error);
            return { status: 'error', message: 'Lỗi lấy giao dịch', data: [] };
        }
    },
};

export const orderService = {
    async getOrders(token: string): Promise<IApiResponse<any[]>> {
        try {
            const response = await fetch(`${API_BASE_URL}/orders`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Không thể lấy danh sách lệnh');
            }

            return response.json();
        } catch (error) {
            console.error('Lỗi lấy danh sách lệnh:', error);
            return { status: 'error', message: 'Lỗi lấy danh sách lệnh', data: [] };
        }
    },

    async placeOrder(token: string, order: any): Promise<IApiResponse<any>> {
        try {
            const response = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(order),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Đặt lệnh thất bại');
            }

            return response.json();
        } catch (error) {
            console.error('Lỗi đặt lệnh:', error);
            return { status: 'error', message: 'Lỗi đặt lệnh', data: {} };
        }
    },

    async cancelOrder(token: string, orderId: number): Promise<IApiResponse<void>> {
        try {
            const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Hủy lệnh thất bại');
            }

            return response.json();
        } catch (error) {
            console.error('Lỗi hủy lệnh:', error);
            return { status: 'error', message: 'Lỗi hủy lệnh', data: undefined as any };
        }
    },
};
