import React from 'react';
import { Link } from 'react-router-dom';
import './ErrorStyles.css';

const NotFound = () => {
  return (
    <div className="not-found-wrapper">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>We can't find the page you're looking for.</p>
      <Link to="/" className="home-button">Return to Homepage</Link>
    </div>
  );
};

export default NotFound;
