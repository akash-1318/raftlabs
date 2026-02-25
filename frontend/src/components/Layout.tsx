import { Link, Outlet } from 'react-router-dom';
import { useCart } from '../store/cart';

export function Layout() {
  const count = useCart((s) => s.lines.reduce((sum, l) => sum + l.quantity, 0));
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-semibold">Food Order</Link>
          <nav className="flex items-center gap-4">
            <Link to="/" className="text-sm text-slate-700 hover:underline">Menu</Link>
            <Link to="/cart" className="text-sm text-slate-700 hover:underline">Cart ({count})</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
