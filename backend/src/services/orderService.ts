import crypto from 'crypto';
import type { MenuItem, Order, OrderStatus } from '../domain/order';
import { ORDER_STATUSES } from '../domain/order';
import type { OrderRepository } from '../repositories/orderRepo';
import type { WsHub } from '../realtime/wsHub';

export class OrderService {
  constructor(
    private repo: OrderRepository,
    private menu: MenuItem[],
    private wsHub?: WsHub
  ) {}

  getMenu() {
    return this.menu;
  }

  createOrder(input: {
    customer: { name: string; address: string; phone: string };
    items: Array<{ menuItemId: string; quantity: number }>;
  }): Order {
    const now = new Date().toISOString();
    const id = `ORD-${crypto.randomUUID().toUpperCase()}`;

    const items = input.items.map(({ menuItemId, quantity }) => {
      const menuItem = this.menu.find((m) => m.id === menuItemId);
      if (!menuItem) {
        const err = new Error(`Menu item not found: ${menuItemId}`);
        (err as any).statusCode = 404;
        throw err;
      }
      return {
        menuItemId,
        quantity,
        unitPrice: menuItem.price,
        name: menuItem.name,
      };
    });

    const total = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);

    const order: Order = {
      id,
      customer: input.customer,
      items,
      total,
      status: 'ORDER_RECEIVED',
      createdAt: now,
      updatedAt: now,
      statusHistory: [{ status: 'ORDER_RECEIVED', at: now }],
    };

    this.repo.create(order);
    // start simulated updates
    this.simulateStatusProgression(order.id);

    return order;
  }

  getOrder(id: string): Order | null {
    return this.repo.getById(id);
  }

  updateStatus(id: string, status: OrderStatus): Order | null {
    const updated = this.repo.updateStatus(id, status);
    if (updated) this.emitStatus(updated.id, updated.status, updated.updatedAt);
    return updated;
  }

  private emitStatus(orderId: string, status: OrderStatus, updatedAt: string) {
    this.wsHub?.broadcastToOrder(orderId, { orderId, status, updatedAt });
  }

  private simulateStatusProgression(orderId: string) {
    // Don't block tests; timers are fine and can be faked.
    const steps: Array<{ status: OrderStatus; delayMs: number }> = [
      { status: 'PREPARING', delayMs: 5000 },
      { status: 'OUT_FOR_DELIVERY', delayMs: 10000 },
      { status: 'DELIVERED', delayMs: 15000 },
    ];

    for (const step of steps) {
      setTimeout(() => {
        const current = this.repo.getById(orderId);
        if (!current) return;
        // avoid moving backwards
        const currentIdx = ORDER_STATUSES.indexOf(current.status);
        const nextIdx = ORDER_STATUSES.indexOf(step.status);
        if (nextIdx <= currentIdx) return;
        const updated = this.repo.updateStatus(orderId, step.status);
        if (updated) this.emitStatus(orderId, updated.status, updated.updatedAt);
      }, step.delayMs);
    }
  }
}
