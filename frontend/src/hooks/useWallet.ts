import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { Wallet } from '../types/wallet';

interface UseWalletReturn {
  wallets: Wallet[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useWallet = (): UseWalletReturn => {
  const { token, isAuthenticated } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWallet = async () => {
    if (!isAuthenticated || !token) {
      setError('Chưa đăng nhập');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[useWallet] Fetching wallets...');
      const response = await fetch('/api/v1/wallet', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('[useWallet] Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('[useWallet] Data:', data);

      if (data.status === 'success') {
        const normalizedWallets: Wallet[] = (Array.isArray(data.data) ? data.data : []).map(
          (item: any) => ({
            id: Number(item.id ?? item.ID ?? 0),
            user_id: Number(item.user_id ?? item.UserID ?? item.UserId ?? 0),
            asset: String(item.asset ?? item.Asset ?? ''),
            balance: Number(item.balance ?? item.Balance ?? 0),
            locked_balance: Number(item.locked_balance ?? item.LockedBalance ?? 0),
          })
        );

        setWallets(normalizedWallets);
      } else {
        throw new Error(data.message || 'Lỗi lấy dữ liệu ví');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Lỗi không xác định';
      console.error('[useWallet] Error:', errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch khi component mount hoặc token thay đổi
  useEffect(() => {
    if (isAuthenticated) {
      fetchWallet();
    }
  }, [isAuthenticated, token]);

  return {
    wallets,
    isLoading,
    error,
    refetch: fetchWallet,
  };
};
