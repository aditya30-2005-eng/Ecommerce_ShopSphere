import React from 'react';
import StarRating from '../common/StarRating';

const ReviewList = ({ reviews = [] }) => {
  if (reviews.length === 0) {
    return <p className="text-muted">No reviews yet. Be the first to review this product.</p>;
  }

  return (
    <div>
      {reviews.map((review) => (
        <div key={review._id} className="border-bottom py-3">
          <div className="d-flex justify-content-between">
            <strong>{review.user?.name || 'Anonymous'}</strong>
            <span className="text-muted small">{new Date(review.createdAt).toLocaleDateString()}</span>
          </div>
          <StarRating value={review.rating} size="0.85rem" />
          <p className="mb-0 mt-1">{review.comment}</p>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
