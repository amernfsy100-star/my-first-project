// Cart Management System

class CartSystem {
    constructor() {
        this.cart = [];
        this.discount = {
            code: '',
            amount: 0,
            percentage: 0
        };
        this.shippingCost = 0;
        this.taxRate = 0.15; // 15% VAT
        
        this.init();
    }

    init() {
        this.loadCart();
        this.renderCart();
        this.setupEventListeners();
        this.updateCartCount();
    }

    loadCart() {
        const savedCart = localStorage.getItem('furniture_store_cart');
        this.cart = savedCart ? JSON.parse(savedCart) : [];
    }

    saveCart() {
        localStorage.setItem('furniture_store_cart', JSON.stringify(this.cart));
        this.updateCartCount();
    }

    setupEventListeners() {
        // Clear cart button
        const clearCartBtn = document.getElementById('clear-cart');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => {
                this.clearCart();
            });
        }

        // Update cart button
        const updateCartBtn = document.getElementById('update-cart');
        if (updateCartBtn) {
            updateCartBtn.addEventListener('click', () => {
                this.updateCartQuantities();
            });
        }

        // Apply discount button
        const applyDiscountBtn = document.getElementById('apply-discount');
        if (applyDiscountBtn) {
            applyDiscountBtn.addEventListener('click', () => {
                this.applyDiscount();
            });
        }

        // Proceed to checkout button
        const checkoutBtn = document.getElementById('proceed-checkout');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                this.proceedToCheckout();
            });
        }

        // Enter key for discount code
        const discountInput = document.getElementById('discount-code');
        if (discountInput) {
            discountInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.applyDiscount();
                }
            });
        }
    }

    renderCart() {
        const cartItemsContainer = document.getElementById('cart-items');
        const emptyCart = document.getElementById('empty-cart');
        const cartItemsCount = document.getElementById('cart-items-count');

        if (this.cart.length === 0) {
            cartItemsContainer.innerHTML = '';
            emptyCart.classList.remove('hidden');
            cartItemsCount.textContent = '0';
            this.updateSummary();
            return;
        }

        emptyCart.classList.add('hidden');
        cartItemsCount.textContent = this.cart.length;

        cartItemsContainer.innerHTML = this.cart.map(item => this.renderCartItem(item)).join('');

        // Add event listeners to quantity controls and remove buttons
        this.attachCartItemEventListeners();
        this.updateSummary();
    }

    renderCartItem(item) {
        const subtotal = item.price * item.quantity;
        const originalSubtotal = item.originalPrice ? item.originalPrice * item.quantity : null;
        
        return `
            <div class="cart-item" data-product-id="${item.id}">
                <div class="cart-item-image">
                    <img src="../assets/images/products/${item.image}" alt="${item.name}" loading="lazy">
                </div>
                
                <div class="cart-item-details">
                    <div class="cart-item-info">
                        <h3>
                            <a href="product-details.html?id=${item.id}">${item.name}</a>
                        </h3>
                        <div class="cart-item-category">${this.getCategoryName(item.category)}</div>
                        <div class="cart-item-features">
                            <span class="cart-item-feature">🛋️ أثاث منزلي</span>
                            <span class="cart-item-feature">🚚 توصيل مجاني</span>
                        </div>
                    </div>
                    
                    <div class="cart-item-actions">
                        <button class="btn-remove-item" data-product-id="${item.id}">
                            🗑️ إزالة
                        </button>
                        <button class="btn-move-wishlist" data-product-id="${item.id}">
                            ❤️ نقل إلى المفضلة
                        </button>
                    </div>
                </div>
                
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn decrease-qty" data-product-id="${item.id}">-</button>
                        <input type="number" class="item-quantity" value="${item.quantity}" min="1" max="10" data-product-id="${item.id}">
                        <button class="quantity-btn increase-qty" data-product-id="${item.id}">+</button>
                    </div>
                    
                    <div class="cart-item-price">
                        <span class="current-price">${this.formatPrice(subtotal)} ر.س</span>
                        ${originalSubtotal ? `
                            <span class="original-price">${this.formatPrice(originalSubtotal)} ر.س</span>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    attachCartItemEventListeners() {
        // Quantity decrease buttons
        document.querySelectorAll('.decrease-qty').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.dataset.productId;
                this.decreaseQuantity(productId);
            });
        });

        // Quantity increase buttons
        document.querySelectorAll('.increase-qty').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.dataset.productId;
                this.increaseQuantity(productId);
            });
        });

        // Quantity inputs
        document.querySelectorAll('.item-quantity').forEach(input => {
            input.addEventListener('change', (e) => {
                const productId = e.target.dataset.productId;
                const quantity = parseInt(e.target.value);
                this.updateItemQuantity(productId, quantity);
            });
        });

        // Remove item buttons
        document.querySelectorAll('.btn-remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.dataset.productId;
                this.removeItem(productId);
            });
        });

        // Move to wishlist buttons
        document.querySelectorAll('.btn-move-wishlist').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.dataset.productId;
                this.moveToWishlist(productId);
            });
        });
    }

    increaseQuantity(productId) {
        const item = this.cart.find(item => item.id == productId);
        if (item && item.quantity < 10) {
            item.quantity++;
            this.saveCart();
            this.renderCart();
        }
    }

    decreaseQuantity(productId) {
        const item = this.cart.find(item => item.id == productId);
        if (item && item.quantity > 1) {
            item.quantity--;
            this.saveCart();
            this.renderCart();
        }
    }

    updateItemQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id == productId);
        if (item && quantity >= 1 && quantity <= 10) {
            item.quantity = quantity;
            this.saveCart();
            this.renderCart();
        } else if (item) {
            // Reset to previous value if invalid
            const input = document.querySelector(`.item-quantity[data-product-id="${productId}"]`);
            if (input) {
                input.value = item.quantity;
            }
        }
    }

    updateCartQuantities() {
        const quantityInputs = document.querySelectorAll('.item-quantity');
        let hasChanges = false;

        quantityInputs.forEach(input => {
            const productId = input.dataset.productId;
            const quantity = parseInt(input.value);
            const item = this.cart.find(item => item.id == productId);

            if (item && item.quantity !== quantity && quantity >= 1 && quantity <= 10) {
                item.quantity = quantity;
                hasChanges = true;
            }
        });

        if (hasChanges) {
            this.saveCart();
            this.renderCart();
            this.showNotification('تم تحديث السلة بنجاح', 'success');
        }
    }

    removeItem(productId) {
        this.cart = this.cart.filter(item => item.id != productId);
        this.saveCart();
        this.renderCart();
        this.showNotification('تم إزالة المنتج من السلة', 'info');
    }

    moveToWishlist(productId) {
        const item = this.cart.find(item => item.id == productId);
        if (!item) return;

        // Add to wishlist
        const wishlist = JSON.parse(localStorage.getItem('furniture_store_wishlist') || '[]');
        const existingItem = wishlist.find(wishItem => wishItem.id == productId);

        if (!existingItem) {
            wishlist.push({
                id: item.id,
                name: item.name,
                price: item.price,
                image: item.image
            });
            localStorage.setItem('furniture_store_wishlist', JSON.stringify(wishlist));
        }

        // Remove from cart
        this.removeItem(productId);
        this.showNotification('تم نقل المنتج إلى المفضلة', 'success');
    }

    clearCart() {
        if (this.cart.length === 0) return;

        if (confirm('هل أنت متأكد من رغبتك في إفراغ سلة التسوق؟')) {
            this.cart = [];
            this.saveCart();
            this.renderCart();
            this.showNotification('تم إفراغ سلة التسوق', 'info');
        }
    }

    updateSummary() {
        const subtotal = this.calculateSubtotal();
        const discountAmount = this.calculateDiscountAmount(subtotal);
        const shippingCost = this.calculateShippingCost(subtotal);
        const taxAmount = this.calculateTaxAmount(subtotal - discountAmount);
        const total = subtotal - discountAmount + shippingCost + taxAmount;

        // Update summary elements
        document.getElementById('subtotal-price').textContent = `${this.formatPrice(subtotal)} ر.س`;
        document.getElementById('discount-amount').textContent = `-${this.formatPrice(discountAmount)} ر.س`;
        document.getElementById('shipping-cost').textContent = shippingCost === 0 ? 'مجاني' : `${this.formatPrice(shippingCost)} ر.س`;
        document.getElementById('tax-amount').textContent = `${this.formatPrice(taxAmount)} ر.س`;
        document.getElementById('total-price').textContent = `${this.formatPrice(total)} ر.س`;

        // Show/hide discount row
        const discountRow = document.querySelector('.summary-row .discount').closest('.summary-row');
        discountRow.style.display = discountAmount > 0 ? 'flex' : 'none';
    }

    calculateSubtotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    calculateDiscountAmount(subtotal) {
        if (this.discount.percentage > 0) {
            return subtotal * (this.discount.percentage / 100);
        }
        return this.discount.amount;
    }

    calculateShippingCost(subtotal) {
        // Free shipping for orders above 500 SAR
        return subtotal >= 500 ? 0 : 50;
    }

    calculateTaxAmount(subtotal) {
        return subtotal * this.taxRate;
    }

    applyDiscount() {
        const discountInput = document.getElementById('discount-code');
        const discountMessage = document.getElementById('discount-message');
        const code = discountInput.value.trim().toUpperCase();

        if (!code) {
            discountMessage.textContent = 'يرجى إدخال كود الخصم';
            discountMessage.className = 'discount-message error';
            return;
        }

        // Mock discount codes - in real app, this would be an API call
        const discountCodes = {
            'WELCOME10': { percentage: 10, message: 'تم تطبيق خصم 10% على طلبك' },
            'FURNITURE15': { percentage: 15, message: 'تم تطبيق خصم 15% على طلبك' },
            'SAVE20': { percentage: 20, message: 'تم تطبيق خصم 20% على طلبك' },
            'FREESHIP': { amount: 50, message: 'تم تطبيق خصم على الشحن' }
        };

        const discount = discountCodes[code];

        if (discount) {
            this.discount = {
                code: code,
                percentage: discount.percentage || 0,
                amount: discount.amount || 0
            };

            discountMessage.textContent = discount.message;
            discountMessage.className = 'discount-message success';
            discountInput.disabled = true;

            this.updateSummary();
            this.showNotification(discount.message, 'success');
        } else {
            discountMessage.textContent = 'كود الخصم غير صالح أو منتهي الصلاحية';
            discountMessage.className = 'discount-message error';
        }
    }

    proceedToCheckout() {
        if (this.cart.length === 0) {
            this.showNotification('سلة التسوق فارغة', 'error');
            return;
        }

        // Check if user is logged in
        const user = JSON.parse(localStorage.getItem('furniture_store_user'));
        if (!user) {
            this.showNotification('يرجى تسجيل الدخول لإتمام الشراء', 'error');
            setTimeout(() => {
                window.location.href = 'login.html?redirect=checkout';
            }, 1500);
            return;
        }

        // Save cart data for checkout
        const checkoutData = {
            cart: this.cart,
            discount: this.discount,
            subtotal: this.calculateSubtotal(),
            shipping: this.calculateShippingCost(this.calculateSubtotal()),
            tax: this.calculateTaxAmount(this.calculateSubtotal() - this.calculateDiscountAmount(this.calculateSubtotal())),
            total: this.calculateSubtotal() - this.calculateDiscountAmount(this.calculateSubtotal()) + 
                   this.calculateShippingCost(this.calculateSubtotal()) + 
                   this.calculateTaxAmount(this.calculateSubtotal() - this.calculateDiscountAmount(this.calculateSubtotal()))
        };

        localStorage.setItem('furniture_store_checkout', JSON.stringify(checkoutData));
        window.location.href = 'checkout.html';
    }

    updateCartCount() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        document.querySelectorAll('.cart-count').forEach(element => {
            element.textContent = totalItems;
        });
    }

    getCategoryName(categorySlug) {
        const categories = {
            'sofas': 'الكنب',
            'curtains': 'الستائر',
            'tables': 'الطاولات',
            'beds': 'الأسرّة'
        };
        return categories[categorySlug] || categorySlug;
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

// Initialize cart system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CartSystem();
});