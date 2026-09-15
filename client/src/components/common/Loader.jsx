import React from 'react';

const Loader = ({ text = 'Loading...' }) => (
  <div className="shop-loader" role="status"><span /><span /><span /><p>{text}</p></div>
);

export default Loader;
