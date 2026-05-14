import { createContext, useState, useCallback, ReactNode } from 'react';

interface WebSocketContextType {
  registerWebSocket: (id: string, ws: WebSocket) => void;
  unregisterWebSocket: (id: string) => void;
  disconnectAll: () => void;
}

export const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [connections, setConnections] = useState<Map<string, WebSocket>>(new Map());

  // Đăng ký WebSocket connection
  const registerWebSocket = useCallback((id: string, ws: WebSocket) => {
    setConnections((prev) => {
      const newMap = new Map(prev);
      newMap.set(id, ws);
      return newMap;
    });
  }, []);

  // Hủy đăng ký WebSocket connection
  const unregisterWebSocket = useCallback((id: string) => {
    setConnections((prev) => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);

  // Ngắt tất cả WebSocket connections
  const disconnectAll = useCallback(() => {
    setConnections((prev) => {
      prev.forEach((ws) => {
        try {
          ws.onclose = null; // Ngan auto-reconnect
          ws.close();
        } catch (error) {
          console.warn('[WebSocketContext] Error closing WebSocket:', error);
        }
      });
      return new Map();
    });
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        registerWebSocket,
        unregisterWebSocket,
        disconnectAll,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};
