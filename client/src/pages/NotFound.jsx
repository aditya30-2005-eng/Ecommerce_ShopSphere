import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';

const NotFound = () => (
  <Container className="py-5 text-center">
    <h1 className="display-1 fw-bold text-primary">404</h1>
    <h4 className="mb-3">Page Not Found</h4>
    <p className="text-muted mb-4">The page you're looking for doesn't exist or has been moved.</p>
    <Link to="/" className="btn btn-primary">
      Back to Home
    </Link>
  </Container>
);

export default NotFound;
