import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';

const baseProduct = {
  _id: 'p1',
  name: 'Wireless Headphones',
  category: 'Electronics',
  price: 3999,
  discountPrice: 2999,
  rating: 4,
  numReviews: 12,
  stock: 5,
  images: ['https://placehold.co/600x600'],
};

const renderCard = (product) =>
  render(
    <MemoryRouter>
      <ProductCard product={product} />
    </MemoryRouter>
  );

describe('ProductCard', () => {
  it('renders the product name and category', () => {
    renderCard(baseProduct);
    expect(screen.getByText('Wireless Headphones')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
  });

  it('shows the discounted price and strikes through the original price', () => {
    renderCard(baseProduct);
    expect(screen.getByText('₹2,999')).toBeInTheDocument();
    expect(screen.getByText('₹3,999')).toBeInTheDocument();
  });

  it('shows the discount percentage badge', () => {
    renderCard(baseProduct);
    expect(screen.getByText('-25%')).toBeInTheDocument();
  });

  it('shows an out of stock badge when stock is 0', () => {
    renderCard({ ...baseProduct, stock: 0 });
    expect(screen.getByText('Out of stock')).toBeInTheDocument();
  });

  it('does not show a discount badge when there is no discount', () => {
    renderCard({ ...baseProduct, discountPrice: 0 });
    expect(screen.queryByText(/-\d+%/)).not.toBeInTheDocument();
  });
});
