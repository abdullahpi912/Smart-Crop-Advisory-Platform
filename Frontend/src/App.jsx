import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';

import Home from './pages/Home';
import Recommend from './pages/Recommend';
import CropLibrary from './pages/CropLibrary';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

export default function App() {
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const location = useLocation();

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast({ message: '', type: 'info' });
  };

  // Global Motion & Single Scroll Observer Setup
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      document.documentElement.classList.add('js');
    } else {
      document.documentElement.classList.remove('js');
    }

    // Scroll to top on route navigation
    window.scrollTo(0, 0);

    if (prefersReducedMotion) return;

    // Single central IntersectionObserver instance
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.08
      }
    );

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [location.pathname]);

  return (
    <div className="app-container">
      <Navbar />

      <div style={{ flex: 1, width: '100%' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/index.html" element={<Home />} />
          <Route path="/recommend" element={<Recommend showToast={showToast} />} />
          <Route path="/recommend.html" element={<Recommend showToast={showToast} />} />
          <Route path="/crops" element={<CropLibrary />} />
          <Route path="/crops.html" element={<CropLibrary />} />
          <Route path="/dashboard" element={<Dashboard showToast={showToast} />} />
          <Route path="/dashboard.html" element={<Dashboard showToast={showToast} />} />
          <Route path="/about" element={<About />} />
          <Route path="/about.html" element={<About />} />
          <Route path="/contact" element={<Contact showToast={showToast} />} />
          <Route path="/contact.html" element={<Contact showToast={showToast} />} />
          <Route path="/login" element={<Login showToast={showToast} />} />
          <Route path="/login.html" element={<Login showToast={showToast} />} />
          <Route path="/register" element={<Register showToast={showToast} />} />
          <Route path="/register.html" element={<Register showToast={showToast} />} />
          <Route path="/admin/login" element={<AdminLogin showToast={showToast} />} />
          <Route path="/admin/dashboard" element={<AdminDashboard showToast={showToast} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      <Footer />

      <Toast message={toast.message} type={toast.type} onClose={closeToast} />
    </div>
  );
}
