import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
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
import NotFound from './pages/NotFound';

export default function App() {
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast({ message: '', type: 'info' });
  };

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ flex: 1 }}>
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      <Footer />

      <Toast message={toast.message} type={toast.type} onClose={closeToast} />
    </div>
  );
}
