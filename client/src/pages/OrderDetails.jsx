import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import orderService from '../services/orderService';
import { formatCurrency } from '../utils/formatCurrency';
import OrderStatusBadge from '../components/order/OrderStatusBadge';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';

const OrderDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await orderService.getOrderById(id);
      setOrder(res.order);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <Loader text="Loading order..." />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;
  if (!order) return null;

  return (
    <Container className="py-5">
      {searchParams.get('success') && (
        <Alert variant="success">
          <i className="bi bi-check-circle-fill me-2"></i>
          Your order was placed successfully!
        </Alert>
      )}

      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Order #{order._id.slice(-8).toUpperCase()}</h3>
        <OrderStatusBadge status={order.orderStatus} />
      </div>

      <Row className="g-4">
        <Col lg={8}>
          <div className="border rounded bg-white p-3 mb-3">
            <h6 className="mb-3">Items</h6>
            {order.orderItems.map((item) => (
              <div key={item.product} className="d-flex align-items-center gap-3 border-bottom py-2">
                <img src={item.image} alt={item.name} style={{ width: 60, height: 60, objectFit: 'cover' }} className="rounded" />
                <div className="flex-grow-1">
                  <Link to={`/products/${item.product}`} className="text-dark text-decoration-none">
                    {item.name}
                  </Link>
                  <div className="text-muted small">
                    {item.quantity} x {formatCurrency(item.price)}
                  </div>
                </div>
                <div className="fw-semibold">{formatCurrency(item.price * item.quantity)}</div>
              </div>
            ))}
          </div>

          <Row className="g-3">
            <Col md={6}>
              <div className="border rounded bg-white p-3 h-100">
                <h6 className="mb-2">Shipping Address</h6>
                <p className="mb-0 small">
                  {order.shippingAddress.address}, {order.shippingAddress.city}
                  <br />
                  {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                  <br />
                  {order.shippingAddress.country}
                </p>
              </div>
            </Col>
            <Col md={6}>
              <div className="border rounded bg-white p-3 h-100">
                <h6 className="mb-2">Contact Info</h6>
                <p className="mb-0 small">
                  {order.contactInfo.name}
                  <br />
                  {order.contactInfo.email}
                  <br />
                  {order.contactInfo.phone}
                </p>
              </div>
            </Col>
          </Row>
        </Col>

        <Col lg={4}>
          <div className="border rounded bg-white p-3">
            <h6 className="mb-3">Payment Summary</h6>
            <div className="d-flex justify-content-between small mb-2">
              <span>Items</span>
              <span>{formatCurrency(order.itemsPrice)}</span>
            </div>
            <div className="d-flex justify-content-between small mb-2 text-success">
              <span>Discount</span>
              <span>-{formatCurrency(order.discountAmount)}</span>
            </div>
            {order.promoCode && (
              <div className="d-flex justify-content-between small mb-2 text-success">
                <span>Promo ({order.promoCode})</span>
                <span>-{formatCurrency(order.promoDiscount)}</span>
              </div>
            )}
            <div className="d-flex justify-content-between small mb-2">
              <span>Delivery</span>
              <span>{order.shippingPrice === 0 ? 'Free' : formatCurrency(order.shippingPrice)}</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between fw-bold fs-5 mb-3">
              <span>Total</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
            <div className="small text-muted">
              Payment Method: {order.paymentMethod}
              <br />
              Payment Status:{' '}
              <span className={order.paymentStatus === 'Paid' ? 'text-success' : 'text-warning'}>
                {order.paymentStatus}
              </span>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderDetails;
