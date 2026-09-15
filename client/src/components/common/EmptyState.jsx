import React from 'react';
import { Link } from 'react-router-dom';

// Shown whenever a list has nothing to display (empty cart, no orders, no
// search results, etc.) instead of a blank page.
const EmptyState = ({ icon = 'bi-inbox', title, message, actionLabel, actionTo }) => (
  <div className="empty-state">
    <i className={`bi ${icon} display-4 d-block mb-3`}></i>
    <h5>{title}</h5>
    <p className="mb-3">{message}</p>
    {actionLabel && actionTo && (
      <Link to={actionTo} className="btn btn-primary">
        {actionLabel}
      </Link>
    )}
  </div>
);

export default EmptyState;
