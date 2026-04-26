/**
 * Nathan Acosta Tutoring - Main JavaScript
 *
 * @file main.js
 * @description Interactive functionality for the tutoring website
 * @author [Ty Bland]
 * @course ITIS 3135
 * @date April 2025
 */

"use strict";

/* ==========================================================================
   1. MOBILE NAVIGATION TOGGLE
   ========================================================================== */

/**
 * Initializes the mobile navigation toggle functionality.
 * Adds click event to hamburger button to show/hide navigation menu.
 */
function initMobileNav() {
    const navToggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('header nav');

    if (!navToggle || !nav) return;

    navToggle.addEventListener('click', function() {
        nav.classList.toggle('nav-open');
        navToggle.classList.toggle('active');

        // Update aria-expanded for accessibility
        const isOpen = nav.classList.contains('nav-open');
        navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close nav when clicking outside
    document.addEventListener('click', function(event) {
        if (!nav.contains(event.target) && !navToggle.contains(event.target)) {
            nav.classList.remove('nav-open');
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    });
}

/* ==========================================================================
   2. CONTACT FORM VALIDATION
   ========================================================================== */

/**
 * Validates an email address format using regex.
 * @param {string} email - The email address to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

/**
 * Validates a phone number format (optional field).
 * @param {string} phone - The phone number to validate
 * @returns {boolean} - True if valid or empty, false otherwise
 */
function isValidPhone(phone) {
    if (!phone) return true; // Phone is optional
    const phonePattern = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return phonePattern.test(phone);
}

/**
 * Shows an error message for a form field.
 * @param {HTMLElement} field - The input field element
 * @param {string} message - The error message to display
 */
function showError(field, message) {
    // Remove any existing error
    clearError(field);

    // Add error class to field
    field.classList.add('field-error');

    // Create and insert error message
    const errorEl = document.createElement('span');
    errorEl.className = 'error-message';
    errorEl.textContent = message;
    field.parentNode.appendChild(errorEl);
}

/**
 * Clears the error message for a form field.
 * @param {HTMLElement} field - The input field element
 */
function clearError(field) {
    field.classList.remove('field-error');
    const errorEl = field.parentNode.querySelector('.error-message');
    if (errorEl) {
        errorEl.remove();
    }
}

/**
 * Shows a success state for a valid field.
 * @param {HTMLElement} field - The input field element
 */
function showSuccess(field) {
    clearError(field);
    field.classList.add('field-success');
}

/**
 * Validates a single form field and shows appropriate feedback.
 * @param {HTMLElement} field - The input field to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;

    // Remove previous success state
    field.classList.remove('field-success');

    switch (fieldName) {
        case 'name':
            if (!value) {
                showError(field, 'Please enter your name');
                return false;
            }
            if (value.length < 2) {
                showError(field, 'Name must be at least 2 characters');
                return false;
            }
            showSuccess(field);
            return true;

        case 'email':
            if (!value) {
                showError(field, 'Please enter your email address');
                return false;
            }
            if (!isValidEmail(value)) {
                showError(field, 'Please enter a valid email address');
                return false;
            }
            showSuccess(field);
            return true;

        case 'phone':
            // Phone is optional, only validate format if provided
            if (value && !isValidPhone(value)) {
                showError(field, 'Please enter a valid phone number');
                return false;
            }
            if (value) {
                showSuccess(field);
            }
            return true;

        case 'message':
            if (!value) {
                showError(field, 'Please enter a message');
                return false;
            }
            if (value.length < 10) {
                showError(field, 'Message must be at least 10 characters');
                return false;
            }
            showSuccess(field);
            return true;

        default:
            // For fields without specific validation (like select dropdown)
            return true;
    }
}

/**
 * Initializes contact form validation with real-time feedback.
 */
function initContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    const fields = form.querySelectorAll('input, textarea, select');

    // Add blur event listeners for real-time validation
    fields.forEach(function(field) {
        field.addEventListener('blur', function() {
            if (field.value.trim()) {
                validateField(field);
            }
        });

        // Clear error on input
        field.addEventListener('input', function() {
            clearError(field);
        });
    });

    // Form submission handler
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        let isValid = true;

        // Validate all required fields
        fields.forEach(function(field) {
            if (field.hasAttribute('required') || field.value.trim()) {
                if (!validateField(field)) {
                    isValid = false;
                }
            }
        });

        if (isValid) {
            // Show success message
            showFormSuccess(form);
        }
    });
}

/**
 * Displays a success message after form submission.
 * @param {HTMLElement} form - The form element
 */
