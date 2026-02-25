import { describe, it, expect, beforeEach } from 'vitest';
import { useCart } from '../cart';

const item1 = { id: '1', name: 'Pizza', description: 'Cheese', price: 100, image: 'x' };
const item2 = { id: '2', name: 'Burger', description: 'Veg', price: 50, image: 'y' };

describe('cart store', () => {
  beforeEach(() => {
    localStorage.clear();
    useCart.getState().clear();
  });

  it('adds items and increments quantity if same item is added again', () => {
    useCart.getState().add(item1);
    useCart.getState().add(item1);
    const lines = useCart.getState().lines;
    expect(lines).toHaveLength(1);
    expect(lines[0].quantity).toBe(2);
  });

  it('decrements but never goes below 1', () => {
    useCart.getState().add(item1);
    useCart.getState().dec('1');
    expect(useCart.getState().lines[0].quantity).toBe(1);
  });

  it('computes total correctly', () => {
    useCart.getState().add(item1); // 1 * 100
    useCart.getState().add(item2); // 1 * 50
    useCart.getState().inc('2');   // 2 * 50
    expect(useCart.getState().total()).toBe(200);
  });

  it('removes item', () => {
    useCart.getState().add(item1);
    useCart.getState().remove('1');
    expect(useCart.getState().lines).toHaveLength(0);
  });
});
