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
    } catch (e) {}
    return 1;
  });

  const [formData, setFormData] = useState(() => {
    const defaultData = {
      fullname: '',
      email: '',
      countryCode: '+91',
      phone: '',
      region: '',
      soilType: 'loamy',
      password: '',
      confirmPassword: '',
      terms: true
    };
    try {
      const saved = sessionStorage.getItem('agrisense_reg_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultData, ...parsed };
      }
    } catch (e) {}
    return defaultData;
  });

  useEffect(() => {
    try {
      sessionStorage.setItem('agrisense_reg_draft', JSON.stringify({ ...formData, currentStep }));
    } catch (e) {}
  }, [formData, currentStep]);

  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [success, setSuccess] = useState(false);

  // Regex Patterns
  const patterns = {
    fullname: /^[a-zA-Z\s]{3,30}$/,
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

      case 'phone':
        const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
        if (!value.trim()) return 'Mobile number is required.';
        if (!/^[6-9]\d{9}$/.test(cleanPhone)) return 'Valid 10-digit Indian mobile number required.';
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
      return !getFieldError('email', formData.email) &&
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
        setCurrentStep((prev) => prev + 1);
      } else {
        setSubmitted(true);
        showToast?.('Please fill required fields in this step.', 'warning');
      }
    } else {
      handleSubmit(e);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    setSubmitted(true);

    if (!isStepValid(1) || !isStepValid(2)) {
      showToast?.('Please resolve form errors before submitting.', 'error');
      return;
    }

    const userData = {
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
    } catch (err) {
      console.error(err);
    }

    setSuccess(true);
    showToast?.('Farm Registration Successful! Redirecting to dashboard...', 'success');

    setTimeout(() => {
      navigate('/dashboard');
    }, 1600);
  };

  const steps = [
    { num: 1, label: 'Farmer & Field Details' },
    { num: 2, label: 'Account Security' }
  ];

  return (
    <main style={{
      padding: '2.5rem 1.5rem',
      minHeight: '88vh',
      backgroundColor: 'var(--bg-canvas)'
    }}>
      <div className="register-split-wrapper">
        {/* Left Column: Portrait Registration Form Card */}
        <div className="register-form-column">
          <div className="multi-step-form-card">
            {/* Header */}
            <div className="multi-step-header">
              <h2>Farm Registration</h2>
            </div>

            {/* Stepper Tabs Bar */}
            <div className="stepper-tabs" role="tablist">
              {steps.map((step) => {
                const isActive = currentStep === step.num;
                const isCompleted = currentStep > step.num || (isStepValid(step.num) && currentStep !== step.num);
                return (
                  <button
                    key={step.num}
                    type="button"
                    className={`stepper-tab ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                    onClick={() => setCurrentStep(step.num)}
                  >
                    <span className="step-icon-circle">
                      {isCompleted ? <i className="fa-solid fa-check"></i> : step.num}
                    </span>
                    <span>{step.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Success Banner */}
            {success && (
              <div className="form-success-summary" role="status" style={{ display: 'flex', marginBottom: '1.5rem' }}>
                <i className="fa-solid fa-circle-check"></i>
                <div>
                  <strong>Farm Profile Created Successfully!</strong>
                  <p>Your agricultural plot settings have been stored. Loading dashboard...</p>
                </div>
              </div>
            )}

            <form onSubmit={handleNextStep}>
              {/* STEP 1: Farmer & Field Details */}
              {currentStep === 1 && (
                <div>
                  <div className="step-section-title">Farmer &amp; Plot Information</div>
                  <div className="reference-form-grid">
                    <div className="ref-field">
                      <label htmlFor="fullname">Full Name <span style={{ color: '#d9381e' }}>*</span></label>
                      <input
                        type="text"
                        id="fullname"
                        name="fullname"
                        placeholder="e.g. Abdullah P I"
                        value={formData.fullname}
                        onChange={handleChange}
                        required
                      />
                      {(touched.fullname || submitted) && getFieldError('fullname', formData.fullname) && (
                        <span role="alert" style={{ fontSize: '0.78rem', color: '#d9381e', marginTop: '0.25rem' }}>{getFieldError('fullname', formData.fullname)}</span>
                      )}
                    </div>

                    <div className="ref-field">
                      <label htmlFor="phone">Mobile Number <span style={{ color: '#d9381e' }}>*</span></label>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <select
                          name="countryCode"
                          value={formData.countryCode}
                          onChange={handleChange}
                          style={{ width: '80px', flexShrink: 0, padding: '0 0.4rem', fontWeight: 700 }}
                        >
                          <option value="+91">🇮🇳 +91</option>
                        </select>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          placeholder="88077 95366"
                          value={formData.phone}
                          onChange={handleChange}
                          style={{ flex: 1 }}
                          required
                        />
                      </div>
                      {(touched.phone || submitted) && getFieldError('phone', formData.phone) && (
                        <span role="alert" style={{ fontSize: '0.78rem', color: '#d9381e', marginTop: '0.25rem' }}>{getFieldError('phone', formData.phone)}</span>
                      )}
                    </div>

                    <div className="ref-field">
                      <label htmlFor="region">District / Location <span style={{ color: '#d9381e' }}>*</span></label>
                      <input
                        type="text"
                        id="region"
                        name="region"
                        placeholder="e.g. Palakkad, Kerala"
                        value={formData.region}
                        onChange={handleChange}
                        required
                      />
                      {(touched.region || submitted) && getFieldError('region', formData.region) && (
                        <span role="alert" style={{ fontSize: '0.78rem', color: '#d9381e', marginTop: '0.25rem' }}>{getFieldError('region', formData.region)}</span>
                      )}
                    </div>

                    <div className="ref-field">
                      <label htmlFor="soilType">Primary Soil Type <span style={{ color: '#d9381e' }}>*</span></label>
                      <select
                        id="soilType"
                        name="soilType"
                        value={formData.soilType}
                        onChange={handleChange}
                        required
                      >
                        <option value="loamy">Loamy Soil</option>
                        <option value="clayey">Clayey Soil</option>
                        <option value="sandy">Sandy Soil</option>
                        <option value="black">Black Cotton Soil</option>
                        <option value="alluvial">Alluvial Soil</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Account Security */}
              {currentStep === 2 && (
                <div>
                  <div className="step-section-title">Account Credentials &amp; Agreement</div>
                  <div className="reference-form-grid">
                    <div className="ref-field">
                      <label htmlFor="email">Email ID <span style={{ color: '#d9381e' }}>*</span></label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="e.g. farmer@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                      {(touched.email || submitted) && getFieldError('email', formData.email) && (
                        <span role="alert" style={{ fontSize: '0.78rem', color: '#d9381e', marginTop: '0.25rem' }}>{getFieldError('email', formData.email)}</span>
                      )}
                    </div>

                    <div className="ref-field">
                      <label htmlFor="password">Password <span style={{ color: '#d9381e' }}>*</span></label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      {(touched.password || submitted) && getFieldError('password', formData.password) && (
                        <span role="alert" style={{ fontSize: '0.78rem', color: '#d9381e', marginTop: '0.25rem' }}>{getFieldError('password', formData.password)}</span>
                      )}
                    </div>

                    <div className="ref-field">
                      <label htmlFor="confirmPassword">Confirm Password <span style={{ color: '#d9381e' }}>*</span></label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                      {(touched.confirmPassword || submitted) && getFieldError('confirmPassword', formData.confirmPassword) && (
                        <span role="alert" style={{ fontSize: '0.78rem', color: '#d9381e', marginTop: '0.25rem' }}>{getFieldError('confirmPassword', formData.confirmPassword)}</span>
                      )}
                    </div>

                    <div className="ref-field full-span" style={{ marginTop: '0.5rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          name="terms"
                          checked={formData.terms}
                          onChange={handleChange}
                          style={{ accentColor: '#3b6e47', width: '16px', height: '16px' }}
                        />
                        <span>I agree to AgriSense Farm Advisory Terms of Service and Privacy Policy <span style={{ color: '#d9381e' }}>*</span></span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Subtext Note */}
              <div className="registration-disclaimer-text">
                All fields marked with an asterisk (*) are required to activate your farm advisory profile.
              </div>

              {/* Footer Action Buttons */}
              <div className="ref-form-footer">
                {currentStep > 1 ? (
                  <button type="button" className="btn-ref-cancel" onClick={handlePrevStep}>
                    PREVIOUS
                  </button>
                ) : (
                  <button type="button" className="btn-ref-cancel" onClick={() => navigate('/')}>
                    CANCEL
                  </button>
                )}

                {currentStep < 2 ? (
                  <button type="submit" className="btn-ref-continue">
                    CONTINUE <i className="fa-solid fa-arrow-right"></i>
                  </button>
                ) : (
                  <button type="submit" className="btn-ref-continue">
                    REGISTER FARM <i className="fa-solid fa-check"></i>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Registration Guide & Roadmap Panel */}
        <aside className="register-info-panel">
          <div>
            <span className="info-panel-badge">
              <i className="fa-solid fa-seedling"></i> AgriSense Platform Guide
            </span>
            <h3 className="info-panel-title">Registration Procedure</h3>
            <p className="info-panel-subtitle">Complete these 2 simple steps to get data-backed crop advice.</p>
          </div>

          {/* Procedure Roadmap Timeline */}
          <div className="procedure-roadmap">
            {[
              {
                num: 1,
                title: 'Farmer & Field Details',
                desc: 'Enter your name, 10-digit mobile number, district location & primary soil type.'
              },
              {
                num: 2,
                title: 'Account Security',
                desc: 'Enter your email ID, set your account password & agree to privacy terms.'
              }
            ].map((step) => {
              const isActive = currentStep === step.num;
              const isCompleted = currentStep > step.num;
              return (
                <div
                  key={step.num}
                  className={`roadmap-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                >
                  <div className="roadmap-num">
                    {isCompleted ? <i className="fa-solid fa-check"></i> : step.num}
                  </div>
                  <div className="roadmap-text">
                    <h4>{step.title}</h4>
                    <p>{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Highlights Grid */}
          <div className="info-features-grid">
            <div className="info-feature-box">
              <strong>99.2%</strong>
              <span>ML Accuracy</span>
            </div>
            <div className="info-feature-box">
              <strong>22</strong>
              <span>Crop Models</span>
            </div>
            <div className="info-feature-box">
              <strong>100%</strong>
              <span>Confidential</span>
            </div>
          </div>

          {/* Trust Footer */}
          <div className="trust-footer-card">
            <i className="fa-solid fa-shield-halved"></i>
            <div>
              <strong style={{ display: 'block', color: '#ffffff', fontSize: '0.86rem' }}>Data Privacy Guaranteed</strong>
              <span>Your soil and farm location data is stored securely for your personal ML advisory reports.</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
