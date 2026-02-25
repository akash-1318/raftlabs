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

describe('Orders API', () => {
  it('creates an order', async () => {
    const { app } = makeApp();
    const res = await request(app)
      .post('/api/orders')
      .send({
        customer: { name: 'Tirth', address: 'Ahmedabad', phone: '9876543210' },
        items: [{ menuItemId: '1', quantity: 2 }],
      });

    expect(res.status).toBe(201);
    expect(res.body.orderId).toMatch(/^ORD-/);
    expect(res.body.status).toBe('ORDER_RECEIVED');
  });

  it('rejects empty cart', async () => {
    const { app } = makeApp();
    const res = await request(app)
      .post('/api/orders')
      .send({
        customer: { name: 'Tirth', address: 'Ahmedabad', phone: '9876543210' },
        items: [],
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  it('rejects invalid phone', async () => {
    const { app } = makeApp();
    const res = await request(app)
      .post('/api/orders')
      .send({
        customer: { name: 'Tirth', address: 'Ahmedabad', phone: '12' },
        items: [{ menuItemId: '1', quantity: 1 }],
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  it('returns 404 for unknown menu item', async () => {
    const { app } = makeApp();
    const res = await request(app)
      .post('/api/orders')
      .send({
        customer: { name: 'Tirth', address: 'Ahmedabad', phone: '9876543210' },
        items: [{ menuItemId: '999', quantity: 1 }],
      });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('NOT_FOUND');
  });

  it('fetches order by id', async () => {
    const { app } = makeApp();
    const create = await request(app)
      .post('/api/orders')
      .send({
        customer: { name: 'Tirth', address: 'Ahmedabad', phone: '9876543210' },
        items: [{ menuItemId: '1', quantity: 1 }],
      });
    const id = create.body.orderId;

    const res = await request(app).get(`/api/orders/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
    expect(res.body.items.length).toBe(1);
    expect(res.body.total).toBeGreaterThan(0);
  });

  it('updates status via PATCH', async () => {
    const { app } = makeApp();
    const create = await request(app)
      .post('/api/orders')
      .send({
        customer: { name: 'Tirth', address: 'Ahmedabad', phone: '9876543210' },
        items: [{ menuItemId: '1', quantity: 1 }],
      });
    const id = create.body.orderId;

    const res = await request(app).patch(`/api/orders/${id}/status`).send({ status: 'PREPARING' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('PREPARING');
    expect(res.body.statusHistory.length).toBeGreaterThanOrEqual(2);
  });
});
