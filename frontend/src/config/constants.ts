/**
 * Global constants and configuration values
 */

// API Configuration
export const API_BASE_URL = 'http://localhost:8080/api/v1';
export const WS_URL = 'ws://localhost:8080/ws';

// User Level Configuration
export const USER_LEVELS = {
    LEVEL_1: 1,
    LEVEL_2: 2,
    LEVEL_3: 3,
    LEVEL_4: 4,
    LEVEL_5: 5,
} as const;

export const USER_LEVEL_NAMES: Record<number, string> = {
    1: 'Cấp độ 1 - Cơ bản',
    2: 'Cấp độ 2 - Xác minh',
    3: 'Cấp độ 3 - Premium',
    4: 'Cấp độ 4 - VIP',
    5: 'Cấp độ 5 - Platinum',
};

// Trading Limits (in USD)
export const TRADING_LIMITS: Record<number, { daily: number; monthly: number }> = {
    1: { daily: 500, monthly: 5000 },
    2: { daily: 5000, monthly: 50000 },
    3: { daily: 50000, monthly: 500000 },
    4: { daily: 500000, monthly: 5000000 },
    5: { daily: 10000000, monthly: 100000000 },
};

// Notification Defaults
export const NOTIFICATION_DEFAULTS = {
    LIMIT: 20,
    REFRESH_INTERVAL: 30000, // 30 seconds
} as const;

// Pagination
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
} as const;

// Format Configurations
export const NUMBER_FORMAT = {
    DECIMAL_PLACES: 2,
    CURRENCY_SYMBOL: '$',
} as const;

// Market Configuration
export const MARKET_CONFIG = {
    DEFAULT_PAIR: 'BTCUSDT',
    CHART_PERIODS: ['1m', '5m', '15m', '1h', '4h', '1d'] as const,
    REFRESH_INTERVAL: 5000, // 5 seconds
} as const;

// Error Messages - Vietnamese
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Lỗi mạng. Vui lòng kiểm tra kết nối.',
    UNAUTHORIZED: 'Phiên của bạn đã hết hạn. Vui lòng đăng nhập lại.',
    FORBIDDEN: 'Bạn không có quyền thực hiện hành động này.',
    NOT_FOUND: 'Không tìm thấy tài nguyên được yêu cầu.',
    VALIDATION_ERROR: 'Vui lòng kiểm tra dữ liệu nhập vào.',
    SERVER_ERROR: 'Lỗi máy chủ. Vui lòng thử lại sau.',
} as const;

// Success Messages - Vietnamese
export const SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: 'Đăng nhập thành công. Chào mừng bạn quay lại!',
    LOGOUT_SUCCESS: 'Đăng xuất thành công. Hẹn gặp lại bạn!',
    PROFILE_UPDATED: 'Hồ sơ cập nhật thành công.',
    PASSWORD_CHANGED: 'Mật khẩu đã được thay đổi thành công.',
    ORDER_PLACED: 'Lệnh đặt thành công.',
    ORDER_CANCELLED: 'Lệnh đã bị hủy thành công.',
} as const;

// Button Texts - Vietnamese
export const BUTTON_TEXT = {
    LOGIN: 'Đăng nhập',
    LOGOUT: 'Đăng xuất',
    SIGNUP: 'Đăng ký',
    SUBMIT: 'Gửi',
    CANCEL: 'Hủy',
    SAVE: 'Lưu',
    DELETE: 'Xóa',
    EDIT: 'Chỉnh sửa',
    BUY: 'Mua',
    SELL: 'Bán',
    BACK: 'Quay lại',
} as const;

// Route Paths
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    SIGNUP: '/signup',
    DASHBOARD: '/dashboard',
    MARKET: '/market',
    WALLET: '/wallet',
    TRANSACTIONS: '/transactions',
    PROFILE: '/members/profile',
    SETTINGS: '/settings',
    SEARCH: '/search',
    BUY_CRYPTO: '/buy-crypto',
    NOTIFICATIONS: '/members/notifications',
    LEVEL_APPLICATION: '/members/application',
    ADDRESSES: '/members/addresses',
    MESSAGES: '/members/messages',
    DOCS: '/docs',
    API: '/api',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    USER_DATA: 'user_data',
    PREFERENCES: 'user_preferences',
    RECENT_TRADES: 'recent_trades',
} as const;
