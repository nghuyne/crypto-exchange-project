import { createContext, useState, useEffect, ReactNode } from 'react';

// Định nghĩa kiểu User
export interface User {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
}

// Định nghĩa kiểu AuthContext
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, full_name: string) => Promise<void>;
}

// Tạo context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Kiểm tra token khi ứng dụng khởi chạy
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');

      if (storedToken) {
        setToken(storedToken);

        try {
          // Gọi API /api/v1/me để lấy thông tin user
          const response = await fetch('/api/v1/me', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${storedToken}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.data);
            setIsAuthenticated(true);
          } else {
            // Token không hợp lệ, xóa nó
            localStorage.removeItem('auth_token');
            setToken(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Lỗi kiểm tra token:', error);
          localStorage.removeItem('auth_token');
          setToken(null);
          setIsAuthenticated(false);
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Hàm login
  const login = async (email: string, password: string) => {
    console.log('[AuthContext] login() called:', { email });
    try {
      const response = await fetch('/api/v1/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      console.log('[AuthContext] login response status:', response.status);
      const data = await response.json();
      console.log('[AuthContext] login response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }

      // Lưu token vào localStorage và state
      const newToken = data.data.token;
      console.log('[AuthContext] token received, calling /api/v1/me');
      localStorage.setItem('auth_token', newToken);
      setToken(newToken);

      // Gọi /api/v1/me để lấy user info
      const meResponse = await fetch('/api/v1/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${newToken}`,
        },
      });

      console.log('[AuthContext] /api/v1/me response status:', meResponse.status);
      if (meResponse.ok) {
        const meData = await meResponse.json();
        console.log('[AuthContext] user data:', meData.data);
        setUser(meData.data);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('[AuthContext] login error:', error);
      throw error;
    }
  };

  // Hàm register
  const register = async (email: string, password: string, full_name: string) => {
    try {
      const response = await fetch('/api/v1/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Đăng ký thất bại');
      }

      // Tự động đăng nhập sau khi đăng ký thành công
      await login(email, password);
    } catch (error) {
      throw error;
    }
  };

  // Hàm logout
  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
