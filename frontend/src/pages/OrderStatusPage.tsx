import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import type { OrderStatus } from '../lib/types';
import { StatusPill } from '../components/StatusPill';
import { makeWsUrl, type WsMessage } from '../lib/ws';

const stepOrder: OrderStatus[] = ['ORDER_RECEIVED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];

export function OrderStatusPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = id ?? '';

  const { data: order, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => api.getOrder(orderId),
    enabled: !!orderId,
    refetchInterval: 5000, // fallback polling
  });

  const [liveStatus, setLiveStatus] = useState<OrderStatus | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const status = liveStatus ?? order?.status;

  const progress = useMemo(() => {
    if (!status) return 0;
    const idx = stepOrder.indexOf(status);
    return Math.max(0, idx) / (stepOrder.length - 1);
  }, [status]);

  useEffect(() => {
    if (!orderId) return;
    const wsUrl = makeWsUrl(api.apiBaseUrl);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'SUBSCRIBE_ORDER', orderId }));
    };

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data) as WsMessage;
        if (msg.type === 'ORDER_STATUS' && msg.orderId === orderId) {
          setLiveStatus(msg.status as OrderStatus);
        }
      } catch {
        // ignore
      }
    };

    return () => {
      try {
        ws.send(JSON.stringify({ type: 'UNSUBSCRIBE_ORDER', orderId }));
      } catch {}
      ws.close();
    };
  }, [orderId]);

  if (isLoading) return <div className="text-slate-600">Loading order…</div>;

  if (isError) {
    return (
      <div className="space-y-2">
        <div className="text-red-600">Failed to load order: {(error as Error).message}</div>
        <button className="rounded bg-slate-900 px-3 py-2 text-white" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  if (!order) return <div className="text-slate-600">Order not found.</div>;

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Order Status</h1>
          <div className="text-sm text-slate-600">Order ID: <span className="font-mono">{order.id}</span></div>
        </div>
        <StatusPill status={(status ?? order.status) as OrderStatus} />
      </div>

      <div className="rounded-xl border bg-white p-4">
        <div className="text-sm font-medium">Progress</div>
        <div className="mt-2 h-2 w-full rounded bg-slate-100">
          <div className="h-2 rounded bg-slate-900" style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="mt-2 text-xs text-slate-600">
          Real-time via WebSocket (polling fallback every 5s).
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <div className="text-sm font-medium">Delivery</div>
        <div className="mt-1 text-sm text-slate-700">{order.customer.name}</div>
        <div className="text-sm text-slate-600">{order.customer.address}</div>
        <div className="text-sm text-slate-600">{order.customer.phone}</div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <div className="text-sm font-medium">Items</div>
        <div className="mt-3 space-y-2">
          {order.items.map((it) => (
            <div key={it.menuItemId} className="flex items-center justify-between text-sm">
              <div className="text-slate-700">{it.name} × {it.quantity}</div>
              <div className="font-semibold">₹{it.unitPrice * it.quantity}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between border-t pt-3 text-sm">
          <div className="text-slate-600">Total</div>
          <div className="font-semibold">₹{order.total}</div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <div className="text-sm font-medium">Timeline</div>
        <ol className="mt-3 space-y-2">
          {order.statusHistory.map((h, idx) => (
            <li key={idx} className="flex items-center justify-between text-sm">
              <div className="text-slate-700">{h.status}</div>
              <div className="font-mono text-xs text-slate-500">{new Date(h.at).toLocaleTimeString()}</div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
