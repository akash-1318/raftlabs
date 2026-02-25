import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../store/cart';

export function CartPage() {
  const lines = useCart((s) => s.lines);
  const inc = useCart((s) => s.inc);
  const dec = useCart((s) => s.dec);
  const remove = useCart((s) => s.remove);
  const total = useCart((s) => s.total)();

  const nav = useNavigate();

  if (lines.length === 0) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Cart</h1>
        <div className="text-slate-600">Your cart is empty.</div>
        <Link className="inline-block rounded bg-slate-900 px-3 py-2 text-white" to="/">
          Browse menu
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold">Cart</h1>
          <div className="text-sm text-slate-600">Review quantities before checkout.</div>
        </div>
        <button className="rounded bg-slate-900 px-3 py-2 text-white" onClick={() => nav('/checkout')}>
          Checkout
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {lines.map((l) => (
          <div key={l.menuItem.id} className="flex items-center gap-4 rounded-xl border bg-white p-4">
            <img className="h-16 w-16 rounded-lg object-cover" src={l.menuItem.image} alt={l.menuItem.name} />
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold">{l.menuItem.name}</div>
              <div className="text-sm text-slate-600">₹{l.menuItem.price} each</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="h-8 w-8 rounded bg-slate-100" onClick={() => dec(l.menuItem.id)} aria-label="Decrease">
                −
              </button>
              <div className="w-6 text-center text-sm font-semibold">{l.quantity}</div>
              <button className="h-8 w-8 rounded bg-slate-100" onClick={() => inc(l.menuItem.id)} aria-label="Increase">
                +
              </button>
            </div>
            <div className="w-20 text-right text-sm font-semibold">₹{l.menuItem.price * l.quantity}</div>
            <button className="text-sm text-red-600 hover:underline" onClick={() => remove(l.menuItem.id)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <div className="text-sm text-slate-600">Total</div>
        <div className="text-lg font-semibold">₹{total}</div>
      </div>
    </div>
  );
}
