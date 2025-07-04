// Function to fetch and display product reviews
function loadReviews(productId) {
    console.log('Starting loadReviews for productId:', productId);
    
    fetch("http://145.223.33.250:5000/products/openreviews", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ product_id: productId })
    })
    .then(response => {
        console.log('Raw response:', response);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log("Reviews API Response:", data);
        if (data.status === true) {
            console.log('Data contains:', {
                reviewsCount: data.reviews?.length,
                productData: data.product
            });
            renderReviews(data);
        } else {
            console.error('API returned false status:', data.message);
            showEmptyReviewsState();
        }
    })
    .catch(error => {
        console.error('Fetch error:', error);
        showEmptyReviewsState();
    });
}

// Function to render all reviews
function renderReviews(data) {
    console.log('Starting renderReviews with data:', data);
    
  
    

// Create reviews container if it doesn't exist
let reviewsContainer = document.querySelector('.reviewsShownHere');
if (!reviewsContainer) {
    reviewsContainer = document.createElement('div');
    reviewsContainer.className = 'reviewsShownHere';
    
    // Find the copyright area and insert before it
    const copyrightArea = document.querySelector('.copyrightArea');
    if (copyrightArea) {
        copyrightArea.parentNode.insertBefore(reviewsContainer, copyrightArea);
    } else {
        // Fallback if copyright area not found
        document.body.appendChild(reviewsContainer);
    }
}

    const reviews = data.reviews || [];
    const product = data.product || {};
    
    console.log(`Found ${reviews.length} reviews for product:`, product.title);
    
    // Clear existing content
    reviewsContainer.innerHTML = '';
    
    // Add title
    const title = document.createElement('h2');
    title.textContent = 'Product Reviews';
    reviewsContainer.appendChild(title);
    
    // Update rating summary
    updateRatingSummary(product, reviewsContainer);
    
    // Create tabs for different rating filters
    createRatingTabs(reviewsContainer);
    
    // Create container for all reviews
    const allReviewsContainer = document.createElement('div');
    allReviewsContainer.className = 'allReviewsContainer';
    reviewsContainer.appendChild(allReviewsContainer);
    
    // Render all reviews at once
    if (reviews.length === 0) {
        showEmptyReviewsState(reviewsContainer);
    } else {
        renderAllReviews(reviews, allReviewsContainer);
    }
}

// Helper function to render all reviews at once
function renderAllReviews(reviews, container) {
    // Sort reviews by date (newest first)
    reviews.sort((a, b) => new Date(b.review_date) - new Date(a.review_date));
    
    reviews.forEach(review => {
        const reviewElement = createReviewElement(review);
        container.appendChild(reviewElement);
    });
}

// Helper function to create a single review element
function createReviewElement(review) {
    const reviewElement = document.createElement('div');
    reviewElement.className = 'oneProductReview';
    
    const rating = review.rating || 0;
    
    // Create stars HTML based on rating
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
        const starClass = i <= rating ? 'positive' : 'negative';
        starsHtml += `<span class="${starClass}">&#9733;</span>`;
    }
    
    // Create review images HTML if they exist
    let imagesHtml = '';
    for (let i = 1; i <= 5; i++) {
        const imageKey = `review_image_${i}`;
        if (review[imageKey]) {
            const imageUrl = `/MSM_Backend/images/reviews/${review[imageKey]}`;
            imagesHtml += `<a href="${imageUrl}" target="_blank"><img src="${imageUrl}" alt="Review image ${i}"></a>`;
        }
    }
    
    // Create variations HTML if they exist
    let variationsHtml = '';
    if (review.variations && review.variations.length > 0) {
        variationsHtml = `<div class="variations"><p>${review.variations.join(' - ')}</p></div>`;
    }
    
    // Format date
    const reviewDate = review.review_date ? new Date(review.review_date).toLocaleDateString() : '';
    
    reviewElement.innerHTML = `
        <div class="starsAndUsername">
            ${starsHtml}
            <p class="username">${review.reviewer_name || 'Anonymous'}</p>
            <p class="reviewDate">${reviewDate}</p>
        </div>
        <p class="reviewContext">${review.review_text || 'No review text provided.'}</p>
        ${imagesHtml ? `<div class="reviewImages">${imagesHtml}</div>` : ''}
        ${variationsHtml}
    `;
    
    return reviewElement;
}

