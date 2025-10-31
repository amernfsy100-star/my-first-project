// Configuration File for Furniture Store
const CONFIG = {
    // API Endpoints
    API_BASE_URL: 'http://localhost:3000/api',
    
    // App Settings
    APP_NAME: 'متجر الأثاث',
    APP_VERSION: '1.0.0',
    
    // Cart Settings
    CART: {
        MAX_ITEMS: 50,
        TAX_RATE: 0.15, // 15%
        SHIPPING_COST: 0, // Free shipping
        CURRENCY: 'ريال'
    },
    
    // Storage Keys
    STORAGE_KEYS: {
        CART: 'furniture_store_cart',
        USER: 'furniture_store_user',
        TOKEN: 'furniture_store_token'
    },
    
    // Default Settings
    DEFAULTS: {
        LANGUAGE: 'ar',
        THEME: 'light',
        ITEMS_PER_PAGE: 12
    },
    
    // Features Flags
    FEATURES: {
        SEARCH: true,
        FILTERS: true,
        WISHLIST: true,
        COMPARE: true,
        REVIEWS: true
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}