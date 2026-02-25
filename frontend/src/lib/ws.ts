export type WsMessage =
  | { type: 'SUBSCRIBED'; orderId: string }
  | { type: 'UNSUBSCRIBED'; orderId: string }
  | { type: 'ORDER_STATUS'; orderId: string; status: string; updatedAt: string }
  | { type: 'ERROR'; message: string };

export function makeWsUrl(apiBaseUrl: string) {
  // http://localhost:4000 -> ws://localhost:4000
  const u = new URL(apiBaseUrl);
  u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
  u.pathname = '/ws';
  return u.toString();
}
