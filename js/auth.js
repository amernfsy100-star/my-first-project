// Authentication System for Furniture Store

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadUser();
        this.attachEventListeners();
        this.checkAuthentication();
    }

    // Load user from localStorage
    loadUser() {
        const userData = localStorage.getItem(CONFIG.STORAGE_KEYS.USER);
        const token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
        
        if (userData && token) {
            this.currentUser = JSON.parse(userData);
            this.updateUI();
        }
    }

    // Save user to localStorage
    saveUser(userData, token) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(userData));
        localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, token);
        this.currentUser = userData;
        this.updateUI();
    }

    // Remove user from localStorage
    logout() {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
        this.currentUser = null;
        this.updateUI();
        window.location.href = '../index.html';
    }

    // Update UI based on authentication status
    updateUI() {
        const authButtons = document.querySelectorAll('.nav__auth-btn');
        const userMenu = document.getElementById('user-menu');
        
        if (this.currentUser) {
            authButtons.forEach(btn => {
                if (btn.id === 'logout-btn') {
                    btn.style.display = 'block';
                } else {
                    btn.textContent = `مرحباً، ${this.currentUser.first_name}`;
                    btn.href = 'pages/profile.html';
                }
            });
        } else {
            authButtons.forEach(btn => {
                if (btn.id === 'logout-btn') {
                    btn.style.display = 'none';
                } else {
                    btn.textContent = 'تسجيل الدخول';
                    btn.href = 'pages/login.html';
                }
            });
        }
    }

    // Check if user is authenticated
    checkAuthentication() {
        const protectedPages = ['profile.html', 'checkout.html'];
        const currentPage = window.location.pathname.split('/').pop();
        
        if (protectedPages.includes(currentPage) && !this.currentUser) {
            window.location.href = 'login.html';
        }
    }

    // Attach event listeners
    attachEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
            this.setupPasswordValidation();
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Profile form
        const profileForm = document.getElementById('personal-info-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
        }

        // Tab switching in profile
        this.setupProfileTabs();

        // Password strength
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', () => this.updatePasswordStrength());
        }
    }

    // Handle login form submission
    async handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');
        const rememberMe = document.getElementById('remember-me').checked;

        // Basic validation
        if (!this.validateEmail(email)) {
            this.showError('email-error', 'البريد الإلكتروني غير صحيح');
            return;
        }

        if (!this.validatePassword(password)) {
            this.showError('password-error', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return;
        }

        // Simulate API call
        try {
            this.showLoading(true);
            const response = await this.mockLoginAPI(email, password);
            
            if (response.success) {
                this.saveUser(response.user, response.token);
                this.showSuccess('تم تسجيل الدخول بنجاح!');
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 1000);
            } else {
                this.showError('password-error', response.message);
            }
        } catch (error) {
            this.showError('password-error', 'حدث خطأ أثناء تسجيل الدخول');
        } finally {
            this.showLoading(false);
        }
    }

    // Handle register form submission
    async handleRegister(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const userData = {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            password: formData.get('password'),
            confirm_password: formData.get('confirm_password')
        };

        // Validation
        if (!this.validateRegistration(userData)) {
            return;
        }

        // Simulate API call
        try {
            this.showLoading(true);
            const response = await this.mockRegisterAPI(userData);
            
            if (response.success) {
                this.saveUser(response.user, response.token);
                this.showSuccess('تم إنشاء الحساب بنجاح!');
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 1500);
            } else {
                this.showError('email-error', response.message);
            }
        } catch (error) {
            this.showError('email-error', 'حدث خطأ أثناء إنشاء الحساب');
        } finally {
            this.showLoading(false);
        }
    }

    // Handle profile update
    async handleProfileUpdate(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const userData = {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            email: formData.get('email'),
            phone: formData.get('phone')
        };

        try {
            this.showLoading(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.currentUser = { ...this.currentUser, ...userData };
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(this.currentUser));
            
            this.showSuccess('تم تحديث المعلومات بنجاح!');
        } catch (error) {
            this.showError('', 'حدث خطأ أثناء تحديث المعلومات');
        } finally {
            this.showLoading(false);
        }
    }

    // Setup password validation
    setupPasswordValidation() {
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirm-password');

        if (password && confirmPassword) {
            confirmPassword.addEventListener('input', () => {
                if (password.value !== confirmPassword.value) {
                    this.showError('confirm-password-error', 'كلمات المرور غير متطابقة');
                } else {
                    this.hideError('confirm-password-error');
                }
            });
        }
    }

    // Setup profile tabs
    setupProfileTabs() {
        const tabItems = document.querySelectorAll('.sidebar-item');
        const tabContents = document.querySelectorAll('.tab-content');

        tabItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                const tabId = item.getAttribute('data-tab');
                
                // Update active tab
                tabItems.forEach(tab => tab.classList.remove('active'));
                item.classList.add('active');
                
                // Show corresponding content
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === tabId) {
                        content.classList.add('active');
                    }
                });
            });
        });
    }

    // Update password strength indicator
    updatePasswordStrength() {
        const password = document.getElementById('password').value;
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.querySelector('.strength-text');
        
        let strength = 0;
        let text = 'ضعيفة';
        let color = '#dc3545';

        if (password.length >= 6) strength = 33;
        if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) strength = 66;
        if (password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
            strength = 100;
            text = 'قوية جداً';
            color = '#28a745';
        } else if (strength === 66) {
            text = 'جيدة';
            color = '#ffc107';
        }

        strengthBar.style.setProperty('--strength-width', strength + '%');
        strengthBar.firstElementChild.style.width = strength + '%';
        strengthBar.firstElementChild.style.background = color;
        strengthText.textContent = `قوة كلمة المرور: ${text}`;
        strengthText.style.color = color;
    }

    // Validation methods
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePassword(password) {
        return password.length >= 6;
    }

    validateRegistration(userData) {
        let isValid = true;

        // Clear previous errors
        this.clearErrors();

        // First name validation
        if (!userData.first_name.trim()) {
            this.showError('first-name-error', 'الاسم الأول مطلوب');
            isValid = false;
        }

        // Last name validation
        if (!userData.last_name.trim()) {
            this.showError('last-name-error', 'اسم العائلة مطلوب');
            isValid = false;
        }

        // Email validation
        if (!this.validateEmail(userData.email)) {
            this.showError('email-error', 'البريد الإلكتروني غير صحيح');
            isValid = false;
        }

        // Phone validation
        if (!userData.phone.trim()) {
            this.showError('phone-error', 'رقم الهاتف مطلوب');
            isValid = false;
        }

        // Password validation
        if (!this.validatePassword(userData.password)) {
            this.showError('password-error', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            isValid = false;
        }

        // Confirm password
        if (userData.password !== userData.confirm_password) {
            this.showError('confirm-password-error', 'كلمات المرور غير متطابقة');
            isValid = false;
        }

        // Terms agreement
        const agreeTerms = document.getElementById('agree-terms');
        if (!agreeTerms.checked) {
            this.showError('terms-error', 'يجب الموافقة على الشروط والأحكام');
            isValid = false;
        }

        return isValid;
    }

    // UI helper methods
    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            
            const inputElement = document.getElementById(elementId.replace('-error', ''));
            if (inputElement) {
                inputElement.classList.add('error');
            }
        }
    }

    hideError(elementId) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.style.display = 'none';
            
            const inputElement = document.getElementById(elementId.replace('-error', ''));
            if (inputElement) {
                inputElement.classList.remove('error');
            }
        }
    }

    clearErrors() {
        const errorElements = document.querySelectorAll('.form-error');
        errorElements.forEach(element => {
            element.style.display = 'none';
        });

        const inputElements = document.querySelectorAll('.form-input');
        inputElements.forEach(element => {
            element.classList.remove('error');
        });
    }

    showLoading(show) {
        const submitButtons = document.querySelectorAll('.btn-auth, .btn-primary');
        submitButtons.forEach(btn => {
            if (show) {
                btn.disabled = true;
                btn.innerHTML = '<span class="loading-spinner">⏳</span> جاري المعالجة...';
            } else {
                btn.disabled = false;
                btn.textContent = btn.getAttribute('data-original-text') || 'تسجيل الدخول';
            }
        });
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${type === 'success' ? '✅' : '❌'}</span>
            <span class="notification-message">${message}</span>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#d4edda' : '#f8d7da'};
            color: ${type === 'success' ? '#155724' : '#721c24'};
            padding: 1rem 2rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            border: 1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'};
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Mock API methods (replace with real API calls)
    async mockLoginAPI(email, password) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock response - in real app, this would be a fetch to your backend
        if (email === 'user@example.com' && password === 'password') {
            return {
                success: true,
                user: {
                    id: 1,
                    first_name: 'أحمد',
                    last_name: 'محمد',
                    email: email,
                    phone: '+966500000000'
                },
                token: 'mock-jwt-token-here'
            };
        } else {
            return {
                success: false,
                message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
            };
        }
    }

    async mockRegisterAPI(userData) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock response - in real app, this would be a fetch to your backend
        return {
            success: true,
            user: {
                id: Date.now(),
                first_name: userData.first_name,
                last_name: userData.last_name,
                email: userData.email,
                phone: userData.phone
            },
            token: 'mock-jwt-token-here'
        };
    }
}

// Initialize auth system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AuthSystem();
});

// Additional utility functions
function formatPhoneNumber(phone) {
    // Format phone number for display
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
}

function validatePhoneNumber(phone) {
    const phoneRegex = /^\+?[\d\s-()]{10,}$/;
    return phoneRegex.test(phone);
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthSystem, formatPhoneNumber, validatePhoneNumber };
}