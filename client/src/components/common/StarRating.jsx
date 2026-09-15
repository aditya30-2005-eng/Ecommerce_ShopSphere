import React from 'react';

// Renders a 5-star rating display (read-only) or an interactive picker
// when `onChange` is supplied (used in the review form).
const StarRating = ({ value = 0, onChange, size = '1rem' }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <span className="rating-stars" style={{ fontSize: size }}>
      {stars.map((star) => (
        <i
          key={star}
          className={`bi ${star <= Math.round(value) ? 'bi-star-fill' : 'bi-star'}`}
          style={{ cursor: onChange ? 'pointer' : 'default', marginRight: 2 }}
          onClick={() => onChange && onChange(star)}
          role={onChange ? 'button' : undefined}
          aria-label={`${star} star`}
        />
      ))}
    </span>
  );
};

export default StarRating;
