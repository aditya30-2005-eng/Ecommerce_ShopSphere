import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';
import OrderStatusBadge from './OrderStatusBadge';

// Summary card used in the My Orders list.
const OrderCard = ({ order }) => (
  <div className="border rounded bg-white p-3 mb-3">
    <div className="d-flex flex-wrap justify-content-between align-items-start gap-2">
      <div>
        <div className="fw-semibold">Order #{order._id.slice(-8).toUpperCase()}</div>
        <div className="text-muted small">
          Placed on {new Date(order.createdAt).toLocaleDateString()} &middot; {order.orderItems.length} item(s)
        </div>
      </div>
      <OrderStatusBadge status={order.orderStatus} />
    </div>
    <div className="d-flex flex-wrap justify-content-between align-items-center mt-3">
      <span className="fw-bold">{formatCurrency(order.totalAmount)}</span>
      <Link to={`/orders/${order._id}`} className="btn btn-sm btn-outline-primary">
        View Details
      </Link>
    </div>
  </div>
);

export default OrderCard;
