/**
 * AgriSense Registration Form Validation System
 * Task 01, Task 02, Task 03, Task 04 Complete Integrated Implementation
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.auth-form');
    if (!form) return;

    // Form Control References
    const fullNameInput = document.getElementById('fullname');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const dobInput = document.getElementById('dob');
    const genderSelect = document.getElementById('gender');
    const pincodeInput = document.getElementById('pincode');
    const regionInput = document.getElementById('region');
    const soilSelect = document.getElementById('soil-type');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm_password');
    const termsCheckbox = document.getElementById('terms-checkbox');

    // Live Alert & Feedback Elements
    const formErrorSummary = document.getElementById('formErrorSummary');
    const formSuccessSummary = document.getElementById('formSuccessSummary');
    const passwordMeter = document.getElementById('password-meter-fill');
    const passwordMeterText = document.getElementById('password-meter-text');

    // Task 03: Regular Expressions (Regex)
    const patterns = {
        // Task 03: Full Name (Only alphabets and spaces, 3-30 length constraint)
        fullName: /^[a-zA-Z\s]{3,30}$/,
        
        // Task 03: Email Address Regex
        email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        
        // Task 03: Indian Mobile Number (10 digits starting with 6, 7, 8, or 9, optional +91 prefix)
        phone: /^(?:\+91[\s-]?)?[6-9]\d{9}$/,
        
        // Task 03: Strong Password (Uppercase, Lowercase, Number, Special Character, 8+ length)
        password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
        
        // Task 03: PIN Code (Optional 6-digit Indian Postal PIN)
        pincode: /^\d{6}$/,

        // Location / Region
        region: /^[a-zA-Z0-9\s,.-]{2,60}$/
    };

    // User-Friendly Messages
    const errorMessages = {
        fullName: 'Full Name must be between 3 and 30 characters and contain only alphabets and spaces.',
        email: 'Please enter a valid email address (e.g. farmer@example.com).',
        phone: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.',
        dobAge: 'You must be at least 18 years old to register.',
        dobRequired: 'Please enter your date of birth.',
        gender: 'Please select your gender.',
        pincode: 'PIN code must be a 6-digit number.',
        region: 'Please enter a valid location or district name.',
        soilSelect: 'Please select a primary soil category for your farm plot.',
        password: 'Password must be at least 8 characters long and contain uppercase, lowercase, a number, and a special character.',
        confirmPassword: 'Passwords do not match. Please re-enter your password.',
        terms: 'Please accept the AgriSense Terms and Data Privacy Policy to proceed.'
    };

    /**
     * Set valid visual state (Task 04: Green border + "Valid" status badge)
     */
    function setValid(input, errorElement, statusBadge) {
        if (!input) return;
        input.setAttribute('aria-invalid', 'false');
        input.classList.remove('invalid-field');
        input.classList.add('valid-field');

        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }

        if (statusBadge) {
            statusBadge.textContent = 'Valid';
            statusBadge.className = 'status-badge valid';
            statusBadge.style.display = 'inline-block';
        }
    }

    /**
     * Set invalid visual state (Task 04: Red border + "Invalid" status badge + inline error)
     */
    function setInvalid(input, errorElement, message, statusBadge) {
        if (!input) return;
        input.setAttribute('aria-invalid', 'true');
        input.classList.remove('valid-field');
        input.classList.add('invalid-field');

        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }

        if (statusBadge) {
            statusBadge.textContent = 'Invalid';
            statusBadge.className = 'status-badge invalid';
            statusBadge.style.display = 'inline-block';
        }
    }

    /**
     * Reset field visual state if optional and empty
     */
    function resetFieldState(input, errorElement, statusBadge) {
        if (!input) return;
        input.removeAttribute('aria-invalid');
        input.classList.remove('valid-field', 'invalid-field');

        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }

        if (statusBadge) {
            statusBadge.textContent = '';
            statusBadge.className = 'status-badge';
            statusBadge.style.display = 'none';
        }
    }

    /**
     * Field Validators
     */

    // 1. Full Name Validation (3-30 chars, Alphabets & Spaces)
    function validateFullName() {
        const errorEl = document.getElementById('fullname-error');
        const badgeEl = document.getElementById('fullname-status');
        const val = fullNameInput.value.trim();

        if (!val) {
            setInvalid(fullNameInput, errorEl, 'Full name is required.', badgeEl);
            return false;
        }
        if (!patterns.fullName.test(val)) {
            setInvalid(fullNameInput, errorEl, errorMessages.fullName, badgeEl);
            return false;
        }
        setValid(fullNameInput, errorEl, badgeEl);
        return true;
    }

    // 2. Email Format Validation
    function validateEmail() {
        const errorEl = document.getElementById('email-error');
        const badgeEl = document.getElementById('email-status');
        const val = emailInput.value.trim();

        if (!val) {
            setInvalid(emailInput, errorEl, 'Email address is required.', badgeEl);
            return false;
        }
        if (!patterns.email.test(val)) {
            setInvalid(emailInput, errorEl, errorMessages.email, badgeEl);
            return false;
        }
        setValid(emailInput, errorEl, badgeEl);
        return true;
    }

    // 3. Indian Phone Number Validation (Strictly 10-digit Indian Mobile Numbers)
    function validatePhone() {
        const errorEl = document.getElementById('phone-error');
        const badgeEl = document.getElementById('phone-status');
        const val = phoneInput.value.trim();
        const cleanPhone = val.replace(/[\s\-\(\)]/g, '');

        if (!val) {
            setInvalid(phoneInput, errorEl, 'Indian mobile number is required.', badgeEl);
            return false;
        }

        if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
            setInvalid(phoneInput, errorEl, 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.', badgeEl);
            return false;
        }

        setValid(phoneInput, errorEl, badgeEl);
        return true;
    }

    countryCodeSelect?.addEventListener('change', validatePhone);

    // 4. Date of Birth Validation (18+ Years Age Check)
    function validateDOB() {
        const errorEl = document.getElementById('dob-error');
        const badgeEl = document.getElementById('dob-status');
        const val = dobInput.value;

        if (!val) {
            setInvalid(dobInput, errorEl, errorMessages.dobRequired, badgeEl);
            return false;
        }

        const dobDate = new Date(val);
        const today = new Date();
        
        let age = today.getFullYear() - dobDate.getFullYear();
        const monthDiff = today.getMonth() - dobDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
            age--;
        }

        if (isNaN(dobDate.getTime()) || age < 18) {
            setInvalid(dobInput, errorEl, errorMessages.dobAge, badgeEl);
            return false;
        }

        setValid(dobInput, errorEl, badgeEl);
        return true;
    }

    // 5. Gender Selection Validation
    function validateGender() {
        const errorEl = document.getElementById('gender-error');
        const badgeEl = document.getElementById('gender-status');
        const val = genderSelect.value;

        if (!val) {
            setInvalid(genderSelect, errorEl, errorMessages.gender, badgeEl);
            return false;
        }
        setValid(genderSelect, errorEl, badgeEl);
        return true;
    }

    // 6. PIN Code Validation (Optional 6-digit regex)
    function validatePincode() {
        const errorEl = document.getElementById('pincode-error');
        const badgeEl = document.getElementById('pincode-status');
        const val = pincodeInput.value.trim();

        if (!val) {
            resetFieldState(pincodeInput, errorEl, badgeEl);
            return true; // Optional field
        }

        if (!patterns.pincode.test(val)) {
            setInvalid(pincodeInput, errorEl, errorMessages.pincode, badgeEl);
            return false;
        }
        setValid(pincodeInput, errorEl, badgeEl);
        return true;
    }

    // 7. Location / District Validation
    function validateRegion() {
        const errorEl = document.getElementById('region-error');
        const badgeEl = document.getElementById('region-status');
        const val = regionInput.value.trim();

        if (!val) {
            setInvalid(regionInput, errorEl, 'Farm location/district is required.', badgeEl);
            return false;
        }
        if (!patterns.region.test(val)) {
            setInvalid(regionInput, errorEl, errorMessages.region, badgeEl);
            return false;
        }
        setValid(regionInput, errorEl, badgeEl);
        return true;
    }

    // 8. Soil Selection Validation
    function validateSoil() {
        const errorEl = document.getElementById('soil-error');
        const badgeEl = document.getElementById('soil-status');
        if (!soilSelect.value) {
            setInvalid(soilSelect, errorEl, errorMessages.soilSelect, badgeEl);
            return false;
        }
        setValid(soilSelect, errorEl, badgeEl);
        return true;
    }

    // Task 02 & 04: Password Strength Calculation Meter
    function updatePasswordMeter(val) {
        if (!passwordMeter || !passwordMeterText) return;
        
        let score = 0;
        if (val.length >= 8) score++;
        if (/[A-Z]/.test(val)) score++;
        if (/[a-z]/.test(val)) score++;
        if (/\d/.test(val)) score++;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val)) score++;

        if (val.length === 0) {
            passwordMeter.style.width = '0%';
            passwordMeter.className = 'password-meter-fill';
            passwordMeterText.textContent = '';
        } else if (score <= 2) {
            passwordMeter.style.width = '33%';
            passwordMeter.className = 'password-meter-fill weak';
            passwordMeterText.textContent = 'Weak Password';
        } else if (score <= 4) {
            passwordMeter.style.width = '66%';
            passwordMeter.className = 'password-meter-fill medium';
            passwordMeterText.textContent = 'Medium Strength';
        } else {
            passwordMeter.style.width = '100%';
            passwordMeter.className = 'password-meter-fill strong';
            passwordMeterText.textContent = 'Strong Password';
        }
    }

    // 9. Strong Password Validation
    function validatePassword() {
        const errorEl = document.getElementById('password-error');
        const badgeEl = document.getElementById('password-status');
        const val = passwordInput.value;
        
        updatePasswordMeter(val);

        if (!val) {
            setInvalid(passwordInput, errorEl, 'Password is required.', badgeEl);
            return false;
        }
        if (!patterns.password.test(val)) {
            setInvalid(passwordInput, errorEl, errorMessages.password, badgeEl);
            return false;
        }
        setValid(passwordInput, errorEl, badgeEl);

        // Revalidate confirm password if already typed
        if (confirmPasswordInput.value) {
            validateConfirmPassword();
        }
        return true;
    }

    // 10. Confirm Password Matching
    function validateConfirmPassword() {
        const errorEl = document.getElementById('confirm-password-error');
        const badgeEl = document.getElementById('confirm_password-status');
        const val = confirmPasswordInput.value;

        if (!val) {
            setInvalid(confirmPasswordInput, errorEl, 'Please confirm your password.', badgeEl);
            return false;
        }
        if (val !== passwordInput.value) {
            setInvalid(confirmPasswordInput, errorEl, errorMessages.confirmPassword, badgeEl);
            return false;
        }
        setValid(confirmPasswordInput, errorEl, badgeEl);
        return true;
    }

    // 11. Terms Checkbox Validation
    function validateTerms() {
        const errorEl = document.getElementById('terms-error');
        if (!termsCheckbox.checked) {
            setInvalid(termsCheckbox, errorEl, errorMessages.terms, null);
            return false;
        }
        setValid(termsCheckbox, errorEl, null);
        return true;
    }

    // Task 04: Live Validation While Typing ('input' event listeners) & Blur Event Listeners
    fullNameInput?.addEventListener('input', validateFullName);
    fullNameInput?.addEventListener('blur', validateFullName);

    emailInput?.addEventListener('input', validateEmail);
    emailInput?.addEventListener('blur', validateEmail);

    phoneInput?.addEventListener('input', validatePhone);
    phoneInput?.addEventListener('blur', validatePhone);

    dobInput?.addEventListener('change', validateDOB);
    dobInput?.addEventListener('blur', validateDOB);

    genderSelect?.addEventListener('change', validateGender);
    genderSelect?.addEventListener('blur', validateGender);

    pincodeInput?.addEventListener('input', validatePincode);
    pincodeInput?.addEventListener('blur', validatePincode);

    regionInput?.addEventListener('input', validateRegion);
    regionInput?.addEventListener('blur', validateRegion);

    soilSelect?.addEventListener('change', validateSoil);
    soilSelect?.addEventListener('blur', validateSoil);

    passwordInput?.addEventListener('input', validatePassword);
    passwordInput?.addEventListener('blur', validatePassword);

    confirmPasswordInput?.addEventListener('input', validateConfirmPassword);
    confirmPasswordInput?.addEventListener('blur', validateConfirmPassword);

    termsCheckbox?.addEventListener('change', validateTerms);

    // Task 02 & Task 04: Intercept Form Submission (event.preventDefault())
    form.addEventListener('submit', (e) => {
        // Prevent default browser form submission
        e.preventDefault();

        // Perform validation across all mandatory and optional fields
        const isNameValid = validateFullName();
        const isEmailValid = validateEmail();
        const isPhoneValid = validatePhone();
        const isDOBValid = validateDOB();
        const isGenderValid = validateGender();
        const isPincodeValid = validatePincode();
        const isRegionValid = validateRegion();
        const isSoilValid = validateSoil();
        const isPasswordValid = validatePassword();
        const isConfirmValid = validateConfirmPassword();
        const isTermsValid = validateTerms();

        const isFormValid = isNameValid && isEmailValid && isPhoneValid && isDOBValid && 
                            isGenderValid && isPincodeValid && isRegionValid && isSoilValid && 
                            isPasswordValid && isConfirmValid && isTermsValid;

        if (!isFormValid) {
            // Task 04: Hide success message, display summary error banner
            if (formSuccessSummary) formSuccessSummary.hidden = true;

            if (formErrorSummary) {
                formErrorSummary.hidden = false;
                formErrorSummary.textContent = 'Please correct the highlighted errors before submitting your registration profile.';
                formErrorSummary.focus();
            }

            // Task 02: Focus management - focus first invalid input field
            const firstInvalidField = form.querySelector('[aria-invalid="true"]');
            if (firstInvalidField) {
                firstInvalidField.focus();
            }
        } else {
            // Task 04: Hide error summary banner
            if (formErrorSummary) {
                formErrorSummary.hidden = true;
                formErrorSummary.textContent = '';
            }

            // Task 04: Display Success Message
            if (formSuccessSummary) {
                formSuccessSummary.hidden = false;
                formSuccessSummary.focus();
            }

            // Save registered user details in localStorage
            const userData = {
                fullname: fullNameInput ? fullNameInput.value.trim() : 'Registered Farmer',
                email: emailInput ? emailInput.value.trim() : '',
                phone: `+91 ${phoneInput ? phoneInput.value.trim() : ''}`,
                region: regionInput ? regionInput.value.trim() : 'Kerala, India',
                soilType: soilSelect ? soilSelect.value : 'clayey',
                registeredAt: new Date().toLocaleString()
            };
            try {
                localStorage.setItem('agrisense_user', JSON.stringify(userData));
            } catch (err) {
                console.error('Failed to save profile:', err);
            }

            // Disable submit button and indicate progress
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Registration Verified! Redirecting...';
            }

            // Simulate navigation after successful validation
            setTimeout(() => {
                window.location.href = form.getAttribute('action') || 'dashboard.html';
            }, 1800);
        }
    });
});
