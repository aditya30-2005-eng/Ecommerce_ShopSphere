import React, { useEffect, useState, useCallback } from 'react';
import { Container, Row, Col, Offcanvas, Button } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import productService from '../services/productService';
import ProductGrid from '../components/product/ProductGrid';
import FilterPanel from '../components/product/FilterPanel';
import Pagination from '../components/common/Pagination';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import useDebounce from '../hooks/useDebounce';

// Full listing page: search (via navbar keyword), category/brand/price
// filters, sorting and pagination - all driven by the URL query string so
// results are shareable/bookmarkable.
const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState({ products: [], page: 1, pages: 1, filters: { categories: [], brands: [] } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filters = {
    keyword: searchParams.get('keyword') || '',
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'newest',
    bestSeller: searchParams.get('bestSeller') || '',
    page: searchParams.get('page') || '1',
  };
  const debouncedFilters = useDebounce(filters, 300);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await productService.getProducts(debouncedFilters);
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(debouncedFilters)]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateFilters = (next) => {
    const params = {};
    Object.entries({ ...filters, ...next, page: 1 }).forEach(([key, value]) => {
      if (value) params[key] = value;
    });
    setSearchParams(params);
  };

  const goToPage = (page) => {
    updateFilters({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">
          {filters.keyword ? `Results for "${filters.keyword}"` : 'All Products'}
        </h3>
        <Button variant="outline-secondary" size="sm" className="d-lg-none" onClick={() => setShowFilters(true)}>
          <i className="bi bi-funnel"></i> Filters
        </Button>
      </div>

      <Row>
        <Col lg={3} className="d-none d-lg-block mb-4">
          <FilterPanel filters={filters} categories={data.filters?.categories} brands={data.filters?.brands} onChange={updateFilters} />
        </Col>

        <Offcanvas show={showFilters} onHide={() => setShowFilters(false)} placement="start">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Filters</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <FilterPanel filters={filters} categories={data.filters?.categories} brands={data.filters?.brands} onChange={updateFilters} />
          </Offcanvas.Body>
        </Offcanvas>

        <Col lg={9}>
          {loading && <Loader text="Loading products..." />}
          {error && <ErrorMessage message={error} onRetry={fetchProducts} />}
          {!loading && !error && (
            <>
              <p className="text-muted small">{data.total} product(s) found</p>
              <ProductGrid products={data.products} />
              <Pagination page={data.page} pages={data.pages} onPageChange={goToPage} />
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Products;
