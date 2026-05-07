/**
 * Centralized crypto asset configuration
 * Icons, colors, and metadata for all supported cryptocurrencies
 */

export interface CryptoAsset {
    symbol: string;
    name: string;
    icon: string;
    color: string;
}

export const CRYPTO_ASSETS: Record<string, CryptoAsset> = {
    BTC: {
        symbol: 'BTC',
        name: 'Bitcoin',
        icon: 'https://cryptoicons.org/api/icon/btc/200',
        color: '#F7931A',
    },
    ETH: {
        symbol: 'ETH',
        name: 'Ethereum',
        icon: 'https://cryptoicons.org/api/icon/eth/200',
        color: '#627EEA',
    },
    USDT: {
        symbol: 'USDT',
        name: 'Tether USD',
        icon: 'https://cryptoicons.org/api/icon/usdt/200',
        color: '#26A17B',
    },
    XRP: {
        symbol: 'XRP',
        name: 'XRP',
        icon: 'https://cryptoicons.org/api/icon/xrp/200',
        color: '#00AAE4',
    },
    DOGE: {
        symbol: 'DOGE',
        name: 'Dogecoin',
        icon: 'https://cryptoicons.org/api/icon/doge/200',
        color: '#C2A633',
    },
    ADA: {
        symbol: 'ADA',
        name: 'Cardano',
        icon: 'https://cryptoicons.org/api/icon/ada/200',
        color: '#0033A0',
    },
    SOL: {
        symbol: 'SOL',
        name: 'Solana',
        icon: 'https://cryptoicons.org/api/icon/sol/200',
        color: '#00D4AA',
    },
    BNB: {
        symbol: 'BNB',
        name: 'Binance Coin',
        icon: 'https://cryptoicons.org/api/icon/bnb/200',
        color: '#F3BA2F',
    },
    LTC: {
        symbol: 'LTC',
        name: 'Litecoin',
        icon: 'https://cryptoicons.org/api/icon/ltc/200',
        color: '#345D9D',
    },
};

export const getAsset = (symbol: string): CryptoAsset | undefined => {
    return CRYPTO_ASSETS[symbol];
};

export const getAssetIcon = (symbol: string): string => {
    return CRYPTO_ASSETS[symbol]?.icon || 'https://cryptoicons.org/api/icon/generic/200';
};

export const getAssetColor = (symbol: string): string => {
    return CRYPTO_ASSETS[symbol]?.color || '#999999';
};
