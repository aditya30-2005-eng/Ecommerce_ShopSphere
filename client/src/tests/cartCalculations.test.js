import { describe, it, expect } from 'vitest';
import { getUnitPrice, getItemSubtotal, calculateCartTotals } from '../utils/cartCalculations';

const product = (overrides = {}) => ({
  _id: '1',
  price: 1000,
  discountPrice: 0,
  ...overrides,
});

describe('getUnitPrice', () => {
  it('returns the regular price when there is no discount', () => {
    expect(getUnitPrice(product())).toBe(1000);
  });

  it('returns the discount price when one is set', () => {
    expect(getUnitPrice(product({ discountPrice: 800 }))).toBe(800);
  });
});

describe('getItemSubtotal', () => {
  it('multiplies unit price by quantity', () => {
    const item = { product: product({ discountPrice: 800 }), quantity: 3 };
    expect(getItemSubtotal(item)).toBe(2400);
  });
});

describe('calculateCartTotals', () => {
  it('calculates subtotal, discount, shipping and total for multiple items', () => {
    const items = [
      { product: product({ price: 1000, discountPrice: 800 }), quantity: 2 }, // 2000 / 1600
      { product: product({ price: 500, discountPrice: 0 }), quantity: 1 }, // 500 / 500
    ];
    const totals = calculateCartTotals(items);

    expect(totals.itemsPrice).toBe(2500); // 2000 + 500
    expect(totals.discount).toBe(400); // (1000-800)*2
    expect(totals.shipping).toBe(0); // discounted total (2100) > 999 threshold
    expect(totals.total).toBe(2100); // 1600 + 500
  });

  it('applies delivery charge below the free-shipping threshold', () => {
    const items = [{ product: product({ price: 500, discountPrice: 0 }), quantity: 1 }];
    const totals = calculateCartTotals(items);
    expect(totals.shipping).toBe(49);
    expect(totals.total).toBe(549);
  });

  it('returns all zeros for an empty cart', () => {
    const totals = calculateCartTotals([]);
    expect(totals).toEqual({ itemsPrice: 0, discount: 0, shipping: 0, total: 0 });
  });
});
