import http from 'http';
import { createApp } from './app';
import { InMemoryOrderRepository } from './repositories/orderRepo';
import { MENU } from './data/menu';
import { OrderService } from './services/orderService';
import { WsHub } from './realtime/wsHub';

const PORT = Number(process.env.PORT ?? 4000);

const repo = new InMemoryOrderRepository();

const server = http.createServer();
const wsHub = new WsHub(server, '/ws');
const service = new OrderService(repo, MENU, wsHub);

const app = createApp(service);
server.on('request', app);

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${PORT}`);
  console.log(`WebSocket listening on ws://localhost:${PORT}/ws`);
});
