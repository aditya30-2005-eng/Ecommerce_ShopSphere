import React from 'react';

const statusVariant = {
  Pending: 'secondary',
  Processing: 'info',
  Shipped: 'primary',
  Delivered: 'success',
  Cancelled: 'danger',
};

const OrderStatusBadge = ({ status }) => (
  <span className={`badge bg-${statusVariant[status] || 'secondary'}`}>{status}</span>
);

export default OrderStatusBadge;
