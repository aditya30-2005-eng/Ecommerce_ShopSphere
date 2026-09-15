import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import orderService from '../services/orderService';
import OrderCard from '../components/order/OrderCard';
import EmptyState from '../components/common/EmptyState';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await orderService.getMyOrders();
      setOrders(res.orders);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Container className="py-5">
      <h3 className="mb-4">My Orders</h3>
      {loading && <Loader text="Loading your orders..." />}
      {error && <ErrorMessage message={error} onRetry={load} />}
      {!loading && !error && orders.length === 0 && (
        <EmptyState
          icon="bi-receipt"
          title="No orders yet"
          message="When you place an order, it will show up here."
          actionLabel="Start Shopping"
          actionTo="/products"
        />
      )}
      {!loading && !error && orders.map((order) => <OrderCard key={order._id} order={order} />)}
    </Container>
  );
};

export default MyOrders;
