// Định nghĩa kiểu Wallet API response
export interface Wallet {
  id: number;
  user_id: number;
  asset: string;
  balance: number;
  locked_balance: number;
}

export interface WalletResponse {
  status: string;
  data: Wallet[];
}
