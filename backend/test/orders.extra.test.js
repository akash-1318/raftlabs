import request from 'supertest';
import { createApp } from '../src/app';
import { InMemoryOrderRepository } from '../src/repositories/orderRepo';
import { MENU } from '../src/data/menu';
import { OrderService } from '../src/services/orderService';
function makeApp() {
    const service = new OrderService(new InMemoryOrderRepository(), MENU);
    const app = createApp(service);
    return { app, service };
}
describe('Orders API - edge cases', () => {
    it('returns 404 for unknown order id', async () => {
        const { app } = makeApp();
        const res = await request(app).get('/api/orders/ORD-NOT-EXIST');
        expect(res.status).toBe(404);
        expect(res.body.error).toBe('NOT_FOUND');
    });
    it('PATCH /status returns 404 for unknown order id', async () => {
        const { app } = makeApp();
        const res = await request(app).patch('/api/orders/ORD-NOT-EXIST/status').send({ status: 'PREPARING' });
        expect(res.status).toBe(404);
        expect(res.body.error).toBe('NOT_FOUND');
    });
    it('rejects invalid status in PATCH', async () => {
        const { app } = makeApp();
        const create = await request(app)
            .post('/api/orders')
            .send({
            customer: { name: 'Tirth', address: 'Ahmedabad', phone: '9876543210' },
            items: [{ menuItemId: '1', quantity: 1 }],
        });
        const id = create.body.orderId;
        const res = await request(app).patch(`/api/orders/${id}/status`).send({ status: 'INVALID_STATUS' });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('VALIDATION_ERROR');
    });
    it('rejects quantity < 1', async () => {
        const { app } = makeApp();
        const res = await request(app)
            .post('/api/orders')
            .send({
            customer: { name: 'Tirth', address: 'Ahmedabad', phone: '9876543210' },
            items: [{ menuItemId: '1', quantity: 0 }],
        });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('VALIDATION_ERROR');
    });
    it('rejects missing customer fields', async () => {
        const { app } = makeApp();
        const res = await request(app)
            .post('/api/orders')
            .send({
            customer: { name: '', address: '', phone: '' },
            items: [{ menuItemId: '1', quantity: 1 }],
        });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('VALIDATION_ERROR');
    });
});
