import { Router } from 'express';
import { validateBody } from '../middleware/validate.js';
import { createOrderSchema, patchStatusSchema } from '../validators/orderSchemas.js';
import type { OrderService } from '../services/orderService.js';
import type { OrderStatus } from '../domain/order.js';

export const orderRouter = (service: OrderService) => {
  const r = Router();

  r.post('/', validateBody(createOrderSchema), (req, res, next) => {
    try {
      const order = service.createOrder(req.body);
      res.status(201).json({ orderId: order.id, status: order.status });
    } catch (e: any) {
      if (e?.statusCode) return res.status(e.statusCode).json({ error: 'NOT_FOUND', message: e.message });
      next(e);
    }
  });

  r.get('/:id', (req, res) => {
    const order = service.getOrder(req.params.id);
    if (!order) return res.status(404).json({ error: 'NOT_FOUND', message: 'Order not found' });
    res.json(order);
  });

  // Optional SSE stream for order updates (simple real-time alternative)
  r.get('/:id/events', (req, res) => {
    const orderId = req.params.id;
    const order = service.getOrder(orderId);
    if (!order) return res.status(404).json({ error: 'NOT_FOUND', message: 'Order not found' });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // initial event
    res.write(`event: status\n`);
    res.write(`data: ${JSON.stringify({ orderId, status: order.status, updatedAt: order.updatedAt })}\n\n`);

    // naive heartbeat to keep connection alive
    const interval = setInterval(() => {
      res.write(`event: ping\n`);
      res.write(`data: {}\n\n`);
    }, 15000);

    req.on('close', () => clearInterval(interval));
  });

  // Admin/testing endpoint
  r.patch('/:id/status', validateBody(patchStatusSchema), (req, res) => {
    const updated = service.updateStatus(req.params.id, req.body.status as OrderStatus);
    if (!updated) return res.status(404).json({ error: 'NOT_FOUND', message: 'Order not found' });
    res.json(updated);
  });

  return r;
};
