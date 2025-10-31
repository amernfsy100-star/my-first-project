// Categories Management System

class CategoriesSystem {
    constructor() {
        this.categories = [];
        this.products = [];
        this.init();
    }

    async init() {
        await this.loadCategories();
        await this.loadProducts();
        this.renderCategories();
        this.setupEventListeners();
    }

    async loadCategories() {
        try {
            const response = await fetch('../assets/data/categories.json');
            this.categories = await response.json();
        } catch (error) {
            console.error('Error loading categories:', error);
            this.categories = this.getMockCategories();
        }
    }

    async loadProducts() {
        try {
            const response = await fetch('../assets/data/products.json');
            this.products = await response.json();
        } catch (error) {
            console.error('Error loading products:', error);
            this.products = this.getMockProducts();
        }
    }

    renderCategories() {
        const categoriesGrid = document.getElementById('categories-grid');
        
        if (!categoriesGrid) return;

        categoriesGrid.innerHTML = this.categories.map(category => {
            const categoryProducts = this.products.filter(product => product.category === category.slug);
            const featuredProducts = categoryProducts.slice(0, 4);
            
            return `
                <div class="category-card" data-category-slug="${category.slug}">
                    <div class="category-image" style="background: linear-gradient(135deg, #${this.getRandomColor()}, #${this.getRandomColor()})">
                        <div class="category-overlay"></div>
                    </div>
                    <div class="category-content">
                        <h3 class="category-title">${category.name}</h3>
                        <p class="category-description">${category.description}</p>
                        
                        <div class="category-stats">
                            <span class="products-count">${categoryProducts.length} منتج</span>
                            <div class="category-rating">
                                <span class="rating-stars">★★★★☆</span>
                                <span class="rating-text">(4.2)</span>
                            </div>
                        </div>
                        
                        <div class="category-actions">
                            <button class="btn-explore view-category-btn" data-category="${category.slug}">
                                👀 استعرض المنتجات
                            </button>
                            <a href="products.html?category=${category.slug}" class="btn-view-all">
                                📦 جميع المنتجات
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    setupEventListeners() {
        // View category buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-category-btn')) {
                const categorySlug = e.target.dataset.category;
                this.showCategoryDetails(categorySlug);
            }
        });

        // Back to categories button
        const backButton = document.getElementById('back-to-categories');
        if (backButton) {
            backButton.addEventListener('click', () => {
                this.hideCategoryDetails();
            });
        }
    }

    showCategoryDetails(categorySlug) {
        const category = this.categories.find(cat => cat.slug === categorySlug);
        const categoryProducts = this.products.filter(product => product.category === categorySlug);
        
        if (!category) return;

        // Update category details
        document.getElementById('category-title').textContent = category.name;
        document.getElementById('category-description').textContent = category.description;

        // Render category products
        this.renderCategoryProducts(categoryProducts);

        // Show category details section
        document.getElementById('categories-grid').classList.add('hidden');
        document.getElementById('category-details').classList.remove('hidden');

        // Update breadcrumb
        this.updateBreadcrumb(category.name);
    }

    hideCategoryDetails() {
        document.getElementById('categories-grid').classList.remove('hidden');
        document.getElementById('category-details').classList.add('hidden');
    }

    renderCategoryProducts(products) {
        const productsContainer = document.getElementById('category-products');
        
        productsContainer.innerHTML = products.slice(0, 6).map(product => {
            return `
                <div class="product-mini-card" data-product-id="${product.id}">
                    <div class="product-mini-image">
                        <img src="../assets/images/products/${product.image}" alt="${product.name}" loading="lazy">
                    </div>
                    <h4 class="product-mini-title">${product.name}</h4>
                    <div class="product-mini-price">${this.formatPrice(product.price)} ر.س</div>
                </div>
            `;
        }).join('');

        // Add click event to product cards
        productsContainer.querySelectorAll('.product-mini-card').forEach(card => {
            card.addEventListener('click', () => {
                const productId = card.dataset.productId;
                window.location.href = `product-details.html?id=${productId}`;
            });
        });
    }

    updateBreadcrumb(categoryName) {
        // This would update the breadcrumb navigation
        console.log('Updating breadcrumb for:', categoryName);
    }

    getRandomColor() {
        const colors = ['2c5530', '4a7c59', '8b4513', 'a52a2a', 'daa520', 'cd853f', 'deb887'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    formatPrice(price) {
        return new Intl.NumberFormat('ar-SA').format(price);
    }

    getMockCategories() {
        return [
            {
                id: 1,
                name: "الكنب",
                slug: "sofas",
                image: "sofas.jpg",
                description: "أحدث designs الكنب والسوفات"
            },
            {
                id: 2,
                name: "الستائر", 
                slug: "curtains",
                image: "curtains.jpg",
                description: "ستائر عصرية بجميع المقاسات"
            },
            {
                id: 3,
                name: "الطاولات",
                slug: "tables",
                image: "tables.jpg", 
                description: "طاولات طعام وقهوة وجانبية"
            },
            {
                id: 4,
                name: "الأسرّة",
                slug: "beds",
                image: "beds.jpg",
                description: "أسرة مريحة وأنيقة بجميع المقاسات"
            }
        ];
    }

    getMockProducts() {
        return [
            {
                id: 1,
                name: "كنب فاخر 3 مقاعد",
                category: "sofas",
                price: 2500,
                image: "sofa-1.jpg"
            },
            {
                id: 2, 
                name: "ستائر قطنية عصرية",
                category: "curtains",
                price: 450,
                image: "curtain-1.jpg"
            }
        ];
    }
}

// Initialize categories system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CategoriesSystem();
});