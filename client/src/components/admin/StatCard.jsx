import React from 'react';

const StatCard = ({ label, value, icon }) => (
  <div className="stat-card d-flex align-items-center gap-3">
    <div className="fs-3 text-primary">
      <i className={`bi ${icon}`}></i>
    </div>
    <div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

export default StatCard;
