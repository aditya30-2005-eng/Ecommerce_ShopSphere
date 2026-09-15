import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Alert, Button } from 'react-bootstrap';
import useAuth from '../hooks/useAuth';
import useCart from '../hooks/useCart';
import OrderSummary from '../components/cart/OrderSummary';
import EmptyState from '../components/common/EmptyState';
import paymentService from '../services/paymentService';
import orderService from '../services/orderService';
import promoService from '../services/promoService';
import { loadRazorpayScript } from '../utils/loadRazorpayScript';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
};

// Drives the full checkout -> Razorpay payment -> verification flow.
// The backend recalculates every price (and re-validates any promo code)
// from MongoDB; this page never sends a total to be trusted directly for
// payment purposes.
const Checkout = () => {
  const { user } = useAuth();
  const { items, totals, clearCartLocally, refreshCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({ ...initialForm, name: user?.name || '', email: user?.email || '' });
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null); // { code, promoDiscount }
  const [promoError, setPromoError] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  if (items.length === 0) {
    return (
      <Container className="py-5">
        <EmptyState
          icon="bi-cart-x"
          title="Your cart is empty"
          message="Add some products before checking out."
          actionLabel="Browse Products"
          actionTo="/products"
        />
      </Container>
    );
  }

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoError('');
    setApplyingPromo(true);
    try {
      const res = await promoService.applyPromoCode(promoInput.trim());
      setAppliedPromo({ code: res.code, promoDiscount: res.promoDiscount });
    } catch (err) {
      setAppliedPromo(null);
      setPromoError(err.message);
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoError('');
  };

  const buildPayload = () => ({
    contactInfo: { name: form.name, email: form.email, phone: form.phone },
    shippingAddress: {
      address: form.address,
      city: form.city,
      state: form.state,
      postalCode: form.postalCode,
      country: form.country,
    },
    promoCode: appliedPromo?.code,
  });

  const validate = () => {
    const required = ['name', 'email', 'phone', 'address', 'city', 'state', 'postalCode', 'country'];
    const missing = required.filter((field) => !form[field]?.trim());
    if (missing.length > 0) {
      setError('Please fill in all required fields.');
      return false;
    }
    return true;
  };

  const handleCodOrder = async () => {
    const res = await orderService.createOrder(buildPayload());
    clearCartLocally();
    navigate(`/orders/${res.order._id}?success=1`);
  };

  const handleRazorpayPayment = async () => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      throw new Error('Unable to load Razorpay. Please check your internet connection.');
    }

    // 1. Backend creates the DB order + Razorpay order using DB prices
    //    (and re-validates the promo code, if any)
    const orderRes = await paymentService.createPaymentOrder(buildPayload());

    return new Promise((resolve, reject) => {
      const options = {
        key: orderRes.keyId,
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: 'ShopSphere',
        description: 'Order Payment',
        order_id: orderRes.razorpayOrderId,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: '#ff6b35' },
        handler: async (response) => {
          try {
            // 2. Backend verifies the signature before confirming the order
            const verifyRes = await paymentService.verifyPayment({
              orderId: orderRes.orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            clearCartLocally();
            resolve(verifyRes.order);
          } catch (err) {
            reject(err);
          }
        },
        modal: {
          ondismiss: () => reject(new Error('Payment was cancelled.')),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => reject(new Error('Payment failed. Please try again.')));
      rzp.open();
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setProcessing(true);
    try {
      if (paymentMethod === 'COD') {
        await handleCodOrder();
      } else {
        const order = await handleRazorpayPayment();
        navigate(`/orders/${order._id}?success=1`);
      }
    } catch (err) {
      setError(err.message);
      await refreshCart();
    } finally {
      setProcessing(false);
    }
  };

  const promoDiscount = appliedPromo?.promoDiscount || 0;
  const displayTotals = { ...totals, total: Math.max(totals.total - promoDiscount, 0) };

  return (
    <Container className="py-5">
      <h3 className="mb-4">Checkout</h3>
      <Form onSubmit={handleSubmit} noValidate>
        <Row className="g-4">
          <Col lg={8}>
            <div className="border rounded bg-white p-3 mb-3">
              <h6 className="mb-3">Customer Information</h6>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Label className="small">Full Name</Form.Label>
                  <Form.Control name="name" value={form.name} onChange={handleChange} required />
                </Col>
                <Col md={6}>
                  <Form.Label className="small">Email</Form.Label>
                  <Form.Control type="email" name="email" value={form.email} onChange={handleChange} required />
                </Col>
                <Col md={6}>
                  <Form.Label className="small">Phone</Form.Label>
                  <Form.Control name="phone" value={form.phone} onChange={handleChange} required />
                </Col>
              </Row>
            </div>

            <div className="border rounded bg-white p-3 mb-3">
              <h6 className="mb-3">Shipping Address</h6>
              <Row className="g-3">
                <Col md={12}>
                  <Form.Label className="small">Address</Form.Label>
                  <Form.Control name="address" value={form.address} onChange={handleChange} required />
                </Col>
                <Col md={6}>
                  <Form.Label className="small">City</Form.Label>
                  <Form.Control name="city" value={form.city} onChange={handleChange} required />
                </Col>
                <Col md={6}>
                  <Form.Label className="small">State</Form.Label>
                  <Form.Control name="state" value={form.state} onChange={handleChange} required />
                </Col>
                <Col md={6}>
                  <Form.Label className="small">Postal Code</Form.Label>
                  <Form.Control name="postalCode" value={form.postalCode} onChange={handleChange} required />
                </Col>
                <Col md={6}>
                  <Form.Label className="small">Country</Form.Label>
                  <Form.Control name="country" value={form.country} onChange={handleChange} required />
                </Col>
              </Row>
            </div>

            <div className="border rounded bg-white p-3">
              <h6 className="mb-3">Payment Method</h6>
              <Form.Check
                type="radio"
                id="pay-razorpay"
                name="paymentMethod"
                label="Pay with Razorpay (Card / UPI / Netbanking)"
                checked={paymentMethod === 'Razorpay'}
                onChange={() => setPaymentMethod('Razorpay')}
              />
              <Form.Check
                type="radio"
                id="pay-cod"
                name="paymentMethod"
                label="Cash on Delivery"
                checked={paymentMethod === 'COD'}
                onChange={() => setPaymentMethod('COD')}
              />
            </div>
          </Col>

          <Col lg={4}>
            {error && <Alert variant="danger">{error}</Alert>}

            <div className="border rounded bg-white p-3 mb-3">
              <h6 className="mb-2">Promo Code</h6>
              {appliedPromo ? (
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="badge bg-success me-2">{appliedPromo.code}</span>
                    <span className="small text-success">Applied!</span>
                  </div>
                  <Button type="button" variant="link" size="sm" className="p-0 text-danger" onClick={handleRemovePromo}>
                    Remove
                  </Button>
                </div>
              ) : (
                <>
                  <div className="d-flex gap-2">
                    <Form.Control
                      size="sm"
                      placeholder="Enter promo code"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleApplyPromo();
                        }
                      }}
                    />
                    <Button type="button" size="sm" variant="outline-primary" onClick={handleApplyPromo} disabled={applyingPromo}>
                      {applyingPromo ? '...' : 'Apply'}
                    </Button>
                  </div>
                  {promoError && <div className="text-danger small mt-2">{promoError}</div>}
                </>
              )}
            </div>

            <OrderSummary
              totals={displayTotals}
              promo={appliedPromo ? { code: appliedPromo.code, amount: appliedPromo.promoDiscount } : null}
            >
              <Button type="submit" className="w-100" disabled={processing}>
                {processing
                  ? 'Processing...'
                  : paymentMethod === 'Razorpay'
                  ? 'Pay with Razorpay'
                  : 'Place Order (COD)'}
              </Button>
            </OrderSummary>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default Checkout;
