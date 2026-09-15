import React from 'react';

const ErrorMessage = ({ message = 'Something went wrong.', onRetry, tone }) => (
  <div className={`error-state ${tone === 'soft' ? 'error-state--soft' : ''}`} role="alert">
    <span className="state-icon"><i className="bi bi-cloud-slash" /></span>
    <div><strong>We’re refreshing the shelves</strong><p>{message}</p></div>
    {onRetry && <button className="btn btn-outline-dark btn-sm" onClick={onRetry}><i className="bi bi-arrow-clockwise" /> Try again</button>}
  </div>
);

export default ErrorMessage;
