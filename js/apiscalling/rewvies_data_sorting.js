// reviews_data_sorting.js

// Enhanced logging with maximum information
const debug = true; // Set to false in production
function log(message, data = null) {
    if (debug) {
        console.log(`[Reviews Sorting] ${message}`);
        if (data) console.dir(data);
    }
}

// Function to initialize reviews sorting functionality
function initReviewsSorting() {
    log('Initializing reviews sorting...');
    
    // Get the sort filter element
    const sortFilter = document.getElementById('sortFilter');
    
    if (sortFilter) {
        log('Sort filter element found');
        
        // Set default value
        sortFilter.value = 'newest';
        
        // Add event listener (better than inline onchange)
        sortFilter.addEventListener('change', sortReviews);
        
        // Initial sort
        sortReviews();
        log('Initialization complete');
    } else {
        console.error('Sort filter element not found - check HTML structure');
    }
}

// Main sorting function
function sortReviews() {
    log('Starting sort operation...');
    
    // Check if we have reviews data to sort
    if (!window.allReviews) {
        log('window.allReviews not defined');
        console.error('Reviews data not loaded');
        return;
    }
    
    if (!Array.isArray(window.allReviews)) {
        log('window.allReviews is not an array', window.allReviews);
        console.error('Invalid reviews data format');
        return;
    }
    
    if (window.allReviews.length === 0) {
        log('Empty reviews array - no data to sort');
        console.warn('No reviews available to sort');
        return;
    }
    
    const sortFilter = document.getElementById('sortFilter');
    const sortValue = sortFilter ? sortFilter.value : 'newest';
    log(`Selected sort value: ${sortValue}`);
    
    // Create a copy of the reviews array to sort
    const reviewsToSort = [...window.allReviews];
    log(`Processing ${reviewsToSort.length} reviews`);
    
    try {
        // Sort the data based on selected option
        switch(sortValue) {
            case 'newest':
                reviewsToSort.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                log('Sorted by newest first');
                break;
            case 'oldest':
                reviewsToSort.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                log('Sorted by oldest first');
                break;
            case 'highest':
                reviewsToSort.sort((a, b) => b.rating - a.rating);
                log('Sorted by highest rating');
                break;
            case 'lowest':
                reviewsToSort.sort((a, b) => a.rating - b.rating);
                log('Sorted by lowest rating');
                break;
            default:
                reviewsToSort.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                log('Default sorting (newest first)');
        }
        
        // Create a data object that matches your displayReviews format
        const sortedData = {
            reviews: reviewsToSort,
            sortMethod: sortValue,
            timestamp: new Date().toISOString()
        };
        
        log('Sorting completed successfully', sortedData);
        
        // Call displayReviews if it exists
        if (typeof window.displayReviews === 'function') {
            log('Calling displayReviews function');
            window.displayReviews(sortedData);
        } else {
            console.error('displayReviews function not available');
            log('Cannot display reviews - displayReviews function missing');
        }
    } catch (error) {
        console.error('Error during sorting:', error);
        log('Sorting failed', error);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    log('DOM content loaded');
    
    // Use setTimeout to ensure other elements are ready
    setTimeout(() => {
        log('Starting initialization after delay');
        initReviewsSorting();
    }, 300);
});

// For debugging purposes - expose functions to global scope
window.sortReviews = sortReviews;
window.initReviewsSorting = initReviewsSorting;
log('Reviews sorting module loaded');