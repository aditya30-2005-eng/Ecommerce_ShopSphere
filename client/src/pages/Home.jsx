import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import productService from '../services/productService';
import ProductGrid from '../components/product/ProductGrid';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import campaign from '../assets/images/campaign.jpg';
import homeLiving from '../assets/images/home-living.jpg';
import footwear from '../assets/images/footwear.jpg';
import knit from '../assets/images/product-knit.jpg';
import ceramic from '../assets/images/product-ceramic.jpg';
import tote from '../assets/images/product-tote.jpg';
import cardigan from '../assets/images/product-cardigan.jpg';

const demoProducts = [
  { _id: 'demo-knit', name: 'Oat Knit Crew', category: 'Fashion', price: 2490, discountPrice: 0, rating: 4.8, numReviews: 212, stock: 8, images: [knit] },
  { _id: 'demo-ceramic', name: 'Clay Pour-Over Set', category: 'Home & Kitchen', price: 1850, discountPrice: 0, rating: 4.9, numReviews: 98, stock: 12, images: [ceramic], bestSeller: true },
  { _id: 'demo-tote', name: 'Linen City Tote', category: 'Fashion', price: 990, discountPrice: 0, rating: 4.7, numReviews: 156, stock: 20, images: [tote] },
  { _id: 'demo-cardigan', name: 'Sage Wool Cardigan', category: 'Fashion', price: 3200, discountPrice: 0, rating: 5, numReviews: 44, stock: 0, images: [cardigan] },
];

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const response = await productService.getProducts({ featured: true, limit: 8 });
      setFeatured(response.products || []);
    } catch {
      setError('The live collection is taking a moment. Here is our studio edit while we reconnect.');
      setFeatured(demoProducts);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="home-page">
      <div className="container-xxl py-4 py-lg-5">
        <section className="campaign-grid">
          <article className="campaign-main rise">
            <img src={campaign} alt="Model wearing the autumn linen collection" width="1080" height="1300" />
            <div className="kinetic-band kinetic-band-one" /><div className="kinetic-band kinetic-band-two" />
            <div className="campaign-copy">
              <span className="eyebrow eyebrow-light">The Autumn Drop</span>
              <h1>Wear the <em>season</em>,<br />not the noise.</h1>
              <p>A considered edit of 120 pieces — cut for how you actually move. No restocks, no filler.</p>
              <div className="campaign-actions"><Link to="/products" className="btn btn-primary btn-lg">Shop the collection</Link><Link to="/products?sort=newest" className="btn btn-glass btn-lg">Browse new in</Link></div>
              <small>Free shipping over ₹999 <i /> Easy 14-day returns</small>
            </div>
          </article>
          <Link to="/products?category=Home%20%26%20Kitchen" className="campaign-tile rise delay-1"><img src={homeLiving} alt="Neutral knitwear and ceramic homeware" width="1024" height="640" loading="lazy" /><span><strong>Home & Living</strong><small>48 pieces</small></span></Link>
          <Link to="/products?category=Fashion" className="campaign-tile rise delay-2"><img src={footwear} alt="Everyday footwear and folded denim" width="1024" height="640" loading="lazy" /><span><strong>Everyday Footwear</strong><small>32 pieces</small></span></Link>
          <article className="offer-tile rise delay-3"><span className="eyebrow">Limited offer</span><h2>20% off your first order</h2><p>Use code <strong>WELCOME20</strong> at checkout. Ends Sunday.</p></article>
        </section>

        <section className="product-section">
          <div className="section-heading"><div><span className="eyebrow">(a) — Curated</span><h2>Made for the everyday</h2></div><Link to="/products">View all products <i className="bi bi-arrow-right" /></Link></div>
          {loading && <Loader text="Curating the collection..." />}
          {error && <ErrorMessage message={error} onRetry={load} tone="soft" />}
          {!loading && <ProductGrid products={featured.length ? featured.slice(0, 8) : demoProducts} />}
        </section>
      </div>
    </div>
  );
};

export default Home;
