import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { OrderStatusPage } from '../OrderStatusPage';
import { Layout } from '../../components/Layout';

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const router = createMemoryRouter(
    [
      {
        element: <Layout />,
        children: [{ path: '/order/:id', element: <OrderStatusPage /> }],
      },
    ],
    { initialEntries: ['/order/ORD-XYZ'] }
  );

  render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

describe('OrderStatusPage', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: any) => {
        const url = String(input);
        if (url.includes('/api/orders/ORD-XYZ')) {
          return {
            ok: true,
            json: async () => ({
              id: 'ORD-XYZ',
              customer: { name: 'Tirth', address: 'Ahmedabad', phone: '9876543210' },
              items: [{ menuItemId: '1', quantity: 2, unitPrice: 100, name: 'Pizza' }],
              total: 200,
              status: 'PREPARING',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              statusHistory: [
                { status: 'ORDER_RECEIVED', at: new Date().toISOString() },
                { status: 'PREPARING', at: new Date().toISOString() },
              ],
            }),
          } as any;
        }
        return { ok: false, status: 404, json: async () => ({ message: 'Not found' }) } as any;
      })
    );

    // Minimal WebSocket mock
    vi.stubGlobal('WebSocket', class {
      onopen: any;
      onmessage: any;
      constructor() {
        setTimeout(() => this.onopen?.(), 0);
      }
      send() {}
      close() {}
    } as any);
  });

  it('renders order details', async () => {
    renderPage();

    await screen.findByText(/Order Status/i);
    expect(screen.getByText(/Order ID:/i)).toBeInTheDocument();
    expect(screen.getByText('Pizza × 2')).toBeInTheDocument();
    expect(screen.getByText('₹200')).toBeInTheDocument();
    expect(screen.getByText('PREPARING')).toBeInTheDocument();
  });
});
