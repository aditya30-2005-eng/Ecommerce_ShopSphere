import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';
import { getUnitPrice, getItemSubtotal } from '../../utils/cartCalculations';
import { notify } from '../common/NotificationCenter';

// Single row in the cart list with a quantity stepper and remove button.
const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const { product, quantity } = item;
  const unitPrice = getUnitPrice(product);
  const [busy, setBusy] = useState(false);

  // Quantity/remove buttons previously called the context straight from
  // onClick with no error handling - if a request failed (e.g. asking for
  // more than the available stock) the button just did nothing visible.
  const runAction = async (action) => {
    setBusy(true);
    try {
      await action();
    } catch (err) {
      notify({ type: 'error', title: 'Couldn’t update cart', message: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="d-flex flex-wrap align-items-center border-bottom py-3 gap-3">
      <img
        src={product.images?.[0]}
        alt={product.name}
        style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }}
      />
      <div className="flex-grow-1" style={{ minWidth: 160 }}>
        <Link to={`/products/${product._id}`} className="text-dark fw-semibold text-decoration-none">
          {product.name}
        </Link>
        <div className="text-muted small">{formatCurrency(unitPrice)} each</div>
        {product.stock < quantity && (
          <div className="text-danger small">Only {product.stock} left in stock</div>
        )}
      </div>

      <div className="d-flex align-items-center border rounded">
        <button
          className="btn btn-sm"
          onClick={() => runAction(() => onUpdateQuantity(product._id, quantity - 1))}
          disabled={quantity <= 1 || busy}
          aria-label="Decrease quantity"
        >
          -
        </button>
        <span className="px-3">{quantity}</span>
        <button
          className="btn btn-sm"
          onClick={() => runAction(() => onUpdateQuantity(product._id, quantity + 1))}
          disabled={quantity >= product.stock || busy}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      <div className="fw-semibold" style={{ width: 100, textAlign: 'right' }}>
        {formatCurrency(getItemSubtotal(item))}
      </div>

      <button
        className="btn btn-sm btn-outline-danger"
        onClick={() => runAction(() => onRemove(product._id))}
        disabled={busy}
        aria-label={`Remove ${product.name} from cart`}
      >
        <i className="bi bi-trash"></i>
      </button>
    </div>
  );
};

export default CartItem;
