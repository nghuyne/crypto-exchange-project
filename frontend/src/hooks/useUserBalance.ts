import { useState, useEffect, useRef, useCallback } from 'react';

export interface CoinHolding {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  currentPrice: number;
  totalValue: number;
  icon: string;
  change24h: number;
}

export interface UserBalance {
  fiatBalance: number;
  currency: string;
  totalPortfolioValue: number;
  coins: CoinHolding[];
}

interface UseUserBalanceOptions {
  refreshInterval?: number;
  apiUrl?: string;
}

interface UseUserBalanceResult {
  balance: UserBalance | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUserBalance({
  refreshInterval = 30000,
  apiUrl = '/api/v1',
}: UseUserBalanceOptions = {}): UseUserBalanceResult {
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef(true);
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!isMountedRef.current) return;
    setIsLoading(true);
    setError(null);

    try {
      const [balanceRes, coinsRes] = await Promise.all([
        fetch(`${apiUrl}/user/balance`),
        fetch(`${apiUrl}/user/coins`),
      ]);

      if (!balanceRes.ok || !coinsRes.ok) {
        throw new Error('Failed to fetch balance data');
      }

      const balanceData = await balanceRes.json();
      const coinsData = await coinsRes.json();

      if (!isMountedRef.current) return;

      const userBalance: UserBalance = {
        fiatBalance: balanceData.data?.balance || 0,
        currency: balanceData.data?.currency || 'USD',
        totalPortfolioValue:
          (balanceData.data?.balance || 0) +
          (coinsData.data?.coins || []).reduce((sum: number, coin: any) => {
            return sum + (coin.currentPrice * coin.amount);
          }, 0),
        coins: (coinsData.data?.coins || []).map((coin: any) => ({
          id: coin.id,
          symbol: coin.symbol,
          name: coin.name,
          amount: coin.amount,
          currentPrice: coin.currentPrice,
          totalValue: coin.currentPrice * coin.amount,
          icon: coin.icon,
          change24h: coin.change24h || 0,
        })),
      };

      setBalance(userBalance);
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        console.error('[UserBalance] Fetch error:', err);
      }
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchBalance();

    if (refreshInterval > 0) {
      refreshTimerRef.current = setInterval(fetchBalance, refreshInterval);
    }

    return () => {
      isMountedRef.current = false;
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [refreshInterval, fetchBalance]);

  return {
    balance,
    isLoading,
    error,
    refetch: fetchBalance,
  };
}
