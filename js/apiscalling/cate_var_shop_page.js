// Set debug mode (true for development, false for production)
const DEBUG_MODE = false;

function debugLog(message, data = null) {
    if (!DEBUG_MODE) return;
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] DEBUG: ${message}`);
    if (data) {
        console.log(`[${timestamp}] DATA:`, data);
    }
}

// Function to close filters area
function closeFiltersArea() {
    document.querySelector('.filtersArea').style.display = 'none';
}

// Function to clear existing filter components (except price range, rating, and promotion)
function clearExistingFilters() {
    const form = document.querySelector('.filtersAreaContext form');
    const filterComponents = document.querySelectorAll('.oneFilterComponent');
    
    filterComponents.forEach(component => {
        const title = component.querySelector('h1');
        if (title) {
            const titleText = title.textContent.toLowerCase();
            // Keep only price range, rating, and promotion filters
            if (!['price range', 'rating', 'promotion'].includes(titleText)) {
                component.remove();
            }
        }
    });
}

// Function to render categories in the filters area
function renderCategories(categories) {
    const form = document.querySelector('.filtersAreaContext form');
    
    // Create the categories filter component
    const filterComponent = document.createElement('div');
    filterComponent.className = 'oneFilterComponent';
    
    // Create the title
    const title = document.createElement('h1');
    title.textContent = 'category';
    filterComponent.appendChild(title);
    
    // Create the categories container
    const categoriesContainer = document.createElement('div');
    categoriesContainer.className = 'categoriesFilters';

    categories.forEach(category => {
        const button = document.createElement('button');
        button.textContent = category.category_name.toLowerCase();
        button.dataset.categoryId = category.category_id;
        
        // Add click event to handle category selection
        button.addEventListener('click', function(e) {
            e.preventDefault();
            // Toggle aria-selected attribute
            const buttons = categoriesContainer.querySelectorAll('button');
            buttons.forEach(btn => btn.setAttribute('aria-selected', 'false'));
            this.setAttribute('aria-selected', 'true');
            
            // You can add your filter logic here
            debugLog('Category selected:', category);
        });
        
        categoriesContainer.appendChild(button);
    });

    // Set the first category as selected by default
    if (categories.length > 0) {
        categoriesContainer.querySelector('button').setAttribute('aria-selected', 'true');
    }
    
    filterComponent.appendChild(categoriesContainer);
    
    // Insert the categories filter as the first filter component
    const firstComponent = form.querySelector('.oneFilterComponent');
    if (firstComponent) {
        form.insertBefore(filterComponent, firstComponent);
    } else {
        form.appendChild(filterComponent);
    }
}







// Function to render variations in the filters area
function renderVariations(variations) {
    const form = document.querySelector('.filtersAreaContext form');
    
    // Find the position where we should insert variation filters (before price range)
    const priceRangeFilter = Array.from(form.querySelectorAll('.oneFilterComponent')).find(component => {
        const title = component.querySelector('h1');
        return title && title.textContent.toLowerCase() === 'price range';
    });
    
    variations.forEach(variationGroup => {
        // Skip if no variations available
        if (variationGroup.variations.length === 0) return;

        // Create the filter component container
        const filterComponent = document.createElement('div');
        filterComponent.className = 'oneFilterComponent';
        
        // Create the title
        const title = document.createElement('h1');
        title.textContent = variationGroup.title.toLowerCase();
        filterComponent.appendChild(title);
        
        // Create the variations container
        const variationsContainer = document.createElement('div');
        variationsContainer.className = 'variationFilters';
        
        // Add each variation option
        variationGroup.variations.forEach(variation => {
            const variationId = `variation_${variationGroup.variation_title_id}_${variation.variation_id}`;
            
            const optionDiv = document.createElement('div');
            optionDiv.className = 'oneVariationOption';
            
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.name = `${variationGroup.title.toLowerCase()}Variation`;
            input.id = variationId;
            
            const label = document.createElement('label');
            label.htmlFor = variationId;
            
            const circleSpan = document.createElement('span');
            circleSpan.className = 'circle';
            
            label.appendChild(circleSpan);
            label.appendChild(document.createTextNode(variation.value.toLowerCase()));
            
            optionDiv.appendChild(input);
            optionDiv.appendChild(label);
            variationsContainer.appendChild(optionDiv);
        });
        
        filterComponent.appendChild(variationsContainer);
        
        // Insert the variation filter before price range if it exists, otherwise append to end
        if (priceRangeFilter) {
            form.insertBefore(filterComponent, priceRangeFilter);
        } else {
            form.appendChild(filterComponent);
        }
    });
}






// Function to fetch categories and variations from API
async function fetchCategoriesAndVariations() {
    const authToken = localStorage.getItem("auth_token");
    debugLog("Fetching categories and variations...");
    
    try {
        // First, clear existing category and variation filters (but keep price, rating, promotion)
        clearExistingFilters();
        
        debugLog("Making API request to get categories and variations");
        const response = await fetch('http://localhost:5000/products/get-categories-variationsopen', {
            method: 'GET',
            // headers: {
            //     "Authorization": `Bearer ${authToken}`
            // }
        });

        debugLog("API response status:", response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        debugLog("API response data:", data);

        if (data.status === 200 && data.response) {
            // Render categories
            if (data.response.categories && data.response.categories.length > 0) {
                renderCategories(data.response.categories);
            }
            
            // Render variations
            if (data.response.variations && data.response.variations.length > 0) {
                renderVariations(data.response.variations);
            }
        } else {
            throw new Error(data.message || 'Failed to fetch categories and variations');
        }
    } catch (error) {
        debugLog("Error fetching categories and variations:", error);
        console.error("Error:", error);
    }
}

// Initialize the filters when the page loads
document.addEventListener('DOMContentLoaded', function() {
    fetchCategoriesAndVariations();
});





























