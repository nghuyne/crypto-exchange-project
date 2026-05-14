// User
export interface IUser {
    id: number;
    email: string;
    full_name: string;
    created_at: string;
}

// Wallet
export interface IWallet {
    id: number;
    user_id: number;
    asset: string; // USDT, BTC, ETH
    balance: number;
    locked_balance: number;
}

// Order
export interface IOrder {
    id: number;
    user_id: number;
    symbol: string; // btc_usdt
    side: string; // BUY, SELL
    type: string; // LIMIT, MARKET
    price: number;
    quantity: number;
    filled: number;
    status: string; // OPEN, FILLED, PARTIAL, CANCELLED
    created_at: string;
}

// Trade
export interface ITrade {
    id: number;
    buy_order_id: number;
    sell_order_id: number;
    symbol: string;
    price: number;
    quantity: number;
    created_at: string;
}

// API Request/Response
export interface ILoginRequest {
    email: string;
    password: string;
}

export interface IRegisterRequest {
    email: string;
    password: string;
    full_name: string;
}

export interface ILoginResponse {
    status: string;
    message: string;
    data: {
        token: string;
        user?: IUser;
    };
}

export interface IRegisterResponse {
    status: string;
    message: string;
    data: {
        token: string;
        user: IUser;
    };
}

export interface IApiResponse<T> {
    status: string;
    message: string;
    data: T;
}
