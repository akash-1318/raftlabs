import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useCart } from '../store/cart';

function isValidPhone(p: string) {
  return /^[0-9]{10}$/.test(p);
}

export function CheckoutPage() {
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const total = useCart((s) => s.total)();
  const nav = useNavigate();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const payload = useMemo(() => {
    return {
      customer: { name: name.trim(), address: address.trim(), phone: phone.trim() },
      items: lines.map((l) => ({ menuItemId: l.menuItem.id, quantity: l.quantity })),
    };
  }, [name, address, phone, lines]);

  const canSubmit =
    payload.customer.name.length > 0 &&
    payload.customer.address.length > 0 &&
    isValidPhone(payload.customer.phone) &&
    payload.items.length > 0;

  const m = useMutation({
    mutationFn: () => api.createOrder(payload),
    onSuccess: (res) => {
      clear();
      nav(`/order/${res.orderId}`);
    },
  });

  if (lines.length === 0) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Checkout</h1>
        <div className="text-slate-600">Your cart is empty.</div>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold">Checkout</h1>
      <div className="mt-1 text-sm text-slate-600">Enter delivery details.</div>

      <div className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium">Name</label>
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Address</label>
          <textarea
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Delivery address"
            rows={3}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Phone</label>
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            placeholder="10-digit phone"
            inputMode="numeric"
          />
          {phone.length > 0 && !isValidPhone(phone) && (
            <div className="mt-1 text-xs text-red-600">Phone must be 10 digits.</div>
          )}
        </div>

        <div className="flex items-center justify-between rounded-xl border bg-white p-4">
          <div>
            <div className="text-sm text-slate-600">Total</div>
            <div className="text-lg font-semibold">₹{total}</div>
          </div>
          <button
            className="rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
            disabled={!canSubmit || m.isPending}
            onClick={() => m.mutate()}
          >
            {m.isPending ? 'Placing…' : 'Place order'}
          </button>
        </div>

        {m.isError && <div className="text-sm text-red-600">Failed: {(m.error as Error).message}</div>}
      </div>
    </div>
  );
}
