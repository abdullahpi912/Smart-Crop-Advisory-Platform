import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register({ showToast }) {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(() => {
    try {
      const saved = sessionStorage.getItem('agrisense_reg_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.currentStep || 1;
      }
    } catch (e) { }
    return 1;
  });

  const [formData, setFormData] = useState(() => {
    const defaultData = {
      fullname: '',
      username: '',
      email: '',
      countryCode: '+91',
      phone: '',
      region: '',
      soilType: 'loamy',
      password: '',
      confirmPassword: '',
      website_trap: '',
      terms: true
    };
    try {
      const saved = sessionStorage.getItem('agrisense_reg_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultData, ...parsed };
      }
    } catch (e) { }
    return defaultData;
  });

  useEffect(() => {
    try {
      const draft = { ...formData, currentStep };
      delete draft.password;
      delete draft.confirmPassword;
      sessionStorage.setItem('agrisense_reg_draft', JSON.stringify(draft));
    } catch (e) { }
  }, [formData, currentStep]);

  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Regex Patterns
  const patterns = {
    fullname: /^[a-zA-Z\s]{3,30}$/,
    username: /^[a-zA-Z0-9_]{3,30}$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
    region: /^[a-zA-Z0-9\s,.-]{2,60}$/
  };

  const getFieldError = (name, value) => {
    switch (name) {
      case 'fullname':
        if (!value.trim()) return 'Full Name is required.';
        if (!patterns.fullname.test(value.trim())) return '3–30 characters, alphabets only.';
        return '';

      case 'username':
        if (!value.trim()) return 'Username is required.';
        if (!patterns.username.test(value.trim())) return '3–30 characters, letters, numbers & underscores only.';
        return '';

      case 'phone':
        const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
        if (!value.trim()) return 'Mobile number is required.';
        if (!/^[6-9]\d{9}$/.test(cleanPhone)) return 'Valid 10-digit mobile number required.';
        return '';

      case 'region':
        if (!value.trim()) return 'District / Location is required.';
        return '';

      case 'email':
        if (!value.trim()) return 'Email ID is required.';
        if (!patterns.email.test(value.trim())) return 'Enter a valid email address.';
        return '';

      case 'password':
        if (!value) return 'Password is required.';
        if (!patterns.password.test(value)) return 'Min 8 chars, uppercase, number & symbol required.';
        return '';

      case 'confirmPassword':
        if (!value) return 'Confirm password is required.';
        if (value !== formData.password) return 'Passwords do not match.';
        return '';

      case 'terms':
        if (!value) return 'Accept terms to proceed.';
        return '';

      default:
        return '';
    }
  };

  const isStepValid = (stepNum) => {
    if (stepNum === 1) {
      return !getFieldError('fullname', formData.fullname) &&
        !getFieldError('phone', formData.phone) &&
        !getFieldError('region', formData.region);
    }
    if (stepNum === 2) {
      return !getFieldError('username', formData.username) &&
        !getFieldError('email', formData.email) &&
        !getFieldError('password', formData.password) &&
        !getFieldError('confirmPassword', formData.confirmPassword) &&
        formData.terms;
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (currentStep < 2) {
      if (isStepValid(currentStep)) {
        setCurrentStep(2);
      } else {
        setSubmitted(true);
        showToast?.('Please complete required fields in step 01.', 'warning');
      }
    } else {
      handleSubmit(e);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(1);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setSubmitted(true);

    if (!isStepValid(1) || !isStepValid(2)) {
      showToast?.('Please resolve form validation errors.', 'error');
      return;
    }

    setLoading(true);

    const payload = {
      username: formData.username.trim(),
      password: formData.password,
      fullname: formData.fullname.trim(),
      email: formData.email.trim(),
      phone: `${formData.countryCode} ${formData.phone}`.trim(),
      region: formData.region.trim(),
      soilType: formData.soilType,
      website_trap: formData.website_trap || ''
    };

    try {
      const backendUrl = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && response.status === 201) {
        const userData = {
          userId: data.user_id,
          username: data.username,
          fullname: formData.fullname,
          email: formData.email,
          phone: `${formData.countryCode} ${formData.phone}`,
          region: formData.region,
          soilType: formData.soilType,
          registeredAt: new Date().toLocaleString()
        };

        try {
          localStorage.setItem('agrisense_user', JSON.stringify(userData));
          sessionStorage.removeItem('agrisense_reg_draft');
        } catch (err) { }

        showToast?.('Farm profile registered successfully! Loading console...', 'success');

        setTimeout(() => {
          navigate('/dashboard');
        }, 1400);
      } else {
        showToast?.(data.error || 'Registration failed.', 'error');
      }
    } catch (err) {
      console.error('Registration network error:', err);
      showToast?.('Network error: Unable to reach backend server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 'calc(var(--nav-height) + 2.5rem) 1.5rem 5rem 1.5rem' }}>
      <div className="auth-split-grid">
        {/* Left: Multi-Step Registration Form */}
        <div className="auth-form-column">
          <div style={{ marginBottom: '2rem' }}>
            <div className="section-meta-row" style={{ marginBottom: '0.75rem' }}>
              <span className="mono-accent">REGISTRATION • ENROLLMENT</span>
              <div className="section-meta-rule" style={{ maxWidth: '30px' }}></div>
              <span className="mono-meta">STEP 0{currentStep} OF 02</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--agri-ink)' }}>
              Farm Profile Registration
            </h1>
          </div>

          {/* Stepper Tabs Bar */}
          <div className="modal-tabs-technical" style={{ marginBottom: '2rem' }}>
            <button
              type="button"
              className={`modal-tab-btn-technical ${currentStep === 1 ? 'active' : ''}`}
              onClick={() => setCurrentStep(1)}
            >
              01 • FARMER &amp; PLOT
            </button>
            <button
              type="button"
              className={`modal-tab-btn-technical ${currentStep === 2 ? 'active' : ''}`}
              onClick={() => {
                if (isStepValid(1)) setCurrentStep(2);
                else { setSubmitted(true); showToast?.('Complete step 01 first.', 'warning'); }
              }}
            >
              02 • ACCOUNT SECURITY
            </button>
          </div>

          <form onSubmit={handleNextStep}>
            {/* Honeypot Bot Trap Field */}
            <input
              type="text"
              name="website_trap"
              value={formData.website_trap}
              onChange={handleChange}
              style={{ display: 'none', position: 'absolute', left: '-9999px' }}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />

            {/* STEP 1: Farmer & Field Details */}
            {currentStep === 1 && (
              <div className="auth-step-slide">
                <div className="console-field" style={{ marginBottom: '1.25rem' }}>
                  <label htmlFor="fullname">
                    <span>Full Name</span>
                    <span style={{ color: 'var(--agri-danger)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="fullname"
                    name="fullname"
                    placeholder="Enter your full name"
                    value={formData.fullname}
                    onChange={handleChange}
                    required
                  />
                  {(touched.fullname || submitted) && getFieldError('fullname', formData.fullname) && (
                    <span className="mono-meta" style={{ color: 'var(--agri-danger)', marginTop: '4px', display: 'block' }}>
                      {getFieldError('fullname', formData.fullname)}
                    </span>
                  )}
                </div>

                <div className="console-field" style={{ marginBottom: '1.25rem' }}>
                  <label htmlFor="phone">
                    <span>Mobile Number</span>
                    <span style={{ color: 'var(--agri-danger)' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleChange}
                      style={{ width: '85px', flexShrink: 0 }}
                    >
                      <option value="+91">+91</option>
                    </select>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="10-digit number"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {(touched.phone || submitted) && getFieldError('phone', formData.phone) && (
                    <span className="mono-meta" style={{ color: 'var(--agri-danger)', marginTop: '4px', display: 'block' }}>
                      {getFieldError('phone', formData.phone)}
                    </span>
                  )}
                </div>

                <div className="console-field" style={{ marginBottom: '1.25rem' }}>
                  <label htmlFor="region">
                    <span>District / Location</span>
                    <span style={{ color: 'var(--agri-danger)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="region"
                    name="region"
                    placeholder="Enter agricultural district"
                    value={formData.region}
                    onChange={handleChange}
                    required
                  />
                  {(touched.region || submitted) && getFieldError('region', formData.region) && (
                    <span className="mono-meta" style={{ color: 'var(--agri-danger)', marginTop: '4px', display: 'block' }}>
                      {getFieldError('region', formData.region)}
                    </span>
                  )}
                </div>

                <div className="console-field" style={{ marginBottom: '1.75rem' }}>
                  <label htmlFor="soilType">
                    <span>Primary Soil Type</span>
                    <span style={{ color: 'var(--agri-danger)' }}>*</span>
                  </label>
                  <select
                    id="soilType"
                    name="soilType"
                    value={formData.soilType}
                    onChange={handleChange}
                    required
                  >
                    <option value="loamy">Loamy Soil</option>
                    <option value="clay-loam">Clay-Loam Soil</option>
                    <option value="sandy">Sandy Soil</option>
                    <option value="alluvial">Alluvial Soil</option>
                    <option value="red">Red Soil</option>
                    <option value="black">Black Cotton Soil (Regur)</option>
                    <option value="laterite">Laterite Soil</option>
                  </select>
                </div>
              </div>
            )}

            {/* STEP 2: Account Security */}
            {currentStep === 2 && (
              <div className="auth-step-slide">
                <div className="console-field" style={{ marginBottom: '1.25rem' }}>
                  <label htmlFor="username">
                    <span>Username</span>
                    <span style={{ color: 'var(--agri-danger)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="Choose username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                  {(touched.username || submitted) && getFieldError('username', formData.username) && (
                    <span className="mono-meta" style={{ color: 'var(--agri-danger)', marginTop: '4px', display: 'block' }}>
                      {getFieldError('username', formData.username)}
                    </span>
                  )}
                </div>

                <div className="console-field" style={{ marginBottom: '1.25rem' }}>
                  <label htmlFor="email">
                    <span>Email Address</span>
                    <span style={{ color: 'var(--agri-danger)' }}>*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  {(touched.email || submitted) && getFieldError('email', formData.email) && (
                    <span className="mono-meta" style={{ color: 'var(--agri-danger)', marginTop: '4px', display: 'block' }}>
                      {getFieldError('email', formData.email)}
                    </span>
                  )}
                </div>

                <div className="console-field" style={{ marginBottom: '1.25rem' }}>
                  <label htmlFor="password">
                    <span>Password</span>
                    <span style={{ color: 'var(--agri-danger)' }}>*</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Min 8 chars with uppercase & symbol"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  {(touched.password || submitted) && getFieldError('password', formData.password) && (
                    <span className="mono-meta" style={{ color: 'var(--agri-danger)', marginTop: '4px', display: 'block' }}>
                      {getFieldError('password', formData.password)}
                    </span>
                  )}
                </div>

                <div className="console-field" style={{ marginBottom: '1.25rem' }}>
                  <label htmlFor="confirmPassword">
                    <span>Confirm Password</span>
                    <span style={{ color: 'var(--agri-danger)' }}>*</span>
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  {(touched.confirmPassword || submitted) && getFieldError('confirmPassword', formData.confirmPassword) && (
                    <span className="mono-meta" style={{ color: 'var(--agri-danger)', marginTop: '4px', display: 'block' }}>
                      {getFieldError('confirmPassword', formData.confirmPassword)}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.75rem' }}>
                  <input
                    type="checkbox"
                    id="terms"
                    name="terms"
                    checked={formData.terms}
                    onChange={handleChange}
                    style={{ accentColor: 'var(--agri-accent)', width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="terms" style={{ fontSize: '0.86rem', color: 'var(--agri-secondary)', cursor: 'pointer' }}>
                    I agree to the AgriSense Farm Terms of Service and Privacy Policy
                  </label>
                </div>
              </div>
            )}

            {/* Stepper Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              {currentStep > 1 ? (
                <button
                  type="button"
                  className="btn-secondary-technical"
                  onClick={handlePrevStep}
                  style={{ flex: 1 }}
                >
                  <i className="fa-solid fa-arrow-left" style={{ marginRight: '6px' }}></i> PREVIOUS
                </button>
              ) : (
                <Link
                  to="/"
                  className="btn-secondary-technical"
                  style={{ flex: 1 }}
                >
                  CANCEL
                </Link>
              )}

              {currentStep < 2 ? (
                <button
                  type="submit"
                  className="btn-primary-technical"
                  style={{ flex: 1.5 }}
                >
                  CONTINUE <i className="fa-solid fa-arrow-right" style={{ marginLeft: '6px' }}></i>
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn-primary-technical"
                  style={{ flex: 1.5 }}
                  disabled={loading}
                >
                  {loading ? (
                    <span><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '6px' }}></i> REGISTERING...</span>
                  ) : (
                    <span>REGISTER FARM <i className="fa-solid fa-check" style={{ marginLeft: '6px' }}></i></span>
                  )}
                </button>
              )}
            </div>
          </form>

          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--agri-line)', paddingTop: '1.5rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.92rem', color: 'var(--agri-secondary)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--agri-accent)', fontWeight: 600 }}>
                Sign In to Console <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.8rem' }}></i>
              </Link>
            </span>
          </div>
        </div>

        {/* Right: Technical Procedure Roadmap Panel */}
        <aside className="auth-sidebar-technical">
          <div>
            <span className="mono-accent">SYSTEM GUIDE • ONBOARDING</span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px', marginBottom: '0.5rem', color: 'var(--agri-ink)' }}>
              Registration Procedure
            </h3>
            <p style={{ color: 'var(--agri-secondary)', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: '2rem' }}>
              Complete the 2 setup steps to configure crop matching and fertilizer deficit recommendations.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span className="mono-accent" style={{ border: '1px solid var(--agri-accent)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', flexShrink: 0 }}>
                  01
                </span>
                <div>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--agri-ink)' }}>Farmer &amp; Field Details</strong>
                  <p style={{ color: 'var(--agri-secondary)', fontSize: '0.85rem', marginTop: '2px', lineHeight: 1.4 }}>
                    Specify operator name, phone number, district location, and predominant plot soil classification.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span className="mono-accent" style={{ border: '1px solid var(--agri-line-strong)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', flexShrink: 0 }}>
                  02
                </span>
                <div>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--agri-ink)' }}>Account Security</strong>
                  <p style={{ color: 'var(--agri-secondary)', fontSize: '0.85rem', marginTop: '2px', lineHeight: 1.4 }}>
                    Define login username, validated email address, and encrypted access password.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--agri-line)', paddingTop: '1.5rem', marginTop: '2rem' }}>
            <span className="mono-meta" style={{ color: 'var(--agri-accent)', display: 'block', marginBottom: '4px' }}>
              DATA CONFIDENTIALITY
            </span>
            <p style={{ fontSize: '0.85rem', color: 'var(--agri-secondary)', lineHeight: 1.5 }}>
              All soil chemical readings and regional farm plot records are encrypted and stored for personalized ML advisory reports.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
