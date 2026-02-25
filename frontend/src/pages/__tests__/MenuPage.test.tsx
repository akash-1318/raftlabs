import { render, screen } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../../lib/queryClient';
import { MenuPage } from '../MenuPage';

vi.mock('../../lib/api', () => ({
  api: {
    getMenu: async () => [
      { id: '1', name: 'Pizza', description: 'Yum', price: 100, image: 'x' },
    ],
  },
}));

describe('MenuPage', () => {
  it('renders menu items', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MenuPage />
      </QueryClientProvider>
    );

    expect(await screen.findByText('Pizza')).toBeInTheDocument();
    expect(screen.getByText('₹100')).toBeInTheDocument();
  });
});
