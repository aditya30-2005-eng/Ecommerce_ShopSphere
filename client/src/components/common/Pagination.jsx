import React from 'react';
import { Pagination as BsPagination } from 'react-bootstrap';

// Generic page-number pagination used on Products and Admin tables.
const Pagination = ({ page, pages, onPageChange }) => {
  if (pages <= 1) return null;

  const pageNumbers = Array.from({ length: pages }, (_, i) => i + 1);

  return (
    <BsPagination className="justify-content-center mt-4">
      <BsPagination.Prev disabled={page <= 1} onClick={() => onPageChange(page - 1)} />
      {pageNumbers.map((num) => (
        <BsPagination.Item key={num} active={num === page} onClick={() => onPageChange(num)}>
          {num}
        </BsPagination.Item>
      ))}
      <BsPagination.Next disabled={page >= pages} onClick={() => onPageChange(page + 1)} />
    </BsPagination>
  );
};

export default Pagination;
