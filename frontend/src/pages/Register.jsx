import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register({ showToast }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    countryCode: '+91',
    phone: '',
    dob: '',
    gender: '',
    pincode: '',
    region: '',
    soilType: '',
    password: '',
    confirmPassword: '',
    terms: true
  });

  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [success, setSuccess] = useState(false);

  // Task 03: Regex Patterns
  const patterns = {
    fullname: /^[a-zA-Z\s]{3,30}$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    pincode: /^\d{6}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
    region: /^[a-zA-Z0-9\s,.-]{2,60}$/
  };

  // Field Validation Function
  const getFieldError = (name, value) => {
    switch (name) {
      case 'fullname':
        if (!value.trim()) return 'Full Name is required.';
        if (!patterns.fullname.test(value.trim())) {
          return 'Full Name must be 3–30 characters long and contain only alphabets and spaces.';
        }
        return '';

      case 'email':
        if (!value.trim()) return 'Email Address is required.';
        if (!patterns.email.test(value.trim())) {
          return 'Please enter a valid email address (e.g. farmer@example.com).';
        }
        return '';

      case 'phone':
        const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
        if (!value.trim()) return 'Indian phone number is required.';
        if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
          return 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.';
        }
        return '';

      case 'dob':
        if (!value) return 'Date of Birth is required.';
        const dobDate = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - dobDate.getFullYear();
        const monthDiff = today.getMonth() - dobDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
          age--;
        }
        if (isNaN(dobDate.getTime()) || age < 18) {
          return 'You must be at least 18 years old to register.';
        }
        return '';

      case 'gender':
        if (!value) return 'Please select your gender.';
        return '';

      case 'pincode':
        if (!value.trim()) return ''; // Optional
        if (!patterns.pincode.test(value.trim())) {
          return 'PIN code must be a 6-digit number.';
        }
        return '';

      case 'region':
        if (!value.trim()) return 'Farm location/district is required.';
        if (!patterns.region.test(value.trim())) {
          return 'Please enter a valid location or district name.';
        }
        return '';

      case 'soilType':
        if (!value) return 'Please select your primary soil type.';
        return '';

      case 'password':
        if (!value) return 'Password is required.';
        if (!patterns.password.test(value)) {
          return 'Password must be at least 8 characters and include uppercase, lowercase, number & symbol.';
        }
        return '';

      case 'confirmPassword':
        if (!value) return 'Please confirm your password.';
        if (value !== formData.password) {
          return 'Passwords do not match. Please re-enter your password.';
        }
        return '';

      case 'terms':
        if (!value) return 'You must accept the terms and privacy policy to proceed.';
        return '';

      default:
        return '';
    }
  };

  // Calculate Password Strength Meter
  const getPasswordStrength = (val) => {
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[a-z]/.test(val)) score++;
    if (/\d/.test(val)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val)) score++;

    if (val.length === 0) return { percent: '0%', text: '', class: '' };
    if (score <= 2) return { percent: '33%', text: 'Weak Password', class: 'weak' };
    if (score <= 4) return { percent: '66%', text: 'Medium Strength', class: 'medium' };
    return { percent: '100%', text: 'Strong Password', class: 'strong' };
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const isFieldValid = (name) => {
    if (name === 'pincode' && !formData.pincode.trim()) return true;
    return getFieldError(name, formData[name]) === '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    // Validate all fields
    const fields = ['fullname', 'email', 'phone', 'dob', 'gender', 'pincode', 'region', 'soilType', 'password', 'confirmPassword', 'terms'];
    let hasError = false;

    fields.forEach((f) => {
      if (getFieldError(f, formData[f])) {
        hasError = true;
      }
    });

    if (hasError) {
      showToast?.('Please fix the errors highlighted in the registration form.', 'error');
      return;
    }

    // Save registered farm profile into Browser LocalStorage
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
    } catch (err) {
      console.error('Failed to save user profile:', err);
    }

    setSuccess(true);
    showToast?.('Farm Profile created successfully! Welcome to AgriSense.', 'success');

    setTimeout(() => {
      navigate('/dashboard');
    }, 1600);
  };

  const strength = getPasswordStrength(formData.password);

  return (
    <main>
      <section className="auth-section">
        <div className="auth-container">
          <div className="auth-card" style={{ maxWidth: '640px' }}>
            <div className="auth-header">
              <div className="auth-badge"><i className="fa-solid fa-user-plus"></i> Free Farm Account</div>
              <h2>Create Your Farm Profile</h2>
              <p>Register to securely store your field NPK logs, save historical crop ML predictions, and manage multi-plot data.</p>
            </div>

            {/* Global Error Summary Banner */}
            {submitted && Object.keys(formData).some((k) => getFieldError(k, formData[k])) && (
              <div className="form-error-summary" role="alert">
                Please correct the highlighted errors before submitting your registration profile.
              </div>
            )}

            {/* Global Success Banner */}
            {success && (
              <div className="form-success-summary" role="status">
                <i className="fa-solid fa-circle-check"></i>
                <div>
                  <strong>Registration Successful!</strong>
                  <p>Your farm profile has been created successfully. Redirecting to your dashboard...</p>
                </div>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="form-grid">

                {/* 1. Full Name */}
                <div className="form-field form-field-full">
                  <div className="field-label-row">
                    <label htmlFor="fullname">Full Name <span className="required-star">*</span></label>
                    {(touched.fullname || submitted) && (
                      <span className={`status-badge ${isFieldValid('fullname') ? 'valid' : 'invalid'}`} style={{ display: 'inline-block' }}>
                        {isFieldValid('fullname') ? 'Valid' : 'Invalid'}
                      </span>
                    )}
                  </div>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="fullname"
                      name="fullname"
                      placeholder="e.g. Abdullah P I"
                      required
                      className={`input-control ${(touched.fullname || submitted) ? (isFieldValid('fullname') ? 'valid-field' : 'invalid-field') : ''}`}
                      value={formData.fullname}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <i className="fa-solid fa-user"></i>
                  </div>
                  <div className="field-hint">3–30 characters, alphabets and spaces only.</div>
                  {(touched.fullname || submitted) && getFieldError('fullname', formData.fullname) && (
                    <div className="field-error-message" style={{ display: 'block' }}>{getFieldError('fullname', formData.fullname)}</div>
                  )}
                </div>

                {/* 2. Email Address */}
                <div className="form-field form-field-full">
                  <div className="field-label-row">
                    <label htmlFor="email">Email Address <span className="required-star">*</span></label>
                    {(touched.email || submitted) && (
                      <span className={`status-badge ${isFieldValid('email') ? 'valid' : 'invalid'}`} style={{ display: 'inline-block' }}>
                        {isFieldValid('email') ? 'Valid' : 'Invalid'}
                      </span>
                    )}
                  </div>
                  <div className="input-wrapper">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="e.g. farmer@example.com"
                      required
                      className={`input-control ${(touched.email || submitted) ? (isFieldValid('email') ? 'valid-field' : 'invalid-field') : ''}`}
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <i className="fa-solid fa-envelope"></i>
                  </div>
                  <div className="field-hint">Valid email format required.</div>
                  {(touched.email || submitted) && getFieldError('email', formData.email) && (
                    <div className="field-error-message" style={{ display: 'block' }}>{getFieldError('email', formData.email)}</div>
                  )}
                </div>

                {/* 3. Phone Number with Country Code Dropdown */}
                <div className="form-field form-field-full">
                  <div className="field-label-row">
                    <label htmlFor="phone">Phone Number <span className="required-star">*</span></label>
                    {(touched.phone || submitted) && (
                      <span className={`status-badge ${isFieldValid('phone') ? 'valid' : 'invalid'}`} style={{ display: 'inline-block' }}>
                        {isFieldValid('phone') ? 'Valid' : 'Invalid'}
                      </span>
                    )}
                  </div>
                  <div className="phone-input-group">
                    <div className="country-select-wrapper">
                      <select
                        name="countryCode"
                        value={formData.countryCode}
                        onChange={handleChange}
                        aria-label="Select Country Code"
                      >
                        <option value="+91">🇮🇳 +91</option>
                      </select>
                    </div>
                    <div className="phone-number-wrapper">
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        placeholder="88077 95366"
                        required
                        className={`input-control ${(touched.phone || submitted) ? (isFieldValid('phone') ? 'valid-field' : 'invalid-field') : ''}`}
                        value={formData.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <i className="fa-solid fa-phone"></i>
                    </div>
                  </div>
                  <div className="field-hint">Select country code and enter mobile number.</div>
                  {(touched.phone || submitted) && getFieldError('phone', formData.phone) && (
                    <div className="field-error-message" style={{ display: 'block' }}>{getFieldError('phone', formData.phone)}</div>
                  )}
                </div>

                {/* 4. Date of Birth */}
                <div className="form-field">
                  <div className="field-label-row">
                    <label htmlFor="dob">Date of Birth <span className="required-star">*</span></label>
                    {(touched.dob || submitted) && (
                      <span className={`status-badge ${isFieldValid('dob') ? 'valid' : 'invalid'}`} style={{ display: 'inline-block' }}>
                        {isFieldValid('dob') ? 'Valid' : 'Invalid'}
                      </span>
                    )}
                  </div>
                  <div className="input-wrapper">
                    <input
                      type="date"
                      id="dob"
                      name="dob"
                      required
                      className={`input-control ${(touched.dob || submitted) ? (isFieldValid('dob') ? 'valid-field' : 'invalid-field') : ''}`}
                      value={formData.dob}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <i className="fa-solid fa-calendar-days"></i>
                  </div>
                  <div className="field-hint">Must be at least 18 years old.</div>
                  {(touched.dob || submitted) && getFieldError('dob', formData.dob) && (
                    <div className="field-error-message" style={{ display: 'block' }}>{getFieldError('dob', formData.dob)}</div>
                  )}
                </div>

                {/* 5. Gender */}
                <div className="form-field">
                  <div className="field-label-row">
                    <label htmlFor="gender">Gender <span className="required-star">*</span></label>
                    {(touched.gender || submitted) && (
                      <span className={`status-badge ${isFieldValid('gender') ? 'valid' : 'invalid'}`} style={{ display: 'inline-block' }}>
                        {isFieldValid('gender') ? 'Valid' : 'Invalid'}
                      </span>
                    )}
                  </div>
                  <div className="input-wrapper" style={{ position: 'relative' }}>
                    <select
                      id="gender"
                      name="gender"
                      className={`input-control select-control ${(touched.gender || submitted) ? (isFieldValid('gender') ? 'valid-field' : 'invalid-field') : ''}`}
                      required
                      style={{ paddingLeft: '2.75rem', width: '100%' }}
                      value={formData.gender}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      <option value="" disabled>Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not">Prefer not to say</option>
                    </select>
                    <i className="fa-solid fa-circle-user" style={{ position: 'absolute', left: '1.1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-light)' }}></i>
                  </div>
                  <div className="field-hint">Please select your gender.</div>
                  {(touched.gender || submitted) && getFieldError('gender', formData.gender) && (
                    <div className="field-error-message" style={{ display: 'block' }}>{getFieldError('gender', formData.gender)}</div>
                  )}
                </div>

                {/* 6. PIN Code */}
                <div className="form-field">
                  <div className="field-label-row">
                    <label htmlFor="pincode">PIN Code <span className="field-optional">(Optional)</span></label>
                    {formData.pincode.trim() && (touched.pincode || submitted) && (
                      <span className={`status-badge ${isFieldValid('pincode') ? 'valid' : 'invalid'}`} style={{ display: 'inline-block' }}>
                        {isFieldValid('pincode') ? 'Valid' : 'Invalid'}
                      </span>
                    )}
                  </div>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="pincode"
                      name="pincode"
                      placeholder="e.g. 682001"
                      maxLength={6}
                      className={`input-control ${formData.pincode.trim() && (touched.pincode || submitted) ? (isFieldValid('pincode') ? 'valid-field' : 'invalid-field') : ''}`}
                      value={formData.pincode}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <i className="fa-solid fa-map-pin"></i>
                  </div>
                  <div className="field-hint">6-digit Indian PIN code.</div>
                  {(touched.pincode || submitted) && getFieldError('pincode', formData.pincode) && (
                    <div className="field-error-message" style={{ display: 'block' }}>{getFieldError('pincode', formData.pincode)}</div>
                  )}
                </div>

                {/* 7. Farm Location / District */}
                <div className="form-field">
                  <div className="field-label-row">
                    <label htmlFor="region">Farm Location / District <span className="required-star">*</span></label>
                    {(touched.region || submitted) && (
                      <span className={`status-badge ${isFieldValid('region') ? 'valid' : 'invalid'}`} style={{ display: 'inline-block' }}>
                        {isFieldValid('region') ? 'Valid' : 'Invalid'}
                      </span>
                    )}
                  </div>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="region"
                      name="region"
                      placeholder="e.g. Kerala, India"
                      required
                      className={`input-control ${(touched.region || submitted) ? (isFieldValid('region') ? 'valid-field' : 'invalid-field') : ''}`}
                      value={formData.region}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <i className="fa-solid fa-location-dot"></i>
                  </div>
                  <div className="field-hint">State or district location.</div>
                  {(touched.region || submitted) && getFieldError('region', formData.region) && (
                    <div className="field-error-message" style={{ display: 'block' }}>{getFieldError('region', formData.region)}</div>
                  )}
                </div>

                {/* 8. Primary Soil Type */}
                <div className="form-field">
                  <div className="field-label-row">
                    <label htmlFor="soilType">Primary Soil Type <span className="required-star">*</span></label>
                    {(touched.soilType || submitted) && (
                      <span className={`status-badge ${isFieldValid('soilType') ? 'valid' : 'invalid'}`} style={{ display: 'inline-block' }}>
                        {isFieldValid('soilType') ? 'Valid' : 'Invalid'}
                      </span>
                    )}
                  </div>
                  <div className="input-wrapper" style={{ position: 'relative' }}>
                    <select
                      id="soilType"
                      name="soilType"
                      className={`input-control select-control ${(touched.soilType || submitted) ? (isFieldValid('soilType') ? 'valid-field' : 'invalid-field') : ''}`}
                      required
                      style={{ paddingLeft: '2.75rem', width: '100%' }}
                      value={formData.soilType}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      <option value="" disabled>Select Soil Category</option>
                      <option value="clayey">Clayey Soil</option>
                      <option value="loamy">Loamy Soil</option>
                      <option value="sandy">Sandy Soil</option>
                      <option value="alluvial">Alluvial Soil</option>
                      <option value="black">Black Cotton Soil</option>
                      <option value="red">Red / Laterite Soil</option>
                    </select>
                    <i className="fa-solid fa-mound" style={{ position: 'absolute', left: '1.1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-light)' }}></i>
                  </div>
                  <div className="field-hint">Calibrates default NPK baselines.</div>
                  {(touched.soilType || submitted) && getFieldError('soilType', formData.soilType) && (
                    <div className="field-error-message" style={{ display: 'block' }}>{getFieldError('soilType', formData.soilType)}</div>
                  )}
                </div>

                {/* 9. Create Password */}
                <div className="form-field">
                  <div className="field-label-row">
                    <label htmlFor="password">Create Password <span className="required-star">*</span></label>
                    {(touched.password || submitted) && (
                      <span className={`status-badge ${isFieldValid('password') ? 'valid' : 'invalid'}`} style={{ display: 'inline-block' }}>
                        {isFieldValid('password') ? 'Valid' : 'Invalid'}
                      </span>
                    )}
                  </div>
                  <div className="input-wrapper">
                    <input
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Min. 8 characters"
                      required
                      className={`input-control ${(touched.password || submitted) ? (isFieldValid('password') ? 'valid-field' : 'invalid-field') : ''}`}
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <i className="fa-solid fa-lock"></i>
                  </div>
                  <div className="field-hint">Min. 8 chars with uppercase, lowercase, number & symbol.</div>
                  <div className="password-meter-container">
                    <div className="password-meter-bg">
                      <div className={`password-meter-fill ${strength.class}`} style={{ width: strength.percent }}></div>
                    </div>
                    <span className="password-meter-text">{strength.text}</span>
                  </div>
                  {(touched.password || submitted) && getFieldError('password', formData.password) && (
                    <div className="field-error-message" style={{ display: 'block' }}>{getFieldError('password', formData.password)}</div>
                  )}
                </div>

                {/* 10. Confirm Password */}
                <div className="form-field">
                  <div className="field-label-row">
                    <label htmlFor="confirmPassword">Confirm Password <span className="required-star">*</span></label>
                    {(touched.confirmPassword || submitted) && (
                      <span className={`status-badge ${isFieldValid('confirmPassword') ? 'valid' : 'invalid'}`} style={{ display: 'inline-block' }}>
                        {isFieldValid('confirmPassword') ? 'Valid' : 'Invalid'}
                      </span>
                    )}
                  </div>
                  <div className="input-wrapper">
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Re-enter password"
                      required
                      className={`input-control ${(touched.confirmPassword || submitted) ? (isFieldValid('confirmPassword') ? 'valid-field' : 'invalid-field') : ''}`}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <i className="fa-solid fa-shield-check"></i>
                  </div>
                  <div className="field-hint">Must match password entered above.</div>
                  {(touched.confirmPassword || submitted) && getFieldError('confirmPassword', formData.confirmPassword) && (
                    <div className="field-error-message" style={{ display: 'block' }}>{getFieldError('confirmPassword', formData.confirmPassword)}</div>
                  )}
                </div>

              </div>

              {/* Terms Checkbox */}
              <div className="form-options" style={{ marginTop: '1rem' }}>
                <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="terms"
                    required
                    checked={formData.terms}
                    onChange={handleChange}
                  />
                  <span>I agree to AgriSense Farm Advisory Terms and Data Privacy Policy <span className="required-star">*</span></span>
                </label>
                {(touched.terms || submitted) && getFieldError('terms', formData.terms) && (
                  <div className="field-error-message" style={{ display: 'block' }}>{getFieldError('terms', formData.terms)}</div>
                )}
              </div>

              <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-terracotta btn-block" disabled={success}>
                  <i className="fa-solid fa-user-plus"></i> Register Farm Profile
                </button>
              </div>
            </form>

            <div className="auth-footer">
              <p>Already registered? <Link to="/login" className="auth-accent-link">Sign In to Existing Account <i className="fa-solid fa-arrow-right"></i></Link></p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
