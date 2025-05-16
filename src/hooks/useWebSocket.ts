import { useEffect, useRef } from 'react';
import WebSocketService from '../services/websocket';

type SocketEventCallback = (...args: any[]) => void;

interface UseWebSocketReturn {
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: SocketEventCallback) => void;
  off: (event: string, callback?: SocketEventCallback) => void;
}

const useWebSocket = (): UseWebSocketReturn => {
  const isConnected = useRef(false);

  useEffect(() => {
    if (!isConnected.current) {
      WebSocketService.connect();
      isConnected.current = true;
    }

    return () => {
      WebSocketService.removeAllListeners();
    };
  }, []);

  const emit = (event: string, data?: any): void => {
    WebSocketService.emit(event, data);
  };

  const on = (event: string, callback: SocketEventCallback): void => {
    WebSocketService.on(event, callback);
  };

  const off = (event: string, callback?: SocketEventCallback): void => {
    WebSocketService.off(event, callback);
  };

  return { emit, on, off };
};

export default useWebSocket;