import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { CheckoutPage } from '../CheckoutPage';
import { OrderStatusPage } from '../OrderStatusPage';
import { Layout } from '../../components/Layout';
import { useCart } from '../../store/cart';

const item1 = { id: '1', name: 'Pizza', description: 'Cheese', price: 100, image: 'x' };

function renderWithRouter(initialPath = '/checkout') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const router = createMemoryRouter(
    [
      {
        element: <Layout />,
        children: [
          { path: '/checkout', element: <CheckoutPage /> },
          { path: '/order/:id', element: <OrderStatusPage /> },
        ],
      },
    ],
    { initialEntries: [initialPath] }
  );

  render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );

  return { router };
}

describe('CheckoutPage', () => {
  beforeEach(() => {
    localStorage.clear();
    useCart.getState().clear();
    useCart.getState().add(item1);

    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: any, init?: any) => {
        const url = String(input);
        if (url.includes('/api/orders') && init?.method === 'POST') {
          return { ok: true, json: async () => ({ orderId: 'ORD-TEST123', status: 'ORDER_RECEIVED' }) } as any;
        }
        if (url.includes('/api/orders/ORD-TEST123')) {
          return {
            ok: true,
            json: async () => ({
              id: 'ORD-TEST123',
              customer: { name: 'Tirth', address: 'Ahmedabad', phone: '9876543210' },
              items: [{ menuItemId: '1', quantity: 1, unitPrice: 100, name: 'Pizza' }],
              total: 100,
              status: 'ORDER_RECEIVED',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              statusHistory: [{ status: 'ORDER_RECEIVED', at: new Date().toISOString() }],
            }),
          } as any;
        }
        return { ok: false, status: 404, json: async () => ({ message: 'Not found' }) } as any;
      })
    );

    // WebSocket is created on OrderStatusPage mount; keep it no-op.
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

  it('enables submit only when form is valid and navigates to order page on success', async () => {
    const user = userEvent.setup();
    const { router } = renderWithRouter();

    // button should start disabled
    const btn = screen.getByRole('button', { name: /place order/i });
    expect(btn).toBeDisabled();

    await user.type(screen.getByPlaceholderText(/your name/i), 'Tirth');
    await user.type(screen.getByPlaceholderText(/delivery address/i), 'Ahmedabad');
    await user.type(screen.getByPlaceholderText(/10-digit phone/i), '9876543210');

    expect(btn).toBeEnabled();

    await user.click(btn);

    // Wait for navigation
    await screen.findByText(/Order Status/i);
    expect(router.state.location.pathname).toBe('/order/ORD-TEST123');
  });
});
