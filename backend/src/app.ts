import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { menuRouter } from './routes/menu.routes';
import { orderRouter } from './routes/order.routes';
import { notFound, errorHandler } from './middleware/errorHandler';
import type { OrderService } from './services/orderService';
import { openapiSpec } from './docs/openapi';

export function createApp(service: OrderService) {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }));
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('dev'));

  app.get('/health', (_req, res) => res.json({ ok: true }));

  // Swagger
  app.get('/api/docs.json', (_req, res) => res.json(openapiSpec));
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(openapiSpec, {
      explorer: true,
      customSiteTitle: 'Order Management API Docs',
    })
  );

  app.use('/api/menu', menuRouter(service));
  app.use('/api/orders', orderRouter(service));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
