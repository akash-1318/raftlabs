import type { Server as HttpServer } from 'http';
import WebSocket, { WebSocketServer } from 'ws';

type ClientMeta = {
  socket: WebSocket;
  subscribedOrderIds: Set<string>;
};

export type OrderStatusEvent = {
  orderId: string;
  status: string;
  updatedAt: string;
};

export class WsHub {
  private wss: WebSocketServer;
  private clients = new Set<ClientMeta>();

  constructor(server: HttpServer, path = '/ws') {
    this.wss = new WebSocketServer({ server, path });

    this.wss.on('connection', (socket) => {
      const client: ClientMeta = { socket, subscribedOrderIds: new Set() };
      this.clients.add(client);

      socket.on('message', (raw) => {
        try {
          const msg = JSON.parse(raw.toString());
          if (msg?.type === 'SUBSCRIBE_ORDER' && typeof msg.orderId === 'string') {
            client.subscribedOrderIds.add(msg.orderId);
            socket.send(JSON.stringify({ type: 'SUBSCRIBED', orderId: msg.orderId }));
          }
          if (msg?.type === 'UNSUBSCRIBE_ORDER' && typeof msg.orderId === 'string') {
            client.subscribedOrderIds.delete(msg.orderId);
            socket.send(JSON.stringify({ type: 'UNSUBSCRIBED', orderId: msg.orderId }));
          }
        } catch {
          socket.send(JSON.stringify({ type: 'ERROR', message: 'Invalid JSON' }));
        }
      });

      socket.on('close', () => {
        this.clients.delete(client);
      });
    });
  }

  broadcastToOrder(orderId: string, event: OrderStatusEvent) {
    const payload = JSON.stringify({ type: 'ORDER_STATUS', ...event });
    for (const c of this.clients) {
      if (c.socket.readyState === WebSocket.OPEN && c.subscribedOrderIds.has(orderId)) {
        c.socket.send(payload);
      }
    }
  }
}
