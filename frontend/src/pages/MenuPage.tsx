import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useCart } from '../store/cart';

export function MenuPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['menu'],
    queryFn: api.getMenu,
  });

  const add = useCart((s) => s.add);

  if (isLoading) return <div className="text-slate-600">Loading menu…</div>;
  if (isError) {
    return (
      <div className="space-y-2">
        <div className="text-red-600">Failed to load menu: {(error as Error).message}</div>
        <button className="rounded bg-slate-900 px-3 py-2 text-white" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  if (!data?.length) return <div className="text-slate-600">No items available.</div>;

  return (
    <div>
      <h1 className="text-xl font-semibold">Menu</h1>
      <p className="text-sm text-slate-600">Add items to cart and checkout.</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {data.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <img
              src={item.image}
              alt={item.name}
              className="h-40 w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'https://via.placeholder.com/600x400?text=Food+Item';
              }}
            />
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{item.name}</div>
                  <div className="mt-1 text-sm text-slate-600">{item.description}</div>
                </div>
                <div className="text-sm font-semibold">₹{item.price}</div>
              </div>
              <button
                className="mt-4 w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
                onClick={() => add(item)}
              >
                Add to cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
