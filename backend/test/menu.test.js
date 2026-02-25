import request from 'supertest';
import { createApp } from '../src/app';
import { InMemoryOrderRepository } from '../src/repositories/orderRepo';
import { MENU } from '../src/data/menu';
import { OrderService } from '../src/services/orderService';
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