function showEmptyReviewsState(container) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty';
    emptyState.innerHTML = '<p>No reviews yet. Be the first to review this product!</p>';
    container.appendChild(emptyState);
}

// Function to create rating tabs
function createRatingTabs(container) {
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'ratingTabs';
    
    // Create "All Reviews" tab
    const allTab = document.createElement('button');
    allTab.textContent = 'All Reviews';
    allTab.className = 'active';
    allTab.addEventListener('click', () => {
        document.querySelectorAll('.oneProductReview').forEach(review => {
            review.style.display = 'block';
        });
        setActiveTab(allTab);
    });
    tabsContainer.appendChild(allTab);
    
    // Create tabs for each star rating (5 to 1)
    for (let rating = 5; rating >= 1; rating--) {
        const tab = document.createElement('button');
        tab.textContent = `${rating} Star${rating !== 1 ? 's' : ''}`;
        tab.addEventListener('click', () => {
            document.querySelectorAll('.oneProductReview').forEach(review => {
                const reviewRating = parseInt(review.querySelector('.starsAndUsername').getAttribute('data-rating'));
                review.style.display = reviewRating === rating ? 'block' : 'none';
            });
            setActiveTab(tab);
        });
        tabsContainer.appendChild(tab);
    }
    
    container.appendChild(tabsContainer);
}

function setActiveTab(activeTab) {
    document.querySelectorAll('.ratingTabs button').forEach(tab => {
        tab.classList.remove('active');
    });
    activeTab.classList.add('active');
}

// Function to update rating summary
function updateRatingSummary(product, container) {
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'ratingSummary';
    
    const averageRating = product.average_rating || 0;
    const totalReviews = product.total_reviews || 0;
    
    summaryDiv.innerHTML = `
        <div class="averageRating">
            <h2>${averageRating.toFixed(1)}</h2>
            <div class="stars">${createStarsHtml(averageRating)}</div>
            <p>${totalReviews} review${totalReviews !== 1 ? 's' : ''}</p>
        </div>
        <div class="ratingBreakdown">
            ${createRatingBar(5, product.five_star_reviews || 0, totalReviews)}
            ${createRatingBar(4, product.four_star_reviews || 0, totalReviews)}
            ${createRatingBar(3, product.three_star_reviews || 0, totalReviews)}
            ${createRatingBar(2, product.two_star_reviews || 0, totalReviews)}
            ${createRatingBar(1, product.one_star_reviews || 0, totalReviews)}
        </div>
    `;
    
    container.appendChild(summaryDiv);
}

function createStarsHtml(rating) {
    let starsHtml = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            starsHtml += '★';
        } else if (i === fullStars + 1 && hasHalfStar) {
            starsHtml += '½';
        } else {
            starsHtml += '☆';
        }
    }
    return starsHtml;
}

function createRatingBar(rating, count, total) {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return `
        <div class="ratingBar">
            <span>${rating} star</span>
            <div class="barContainer">
                <div class="bar" style="width: ${percentage}%"></div>
            </div>
            <span>${count}</span>
        </div>
    `;
}

// Wait for DOM to be fully loaded before executing
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId) {
        console.log('Product ID found, loading reviews...');
        loadReviews(productId);
    } else {
        console.error('No product ID found in URL');
        // Create container anyway to show error
        const reviewsContainer = document.createElement('div');
        reviewsContainer.className = 'reviewsShownHere';
        document.body.appendChild(reviewsContainer);
        showEmptyReviewsState(reviewsContainer);
    }
});



