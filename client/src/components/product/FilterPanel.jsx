import React from 'react';
import { Form } from 'react-bootstrap';

// Sidebar filter controls for the Products listing page: category, brand,
// price range and sorting.
const FilterPanel = ({ filters, categories = [], brands = [], onChange }) => {
  const handleField = (field) => (e) => onChange({ ...filters, [field]: e.target.value });

  return (
    <div className="bg-white border rounded p-3">
      <h6 className="mb-3">Filters</h6>

      <Form.Group className="mb-3">
        <Form.Label className="small fw-semibold">Category</Form.Label>
        <Form.Select value={filters.category || ''} onChange={handleField('category')}>
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="small fw-semibold">Brand</Form.Label>
        <Form.Select value={filters.brand || ''} onChange={handleField('brand')}>
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="small fw-semibold">Price Range</Form.Label>
        <div className="d-flex gap-2">
          <Form.Control
            type="number"
            min="0"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={handleField('minPrice')}
          />
          <Form.Control
            type="number"
            min="0"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={handleField('maxPrice')}
          />
        </div>
      </Form.Group>

      <Form.Group>
        <Form.Label className="small fw-semibold">Sort By</Form.Label>
        <Form.Select value={filters.sort || ''} onChange={handleField('sort')}>
          <option value="newest">Newest</option>
          <option value="priceAsc">Price: Low to High</option>
          <option value="priceDesc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
          <option value="nameAsc">Name: A-Z</option>
        </Form.Select>
      </Form.Group>
    </div>
  );
};

export default FilterPanel;
