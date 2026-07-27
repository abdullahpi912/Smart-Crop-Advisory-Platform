import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer-centered">
      <div className="footer-content-centered">
        <Link className="logo" to="/">
          <i className="fa-solid fa-seedling"></i> AgriSense
        </Link>
        <p className="footer-tagline">Smart soil-to-crop advisory platform powered by machine learning.</p>
        <p className="footer-copyright">&copy; {new Date().getFullYear()} AgriSense Precision Advisory. All rights reserved.</p>
      </div>
    </footer>
  );
}
