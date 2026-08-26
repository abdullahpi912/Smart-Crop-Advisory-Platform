/**
 * Cropling Multi-Step Farm Registration Form Controller
 * Support for 4-Step Wizard, Real-time Validation, File Upload, and Draft State Persistence
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.auth-form');
    if (!form) return;

    // Multi-Step Navigation Controls
    let currentStep = 1;
    const totalSteps = 4;

    const stepPanels = {
        1: document.getElementById('step-1'),
        2: document.getElementById('step-2'),
        3: document.getElementById('step-3'),
        4: document.getElementById('step-4')
    };

    const stepperTabs = document.querySelectorAll('.stepper-tab');
    const prevBtn = document.getElementById('prev-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');

    // Input Control References
    const fullNameInput = document.getElementById('fullname');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const countryCodeSelect = document.getElementById('country-code');
    const dobInput = document.getElementById('dob');
    const genderSelect = document.getElementById('gender');
    const plotNameInput = document.getElementById('plotName');
    const regionInput = document.getElementById('region');
    const stateNameInput = document.getElementById('stateName');
    const pincodeInput = document.getElementById('pincode');
    const soilSelect = document.getElementById('soil-type');
    const nitrogenInput = document.getElementById('nitrogen');
    const phosphorusInput = document.getElementById('phosphorus');
    const potassiumInput = document.getElementById('potassium');
    const phInput = document.getElementById('ph');
    const soilReportInput = document.getElementById('soilReport');
    const fileUploadText = document.getElementById('file-upload-filename');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm_password');
    const termsCheckbox = document.getElementById('terms-checkbox');

    // Alert & Feedback Banners
    const formErrorSummary = document.getElementById('formErrorSummary');
    const formSuccessSummary = document.getElementById('formSuccessSummary');

    // Regex Patterns
    const patterns = {
        fullName: /^[a-zA-Z\s]{3,30}$/,
        email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        phone: /^[6-9]\d{9}$/,
        password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
        pincode: /^\d{6}$/,
        region: /^[a-zA-Z0-9\s,.-]{2,60}$/
    };

    // User Messages
    const errorMessages = {
        fullName: 'Full Name must be 3–30 characters, alphabets only.',
        email: 'Please enter a valid email address.',
        phone: 'Valid 10-digit Indian mobile number required.',
        dobAge: 'Must be at least 18 years old.',
        dobRequired: 'Please enter your date of birth.',
        gender: 'Please select gender.',
        region: 'District/Location is required.',
        password: 'Min 8 chars, uppercase, number & symbol required.',
        confirmPassword: 'Passwords do not match.',
        terms: 'Accept terms to proceed.'
    };

    // Restore draft state from sessionStorage if available
    try {
        const savedDraft = sessionStorage.getItem('cropling_reg_draft') || sessionStorage.getItem('agrisense_reg_draft');
        if (savedDraft) {
            const draft = JSON.parse(savedDraft);
            if (draft.currentStep) currentStep = draft.currentStep;
            if (draft.fullname && fullNameInput) fullNameInput.value = draft.fullname;
            if (draft.email && emailInput) emailInput.value = draft.email;
            if (draft.phone && phoneInput) phoneInput.value = draft.phone;
            if (draft.dob && dobInput) dobInput.value = draft.dob;
            if (draft.gender && genderSelect) genderSelect.value = draft.gender;
            if (draft.plotName && plotNameInput) plotNameInput.value = draft.plotName;
            if (draft.region && regionInput) regionInput.value = draft.region;
            if (draft.stateName && stateNameInput) stateNameInput.value = draft.stateName;
            if (draft.pincode && pincodeInput) pincodeInput.value = draft.pincode;
            if (draft.soilType && soilSelect) soilSelect.value = draft.soilType;
            if (draft.nitrogen && nitrogenInput) nitrogenInput.value = draft.nitrogen;
            if (draft.phosphorus && phosphorusInput) phosphorusInput.value = draft.phosphorus;
            if (draft.potassium && potassiumInput) potassiumInput.value = draft.potassium;
            if (draft.ph && phInput) phInput.value = draft.ph;
        }
    } catch (e) {
        console.error('Failed to restore draft state:', e);
    }

    function saveDraftState() {
        const draft = {
            currentStep,
            fullname: fullNameInput?.value || '',
            email: emailInput?.value || '',
            phone: phoneInput?.value || '',
            dob: dobInput?.value || '',
            gender: genderSelect?.value || '',
            plotName: plotNameInput?.value || '',
            region: regionInput?.value || '',
            stateName: stateNameInput?.value || '',
            pincode: pincodeInput?.value || '',
            soilType: soilSelect?.value || '',
            nitrogen: nitrogenInput?.value || '',
            phosphorus: phosphorusInput?.value || '',
            potassium: potassiumInput?.value || '',
            ph: phInput?.value || ''
        };
        try {
            sessionStorage.setItem('cropling_reg_draft', JSON.stringify(draft));
            sessionStorage.setItem('agrisense_reg_draft', JSON.stringify(draft));
        } catch (e) {
            console.error('Failed to save draft state:', e);
        }
    }

    // Helper functions for field validation
    function showError(elementId, message) {
        const el = document.getElementById(elementId);
        if (el) {
            el.textContent = message;
            el.style.display = 'block';
        }
    }

    function hideError(elementId) {
        const el = document.getElementById(elementId);
        if (el) {
            el.textContent = '';
            el.style.display = 'none';
        }
    }

    function validateStep1() {
        let valid = true;
        
        // Full Name
        const nameVal = fullNameInput ? fullNameInput.value.trim() : '';
        if (!nameVal || !patterns.fullName.test(nameVal)) {
            showError('fullname-error', errorMessages.fullName);
            valid = false;
        } else {
            hideError('fullname-error');
        }

        // Email
        const emailVal = emailInput ? emailInput.value.trim() : '';
        if (!emailVal || !patterns.email.test(emailVal)) {
            showError('email-error', errorMessages.email);
            valid = false;
        } else {
            hideError('email-error');
        }

        // Phone
        const phoneVal = phoneInput ? phoneInput.value.replace(/[\s\-\(\)]/g, '') : '';
        if (!phoneVal || !patterns.phone.test(phoneVal)) {
            showError('phone-error', errorMessages.phone);
            valid = false;
        } else {
            hideError('phone-error');
        }

        // DOB
        const dobVal = dobInput ? dobInput.value : '';
        if (!dobVal) {
            showError('dob-error', errorMessages.dobRequired);
            valid = false;
        } else {
            const dobDate = new Date(dobVal);
            const today = new Date();
            let age = today.getFullYear() - dobDate.getFullYear();
            if (isNaN(dobDate.getTime()) || age < 18) {
                showError('dob-error', errorMessages.dobAge);
                valid = false;
            } else {
                hideError('dob-error');
            }
        }

        // Gender
        if (!genderSelect || !genderSelect.value) {
            showError('gender-error', errorMessages.gender);
            valid = false;
        } else {
            hideError('gender-error');
        }

        return valid;
    }

    function validateStep2() {
        let valid = true;
        const regionVal = regionInput ? regionInput.value.trim() : '';
        if (!regionVal) {
            showError('region-error', errorMessages.region);
            valid = false;
        } else {
            hideError('region-error');
        }
        return valid;
    }

    function validateStep3() {
        return true; // Optional soil parameters & file
    }

    function validateStep4() {
        let valid = true;

        // Password
        const passVal = passwordInput ? passwordInput.value : '';
        if (!passVal || !patterns.password.test(passVal)) {
            showError('password-error', errorMessages.password);
            valid = false;
        } else {
            hideError('password-error');
        }

        // Confirm Password
        const confirmVal = confirmPasswordInput ? confirmPasswordInput.value : '';
        if (!confirmVal || confirmVal !== passVal) {
            showError('confirm-password-error', errorMessages.confirmPassword);
            valid = false;
        } else {
            hideError('confirm-password-error');
        }

        // Terms
        if (!termsCheckbox || !termsCheckbox.checked) {
            showError('terms-error', errorMessages.terms);
            valid = false;
        } else {
            hideError('terms-error');
        }

        return valid;
    }

    function validateCurrentStep() {
        if (currentStep === 1) return validateStep1();
        if (currentStep === 2) return validateStep2();
        if (currentStep === 3) return validateStep3();
        if (currentStep === 4) return validateStep4();
        return true;
    }

    function updateStepUI() {
        // Show active panel, hide others
        for (let i = 1; i <= totalSteps; i++) {
            if (stepPanels[i]) {
                stepPanels[i].style.display = i === currentStep ? 'block' : 'none';
            }
        }

        // Update Stepper Tabs & Roadmap Items
        const roadmapItems = document.querySelectorAll('.roadmap-item');
        stepperTabs.forEach((tab) => {
            const stepNum = parseInt(tab.getAttribute('data-step'), 10);
            tab.classList.remove('active', 'completed');
            const circle = tab.querySelector('.step-icon-circle');

            if (stepNum === currentStep) {
                tab.classList.add('active');
                if (circle) circle.innerHTML = stepNum;
            } else if (stepNum < currentStep) {
                tab.classList.add('completed');
                if (circle) circle.innerHTML = '<i class="fa-solid fa-check"></i>';
            } else {
                if (circle) circle.innerHTML = stepNum;
            }
        });

        roadmapItems.forEach((item) => {
            const stepNum = parseInt(item.getAttribute('data-roadmap-step'), 10);
            item.classList.remove('active', 'completed');
            const numEl = item.querySelector('.roadmap-num');
            if (stepNum === currentStep) {
                item.classList.add('active');
                if (numEl) numEl.innerHTML = stepNum;
            } else if (stepNum < currentStep) {
                item.classList.add('completed');
                if (numEl) numEl.innerHTML = '<i class="fa-solid fa-check"></i>';
            } else {
                if (numEl) numEl.innerHTML = stepNum;
            }
        });

        // Update Footer Buttons
        if (currentStep === 1) {
            if (prevBtn) prevBtn.style.display = 'none';
            if (cancelBtn) cancelBtn.style.display = 'inline-block';
            if (nextBtn) nextBtn.style.display = 'inline-flex';
            if (submitBtn) submitBtn.style.display = 'none';
        } else if (currentStep < totalSteps) {
            if (prevBtn) prevBtn.style.display = 'inline-block';
            if (cancelBtn) cancelBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'inline-flex';
            if (submitBtn) submitBtn.style.display = 'none';
        } else {
            if (prevBtn) prevBtn.style.display = 'inline-block';
            if (cancelBtn) cancelBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
            if (submitBtn) submitBtn.style.display = 'inline-flex';
        }

        saveDraftState();
    }

    // Step Switch Event Listeners
    nextBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        if (validateCurrentStep()) {
            if (currentStep < totalSteps) {
                currentStep++;
                updateStepUI();
                if (formErrorSummary) formErrorSummary.hidden = true;
            }
        } else {
            if (formErrorSummary) {
                formErrorSummary.hidden = false;
                formErrorSummary.textContent = 'Please fill out required fields before continuing.';
            }
        }
    });

    prevBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentStep > 1) {
            currentStep--;
            updateStepUI();
            if (formErrorSummary) formErrorSummary.hidden = true;
        }
    });

    stepperTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const targetStep = parseInt(tab.getAttribute('data-step'), 10);
            if (targetStep < currentStep || validateCurrentStep()) {
                currentStep = targetStep;
                updateStepUI();
                if (formErrorSummary) formErrorSummary.hidden = true;
            }
        });
    });

    // File Upload Handler
    soilReportInput?.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            if (fileUploadText) fileUploadText.textContent = e.target.files[0].name;
        } else {
            if (fileUploadText) fileUploadText.textContent = 'No file chosen.';
        }
    });

    // Save inputs to draft as user types
    form.addEventListener('input', saveDraftState);
    form.addEventListener('change', saveDraftState);

    // Form Submit Handler
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!validateStep1() || !validateStep2() || !validateStep4()) {
            if (formErrorSummary) {
                formErrorSummary.hidden = false;
                formErrorSummary.textContent = 'Please resolve all required form fields before submitting.';
            }
            return;
        }

        if (formErrorSummary) formErrorSummary.hidden = true;

        if (formSuccessSummary) {
            formSuccessSummary.style.display = 'flex';
        }

        // Store profile in localStorage
        const userData = {
            fullname: fullNameInput ? fullNameInput.value.trim() : '',
            email: emailInput ? emailInput.value.trim() : '',
            phone: `+91 ${phoneInput ? phoneInput.value.trim() : ''}`,
            region: regionInput ? regionInput.value.trim() : '',
            soilType: soilSelect ? soilSelect.value : 'loamy',
            registeredAt: new Date().toLocaleString()
        };

        try {
            localStorage.setItem('cropling_user', JSON.stringify(userData));
            localStorage.setItem('agrisense_user', JSON.stringify(userData));
            sessionStorage.removeItem('cropling_reg_draft');
            sessionStorage.removeItem('agrisense_reg_draft');
        } catch (err) {
            console.error('Failed to save profile to localStorage:', err);
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Registering...';
        }

        setTimeout(() => {
            window.location.href = form.getAttribute('action') || 'dashboard.html';
        }, 1600);
    });

    // Initial UI render
    updateStepUI();
});
