import request from 'supertest';
import http from 'http';
import { createApp } from '../src/app.js';
import { InMemoryOrderRepository } from '../src/repositories/orderRepo.js';
import { MENU } from '../src/data/menu.js';
import { OrderService } from '../src/services/orderService.js';

describe('GET /api/menu', () => {
  it('returns menu list', async () => {
    const service = new OrderService(new InMemoryOrderRepository(), MENU);
    const app = createApp(service);
    const res = await request(app).get('/api/menu');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('name');
  });
});
