import type { Order, OrderStatus } from '../domain/order.js';

export interface OrderRepository {
  create(order: Order): void;
  getById(id: string): Order | null;
  updateStatus(id: string, status: OrderStatus): Order | null;
  list(): Order[];
}

export class InMemoryOrderRepository implements OrderRepository {
  private orders = new Map<string, Order>();

  create(order: Order) {
    this.orders.set(order.id, order);
  }

  getById(id: string) {
    return this.orders.get(id) ?? null;
  }

  updateStatus(id: string, status: OrderStatus) {
    const order = this.orders.get(id);
    if (!order) return null;
    const now = new Date().toISOString();
    const updated: Order = {
      ...order,
      status,
      updatedAt: now,
      statusHistory: [...order.statusHistory, { status, at: now }],
    };
    this.orders.set(id, updated);
    return updated;
  }

  list() {
    return [...this.orders.values()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }
}
