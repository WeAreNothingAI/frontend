import io, { Socket } from 'socket.io-client';
import { API_CONFIG } from '../constants/config';

type SocketEventCallback = (...args: any[]) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, SocketEventCallback> = new Map();

  connect(url: string = API_CONFIG.WEBSOCKET_URL): void {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    this.socket = io(url, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('Disconnected from WebSocket server:', reason);
    });

    this.socket.on('error', (error: Error) => {
      console.error('WebSocket error:', error);
    });

    // 등록된 모든 리스너 재등록
    this.listeners.forEach((callback, event) => {
      this.socket?.on(event, callback);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected');
    }
  }

  on(event: string, callback: SocketEventCallback): void {
    this.listeners.set(event, callback);
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: SocketEventCallback): void {
    this.listeners.delete(event);
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  removeAllListeners(): void {
    this.listeners.clear();
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export default new WebSocketService();