// Function to fetch all reviews
async function fetchAllReviews() {
    const authToken = localStorage.getItem("auth_token");
    const apiUrl = "http://localhost:5000/products/ADMIN/get-all-reviews";
    
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({
                status: "pending" // pass status in the request body
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return null;
    }
}




function displayReviews(reviewsData) {
    const reviewsContainer = document.querySelector('.reviewProductsHere');
    
    // Clear existing content
    reviewsContainer.innerHTML = '';
    
    if (!reviewsData || !reviewsData.reviews || reviewsData.reviews.length === 0) {
        // Show empty state if no reviews
        const emptyElement = document.createElement('p');
        emptyElement.className = 'empty';
        emptyElement.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <g fill="none" stroke="currentColor">
                    <path d="M2 12c0-4.714 0-7.071 1.464-8.536C4.93 2 7.286 2 12 2s7.071 0 8.535 1.464C22 4.93 22 7.286 22 12s0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12Z" />
                    <path stroke-linecap="round" d="M2 13h3.16c.905 0 1.358 0 1.756.183s.692.527 1.281 1.214l.606.706c.589.687.883 1.031 1.281 1.214s.85.183 1.756.183h.32c.905 0 1.358 0 1.756-.183s.692-.527 1.281-1.214l.606-.706c.589-.687.883-1.031 1.281-1.214S17.934 13 18.84 13H22" />
                </g>
            </svg>
            <span>empty</span>
        `;
        reviewsContainer.appendChild(emptyElement);
        return;
    }
    
    // Create review items for each review
    reviewsData.reviews.forEach(review => {
        const reviewItem = document.createElement('button');
        reviewItem.type = 'button';
        reviewItem.className = 'oneReviewItem';
        reviewItem.onclick = () => openViewReviewArea(review.review_id);
        
        // Create stars HTML based on rating
        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= review.rating) {
                starsHTML += '<span class="positive">&#9733;</span>';
            } else {
                starsHTML += '<span class="negative">&#9733;</span>';
            }
        }
        
        // Format variations
        const variationsText = review.variations.join(" - ");
        
        // Format date (assuming the API returns a format that can be parsed by Date)
        const date = new Date(review.created_at);
        const formattedDate = date.toLocaleString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        // Get the first available image (if any)
        let firstImage = '';
        if (review.review_image_1) {
            // Correct the image path based on your API response
            firstImage = `/MSM_Backend/images/reviews/${review.review_image_1}`;
        } else {
            firstImage = '/msm_kosmetika_fin/assets/misc/rewiewProduct2.jpg'; // default image
        }
        
        // Check if there are any images to show an image indicator
        const hasImages = review.review_image_1 || review.review_image_2 || 
                         review.review_image_3 || review.review_image_4 || 
                         review.review_image_5;
        
        reviewItem.innerHTML = `
            <div class="itemImageBox">
                <img src="${firstImage}" alt="Review image" onerror="this.src='/assets/misc/productItem1.png'">
                ${hasImages ? '<div class="imageCountBadge">' + 
                    [review.review_image_1, review.review_image_2, review.review_image_3, 
                     review.review_image_4, review.review_image_5].filter(Boolean).length + 
                    '</div>' : ''}
            </div>
            <div class="itemDets">
                <h1>${review.review_text || 'No review text provided'}</h1>
                <div class="variations">
                    <p><span>${variationsText}</span></p>
                </div>
                <div class="detsPlusAcc">
                    <div class="givenReview">
                        <div class="stars">${starsHTML}</div>
                        <p>(<span>${review.rating}</span>.0)</p>
                    </div>
                </div>
                <div class="status">
                    <h2>${review.status}</h2>
                    <p>Posted on: <span>${formattedDate}</span></p>
                </div>
            </div>
        `;
        
        reviewsContainer.appendChild(reviewItem);
    });
}






// Function to fetch review details
async function fetchReviewDetails(reviewId) {
    const authToken = localStorage.getItem("auth_token");
    const apiUrl = "http://localhost:5000/products/ADMIN/get-review-details";
    
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({ review_id: reviewId })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching review details:", error);
        return null;
    }
}

// Function to open review details
async function openViewReviewArea(reviewId) {
    console.log(`Opening review with ID: ${reviewId}`);
    
    // Show loading state
    const viewReviewArea = document.querySelector('.viewReviewArea');
    viewReviewArea.style.opacity = 1;
    viewReviewArea.style.transform = "translateY(0%)";
    viewReviewArea.querySelector('form').innerHTML = '<p>Loading review details...</p>';
    
    // Fetch review details
    const reviewData = await fetchReviewDetails(reviewId);
    
    if (!reviewData || !reviewData.review) {
        viewReviewArea.querySelector('form').innerHTML = '<p>Error loading review details</p>';
        return;
    }
    
    const review = reviewData.review;
    
    // Format date
    const date = new Date(review.created_at);
    const formattedDate = date.toLocaleString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    // Create stars HTML based on rating
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        starsHTML += `<input value="${i}" name="rate" id="star${i}" type="radio" ${i === review.rating ? 'checked' : ''} readonly>
                      <label title="text" for="star${i}"></label>`;
    }
    
    // Get all review images (excluding null values)
    const reviewImages = [
        review.review_image_1,
        review.review_image_2,
        review.review_image_3,
        review.review_image_4,
        review.review_image_5
    ].filter(img => img !== null);
    
    // Create images HTML
    let imagesHTML = '';
    reviewImages.forEach(img => {
        const imageUrl = `/MSM_Backend/images/reviews/${img}`;
        imagesHTML += `
            <div class="oneImageBox">
                <a href="${imageUrl}" target="_blank">
                    <img src="${imageUrl}" alt="Review image" onerror="this.src='/assets/misc/productItem1.png'">
                </a>
            </div>
        `;
    });
    
    // Update the form with review details
    const formHTML = `
        <div class="sideTitlePlusCloseButton">
            <h1>Review</h1>
            <button type="button" onclick="closeViewReviewArea()"><svg xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24">
                    <g fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" />
                        <path stroke-linecap="round" d="m14.5 9.5l-5 5m0-5l5 5" />
                    </g>
                </svg>&nbsp;Close</button>
        </div>

        <div class="orderDets">
            <h1>Order #<span>${review.order_id}</span></h1>
            <h2>Placed on&nbsp;<span>${formattedDate}</span></h2>
        </div>

        <div class="reviewStatus">
            <h1>Status</h1>
            <h2>${review.status}</h2>
        </div>

        <div class="givenRatingStars">
            <h1>Rating</h1>
            <div class="givenRating">
                ${starsHTML}
            </div>
        </div>

        <div class="givenReviewArea">
            <h1>Given review:</h1>
            <p>${review.review_text || 'No review text provided'}</p>
            <h2>Posted on:&nbsp;<small>${formattedDate}</small></h2>
        </div>

        ${reviewImages.length > 0 ? `
        <div class="previewImages">
            ${imagesHTML}
        </div>
        ` : ''}

        <div class="orderActionArea">
    <select name="reviewAction" id="reviewAction">
        <option value="">Action</option>
        <option value="approve">Approve review pictures</option>
        <option value="reject">Reject review pictures</option>
    </select>
    <button onclick="handleReviewAction(${review.review_id})">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path fill="none" stroke="currentColor"
                d="M20.409 9.353a2.998 2.998 0 0 1 0 5.294L7.597 21.614C5.534 22.737 3 21.277 3 18.968V5.033c0-2.31 2.534-3.769 4.597-2.648z" />
        </svg>
    </button>
</div>
    `;
    
    viewReviewArea.querySelector('form').innerHTML = formHTML;
}

// Function to close the review details view
function closeViewReviewArea() {
    const viewReviewArea = document.querySelector('.viewReviewArea');
    viewReviewArea.style.opacity = 0;
    viewReviewArea.style.transform = "translateY(100%)";
}






async function handleReviewAction(reviewId) {
    const actionSelect = document.getElementById('reviewAction');
    const action = actionSelect.value;
    
    if (!action) {
        alert('Please select an action');
        return;
    }
    
    // Map the action to the API status
    const statusMap = {
        'approve': 'approved',
        'reject': 'rejected'
    };
    const newStatus = statusMap[action];
    
    if (!newStatus) {
        alert('Invalid action selected');
        return;
    }
    
    try {
        const result = await updateReviewStatus(reviewId, newStatus);
        
        if (result && result.status === true) {
            // Success case - matches the API response format you showed
            alert(result.message || `Review status updated to ${newStatus} successfully!`);
            closeViewReviewArea();
            loadReviews(); // Refresh the reviews list
        } else {
            // Handle API success=false case
            const errorMsg = result.message || 'Failed to update review status';
            alert(errorMsg);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while updating the review status');
    }
}




// Function to update review status
async function updateReviewStatus(reviewId, newStatus) {
    const authToken = localStorage.getItem("auth_token");
    const apiUrl = "http://localhost:5000/products/ADMIN/update-review-status";
    
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({
                review_id: reviewId,
                new_status: newStatus
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error updating review status:", error);
        return null;
    }
}





// Function to fetch reviews by order ID
async function fetchReviewsByOrderId(orderId) {
    const authToken = localStorage.getItem("auth_token");
    const apiUrl = "http://localhost:5000/products/ADMIN/get-reviews-by-order";
    
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({ order_id: orderId })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching reviews by order ID:", error);
        return null;
    }
}

async function searchByOrderId() {
    const orderIdInput = document.getElementById('orderIdSearch');
    const orderId = orderIdInput.value.trim();
    
    if (!orderId) {
        alert('Please enter an order ID');
        return;
    }
    
    // Show loading state
    const reviewsContainer = document.querySelector('.reviewProductsHere');
    reviewsContainer.innerHTML = '<p>Loading reviews for order ID: ' + orderId + '...</p>';
    
    // Fetch reviews by order ID
    const reviewsData = await fetchReviewsByOrderId(orderId);
    
    if (!reviewsData) {
        reviewsContainer.innerHTML = '<p class="error">Error loading reviews for this order ID</p>';
        return;
    }
    
    if (!reviewsData.reviews || reviewsData.reviews.length === 0) {
        // Show empty state if no reviews found
        const emptyElement = document.createElement('p');
        emptyElement.className = 'empty';
        emptyElement.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <g fill="none" stroke="currentColor">
                    <path d="M2 12c0-4.714 0-7.071 1.464-8.536C4.93 2 7.286 2 12 2s7.071 0 8.535 1.464C22 4.93 22 7.286 22 12s0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12Z" />
                    <path stroke-linecap="round" d="M2 13h3.16c.905 0 1.358 0 1.756.183s.692.527 1.281 1.214l.606.706c.589.687.883 1.031 1.281 1.214s.85.183 1.756.183h.32c.905 0 1.358 0 1.756-.183s.692-.527 1.281-1.214l.606-.706c.589-.687.883-1.031 1.281-1.214S17.934 13 18.84 13H22" />
                </g>
            </svg>
            <span>No reviews found for order ID: ${orderId}</span>
        `;
        reviewsContainer.appendChild(emptyElement);
        return;
    }
    
    // Store the filtered data globally
    allReviewsData = reviewsData;
    
    // Display the filtered reviews with current sort
    sortReviews();
}

// Add event listener for Enter key in search input
document.addEventListener('DOMContentLoaded', function() {
    const orderIdInput = document.getElementById('orderIdSearch');
    if (orderIdInput) {
        orderIdInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchByOrderId();
            }
        });
    }
    
    // Load all reviews initially
    loadReviews();
});
// Global variable to store reviews data
let allReviewsData = null;

