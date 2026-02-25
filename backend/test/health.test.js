import request from 'supertest';
import { createApp } from '../src/app';
import { InMemoryOrderRepository } from '../src/repositories/orderRepo';
import { MENU } from '../src/data/menu';
import { OrderService } from '../src/services/orderService';
describe('Health + Docs', () => {
    it('GET /health returns ok', async () => {
        const service = new OrderService(new InMemoryOrderRepository(), MENU);
        const app = createApp(service);
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ ok: true });
    });
    it('GET /api/docs.json returns OpenAPI document', async () => {
        const service = new OrderService(new InMemoryOrderRepository(), MENU);
        const app = createApp(service);
        const res = await request(app).get('/api/docs.json');
        expect(res.status).toBe(200);
        expect(res.body.openapi).toBe('3.0.3');
        expect(res.body.paths).toHaveProperty('/api/menu');
    });
});
