// Product Details System

class ProductDetailsSystem {
    constructor() {
        this.product = null;
        this.relatedProducts = [];
        this.currentImageIndex = 0;
        this.init();
    }

    async init() {
        await this.loadProduct();
        this.renderProductDetails();
        this.setupEventListeners();
        this.loadRelatedProducts();
    }

    async loadProduct() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        try {
            const response = await fetch('../assets/data/products.json');
            const products = await response.json();
            this.product = products.find(p => p.id == productId) || this.getMockProduct();
        } catch (error) {
            console.error('Error loading product:', error);
            this.product = this.getMockProduct();
        }
    }

    renderProductDetails() {
        if (!this.product) return;

        // Update page title
        document.title = `${this.product.name} - متجر الأثاث`;

        // Update breadcrumb
        this.updateBreadcrumb();

        // Update main product info
        document.getElementById('product-title').textContent = this.product.name;
        document.getElementById('product-description').textContent = this.product.description;
        document.getElementById('full-description').innerHTML = this.getFullDescription();
        
        // Update pricing
        this.updatePricing();
        
        // Update rating
        this.updateRating();
        
        // Update features
        this.renderFeatures();
        
        // Update images
        this.renderImages();
        
        // Update specifications
        this.renderSpecifications();
        
        // Update badges
        this.updateBadges();
    }

    updateBreadcrumb() {
        const categoryBreadcrumb = document.getElementById('category-breadcrumb');
        const productBreadcrumb = document.getElementById('product-breadcrumb');
        
        const categoryName = this.getCategoryName(this.product.category);
        categoryBreadcrumb.textContent = categoryName;
        categoryBreadcrumb.href = `categories.html?category=${this.product.category}`;
        
        productBreadcrumb.textContent = this.product.name;
    }

    updatePricing() {
        const currentPrice = document.getElementById('current-price');
        const originalPrice = document.getElementById('original-price');
        const discountPercent = document.getElementById('discount-percent');

        currentPrice.textContent = `${this.formatPrice(this.product.price)} ر.س`;

        if (this.product.oldPrice) {
            const discount = Math.round(((this.product.oldPrice - this.product.price) / this.product.oldPrice) * 100);
            originalPrice.textContent = `${this.formatPrice(this.product.oldPrice)} ر.س`;
            discountPercent.textContent = `-${discount}%`;
            originalPrice.style.display = 'block';
            discountPercent.style.display = 'block';
        } else {
            originalPrice.style.display = 'none';
            discountPercent.style.display = 'none';
        }
    }

    updateRating() {
        const productStars = document.getElementById('product-stars');
        const ratingText = document.getElementById('rating-text');
        const averageRating = document.getElementById('average-rating');
        const reviewsCount = document.getElementById('reviews-count');

        productStars.innerHTML = this.renderStars(this.product.rating);
        ratingText.textContent = `(${this.product.reviewCount} تقييم)`;
        averageRating.textContent = this.product.rating.toFixed(1);
        reviewsCount.textContent = `${this.product.reviewCount} تقييم`;
    }

    renderFeatures() {
        const featuresList = document.getElementById('features-list');
        featuresList.innerHTML = this.product.features.map(feature => 
            `<li>${feature}</li>`
        ).join('');
    }

    renderImages() {
        const mainImage = document.getElementById('main-product-image');
        const thumbnailsContainer = document.getElementById('image-thumbnails');

        // Set main image
        mainImage.src = `../assets/images/products/${this.product.image}`;
        mainImage.alt = this.product.name;

        // Create thumbnails
        const images = this.product.images || [this.product.image];
        thumbnailsContainer.innerHTML = images.map((image, index) => `
            <div class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
                <img src="../assets/images/products/${image}" alt="${this.product.name}">
            </div>
        `).join('');

        // Add thumbnail click events
        thumbnailsContainer.querySelectorAll('.thumbnail').forEach(thumb => {
            thumb.addEventListener('click', () => {
                const index = parseInt(thumb.dataset.index);
                this.changeMainImage(index);
            });
        });
    }

    renderSpecifications() {
        const specsTable = document.getElementById('specs-table');
        const specifications = this.getSpecifications();
        
        specsTable.innerHTML = Object.entries(specifications).map(([key, value]) => `
            <div class="spec-row">
                <div class="spec-name">${key}</div>
                <div class="spec-value">${value}</div>
            </div>
        `).join('');
    }

    updateBadges() {
        const newBadge = document.getElementById('new-badge');
        const discountBadge = document.getElementById('discount-badge');

        newBadge.style.display = this.product.isNew ? 'block' : 'none';
        discountBadge.style.display = this.product.oldPrice ? 'block' : 'none';
    }

    setupEventListeners() {
        // Quantity controls
        const decreaseBtn = document.getElementById('decrease-qty');
        const increaseBtn = document.getElementById('increase-qty');
        const quantityInput = document.getElementById('quantity');

        decreaseBtn.addEventListener('click', () => {
            let quantity = parseInt(quantityInput.value);
            if (quantity > 1) {
                quantityInput.value = quantity - 1;
            }
        });

        increaseBtn.addEventListener('click', () => {
            let quantity = parseInt(quantityInput.value);
            if (quantity < 10) {
                quantityInput.value = quantity + 1;
            }
        });

        // Add to cart
        const addToCartBtn = document.getElementById('add-to-cart');
        addToCartBtn.addEventListener('click', () => {
            this.addToCart();
        });

        // Buy now
        const buyNowBtn = document.getElementById('buy-now');
        buyNowBtn.addEventListener('click', () => {
            this.buyNow();
        });

        // Wishlist
        const wishlistBtn = document.getElementById('add-to-wishlist');
        wishlistBtn.addEventListener('click', () => {
            this.toggleWishlist(wishlistBtn);
        });

        // Tab switching
        this.setupTabs();

        // Review modal
        this.setupReviewModal();
    }

    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanels = document.querySelectorAll('.tab-panel');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.dataset.tab;

                // Update active tab button
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Show corresponding tab panel
                tabPanels.forEach(panel => {
                    panel.classList.remove('active');
                    if (panel.id === tabId) {
                        panel.classList.add('active');
                    }
                });
            });
        });
    }

    setupReviewModal() {
        const reviewModal = document.getElementById('review-modal');
        const reviewClose = document.getElementById('review-close');
        const writeReviewBtn = document.getElementById('write-review');
        const reviewForm = document.getElementById('review-form');
        const stars = document.querySelectorAll('.rating-input .star');

        // Star rating
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.rating);
                this.setStarRating(rating);
            });
        });

        // Open modal
        writeReviewBtn.addEventListener('click', () => {
            reviewModal.classList.add('active');
        });

        // Close modal
        reviewClose.addEventListener('click', () => {
            reviewModal.classList.remove('active');
        });

        // Close modal when clicking outside
        reviewModal.addEventListener('click', (e) => {
            if (e.target === reviewModal) {
                reviewModal.classList.remove('active');
            }
        });

        // Handle form submission
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitReview();
        });
    }

    changeMainImage(index) {
        const mainImage = document.getElementById('main-product-image');
        const thumbnails = document.querySelectorAll('.thumbnail');
        const images = this.product.images || [this.product.image];

        mainImage.src = `../assets/images/products/${images[index]}`;
        
        // Update active thumbnail
        thumbnails.forEach(thumb => thumb.classList.remove('active'));
        thumbnails[index].classList.add('active');
        
        this.currentImageIndex = index;
    }

    addToCart() {
        const quantity = parseInt(document.getElementById('quantity').value);
        
        // Get current cart
        const cart = JSON.parse(localStorage.getItem('furniture_store_cart') || '[]');
        
        // Check if product already in cart
        const existingItem = cart.find(item => item.id == this.product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: this.product.id,
                name: this.product.name,
                price: this.product.price,
                image: this.product.image,
                quantity: quantity
            });
        }

        // Save cart
        localStorage.setItem('furniture_store_cart', JSON.stringify(cart));
        
        // Update cart count
        this.updateCartCount();
        
        // Show success message
        this.showNotification('تمت إضافة المنتج إلى السلة بنجاح!', 'success');
    }

    buyNow() {
        this.addToCart();
        // Redirect to checkout page
        setTimeout(() => {
            window.location.href = 'checkout.html';
        }, 1000);
    }

    toggleWishlist(button) {
        const wishlist = JSON.parse(localStorage.getItem('furniture_store_wishlist') || '[]');
        const productIndex = wishlist.findIndex(item => item.id == this.product.id);
        
        if (productIndex > -1) {
            // Remove from wishlist
            wishlist.splice(productIndex, 1);
            button.classList.remove('active');
            this.showNotification('تمت إزالة المنتج من المفضلة', 'info');
        } else {
            // Add to wishlist
            wishlist.push({
                id: this.product.id,
                name: this.product.name,
                price: this.product.price,
                image: this.product.image
            });
            button.classList.add('active');
            this.showNotification('تمت إضافة المنتج إلى المفضلة', 'success');
        }
        
        localStorage.setItem('furniture_store_wishlist', JSON.stringify(wishlist));
    }

    setStarRating(rating) {
        const stars = document.querySelectorAll('.rating-input .star');
        
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
                star.textContent = '★';
            } else {
                star.classList.remove('active');
                star.textContent = '☆';
            }
        });
    }

    async submitReview() {
        const title = document.getElementById('review-title').value;
        const text = document.getElementById('review-text').value;
        const stars = document.querySelectorAll('.rating-input .star.active').length;

        if (stars === 0) {
            this.showNotification('يرجى اختيار تقييم', 'error');
            return;
        }

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Close modal
        document.getElementById('review-modal').classList.remove('active');
        
        // Reset form
        document.getElementById('review-form').reset();
        this.setStarRating(0);
        
        this.showNotification('شكراً لك! تم نشر تقييمك بنجاح', 'success');
    }

    async loadRelatedProducts() {
        try {
            const response = await fetch('../assets/data/products.json');
            const products = await response.json();
            
            // Get products from same category, excluding current product
            this.relatedProducts = products
                .filter(p => p.category === this.product.category && p.id !== this.product.id)
                .slice(0, 4);
            
            this.renderRelatedProducts();
        } catch (error) {
            console.error('Error loading related products:', error);
        }
    }

    renderRelatedProducts() {
        const relatedGrid = document.getElementById('related-products');
        
        relatedGrid.innerHTML = this.relatedProducts.map(product => `
            <div class="product-mini-card" data-product-id="${product.id}">
                <div class="product-mini-image">
                    <img src="../assets/images/products/${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <h4 class="product-mini-title">${product.name}</h4>
                <div class="product-mini-price">${this.formatPrice(product.price)} ر.س</div>
            </div>
        `).join('');

        // Add click events
        relatedGrid.querySelectorAll('.product-mini-card').forEach(card => {
            card.addEventListener('click', () => {
                const productId = card.dataset.productId;
                window.location.href = `product-details.html?id=${productId}`;
            });
        });
    }

    updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('furniture_store_cart') || '[]');
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        document.querySelectorAll('.cart-count').forEach(element => {
            element.textContent = totalItems;
        });
    }

    // Helper methods
    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        
        return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
    }

    formatPrice(price) {
        return new Intl.NumberFormat('ar-SA').format(price);
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

    getFullDescription() {
        return `
            <p>${this.product.description}</p>
            <p>تم تصنيع هذا المنتج بأعلى معايير الجودة باستخدام أفضل المواد الخام. 
            يتميز بتصميمه العصري وأناقته التي تناسب جميع الأذواق.</p>
            
            <h4>المميزات الرئيسية:</h4>
            <ul>
                ${this.product.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
            
            <h4>معلومات إضافية:</h4>
            <p>يشمل المنتج ضمان لمدة سنتين ضد عيوب الصنعة، مع خدمة ما بعد البيع 
            متاحة على مدار الساعة طوال أيام الأسبوع.</p>
        `;
    }

    getSpecifications() {
        return {
            'المادة': 'خشب طبيعي عالي الجودة',
            'الأبعاد': '200 × 90 × 85 سم',
            'اللون': 'بني فاتح',
            'الوزن': '45 كجم',
            'مدة التجميع': '30 دقيقة',
            'الضمان': 'سنتان',
            'بلد المنشأ': 'المملكة العربية السعودية',
            'مستوى الصعوبة': 'سهل التجميع'
        };
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

    getMockProduct() {
        return {
            id: 1,
            name: "كنب فاخر 3 مقاعد",
            category: "sofas",
            price: 2500,
            oldPrice: 3000,
            image: "sofa-1.jpg",
            images: ["sofa-1.jpg", "sofa-2.jpg", "sofa-3.jpg"],
            description: "كنب فاخر مصنوع من أجود أنواع القماش مع تصميم عصري يناسب جميع ديكورات المنزل.",
            features: [
                "قابل للتنظيف",
                "مقاعد مريحة", 
                "ضمان 3 سنوات",
                "توصيل مجاني",
                "تركيب مجاني",
                "خشب طبيعي"
            ],
            rating: 4.5,
            reviewCount: 24,
            isNew: true,
            isBestseller: true,
            freeShipping: true
        };
    }
}

// Initialize product details system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProductDetailsSystem();
});