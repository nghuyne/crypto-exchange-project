import { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { WebSocketContext } from '../context/WebSocketContext';

// Derive WebSocket URL tu window.location de hoat dong dung moi moi truong.
// Tai sao khong hardcode? ws://localhost:8080 chi dung tren may dev,
// fail ngay khi deploy len server khac hoac dung HTTPS (phai la wss://).
// Uu tien: REACT_APP_WS_URL (env var) > tu dong derive tu hostname:8080.
const _wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const DEFAULT_WS_URL =
  process.env.REACT_APP_WS_URL ??
  `${_wsProtocol}//${window.location.hostname}:8080/ws`;

// ============================================================
// useOrderBook — Hook quan ly Order Book real-time
//
// Tai sao dung WebSocket thay vi polling?
// Polling (setInterval) luon gui request du co data moi hay khong -> ton bandwidth.
// WebSocket chi nhan du lieu khi co su kien thuc su (TRADE_EXECUTED) -> hieu qua hon,
// orderbook cap nhat ngay lap tuc khi khop lenh, khong phai doi den vong poll tiep theo.
//
// Cach hoat dong:
//   1. Goi REST API /market/orderbook de lay snapshot ban dau
//   2. Mo ket noi WebSocket den server
//   3. Khi nhan su kien TRADE_EXECUTED cung symbol -> goi lai REST de lay data moi
//   4. Fallback: neu WS mat ket noi -> tu dong reconnect sau 3s
// ============================================================

export interface OrderLevel {
  Price: number;
  Quantity: number;
  Total: number;
}

export interface OrderBook {
  bids: OrderLevel[]; // Lenh mua — sap xep gia giam dan
  asks: OrderLevel[]; // Lenh ban — sap xep gia tang dan
}

interface UseOrderBookOptions {
  symbol: string;
  wsUrl?: string; // WebSocket URL — mac dinh tu dong derive tu window.location
}

interface UseOrderBookResult {
  bids: OrderLevel[];
  asks: OrderLevel[];
  isLoading: boolean;
  isConnected: boolean; // Trang thai WebSocket
  lastUpdated: Date | null;
  refetch: () => void;
}

export function useOrderBook({
  symbol,
  wsUrl = DEFAULT_WS_URL,
}: UseOrderBookOptions): UseOrderBookResult {
  const wsCtx = useContext(WebSocketContext);
  const [bids, setBids] = useState<OrderLevel[]>([]);
  const [asks, setAsks] = useState<OrderLevel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const wsIdRef = useRef(`orderbook-${symbol}`); // ID để track WebSocket

  // --- Fetch orderbook tu REST API ---
  const fetchOrderBook = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/market/orderbook?symbol=${symbol}`);
      if (!res.ok) return;
      const result = await res.json();
      if (!isMountedRef.current) return;

      if (result.data?.bids) {
        setBids(result.data.bids.map((b: any) => ({
          Price: Number(b.price ?? b.Price ?? 0),
          Quantity: Number((b.quantity ?? b.Quantity ?? 0) - (b.filled ?? b.Filled ?? 0)),
          Total: Number(b.price ?? b.Price ?? 0) * Number((b.quantity ?? b.Quantity ?? 0) - (b.filled ?? b.Filled ?? 0)),
        })));
      }
      if (result.data?.asks) {
        setAsks(result.data.asks.map((a: any) => ({
          Price: Number(a.price ?? a.Price ?? 0),
          Quantity: Number((a.quantity ?? a.Quantity ?? 0) - (a.filled ?? a.Filled ?? 0)),
          Total: Number(a.price ?? a.Price ?? 0) * Number((a.quantity ?? a.Quantity ?? 0) - (a.filled ?? a.Filled ?? 0)),
        })));
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.warn('[OrderBook] Fetch error:', err);
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [symbol]);

  // --- Mo ket noi WebSocket ---
  const connectWebSocket = useCallback(() => {
    // Dong ket noi cu neu con ton tai
    if (wsRef.current) {
      wsRef.current.onclose = null; // Ngan auto-reconnect khi dong chu dong
      wsRef.current.close();
    }

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!isMountedRef.current) return;
      setIsConnected(true);
      // Dang ky WebSocket voi context
      if (wsCtx) {
        wsCtx.registerWebSocket(wsIdRef.current, ws);
      }
      console.log('[OrderBook] WebSocket connected');
    };

    ws.onmessage = (event) => {
      if (!isMountedRef.current) return;
      try {
        const msg = JSON.parse(event.data);
        // Chi refetch khi co TRADE khop tren dung symbol nay
        // Tai sao check symbol? De tranh fetch thua khi co nhieu cap giao dich
        if (msg.type === 'TRADE_EXECUTED' && msg.symbol === symbol) {
          fetchOrderBook();
        }
      } catch {
        // Ignore invalid JSON
      }
    };

    ws.onclose = () => {
      if (!isMountedRef.current) return;
      setIsConnected(false);
      // Huy dang ky WebSocket
      if (wsCtx) {
        wsCtx.unregisterWebSocket(wsIdRef.current);
      }
      console.log('[OrderBook] WebSocket disconnected, reconnecting in 3s...');
      // Tu dong ket noi lai sau 3 giay
      reconnectTimerRef.current = setTimeout(() => {
        if (isMountedRef.current) connectWebSocket();
      }, 3000);
    };

    ws.onerror = () => {
      // onerror luon di kem voi onclose, nen khong can xu ly them
      setIsConnected(false);
    };
  }, [symbol, wsUrl, fetchOrderBook, wsCtx]);

  // --- Khoi chay khi mount / doi symbol ---
  useEffect(() => {
    isMountedRef.current = true;
    setIsLoading(true);
    fetchOrderBook();
    connectWebSocket();

    return () => {
      isMountedRef.current = false;
      // Cleanup khi component unmount
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // Ngan reconnect sau khi unmount
        wsRef.current.close();
      }
      // Huy dang ky WebSocket
      if (wsCtx) {
        wsCtx.unregisterWebSocket(wsIdRef.current);
      }
    };
  }, [symbol]); // Chi re-run khi symbol thay doi

  return {
    bids,
    asks,
    isLoading,
    isConnected,
    lastUpdated,
    refetch: fetchOrderBook,
  };
}
