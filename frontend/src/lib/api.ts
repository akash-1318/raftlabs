import type { MenuItem, Order } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message || `Request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

export const api = {
  getMenu: () => http<MenuItem[]>('/api/menu'),
  createOrder: (payload: {
    customer: { name: string; address: string; phone: string };
    items: Array<{ menuItemId: string; quantity: number }>;
  }) => http<{ orderId: string; status: string }>('/api/orders', { method: 'POST', body: JSON.stringify(payload) }),
  getOrder: (orderId: string) => http<Order>(`/api/orders/${orderId}`),
  apiBaseUrl: API_BASE_URL,
};
