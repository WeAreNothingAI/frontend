import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = (): Socket => {
  if (socket) return socket;

  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || '';
  
  socket = io(WS_URL, {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    // 쿠키가 자동으로 전송되므로 별도 토큰 불필요
    // 필요시 auth나 query에 토큰 추가 가능
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  socket.on('error', (error: any) => {
    console.error('Socket error:', error);
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};