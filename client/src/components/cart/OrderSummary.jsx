import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency';

// Shared price breakdown block used on the Cart and Checkout pages.
// `promo`, when supplied, adds an extra "Promo (CODE)" line and is already
// baked into `totals.total` by the caller.
const OrderSummary = ({ totals, promo, children }) => {
  const { itemsPrice, discount, shipping, total } = totals;

  return (
    <div className="border rounded p-3 bg-white">
      <h6 className="mb-3">Order Summary</h6>
      <div className="d-flex justify-content-between small mb-2">
        <span>Subtotal</span>
        <span>{formatCurrency(itemsPrice)}</span>
      </div>
      <div className="d-flex justify-content-between small mb-2 text-success">
        <span>Discount</span>
        <span>-{formatCurrency(discount)}</span>
      </div>
      {promo && promo.amount > 0 && (
        <div className="d-flex justify-content-between small mb-2 text-success">
          <span>Promo ({promo.code})</span>
          <span>-{formatCurrency(promo.amount)}</span>
        </div>
      )}
      <div className="d-flex justify-content-between small mb-2">
        <span>Delivery</span>
        <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
      </div>
      <hr />
      <div className="d-flex justify-content-between fw-bold fs-5 mb-3">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>
      {children}
    </div>
  );
};

export default OrderSummary;
