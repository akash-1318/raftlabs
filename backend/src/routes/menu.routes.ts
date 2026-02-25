import { Router } from 'express';
import type { OrderService } from '../services/orderService';

export const menuRouter = (service: OrderService) => {
  const r = Router();

  r.get('/', (_req, res) => {
    res.json(service.getMenu());
  });

  return r;
};
