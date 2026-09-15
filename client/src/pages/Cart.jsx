import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import useCart from '../hooks/useCart';
import CartItem from '../components/cart/CartItem';
import OrderSummary from '../components/cart/OrderSummary';
import EmptyState from '../components/common/EmptyState';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';

const Cart = () => {
  const { items, loading, error, totals, updateItem, removeItem, refreshCart } = useCart();
  const navigate = useNavigate();

  if (loading) return <Loader text="Loading your cart..." />;
  if (error) return <ErrorMessage message={error} onRetry={refreshCart} />;

  if (items.length === 0) {
    return (
      <Container className="py-5">
        <EmptyState
          icon="bi-cart-x"
          title="Your cart is empty"
          message="Looks like you haven't added anything to your cart yet."
          actionLabel="Start Shopping"
          actionTo="/products"
        />
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h3 className="mb-4">Shopping Cart</h3>
      <Row className="g-4">
        <Col lg={8}>
          <div className="border rounded bg-white p-3">
            {items.map((item) => (
              <CartItem
                key={item.product._id}
                item={item}
                onUpdateQuantity={updateItem}
                onRemove={removeItem}
              />
            ))}
          </div>
          <Link to="/products" className="d-inline-block mt-3 small">
            &larr; Continue Shopping
          </Link>
        </Col>
        <Col lg={4}>
          <OrderSummary totals={totals}>
            <button className="btn btn-primary w-100" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </button>
          </OrderSummary>
        </Col>
      </Row>
    </Container>
  );
};

export default Cart;