function showFormSuccess(form) {
    const successMsg = document.createElement('div');
    successMsg.className = 'form-success';
    successMsg.innerHTML = '<h3>Message Sent!</h3><p>Thank you for reaching out. Nathan will get back to you within 24 hours.</p>';

    form.style.display = 'none';
    form.parentNode.appendChild(successMsg);
}

/* ==========================================================================
   3. PRICING CALCULATOR
   ========================================================================== */

/** Pricing data for tutoring sessions */
const PRICING = {
    subjects: {
        math: { name: 'Mathematics', rate: 45 },
        physics: { name: 'Physics', rate: 45 },
        python: { name: 'Python', rate: 50 },
        java: { name: 'Java', rate: 50 }
    },
    groupDiscounts: {
        1: 1.0,      // Individual: no discount
        2: 0.67,     // 2 students: ~33% off per person
        3: 0.67,     // 3 students: ~33% off per person
        4: 0.49,     // 4 students: ~50% off per person
        5: 0.49      // 5 students: ~50% off per person
    },
    packageDiscounts: {
        1: 1.0,      // Single session: no discount
        5: 0.89,     // 5-pack: ~11% off
        10: 0.89     // 10-pack: ~11% off
    }
};

/**
 * Calculates the total price based on selected options.
 * @param {string} subject - The subject code (math, physics, python, java)
 * @param {number} sessions - Number of sessions
 * @param {number} groupSize - Number of students in group
 * @returns {object} - Object containing price breakdown
 */
function calculatePrice(subject, sessions, groupSize) {
    const baseRate = PRICING.subjects[subject].rate;
    const groupMultiplier = PRICING.groupDiscounts[groupSize] || 1.0;
    const packageMultiplier = sessions >= 10 ? 0.89 : (sessions >= 5 ? 0.89 : 1.0);

    const pricePerPerson = baseRate * groupMultiplier * packageMultiplier;
    const totalPerSession = pricePerPerson * groupSize;
    const grandTotal = totalPerSession * sessions;

    return {
        baseRate: baseRate,
        pricePerPerson: Math.round(pricePerPerson * 100) / 100,
        totalPerSession: Math.round(totalPerSession * 100) / 100,
        grandTotal: Math.round(grandTotal * 100) / 100,
        savings: Math.round((baseRate * groupSize * sessions - grandTotal) * 100) / 100
    };
}

/**
 * Updates the calculator display with current selections.
 */
function updateCalculator() {
    const subject = document.getElementById('calc-subject').value;
    const sessions = parseInt(document.getElementById('calc-sessions').value) || 1;
    const groupSize = parseInt(document.getElementById('calc-group').value) || 1;

    if (!subject) {
        document.getElementById('calc-result').innerHTML = '<p class="calc-placeholder">Select a subject to see pricing</p>';
        return;
    }

    const pricing = calculatePrice(subject, sessions, groupSize);
    const subjectName = PRICING.subjects[subject].name;

    let resultHTML = '<div class="calc-breakdown">';
    resultHTML += '<div class="calc-row"><span>Subject:</span><span>' + subjectName + '</span></div>';
    resultHTML += '<div class="calc-row"><span>Base Rate:</span><span>$' + pricing.baseRate + '/hr</span></div>';

    if (groupSize > 1) {
        resultHTML += '<div class="calc-row"><span>Group Rate (per person):</span><span>$' + pricing.pricePerPerson.toFixed(2) + '/hr</span></div>';
    }

    resultHTML += '<div class="calc-row"><span>Sessions:</span><span>' + sessions + '</span></div>';
    resultHTML += '<div class="calc-row"><span>Students:</span><span>' + groupSize + '</span></div>';
    resultHTML += '<div class="calc-row calc-total"><span>Total:</span><span>$' + pricing.grandTotal.toFixed(2) + '</span></div>';

    if (pricing.savings > 0) {
        resultHTML += '<div class="calc-row calc-savings"><span>You Save:</span><span>$' + pricing.savings.toFixed(2) + '</span></div>';
    }

    resultHTML += '</div>';

    document.getElementById('calc-result').innerHTML = resultHTML;
}

/**
 * Initializes the pricing calculator functionality.
 */
function initPricingCalculator() {
    const calculator = document.getElementById('pricing-calculator');
    if (!calculator) return;

    // Add event listeners to all calculator inputs
    const inputs = calculator.querySelectorAll('select, input');
    inputs.forEach(function(input) {
        input.addEventListener('change', updateCalculator);
        input.addEventListener('input', updateCalculator);
    });

    // Initial calculation
    updateCalculator();
}

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */

/**
 * Initializes all interactive features when DOM is ready.
 */
document.addEventListener('DOMContentLoaded', function() {
    initMobileNav();
    initContactForm();
    initPricingCalculator();
});
