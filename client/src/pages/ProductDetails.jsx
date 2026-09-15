import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import productService from '../services/productService';
import useAuth from '../hooks/useAuth';
import useCart from '../hooks/useCart';
import { formatCurrency } from '../utils/formatCurrency';
import StarRating from '../components/common/StarRating';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import ReviewList from '../components/product/ReviewList';
import ReviewForm from '../components/product/ReviewForm';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [cartMessage, setCartMessage] = useState('');
  const [cartError, setCartError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [productRes, reviewRes] = await Promise.all([
        productService.getProductById(id),
        productService.getReviews(id),
      ]);
      setProduct(productRes.product);
      setReviews(reviewRes.reviews);
      setQuantity(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAddToCart = async () => {
    setCartError('');
    setCartMessage('');
    setSubmitting(true);
    try {
      await addItem(product._id, quantity);
      setCartMessage('Added to cart!');
    } catch (err) {
      setCartError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // "Buy Now" must wait for the item to actually land in the cart before
  // moving to Checkout - navigating immediately (the previous <Link
  // onClick={...}> pattern) fired the redirect before the add-to-cart
  // request finished, so Checkout would often load with an empty cart.
  const handleBuyNow = async () => {
    setCartError('');
    setCartMessage('');
    setSubmitting(true);
    try {
      await addItem(product._id, quantity);
      navigate('/checkout');
    } catch (err) {
      setCartError(err.message);
      setSubmitting(false);
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    await productService.addReview(id, reviewData);
    await load();
  };

  if (loading) return <Loader text="Loading product..." />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;
  if (!product) return null;

  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const finalPrice = hasDiscount ? product.discountPrice : product.price;

  return (
    <Container className="py-5">
      <nav className="small text-muted mb-3">
        <Link to="/products">Products</Link> / {product.category} / {product.name}
      </nav>

      <Row className="g-4">
        <Col md={6}>
          <img
            src={product.images?.[activeImage]}
            alt={product.name}
            className="w-100 rounded border"
            style={{ aspectRatio: '1/1', objectFit: 'cover' }}
          />
          {product.images?.length > 1 && (
            <div className="d-flex gap-2 mt-2">
              {product.images.map((img, idx) => (
                <img
                  key={img + idx}
                  src={img}
                  alt=""
                  onClick={() => setActiveImage(idx)}
                  className={`rounded border ${idx === activeImage ? 'border-primary border-2' : ''}`}
                  style={{ width: 60, height: 60, objectFit: 'cover', cursor: 'pointer' }}
                />
              ))}
            </div>
          )}
        </Col>

        <Col md={6}>
          <p className="text-muted text-uppercase small mb-1">{product.brand}</p>
          <h2>{product.name}</h2>
          <div className="d-flex align-items-center gap-2 mb-2">
            <StarRating value={product.rating} />
            <span className="text-muted small">({product.numReviews} reviews)</span>
          </div>

          <div className="mb-3">
            <span className="fs-3 fw-bold text-primary me-2">{formatCurrency(finalPrice)}</span>
            {hasDiscount && (
              <span className="text-muted text-decoration-line-through">{formatCurrency(product.price)}</span>
            )}
          </div>

          <p>{product.description}</p>

          <p className="mb-3">
            {product.stock > 0 ? (
              <span className="text-success">
                <i className="bi bi-check-circle me-1"></i>
                In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="text-danger">
                <i className="bi bi-x-circle me-1"></i>Out of Stock
              </span>
            )}
          </p>

          {product.stock > 0 && (
            <>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="d-flex align-items-center border rounded">
                  <button className="btn btn-sm" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                    -
                  </button>
                  <span className="px-3">{quantity}</span>
                  <button
                    className="btn btn-sm"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  >
                    +
                  </button>
                </div>
              </div>

              {cartMessage && <Alert variant="success">{cartMessage}</Alert>}
              {cartError && <Alert variant="danger">{cartError}</Alert>}

              <div className="d-flex gap-2">
                {isAuthenticated ? (
                  <>
                    <button className="btn btn-outline-primary" onClick={handleAddToCart} disabled={submitting}>
                      <i className="bi bi-cart-plus me-1"></i>Add to Cart
                    </button>
                    <button className="btn btn-primary" onClick={handleBuyNow} disabled={submitting}>
                      {submitting ? 'Please wait...' : 'Buy Now'}
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="btn btn-primary">
                    Login to Purchase
                  </Link>
                )}
              </div>
            </>
          )}
        </Col>
      </Row>

      <Row className="mt-5">
        <Col lg={8}>
          <h5 className="mb-3">Customer Reviews</h5>
          <ReviewList reviews={reviews} />
          <div className="mt-3">
            {isAuthenticated ? (
              <ReviewForm onSubmit={handleReviewSubmit} />
            ) : (
              <p className="text-muted">
                <Link to="/login">Login</Link> to write a review.
              </p>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetails;
