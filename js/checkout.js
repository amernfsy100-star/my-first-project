// Checkout System

class CheckoutSystem {
    constructor() {
        this.currentStep = 1;
        this.checkoutData = {};
        this.order = {};
        
        this.init();
    }

    init() {
        this.loadCheckoutData();
        this.setupEventListeners();
        this.renderCurrentStep();
        this.updateOrderSummary();
    }

    loadCheckoutData() {
        const savedData = localStorage.getItem('furniture_store_checkout');
        this.checkoutData = savedData ? JSON.parse(savedData) : {
            cart: [],
            discount: { code: '', amount: 0, percentage: 0 },
            subtotal: 0,
            shipping: 0,
            tax: 0,
            total: 0
        };

        // If cart is empty, redirect to cart page
        if (this.checkoutData.cart.length === 0) {
            this.showNotification('سلة التسوق فارغة', 'error');
            setTimeout(() => {
                window.location.href = 'cart.html';
            }, 2000);
            return;
        }
    }

    setupEventListeners() {
        // Step navigation
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('next-step')) {
                const nextStep = parseInt(e.target.dataset.next);
                this.goToStep(nextStep);
            }

            if (e.target.classList.contains('prev-step')) {
                const prevStep = parseInt(e.target.dataset.prev);
                this.goToStep(prevStep);
            }
        });

        // Payment method changes
        document.querySelectorAll('input[name="payment_method"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.togglePaymentForm(e.target.value);
            });
        });

        // Shipping method changes
        document.querySelectorAll('input[name="shipping_method"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.updateShippingCost(e.target.value);
            });
        });

        // Form submission
        const checkoutForm = document.getElementById('checkout-form');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.placeOrder();
            });
        }

        // Real-time form validation
        this.setupFormValidation();
    }

    goToStep(step) {
        // Validate current step before proceeding
        if (step > this.currentStep && !this.validateStep(this.currentStep)) {
            this.showNotification('يرجى إكمال جميع الحقول المطلوبة', 'error');
            return;
        }

        // Update steps UI
        document.querySelectorAll('.step').forEach(stepEl => {
            stepEl.classList.remove('active');
            if (parseInt(stepEl.dataset.step) === step) {
                stepEl.classList.add('active');
            }
        });

        // Update step content
        document.querySelectorAll('.checkout-step').forEach(stepContent => {
            stepContent.classList.remove('active');
        });

        document.getElementById(`step-${step}`).classList.add('active');
        this.currentStep = step;

        // Update review section if on step 4
        if (step === 4) {
            this.updateReviewSection();
        }
    }

    validateStep(step) {
        switch (step) {
            case 1:
                return this.validatePersonalInfo();
            case 2:
                return this.validateShippingInfo();
            case 3:
                return this.validatePaymentInfo();
            default:
                return true;
        }
    }

    validatePersonalInfo() {
        const requiredFields = ['first-name', 'last-name', 'email', 'phone'];
        let isValid = true;

        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                this.markFieldError(field, 'هذا الحقل مطلوب');
                isValid = false;
            } else {
                this.clearFieldError(field);
            }
        });

        // Email validation
        const emailField = document.getElementById('email');
        if (emailField.value && !this.isValidEmail(emailField.value)) {
            this.markFieldError(emailField, 'البريد الإلكتروني غير صحيح');
            isValid = false;
        }

        return isValid;
    }

    validateShippingInfo() {
        const requiredFields = ['address', 'city', 'district'];
        let isValid = true;

        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                this.markFieldError(field, 'هذا الحقل مطلوب');
                isValid = false;
            } else {
                this.clearFieldError(field);
            }
        });

        return isValid;
    }

    validatePaymentInfo() {
        const paymentMethod = document.querySelector('input[name="payment_method"]:checked').value;
        
        if (paymentMethod === 'credit_card') {
            const requiredFields = ['card-number', 'card-name', 'expiry-date', 'cvv'];
            let isValid = true;

            requiredFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (!field.value.trim()) {
                    this.markFieldError(field, 'هذا الحقل مطلوب');
                    isValid = false;
                } else {
                    this.clearFieldError(field);
                }
            });

            // Basic card validation
            const cardNumber = document.getElementById('card-number').value;
            if (cardNumber && !this.isValidCardNumber(cardNumber)) {
                this.markFieldError(document.getElementById('card-number'), 'رقم البطاقة غير صحيح');
                isValid = false;
            }

            return isValid;
        }

        return true;
    }

    setupFormValidation() {
        // Real-time email validation
        const emailField = document.getElementById('email');
        if (emailField) {
            emailField.addEventListener('blur', () => {
                if (emailField.value && !this.isValidEmail(emailField.value)) {
                    this.markFieldError(emailField, 'البريد الإلكتروني غير صحيح');
                }
            });
        }

        // Real-time card number validation
        const cardNumberField = document.getElementById('card-number');
        if (cardNumberField) {
            cardNumberField.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                let formattedValue = value.match(/.{1,4}/g)?.join(' ') || '';
                e.target.value = formattedValue;
            });

            cardNumberField.addEventListener('blur', () => {
                if (cardNumberField.value && !this.isValidCardNumber(cardNumberField.value)) {
                    this.markFieldError(cardNumberField, 'رقم البطاقة غير صحيح');
                }
            });
        }

        // Expiry date formatting
        const expiryField = document.getElementById('expiry-date');
        if (expiryField) {
            expiryField.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                e.target.value = value;
            });
        }

        // CVV validation
        const cvvField = document.getElementById('cvv');
        if (cvvField) {
            cvvField.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3);
            });
        }
    }

    togglePaymentForm(paymentMethod) {
        const creditCardForm = document.getElementById('credit-card-form');
        if (creditCardForm) {
            creditCardForm.style.display = paymentMethod === 'credit_card' ? 'block' : 'none';
        }
    }

    updateShippingCost(shippingMethod) {
        if (shippingMethod === 'express') {
            this.checkoutData.shipping = 50;
        } else {
            // Recalculate shipping based on subtotal
            this.checkoutData.shipping = this.checkoutData.subtotal >= 500 ? 0 : 50;
        }

        // Recalculate total
        const discountAmount = this.checkoutData.discount.percentage > 0 ? 
            this.checkoutData.subtotal * (this.checkoutData.discount.percentage / 100) : 
            this.checkoutData.discount.amount;
            
        const taxableAmount = this.checkoutData.subtotal - discountAmount;
        this.checkoutData.tax = taxableAmount * 0.15;
        this.checkoutData.total = this.checkoutData.subtotal - discountAmount + this.checkoutData.shipping + this.checkoutData.tax;

        this.updateOrderSummary();
    }

    updateOrderSummary() {
        // Update sidebar summary
        document.getElementById('sidebar-subtotal').textContent = `${this.formatPrice(this.checkoutData.subtotal)} ر.س`;
        document.getElementById('sidebar-shipping').textContent = 
            this.checkoutData.shipping === 0 ? 'مجاني' : `${this.formatPrice(this.checkoutData.shipping)} ر.س`;
        document.getElementById('sidebar-tax').textContent = `${this.formatPrice(this.checkoutData.tax)} ر.س`;
        document.getElementById('sidebar-total').textContent = `${this.formatPrice(this.checkoutData.total)} ر.س`;

        // Update items preview
        this.renderItemsPreview();
    }

    renderItemsPreview() {
        const itemsContainer = document.getElementById('sidebar-items');
        
        itemsContainer.innerHTML = this.checkoutData.cart.map(item => `
            <div class="preview-item">
                <div class="preview-item-image">
                    <img src="../assets/images/products/${item.image}" alt="${item.name}" loading="lazy">
                </div>
                <div class="preview-item-details">
                    <h4>${item.name}</h4>
                    <div class="preview-item-meta">
                        <span>الكمية: ${item.quantity}</span>
                        <span>${this.formatPrice(item.price * item.quantity)} ر.س</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateReviewSection() {
        // Update items in review
        const reviewItems = document.getElementById('review-items');
        reviewItems.innerHTML = this.checkoutData.cart.map(item => `
            <div class="review-item">
                <div class="review-item-info">
                    <div class="review-item-image">
                        <img src="../assets/images/products/${item.image}" alt="${item.name}">
                    </div>
                    <div class="review-item-details">
                        <h4>${item.name}</h4>
                        <div class="quantity">الكمية: ${item.quantity}</div>
                    </div>
                </div>
                <div class="review-item-price">
                    ${this.formatPrice(item.price * item.quantity)} ر.س
                </div>
            </div>
        `).join('');

        // Update shipping method
        const shippingMethod = document.querySelector('input[name="shipping_method"]:checked');
        document.getElementById('review-shipping').textContent = 
            shippingMethod.value === 'express' ? 'التوصيل السريع' : 'التوصيل العادي';

        // Update payment method
        const paymentMethod = document.querySelector('input[name="payment_method"]:checked');
        const paymentMethods = {
            'credit_card': 'بطاقة ائتمان',
            'mada': 'مدى',
            'apple_pay': 'Apple Pay',
            'cash': 'الدفع عند الاستلام'
        };
        document.getElementById('review-payment').textContent = paymentMethods[paymentMethod.value];

        // Update total
        document.getElementById('review-total').textContent = `${this.formatPrice(this.checkoutData.total)} ر.س`;

        // Update address
        const address = document.getElementById('address').value;
        const city = document.getElementById('city').value;
        const district = document.getElementById('district').value;
        const postalCode = document.getElementById('postal-code').value;
        
        const cities = {
            'riyadh': 'الرياض',
            'jeddah': 'جدة',
            'dammam': 'الدمام',
            'mecca': 'مكة المكرمة',
            'medina': 'المدينة المنورة'
        };

        document.getElementById('review-address').innerHTML = `
            <p><strong>${document.getElementById('first-name').value} ${document.getElementById('last-name').value}</strong></p>
            <p>${address}</p>
            <p>${district}, ${cities[city]}</p>
            ${postalCode ? `<p>الرمز البريدي: ${postalCode}</p>` : ''}
            <p>📞 ${document.getElementById('phone').value}</p>
            <p>📧 ${document.getElementById('email').value}</p>
        `;
    }

    async placeOrder() {
        // Validate terms agreement
        const agreeTerms = document.getElementById('agree-terms');
        if (!agreeTerms.checked) {
            this.showNotification('يرجى الموافقة على الشروط والأحكام', 'error');
            return;
        }

        // Show loading state
        const placeOrderBtn = document.getElementById('place-order');
        const originalText = placeOrderBtn.innerHTML;
        placeOrderBtn.innerHTML = '<span class="loading-spinner">⏳</span> جاري معالجة الطلب...';
        placeOrderBtn.disabled = true;

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Create order object
            this.order = {
                id: 'ORD' + Date.now(),
                date: new Date().toISOString(),
                customer: {
                    firstName: document.getElementById('first-name').value,
                    lastName: document.getElementById('last-name').value,
                    email: document.getElementById('email').value,
                    phone: document.getElementById('phone').value
                },
                shipping: {
                    address: document.getElementById('address').value,
                    city: document.getElementById('city').value,
                    district: document.getElementById('district').value,
                    postalCode: document.getElementById('postal-code').value,
                    method: document.querySelector('input[name="shipping_method"]:checked').value
                },
                payment: {
                    method: document.querySelector('input[name="payment_method"]:checked').value,
                    status: 'completed'
                },
                items: this.checkoutData.cart,
                summary: {
                    subtotal: this.checkoutData.subtotal,
                    discount: this.checkoutData.discount.amount + (this.checkoutData.subtotal * (this.checkoutData.discount.percentage / 100)),
                    shipping: this.checkoutData.shipping,
                    tax: this.checkoutData.tax,
                    total: this.checkoutData.total
                },
                status: 'confirmed',
                estimatedDelivery: this.calculateEstimatedDelivery()
            };

            // Save order to localStorage (in real app, this would be sent to backend)
            this.saveOrder(this.order);

            // Clear cart and checkout data
            localStorage.removeItem('furniture_store_cart');
            localStorage.removeItem('furniture_store_checkout');

            // Show success modal
            this.showSuccessModal();

        } catch (error) {
            this.showNotification('حدث خطأ أثناء معالجة الطلب', 'error');
            console.error('Order placement error:', error);
        } finally {
            // Reset button state
            placeOrderBtn.innerHTML = originalText;
            placeOrderBtn.disabled = false;
        }
    }

    saveOrder(order) {
        const orders = JSON.parse(localStorage.getItem('furniture_store_orders') || '[]');
        orders.push(order);
        localStorage.setItem('furniture_store_orders', JSON.stringify(orders));
    }

    calculateEstimatedDelivery() {
        const shippingMethod = document.querySelector('input[name="shipping_method"]:checked').value;
        const today = new Date();
        
        if (shippingMethod === 'express') {
            today.setDate(today.getDate() + 2);
        } else {
            today.setDate(today.getDate() + 5);
        }
        
        return today.toISOString();
    }

    showSuccessModal() {
        const modal = document.getElementById('success-modal');
        const orderNumber = document.getElementById('order-number');
        
        orderNumber.textContent = this.order.id;
        modal.classList.add('active');

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    // Utility methods
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidCardNumber(cardNumber) {
        const cleaned = cardNumber.replace(/\s+/g, '');
        return /^\d{16}$/.test(cleaned);
    }

    markFieldError(field, message) {
        field.classList.add('error');
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Add error message
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.style.cssText = `
            color: #dc3545;
            font-size: 0.8rem;
            margin-top: 0.25rem;
        `;
        errorElement.textContent = message;
        
        field.parentNode.appendChild(errorElement);
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    formatPrice(price) {
        return new Intl.NumberFormat('ar-SA').format(price);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            <span class="notification-message">${message}</span>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
            color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
            padding: 1rem 2rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize checkout system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CheckoutSystem();
});