// Modified loadReviews function to store data globally
async function loadReviews() {
    allReviewsData = await fetchAllReviews();
    if (allReviewsData) {
        sortReviews(); // Default sort
    }
}

// Sorting function
function sortReviews() {
    if (!allReviewsData || !allReviewsData.reviews) return;
    
    const sortFilter = document.getElementById('sortFilter');
    const sortValue = sortFilter.value;
    
    // Create a copy of the reviews array to sort
    const reviewsToSort = [...allReviewsData.reviews];
    
    switch(sortValue) {
        case 'newest':
            reviewsToSort.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        case 'oldest':
            reviewsToSort.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            break;
        case 'highest':
            reviewsToSort.sort((a, b) => b.rating - a.rating);
            break;
        case 'lowest':
            reviewsToSort.sort((a, b) => a.rating - b.rating);
            break;
        default:
            // Default to newest first
            reviewsToSort.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    
    // Create a new object with the sorted reviews
    const sortedData = {
        ...allReviewsData,
        reviews: reviewsToSort
    };
    
    // Display the sorted reviews
    displayReviews(sortedData);
}






// Main function to load and display reviews
async function loadReviews() {
    const reviewsData = await fetchAllReviews();
    if (reviewsData) {
        displayReviews(reviewsData);
    }
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', loadReviews);



