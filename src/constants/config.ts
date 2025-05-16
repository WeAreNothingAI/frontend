export const API_CONFIG = {
  BASE_URL: 'http://your-backend-url',
  WEBSOCKET_URL: 'ws://your-websocket-url',
  TIMEOUT: 10000,
} as const;

export const ROUTES = {
  HOME: 'Home',
  CHAT: 'Chat',
  PROFILE: 'Profile',
} as const;

export type RouteNames = typeof ROUTES[keyof typeof ROUTES];