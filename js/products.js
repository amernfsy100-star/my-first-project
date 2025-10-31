// Products Management System

class ProductsSystem {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentPage = 1;
        this.productsPerPage = 12;
        this.currentView = 'grid';
        this.filters = {
            categories: [],
            priceRange: { min: 0, max: 10000 },
            features: [],
            rating: null,
            searchQuery: ''
        };
        
        this.init();
    }

    async init() {
        await this.loadProducts();
        this.setupEventListeners();
        this.renderProducts();
        this.updateResultsCount();
    }

    async loadProducts() {
        try {
            // Simulate API call
            const response = await fetch('../assets/data/products.json');
            this.products = await response.json();
            this.filteredProducts = [...this.products];
        } catch (error) {
            console.error('Error loading products:', error);
            // Fallback to mock data
            this.products = this.getMockProducts();
            this.filteredProducts = [...this.products];
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('global-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.searchQuery = e.target.value;
                this.applyFilters();
            });
        }

        // Filter toggle
        const filterToggle = document.getElementById('filter-toggle');
        const filtersSidebar = document.getElementById('filters-sidebar');
        const filtersClose = document.getElementById('filters-close');
        
        if (filterToggle && filtersSidebar) {
            filterToggle.addEventListener('click', () => {
                filtersSidebar.classList.add('active');
            });
            
            filtersClose.addEventListener('click', () => {
                filtersSidebar.classList.remove('active');
            });
        }

        // Category filters
        const categoryFilters = document.querySelectorAll('input[name="category"]');
        categoryFilters.forEach(filter => {
            filter.addEventListener('change', (e) => {
                this.handleCategoryFilter(e.target);
            });
        });

        // Price filter
        const priceRange = document.getElementById('price-range');
        const minPrice = document.getElementById('min-price');
        const maxPrice = document.getElementById('max-price');
        
        if (priceRange) {
            priceRange.addEventListener('input', (e) => {
                const value = e.target.value;
                if (minPrice) minPrice.value = value;
                this.filters.priceRange.min = parseInt(value);
                this.applyFilters();
            });
        }

        if (minPrice && maxPrice) {
            minPrice.addEventListener('change', (e) => {
                this.filters.priceRange.min = parseInt(e.target.value) || 0;
                this.applyFilters();
            });
            
            maxPrice.addEventListener('change', (e) => {
                this.filters.priceRange.max = parseInt(e.target.value) || 10000;
                this.applyFilters();
            });
        }

        // Feature filters
        const featureFilters = document.querySelectorAll('input[name="feature"]');
        featureFilters.forEach(filter => {
            filter.addEventListener('change', (e) => {
                this.handleFeatureFilter(e.target);
            });
        });

        // Rating filters
        const ratingFilters = document.querySelectorAll('input[name="rating"]');
        ratingFilters.forEach(filter => {
            filter.addEventListener('change', (e) => {
                this.filters.rating = e.target.value ? parseInt(e.target.value) : null;
                this.applyFilters();
            });
        });

        // Sort functionality
        const sortSelect = document.getElementById('sort-by');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortProducts(e.target.value);
            });
        }

        // View toggle
        const viewButtons = document.querySelectorAll('.view-btn');
        viewButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.target.dataset.view);
            });
        });

        // Apply filters button
        const applyFiltersBtn = document.getElementById('apply-filters');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => {
                this.applyFilters();
                if (window.innerWidth <= 768) {
                    filtersSidebar.classList.remove('active');
                }
            });
        }

        // Reset filters button
        const resetFiltersBtn = document.getElementById('reset-filters');
        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', () => {
                this.resetFilters();
            });
        }

        // Reset search button
        const resetSearchBtn = document.getElementById('reset-search');
        if (resetSearchBtn) {
            resetSearchBtn.addEventListener('click', () => {
                this.resetFilters();
            });
        }

        // Quick view functionality
        this.setupQuickView();
    }

    handleCategoryFilter(checkbox) {
        if (checkbox.checked) {
            this.filters.categories.push(checkbox.value);
        } else {
            this.filters.categories = this.filters.categories.filter(cat => cat !== checkbox.value);
        }
    }

    handleFeatureFilter(checkbox) {
        if (checkbox.checked) {
            this.filters.features.push(checkbox.value);
        } else {
            this.filters.features = this.filters.features.filter(feature => feature !== checkbox.value);
        }
    }

    applyFilters() {
        this.filteredProducts = this.products.filter(product => {
            // Search filter
            if (this.filters.searchQuery) {
                const searchTerm = this.filters.searchQuery.toLowerCase();
                const productName = product.name.toLowerCase();
                const productDescription = product.description.toLowerCase();
                if (!productName.includes(searchTerm) && !productDescription.includes(searchTerm)) {
                    return false;
                }
            }

            // Category filter
            if (this.filters.categories.length > 0 && !this.filters.categories.includes(product.category)) {
                return false;
            }

            // Price filter
            if (product.price < this.filters.priceRange.min || product.price > this.filters.priceRange.max) {
                return false;
            }

            // Feature filters
            if (this.filters.features.length > 0) {
                if (this.filters.features.includes('free-shipping') && !product.freeShipping) {
                    return false;
                }
                if (this.filters.features.includes('discount') && !product.oldPrice) {
                    return false;
                }
                if (this.filters.features.includes('new') && !product.isNew) {
                    return false;
                }
                if (this.filters.features.includes('bestseller') && !product.isBestseller) {
                    return false;
                }
            }

            // Rating filter
            if (this.filters.rating && product.rating < this.filters.rating) {
                return false;
            }

            return true;
        });

        this.currentPage = 1;
        this.renderProducts();
        this.updateResultsCount();
    }

    resetFilters() {
        // Reset filter values
        this.filters = {
            categories: [],
            priceRange: { min: 0, max: 10000 },
            features: [],
            rating: null,
            searchQuery: ''
        };

        // Reset UI elements
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.checked = false;
        });

        document.getElementById('min-price').value = '';
        document.getElementById('max-price').value = '';
        document.getElementById('price-range').value = 5000;
        document.getElementById('global-search').value = '';

        this.filteredProducts = [...this.products];
        this.currentPage = 1;
        this.renderProducts();
        this.updateResultsCount();
    }

    sortProducts(sortBy) {
        switch (sortBy) {
            case 'price-low':
                this.filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                this.filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
                break;
            case 'newest':
                this.filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'popular':
                this.filteredProducts.sort((a, b) => b.salesCount - a.salesCount);
                break;
            default:
                this.filteredProducts.sort((a, b) => a.id - b.id);
        }
        this.renderProducts();
    }

    switchView(view) {
        this.currentView = view;
        const productsGrid = document.getElementById('products-grid');
        const viewButtons = document.querySelectorAll('.view-btn');
        
        // Update active view button
        viewButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.view === view) {
                btn.classList.add('active');
            }
        });

        // Update grid class
        productsGrid.className = `products-grid ${view}-view`;
        
        this.renderProducts();
    }

    renderProducts() {
        const productsGrid = document.getElementById('products-grid');
        const loadingState = document.getElementById('loading-state');
        const emptyState = document.getElementById('empty-state');
        const pagination = document.getElementById('pagination');

        // Show loading state
        loadingState.classList.remove('hidden');
        productsGrid.innerHTML = '';
        emptyState.classList.add('hidden');
        pagination.classList.add('hidden');

        setTimeout(() => {
            loadingState.classList.add('hidden');

            if (this.filteredProducts.length === 0) {
                emptyState.classList.remove('hidden');
                return;
            }

            // Calculate pagination
            const startIndex = (this.currentPage - 1) * this.productsPerPage;
            const endIndex = startIndex + this.productsPerPage;
            const productsToShow = this.filteredProducts.slice(startIndex, endIndex);

            // Render products
            productsGrid.innerHTML = productsToShow.map(product => this.renderProductCard(product)).join('');

            // Render pagination
            this.renderPagination();

            // Re-attach event listeners for new product cards
            this.attachProductEventListeners();
        }, 500);
    }

    renderProductCard(product) {
        const discountPercent = product.oldPrice ? 
            Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
        
        const stars = this.renderStars(product.rating);
        
        if (this.currentView === 'list') {
            return `
                <div class="product-card" data-product-id="${product.id}">
                    <div class="product-image">
                        <img src="../assets/images/products/${product.image}" alt="${product.name}" loading="lazy">
                        <div class="product-badges">
                            ${product.isNew ? '<span class="product-badge badge-new">جديد</span>' : ''}
                            ${product.oldPrice ? `<span class="product-badge badge-discount">-${discountPercent}%</span>` : ''}
                            ${product.isBestseller ? '<span class="product-badge badge-bestseller">الأكثر مبيعاً</span>' : ''}
                        </div>
                        <div class="product-actions">
                            <button class="action-btn quick-view-btn" title="عرض سريع">👁️</button>
                            <button class="action-btn wishlist-btn" title="إضافة للمفضلة">❤️</button>
                        </div>
                    </div>
                    <div class="product-info">
                        <div class="product-details">
                            <span class="product-category">${this.getCategoryName(product.category)}</span>
                            <h3 class="product-title">
                                <a href="product-details.html?id=${product.id}">${product.name}</a>
                            </h3>
                            <div class="product-rating">
                                <div class="product-stars">${stars}</div>
                                <span class="rating-count">(${product.reviewCount})</span>
                            </div>
                            <div class="product-description">
                                <p>${product.description}</p>
                            </div>
                            <div class="product-features">
                                ${product.features.slice(0, 3).map(feature => `
                                    <div class="product-feature">✓ ${feature}</div>
                                `).join('')}
                            </div>
                        </div>
                        <div class="product-pricing-actions">
                            <div class="product-price">
                                <span class="current-price">${this.formatPrice(product.price)} ر.س</span>
                                ${product.oldPrice ? `
                                    <span class="original-price">${this.formatPrice(product.oldPrice)} ر.س</span>
                                ` : ''}
                            </div>
                            <div class="product-actions-bottom">
                                <button class="btn-add-cart" data-product-id="${product.id}">
                                    🛒 أضف إلى السلة
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Grid view
        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="../assets/images/products/${product.image}" alt="${product.name}" loading="lazy">
                    <div class="product-badges">
                        ${product.isNew ? '<span class="product-badge badge-new">جديد</span>' : ''}
                        ${product.oldPrice ? `<span class="product-badge badge-discount">-${discountPercent}%</span>` : ''}
                        ${product.isBestseller ? '<span class="product-badge badge-bestseller">الأكثر مبيعاً</span>' : ''}
                    </div>
                    <div class="product-actions">
                        <button class="action-btn quick-view-btn" title="عرض سريع">👁️</button>
                        <button class="action-btn wishlist-btn" title="إضافة للمفضلة">❤️</button>
                    </div>
                </div>
                <div class="product-info">
                    <span class="product-category">${this.getCategoryName(product.category)}</span>
                    <h3 class="product-title">
                        <a href="product-details.html?id=${product.id}">${product.name}</a>
                    </h3>
                    <div class="product-rating">
                        <div class="product-stars">${stars}</div>
                        <span class="rating-count">(${product.reviewCount})</span>
                    </div>
                    <div class="product-price">
                        <span class="current-price">${this.formatPrice(product.price)} ر.س</span>
                        ${product.oldPrice ? `
                            <span class="original-price">${this.formatPrice(product.oldPrice)} ر.س</span>
                        ` : ''}
                    </div>
                    <div class="product-features">
                        ${product.features.slice(0, 2).map(feature => `
                            <div class="product-feature">✓ ${feature}</div>
                        `).join('')}
                    </div>
                    <div class="product-actions-bottom">
                        <button class="btn-add-cart" data-product-id="${product.id}">
                            🛒 أضف إلى السلة
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        
        return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
    }

    renderPagination() {
        const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
        const pagination = document.getElementById('pagination');
        
        if (totalPages <= 1) {
            pagination.classList.add('hidden');
            return;
        }

        pagination.classList.remove('hidden');
        
        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <button class="pagination-btn ${this.currentPage === 1 ? 'disabled' : ''}" 
                    data-page="${this.currentPage - 1}">
                السابق
            </button>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                paginationHTML += `
                    <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" 
                            data-page="${i}">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                paginationHTML += `<span class="pagination-dots">...</span>`;
            }
        }

        // Next button
        paginationHTML += `
            <button class="pagination-btn ${this.currentPage === totalPages ? 'disabled' : ''}" 
                    data-page="${this.currentPage + 1}">
                التالي
            </button>
        `;

        pagination.innerHTML = paginationHTML;

        // Add event listeners to pagination buttons
        pagination.querySelectorAll('.pagination-btn:not(.disabled)').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.currentPage = parseInt(e.target.dataset.page);
                this.renderProducts();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    }

    attachProductEventListeners() {
        // Add to cart buttons
        document.querySelectorAll('.btn-add-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.dataset.productId;
                this.addToCart(productId);
            });
        });

        // Quick view buttons
        document.querySelectorAll('.quick-view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productCard = e.target.closest('.product-card');
                const productId = productCard.dataset.productId;
                this.showQuickView(productId);
            });
        });

        // Wishlist buttons
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productCard = e.target.closest('.product-card');
                const productId = productCard.dataset.productId;
                this.toggleWishlist(productId, e.target);
            });
        });
    }

    setupQuickView() {
        const quickViewModal = document.getElementById('quick-view-modal');
        const quickViewClose = document.getElementById('quick-view-close');

        if (quickViewClose) {
            quickViewClose.addEventListener('click', () => {
                quickViewModal.classList.remove('active');
            });
        }

        // Close modal when clicking outside
        quickViewModal.addEventListener('click', (e) => {
            if (e.target === quickViewModal) {
                quickViewModal.classList.remove('active');
            }
        });
    }

    async showQuickView(productId) {
        const product = this.products.find(p => p.id == productId);
        if (!product) return;

        const quickViewModal = document.getElementById('quick-view-modal');
        const quickViewContent = document.getElementById('quick-view-content');

        const discountPercent = product.oldPrice ? 
            Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;

        quickViewContent.innerHTML = `
            <div class="product-gallery">
                <div class="main-image">
                    <img src="../assets/images/products/${product.image}" alt="${product.name}">
                </div>
            </div>
            <div class="product-info">
                <h2 class="product-title">${product.name}</h2>
                <div class="product-rating">
                    <div class="product-stars">${this.renderStars(product.rating)}</div>
                    <span class="rating-count">(${product.reviewCount} تقييم)</span>
                </div>
                <div class="product-pricing">
                    <span class="current-price">${this.formatPrice(product.price)} ر.س</span>
                    ${product.oldPrice ? `
                        <span class="original-price">${this.formatPrice(product.oldPrice)} ر.س</span>
                        <span class="discount-percent">-${discountPercent}%</span>
                    ` : ''}
                </div>
                <div class="product-description">
                    <p>${product.description}</p>
                </div>
                <div class="product-features">
                    <h4>المميزات:</h4>
                    <ul class="features-list">
                        ${product.features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                </div>
                <div class="product-actions">
                    <button class="btn btn-primary btn-add-to-cart" data-product-id="${product.id}">
                        🛒 أضف إلى السلة
                    </button>
                    <a href="product-details.html?id=${product.id}" class="btn btn-secondary">
                        عرض التفاصيل
                    </a>
                </div>
            </div>
        `;

        quickViewModal.classList.add('active');

        // Add event listener to quick view add to cart button
        quickViewContent.querySelector('.btn-add-to-cart').addEventListener('click', () => {
            this.addToCart(product.id);
            quickViewModal.classList.remove('active');
        });
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id == productId);
        if (!product) return;

        // Get current cart from localStorage
        const cart = JSON.parse(localStorage.getItem('furniture_store_cart') || '[]');
        
        // Check if product already in cart
        const existingItem = cart.find(item => item.id == productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }

        // Save back to localStorage
        localStorage.setItem('furniture_store_cart', JSON.stringify(cart));
        
        // Update cart count
        this.updateCartCount();
        
        // Show success message
        this.showNotification('تمت إضافة المنتج إلى السلة بنجاح!', 'success');
    }

    toggleWishlist(productId, button) {
        const wishlist = JSON.parse(localStorage.getItem('furniture_store_wishlist') || '[]');
        const productIndex = wishlist.findIndex(item => item.id == productId);
        
        if (productIndex > -1) {
            // Remove from wishlist
            wishlist.splice(productIndex, 1);
            button.textContent = '❤️';
            this.showNotification('تمت إزالة المنتج من المفضلة', 'info');
        } else {
            // Add to wishlist
            const product = this.products.find(p => p.id == productId);
            if (product) {
                wishlist.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image
                });
                button.textContent = '💔';
                this.showNotification('تمت إضافة المنتج إلى المفضلة', 'success');
            }
        }
        
        localStorage.setItem('furniture_store_wishlist', JSON.stringify(wishlist));
    }

    updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('furniture_store_cart') || '[]');
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        document.querySelectorAll('.cart-count').forEach(element => {
            element.textContent = totalItems;
        });
    }

    updateResultsCount() {
        const resultsCount = document.getElementById('results-count');
        if (resultsCount) {
            resultsCount.textContent = this.filteredProducts.length;
        }
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

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            <span class="notification-message">${message}</span>
        `;

        // Add styles
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

        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    getMockProducts() {
        return [
            {
                id: 1,
                name: "كنب فاخر 3 مقاعد",
                category: "sofas",
                price: 2500,
                oldPrice: 3000,
                image: "sofa-1.jpg",
                description: "كنب فاخر مصنوع من أجود أنواع القماش مع تصميم عصري يناسب جميع ديكورات المنزل.",
                features: ["قابل للتنظيف", "مقاعد مريحة", "ضمان 3 سنوات", "توصيل مجاني"],
                rating: 4.5,
                reviewCount: 24,
                isNew: true,
                isBestseller: true,
                freeShipping: true,
                salesCount: 150,
                createdAt: "2024-01-15"
            },
            {
                id: 2,
                name: "ستائر قطنية عصرية",
                category: "curtains", 
                price: 450,
                oldPrice: 600,
                image: "curtain-1.jpg",
                description: "ستائر قطنية عالية الجودة بمقاسات مختلفة وألوان متنوعة تناسب جميع الغرف.",
                features: ["قابل للغسيل", "عازل للضوء", "مقاسات متعددة", "تركيب مجاني"],
                rating: 4.2,
                reviewCount: 18,
                isNew: false,
                isBestseller: true,
                freeShipping: true,
                salesCount: 89,
                createdAt: "2024-02-01"
            }
        ];
    }
}

// Initialize products system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProductsSystem();
});