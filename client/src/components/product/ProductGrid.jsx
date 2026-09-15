import React from 'react';
import { Row, Col } from 'react-bootstrap';
import ProductCard from './ProductCard';
import EmptyState from '../common/EmptyState';

// Responsive grid: 1 column on mobile, 2 on tablet, 3-4 on desktop.
const ProductGrid = ({ products = [] }) => {
  if (products.length === 0) {
    return (
      <EmptyState
        icon="bi-search"
        title="No products found"
        message="Try adjusting your filters or search keyword."
      />
    );
  }

  return (
    <Row className="g-4">
      {products.map((product) => (
        <Col key={product._id} xs={12} sm={6} lg={4} xl={3}>
          <ProductCard product={product} />
        </Col>
      ))}
    </Row>
  );
};

export default ProductGrid;
