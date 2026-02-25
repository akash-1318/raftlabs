import type { OrderStatus } from '../lib/types';
import clsx from 'clsx';

const labels: Record<OrderStatus, string> = {
  ORDER_RECEIVED: 'Order Received',
  PREPARING: 'Preparing',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
};

export function StatusPill({ status }: { status: OrderStatus }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
        status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
      )}
    >
      {labels[status]}
    </span>
  );
}
