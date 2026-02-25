import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MenuItem } from '../lib/types';

export type CartLine = {
  menuItem: MenuItem;
  quantity: number;
};

type CartState = {
  lines: CartLine[];
  add: (item: MenuItem) => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  total: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (item) =>
        set((s) => {
          const existing = s.lines.find((l) => l.menuItem.id === item.id);
          if (existing) {
            return { lines: s.lines.map((l) => (l.menuItem.id === item.id ? { ...l, quantity: l.quantity + 1 } : l)) };
          }
          return { lines: [...s.lines, { menuItem: item, quantity: 1 }] };
        }),
      inc: (id) =>
        set((s) => ({ lines: s.lines.map((l) => (l.menuItem.id === id ? { ...l, quantity: l.quantity + 1 } : l)) })),
      dec: (id) =>
        set((s) => ({
          lines: s.lines
            .map((l) => (l.menuItem.id === id ? { ...l, quantity: Math.max(1, l.quantity - 1) } : l))
            .filter(Boolean),
        })),
      remove: (id) => set((s) => ({ lines: s.lines.filter((l) => l.menuItem.id !== id) })),
      clear: () => set({ lines: [] }),
      total: () => get().lines.reduce((sum, l) => sum + l.menuItem.price * l.quantity, 0),
    }),
    { name: 'cart-v1' }
  )
);
