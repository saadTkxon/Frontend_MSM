// Add this to your cate_var_shop_page.js or create a new file for filtering logic

// Global variables to store filter state
let currentFilters = {
    category: null,
    variations: {},
    priceRange: { min: null, max: null },
    rating: null,
    promotion: []
};

// Function to apply all active filters
function applyFilters() {
    const products = Object.values(currentProducts); // Get all products
    
    const filteredProducts = products.filter(product => {
        // Category filter
        if (currentFilters.category && product.category_id !== currentFilters.category) {
            return false;
        }
        
        // Variations filter
        for (const [variationName, selectedValues] of Object.entries(currentFilters.variations)) {
            if (selectedValues.length > 0) {
                if (!product.variations || !product.variations.some(v => 
                    v.title === variationName && selectedValues.includes(v.values[0]))) {
                    return false;
                }
            }
        }
        
        // Price range filter
        const displayPrice = product.discount_price || product.actual_price;
        if (currentFilters.priceRange.min && displayPrice < currentFilters.priceRange.min) {
            return false;
        }
        if (currentFilters.priceRange.max && displayPrice > currentFilters.priceRange.max) {
            return false;
        }
        
        // Rating filter (assuming product has a rating property)
        if (currentFilters.rating && (!product.rating || product.rating < currentFilters.rating)) {
            return false;
        }
        
        // Promotion filters
        if (currentFilters.promotion.length > 0) {
            // On sale check
            if (currentFilters.promotion.includes('on sale') && 
                (!product.discount_price || product.discount_price >= product.actual_price)) {
                return false;
            }
            
            // Free delivery check (assuming product has a shipping_fee property)
            if (currentFilters.promotion.includes('free delivery') && 
                (product.shipping_fee && parseFloat(product.shipping_fee) > 0)) {
                return false;
            }
        }
        
        return true;
    });
    
    // Convert back to object format with product IDs as keys
    const filteredProductsObj = {};
    filteredProducts.forEach(product => {
        filteredProductsObj[product.product_id] = product;
    });
    
    // Display the filtered products
    displayProducts(filteredProductsObj);
    productsFoundElement.textContent = filteredProducts.length;
    
    // Reset pagination
    currentPage = 1;
    totalProducts = filteredProducts.length;
    totalPages = Math.ceil(totalProducts / itemsPerPage);
    updatePagination();
}

// Update your category button click handler to set the category filter
function setupCategoryFilters() {
    document.querySelectorAll('.categoriesFilters button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const buttons = this.parentElement.querySelectorAll('button');
            buttons.forEach(btn => btn.setAttribute('aria-selected', 'false'));
            this.setAttribute('aria-selected', 'true');
            
            currentFilters.category = this.dataset.categoryId || null;
            applyFilters();
        });
    });
}

// Update your variation checkbox handler to set variation filters
function setupVariationFilters() {
    document.querySelectorAll('.variationFilters input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const variationName = this.name.replace('Variation', '');
            const variationValue = this.nextElementSibling.textContent.trim();
            
            if (!currentFilters.variations[variationName]) {
                currentFilters.variations[variationName] = [];
            }
            
            if (this.checked) {
                currentFilters.variations[variationName].push(variationValue);
            } else {
                currentFilters.variations[variationName] = 
                    currentFilters.variations[variationName].filter(v => v !== variationValue);
            }
            
            applyFilters();
        });
    });
}

// Update your price range filter handler
function setupPriceRangeFilter() {
    const priceRangeFilter = document.querySelector('.priceRangeFilters');
    if (priceRangeFilter) {
        const minInput = priceRangeFilter.querySelector('input:first-child');
        const maxInput = priceRangeFilter.querySelector('input:nth-child(2)');
        const applyButton = priceRangeFilter.querySelector('button');
        
        applyButton.addEventListener('click', function(e) {
            e.preventDefault();
            currentFilters.priceRange = {
                min: minInput.value ? parseFloat(minInput.value) : null,
                max: maxInput.value ? parseFloat(maxInput.value) : null
            };
            applyFilters();
        });
    }
}

// Update your rating filter handler
function setupRatingFilter() {
    document.querySelectorAll('.ratingFilters button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const buttons = this.parentElement.querySelectorAll('button');
            buttons.forEach(btn => btn.setAttribute('aria-selected', 'false'));
            
            // Extract rating from button text (e.g., "4.0 & up" -> 4)
            const ratingText = this.textContent.trim();
            const ratingMatch = ratingText.match(/(\d+\.?\d*)/);
            const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;
            
            if (rating === currentFilters.rating) {
                // Clicking the same rating again clears the filter
                this.setAttribute('aria-selected', 'false');
                currentFilters.rating = null;
            } else {
                this.setAttribute('aria-selected', 'true');
                currentFilters.rating = rating;
            }
            
            applyFilters();
        });
    });
}

// Update your promotion filter handler
function setupPromotionFilters() {
    document.querySelectorAll('.promotionFilters input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const promotionValue = this.nextElementSibling.textContent.trim().toLowerCase();
            
            if (this.checked) {
                if (!currentFilters.promotion.includes(promotionValue)) {
                    currentFilters.promotion.push(promotionValue);
                }
            } else {
                currentFilters.promotion = currentFilters.promotion.filter(p => p !== promotionValue);
            }
            
            applyFilters();
        });
    });
}

// Initialize all filter event listeners
function initializeFilters() {
    setupCategoryFilters();
    setupVariationFilters();
    setupPriceRangeFilter();
    setupRatingFilter();
    setupPromotionFilters();
}

// Call this after you've rendered the filters
document.addEventListener('DOMContentLoaded', function() {
    fetchCategoriesAndVariations();
    initializeFilters();
});

// Add this function to your filters.js file
function openFiltersArea() {
    document.querySelector('.filtersArea').style.display = 'block';
}


