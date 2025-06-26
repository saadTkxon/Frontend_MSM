document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    
    // Get filter elements with more specific selectors
    const dateFilterStart = document.querySelector('.dateFilter input[type="date"]:first-child');
    const dateFilterEnd = document.querySelector('.dateFilter input[type="date"]:nth-child(3)'); // Changed selector
    const dateFilterButton = document.querySelector('.dateFilter button');
    const durationFilter = document.querySelector('.durationFilter');
    
    // Add reset button (we'll add this to HTML)
    const resetButton = document.getElementById('resetFiltersButton');
    
    console.log('Filter elements:', {
        dateFilterStart,
        dateFilterEnd,
        dateFilterButton,
        durationFilter
    });
    
    // Global variable to store all reviews
    let allReviews = [];
    
    // Store recent filters
    let recentFilters = {
        dateStart: '',
        dateEnd: '',
        duration: ''
    };
    
    // Function to apply all filters
    function applyFilters(e) {
        if (e) e.preventDefault(); // Prevent form submission/refresh
        
        console.log('Applying filters...');
        
        if (allReviews.length === 0) {
            console.warn('No reviews to filter');
            return;
        }
        
        // Get current filter values
        const startDate = dateFilterStart.value;
        const endDate = dateFilterEnd ? dateFilterEnd.value : ''; // Safe check
        const duration = durationFilter.value;
        
        console.log('Current filter values:', {
            startDate,
            endDate,
            duration
        });
        
        // Store recent filters
        recentFilters = {
            dateStart: startDate,
            dateEnd: endDate,
            duration: duration
        };
        
        // Filter by date range first
        let filteredReviews = filterByDateRange(allReviews, startDate, endDate);
        console.log(`Reviews after date filter: ${filteredReviews.length} (from ${allReviews.length})`);
        
        // Then filter by duration if set
        if (duration) {
            filteredReviews = filterByDuration(filteredReviews, duration);
            console.log(`Reviews after duration filter: ${filteredReviews.length}`);
        }
        
        // Create a filtered data object that matches your displayReviews format
        const filteredData = {
            reviews: filteredReviews
        };
        
        // Display the filtered reviews
        if (typeof displayReviews === 'function') {
            displayReviews(filteredData);
            console.log('Displaying filtered reviews');
        } else {
            console.error('displayReviews function not found');
        }
        
        // Add fun animation to the filter button
        animateFilterButton();
    }
    
    // Filter by date range
    function filterByDateRange(reviews, startDate, endDate) {
        if (!startDate && !endDate) {
            console.log('No date range filter applied');
            return reviews;
        }
        
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        console.log('Filtering by date range:', {
            start,
            end
        });
        
        return reviews.filter(review => {
            const reviewDate = new Date(review.created_at);
            
            if (start && end) {
                return reviewDate >= start && reviewDate <= end;
            } else if (start) {
                return reviewDate >= start;
            } else if (end) {
                return reviewDate <= end;
            }
            
            return true;
        });
    }
    
    // Filter by duration
    function filterByDuration(reviews, duration) {
        console.log(`Filtering by duration: ${duration}`);
        
        const now = new Date();
        let cutoffDate = new Date();
        
        switch(duration) {
            case 'Last 30 days':
                cutoffDate.setDate(now.getDate() - 30);
                break;
            case 'Last 60 days':
                cutoffDate.setDate(now.getDate() - 60);
                break;
            case 'Last 90 days':
                cutoffDate.setDate(now.getDate() - 90);
                break;
            case 'Last 6 months':
                cutoffDate.setMonth(now.getMonth() - 6);
                break;
            case 'Last 1 year':
                cutoffDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                return reviews;
        }
        
        console.log('Cutoff date:', cutoffDate);
        
        return reviews.filter(review => {
            const reviewDate = new Date(review.created_at);
            return reviewDate >= cutoffDate;
        });
    }
    
    // Fun animation for filter button
    function animateFilterButton() {
        console.log('Animating filter button');
        const button = dateFilterButton;
        button.classList.add('filter-animation');
        
        // Remove animation class after it completes
        setTimeout(() => {
            button.classList.remove('filter-animation');
        }, 500);
    }
    
    // Reset filters
    function resetFilters(e) {
        if (e) e.preventDefault(); // Prevent form submission/refresh
        
        console.log('Resetting filters');
        dateFilterStart.value = '';
        if (dateFilterEnd) dateFilterEnd.value = '';
        durationFilter.value = 'Last 30 days'; // Default value
        
        // Reapply filters to show all reviews
        applyFilters();
    }
    
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        .filter-animation {
            animation: filterPop 0.5s ease;
        }
        
        @keyframes filterPop {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        .dateFilter button, #resetFiltersButton {
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .dateFilter button:hover, #resetFiltersButton:hover {
            transform: scale(1.05);
            background-color: #f0f0f0;
        }
        
        .dateFilter button:active, #resetFiltersButton:active {
            transform: scale(0.95);
        }
        
        #resetFiltersButton {
            margin-left: 10px;
            padding: 5px 10px;
            background: #f8f8f8;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
    `;
    document.head.appendChild(style);
    console.log('Added animation styles');
    
    // Event listeners
    dateFilterButton.addEventListener('click', applyFilters);
    durationFilter.addEventListener('change', applyFilters);
    
    if (resetButton) {
        resetButton.addEventListener('click', resetFilters);
    }
    
    console.log('Event listeners added');
    
    // Listen for Enter key in date inputs
    [dateFilterStart, dateFilterEnd].forEach(input => {
        if (input) { // Only add listener if input exists
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    console.log('Enter key pressed in date input');
                    applyFilters(e);
                }
            });
        }
    });
    
    // Override the displayReviews function to store all reviews
    if (typeof window.displayReviews === 'function') {
        const originalDisplayReviews = window.displayReviews;
        console.log('Original displayReviews function:', originalDisplayReviews);
        
        window.displayReviews = function(reviewsData) {
            console.log('displayReviews called with data:', reviewsData);
            
            // Store all reviews for filtering
            if (reviewsData && reviewsData.reviews) {
                allReviews = reviewsData.reviews;
                console.log(`Stored ${allReviews.length} reviews for filtering`);
            }
            
            // Call the original function
            originalDisplayReviews.apply(this, arguments);
        };
    }
    
    // Initialize by loading reviews (if not already loaded)
    if (typeof loadReviews === 'function') {
        console.log('loadReviews function exists, calling it...');
        loadReviews();
    } else {
        console.warn('loadReviews function not found');
    }
    
    // Fix duration filter options
    const durationOptions = [
        { value: 'Last 30 days', text: 'Last 30 days' },
        { value: 'Last 60 days', text: 'Last 60 days' },
        { value: 'Last 90 days', text: 'Last 90 days' },
        { value: 'Last 6 months', text: 'Last 6 months' },
        { value: 'Last 1 year', text: 'Last 1 year' }
    ];
    
    // Clear and repopulate the duration filter with proper values
    if (durationFilter) {
        durationFilter.innerHTML = '';
        durationOptions.forEach(option => {
            const optElement = document.createElement('option');
            optElement.value = option.value;
            optElement.textContent = option.text;
            durationFilter.appendChild(optElement);
        });
        
        // Set default value
        durationFilter.value = 'Last 30 days';
    }
    
    console.log('Duration filter options populated');
});

console.log('Review filter script loaded (waiting for DOM)');