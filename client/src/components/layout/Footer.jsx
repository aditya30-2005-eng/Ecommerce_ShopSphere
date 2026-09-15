import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { notify } from '../common/NotificationCenter';

const Footer = () => {
  const subscribe = (event) => {
    event.preventDefault();
    event.currentTarget.reset();
    notify({ title: 'You’re on the list', message: 'New drops, sent thoughtfully.' });
  };

  return (
    <footer className="app-footer">
      <Container>
        <Row className="gy-4">
          <Col md={4}>
            <h5 className="footer-brand">ShopSphere<span>.</span></h5>
            <p>A considered edit for the way you actually live.</p>
          </Col>
          <Col xs={6} md={2}><h6>Shop</h6><ul><li><Link to="/products?sort=newest">New In</Link></li><li><Link to="/products?category=Fashion">Fashion</Link></li><li><Link to="/products?category=Home%20%26%20Kitchen">Home</Link></li></ul></Col>
          <Col xs={6} md={2}><h6>Help</h6><ul><li><Link to="/orders">Track order</Link></li><li><a href="mailto:hello@shopsphere.demo">Contact</a></li><li><a href="#!">Returns</a></li></ul></Col>
          <Col md={4}>
            <h6>Stay in the loop</h6><p>New drops, once a month.</p>
            <Form className="newsletter-form" onSubmit={subscribe}><Form.Control required type="email" placeholder="you@email.com" aria-label="Email address" /><button type="submit">Join</button></Form>
          </Col>
        </Row>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} ShopSphere. Crafted in India.</span><span>Privacy · Terms</span></div>
      </Container>
    </footer>
  );
};

export default Footer;
