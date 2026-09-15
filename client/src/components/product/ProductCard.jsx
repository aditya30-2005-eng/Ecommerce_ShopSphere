import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';
import StarRating from '../common/StarRating';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';
import { notify } from '../common/NotificationCenter';

const ProductCard = ({ product }) => {
  const [adding, setAdding] = useState(false);
  const { isAuthenticated } = useAuth() || {};
  const { addItem } = useCart() || {};
  const navigate = useNavigate();
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const discountPercent = hasDiscount ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;
  const isDemo = String(product._id).startsWith('demo-');

  const addToBag = async () => {
    if (product.stock === 0) {
      notify({ title: 'We’ll let you know', message: `${product.name} is on your restock list.` });
      return;
    }
    if (isDemo) {
      notify({ title: 'Studio preview', message: 'Connect the store service to add this preview item.' });
      return;
    }
    if (!isAuthenticated) { navigate('/login'); return; }
    setAdding(true);
    if (!addItem) return;
    try {
      await addItem(product._id, 1);
      notify({ title: 'Added to your bag', message: product.name });
    } catch (error) {
      notify({ type: 'error', title: 'Couldn’t add item', message: error.message });
    } finally { setAdding(false); }
  };

  return (
    <article className={`product-card ${product.stock === 0 ? 'product-card--sold' : ''}`}>
      <div className="product-media">
        {hasDiscount && <span className="product-badge">-{discountPercent}%</span>}
        {product.bestSeller && !hasDiscount && <span className="product-badge product-badge--fern">Bestseller</span>}
        {product.stock === 0 && <span className="product-badge product-badge--dark">Out of stock</span>}
        <Link to={isDemo ? '/products' : `/products/${product._id}`}><img src={product.images?.[0]} alt={product.name} className="product-card-img" loading="lazy" width="640" height="800" /></Link>
        <button type="button" className="wishlist-button" aria-label={`Save ${product.name}`} onClick={() => notify({ title: 'Saved for later', message: product.name })}><i className="bi bi-heart" /></button>
      </div>
      <div className="product-info">
        <div className="product-title-row"><div><p>{product.category}</p><Link to={isDemo ? '/products' : `/products/${product._id}`}>{product.name}</Link></div><strong>{formatCurrency(hasDiscount ? product.discountPrice : product.price)}</strong></div>
        <div className="product-meta"><span><StarRating value={product.rating} size="0.75rem" /> {product.rating || 0} ({product.numReviews || 0})</span>{hasDiscount && <del>{formatCurrency(product.price)}</del>}</div>
        <button type="button" className="add-to-bag" onClick={addToBag} disabled={adding}>{adding ? 'Adding…' : product.stock === 0 ? 'Notify me' : 'Add to bag'}</button>
      </div>
    </article>
  );
};

export default ProductCard;
