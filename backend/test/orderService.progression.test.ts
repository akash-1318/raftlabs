import { InMemoryOrderRepository } from '../src/repositories/orderRepo';
import { MENU } from '../src/data/menu';
import { OrderService } from '../src/services/orderService';

describe('OrderService status progression', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('progresses ORDER_RECEIVED -> PREPARING -> OUT_FOR_DELIVERY -> DELIVERED', () => {
    const repo = new InMemoryOrderRepository();
    const service = new OrderService(repo, MENU);

    const order = service.createOrder({
      customer: { name: 'Tirth', address: 'Ahmedabad', phone: '9876543210' },
      items: [{ menuItemId: '1', quantity: 1 }],
    });

    expect(service.getOrder(order.id)?.status).toBe('ORDER_RECEIVED');

    jest.advanceTimersByTime(5000);
    expect(service.getOrder(order.id)?.status).toBe('PREPARING');

    jest.advanceTimersByTime(5000);
    expect(service.getOrder(order.id)?.status).toBe('OUT_FOR_DELIVERY');

    jest.advanceTimersByTime(5000);
    expect(service.getOrder(order.id)?.status).toBe('DELIVERED');

    const final = service.getOrder(order.id)!;
    expect(final.statusHistory.map((h) => h.status)).toEqual([
      'ORDER_RECEIVED',
      'PREPARING',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
    ]);
  });
});
