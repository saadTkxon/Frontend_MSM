document.addEventListener('DOMContentLoaded', function() {
    // Fetch reviewed products when the page loads
    fetchReviewedProducts();
    
    // Initialize review areas
    initReviewAreas();
});

// Global variable to store reviewed products
let reviewedProducts = [];

async function fetchReviewedProducts() {
    try {
        const authToken = localStorage.getItem("auth_token");
        const response = await fetch('http://localhost:5000/products/my-reviewed-products', {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch reviewed products');
        }

        const data = await response.json();
        
        if (data.status && data.reviewed_products) {
            reviewedProducts = data.reviewed_products;
            populateReviewedProducts(data.reviewed_products);
        } else {
            console.error('No reviewed products found or API error');
            // Hide empty message if no products
            document.querySelector('.reviewedOrdersPack .empty').style.display = 'flex';
        }
    } catch (error) {
        console.error('Error fetching reviewed products:', error);
        document.querySelector('.reviewedOrdersPack .empty').style.display = 'flex';
    }
}

function initReviewAreas() {
    // Initialize review areas
    
    const viewReviewArea = document.querySelector('.viewReviewArea');
    
   
    // Add transition for smooth animation

    viewReviewArea.style.transition = 'all 0.3s ease';
}

function populateReviewedProducts(products) {
    const container = document.querySelector('.reviewedOrdersPack');
    
    // Clear existing content except the empty message
    const existingItems = container.querySelectorAll('.onReviewedItem');
    existingItems.forEach(item => item.remove());
    
    if (products.length === 0) {
        document.querySelector('.reviewedOrdersPack .empty').style.display = 'flex';
        return;
    } else {
        document.querySelector('.reviewedOrdersPack .empty').style.display = 'none';
    }
    
    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'onReviewedItem oneReviewItem';
        productElement.innerHTML = `
            <div class="itemImageBox">
                <img src="/MSM_Backend/images//${product.product_image}" alt="${product.product_name}">
            </div>
            <div class="itemDets">
                <h1>${product.product_title}</h1>
                <div class="variations">
                    ${product.variations && product.variations.length > 0 ? 
                      `<p>${product.variations.map(v => `<span>${v}</span>`).join('&nbsp;-&nbsp;')}</p>` : 
                      '<p>No variations</p>'}
                </div>
                <div class="detsPlusAcc">
                    <div class="givenReview">
                        <div class="stars">
                            ${Array(5).fill(0).map((_, i) => 
                                `<span class="${i < product.rating ? 'positive' : 'negative'}">★</span>`
                            ).join('')}
                        </div>
                        <p>(<span>${product.rating}</span>.0)</p>
                    </div>
                    <button type="button" class="accButton" onclick="openViewReviewArea('${product.review_id}')">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path fill="currentColor" fill-rule="evenodd"
                                d="M14.1 2.391a3.896 3.896 0 0 1 5.509 5.51l-7.594 7.594c-.428.428-.69.69-.98.917a6 6 0 0 1-1.108.684c-.334.159-.685.276-1.259.467l-2.672.891l-.642.214a1.598 1.598 0 0 1-2.022-2.022l1.105-3.314c.191-.574.308-.925.467-1.259a6 6 0 0 1 .685-1.107c.227-.291.488-.553.916-.98zM5.96 16.885l-.844-.846l.728-2.185c.212-.636.3-.895.414-1.135q.212-.443.513-.83c.164-.21.356-.404.83-.879l5.891-5.89a6.05 6.05 0 0 0 1.349 2.04a6.05 6.05 0 0 0 2.04 1.348l-5.891 5.89c-.475.475-.668.667-.878.83q-.388.302-.83.514c-.24.114-.5.202-1.136.414zm12.116-9.573a4 4 0 0 1-.455-.129a4.5 4.5 0 0 1-1.72-1.084a4.54 4.54 0 0 1-1.084-1.72a4 4 0 0 1-.13-.455l.473-.472a2.396 2.396 0 0 1 3.388 3.388zM3.25 22a.75.75 0 0 1 .75-.75h16v1.5H4a.75.75 0 0 1-.75-.75"
                                clip-rule="evenodd" />
                        </svg>
                        <span>view/edit review</span>
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(productElement);
    });
}














// Function to open the review view area with specific review data
async function openViewReviewArea(reviewId) {
    console.log('openViewReviewArea called with reviewId:', reviewId);
    
    try {
        const authToken = localStorage.getItem("auth_token");
        const response = await fetch(`http://localhost:5000/products/review/${reviewId}`, {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch review details');
        }

        const data = await response.json();
        console.log('API response:', data);

        if (!data.status || !data.review) {
            throw new Error('No review data found');
        }

        const review = data.review;
        const viewArea = document.querySelector('.viewReviewArea');
        
// Store review ID in localStorage
localStorage.setItem("currentReviewId", reviewId); // Save the review ID

        // Populate the view area with review data
        const productContainer = viewArea.querySelector('.reviewProductHere');
        
        const variationsHTML = review.variations && review.variations.length > 0 ?
            `<p>${review.variations.map(v => `<span>${v}</span>`).join('&nbsp;-&nbsp;')}</p>` :
            '<p>No variations</p>';

        productContainer.innerHTML = `
            <div class="oneReviewItem">
                <div class="itemImageBox">
                    <img src="/MSM_Backend/images/${review.product_image}" alt="${review.product_name}">
                </div>
                <div class="itemDets">
                    <h1>${review.product_name}</h1>
                    <div class="variations">
                        ${variationsHTML}
                    </div>
                    <div class="detsPlusAcc">
                        <div class="placedOn">
                            <p>Posted on:&nbsp;&nbsp;<span>${new Date(review.created_at).toLocaleString()}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Set the rating stars
        const stars = viewArea.querySelectorAll('.givenRating input');
        stars.forEach((star, index) => {
            star.checked = (index === (5 - review.rating));
        });

        // Set the review text
        const reviewTextArea = viewArea.querySelector('.givenReviewArea');
        reviewTextArea.innerHTML = `
            <h1>Given review:</h1>
            <p>${review.review_text || 'No review text provided'}</p>
            <h2>Posted on:&nbsp;<small>${new Date(review.created_at).toLocaleString()}</small></h2>
            ${review.status !== 'approved' ? 
              `<h2><small>Your review is ${review.status}</small></h2>` : ''}
        `;

        // Set review images if any
        const imagesContainer = viewArea.querySelector('.previewImages');
        imagesContainer.innerHTML = '';

        // Create array of review images (excluding null values)
        const reviewImages = [
            review.review_image_1,
            review.review_image_2,
            review.review_image_3,
            review.review_image_4,
            review.review_image_5
        ].filter(img => img !== null);

        if (reviewImages.length > 0) {
            reviewImages.forEach(image => {
                const imgBox = document.createElement('div');
                imgBox.className = 'oneImageBox';
                imgBox.innerHTML = `
                    <a href="/MSM_Backend/images/reviews/${image}" target="_blank">
                        <img src="/MSM_Backend/images/reviews/${image}" alt="Review image">
                    </a>
                `;
                imagesContainer.appendChild(imgBox);
            });
        }

        // Store current review ID for editing
        viewArea.dataset.reviewId = reviewId;

        // Show the view area
        viewArea.style.opacity = 1;
        viewArea.style.transform = "translateX(0%)";

    } catch (error) {
        console.error('Error in openViewReviewArea:', error);
        alert('Failed to load review details. Please try again.');
    }
}





function closeWriteOrEditReviewArea12(){

  
    
    // Clear localStorage for review ID
    localStorage.removeItem("currentReviewId");

    
    writeOrEditReviewArea.style.opacity = 0;
    writeOrEditReviewArea.style.transform = "translateX(110%)";
}













// Function to show delete confirmation before editing
function confirmDeleteBeforeEdit() {
    const modal = document.getElementById('deleteConfirmationModal');
    modal.classList.add('active');
    
    // Set up event listeners for modal buttons
    modal.querySelector('.cancel-btn').onclick = function() {
        modal.classList.remove('active');
    };
    
    modal.querySelector('.confirm-btn').onclick = async function() {
        const reviewId = localStorage.getItem("currentReviewId");
        if (!reviewId) {
            alert('No review selected');
            return;
        }
        
        try {
            const authToken = localStorage.getItem("auth_token");
            const response = await fetch(`http://localhost:5000/products/review/${reviewId}`, {
                method: 'DELETE',
                headers: {
                    "Authorization": `Bearer ${authToken}`
                }
            });

            const data = await response.json();
            
            if (data.status) {
                // Close the modal and view area
                modal.classList.remove('active');
                document.querySelector('.viewReviewArea').style.opacity = 0;
                document.querySelector('.viewReviewArea').style.transform = "translateX(110%)";
                
                // Refresh the reviewed products list
                location.reload();
                fetchReviewedProducts();
                 // Instead of fetch
                // Now open the edit area (if you have one)
                // openEditReviewArea(); // Uncomment if you have this function
            } else {
                alert('Failed to delete review: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            alert('Failed to delete review. Please try again.');
        }
    };
}

// Function to close the modal (optional)
function closeConfirmationModal() {
    document.getElementById('deleteConfirmationModal').classList.remove('active');
}








// async function openEditReviewArea(reviewId) {
//     console.log('openEditReviewArea called with reviewId:', reviewId);
    
//     // If no reviewId was passed as parameter, try to get it from localStorage
//     if (!reviewId) {
//         reviewId = localStorage.getItem("currentReviewId");
//         console.log('Falling back to localStorage reviewId:', reviewId);
//     }
    
//     if (!reviewId) {
//         console.error('No review ID provided');
//         return;
//     }
    
//     try {
//         const authToken = localStorage.getItem("auth_token");
//         const response = await fetch(`http://localhost:5000/products/review/${reviewId}`, {
//             method: 'GET',
//             headers: {
//                 "Authorization": `Bearer ${authToken}`
//             }
//         });

//         if (!response.ok) {
//             throw new Error('Failed to fetch review details');
//         }

//         const data = await response.json();
//         console.log('API response:', data);

//         if (!data.status || !data.review) {
//             throw new Error('No review data found');
//         }

//         const review = data.review;
//         const editArea = document.querySelector('.writeOrEditReviewArea');
        
//         // Store review ID in the edit area
//         editArea.dataset.reviewId = reviewId;

//         // Populate the product info
//         const productContainer = editArea.querySelector('.reviewProductHere');
        
//         const variationsHTML = review.variations && review.variations.length > 0 ?
//             `<p>${review.variations.map(v => `<span>${v}</span>`).join('&nbsp;-&nbsp;')}</p>` :
//             '<p>No variations</p>';

//         productContainer.innerHTML = `
//             <div class="oneReviewItem">
//                 <div class="itemImageBox">
//                     <img src="/MSM_Backend/images/${review.product_image}" alt="${review.product_name}">
//                 </div>
//                 <div class="itemDets">
//                     <h1>${review.product_name}</h1>
//                     <div class="variations">
//                         ${variationsHTML}
//                     </div>
//                     <div class="detsPlusAcc">
//                         <div class="placedOn">
//                             <p>Posted on:&nbsp;&nbsp;<span>${new Date(review.created_at).toLocaleString()}</span></p>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         `;

//         // Set the rating stars (note: your HTML uses reverse order - star5 is first)
//         const ratingInput = editArea.querySelector(`.ratingStars input[value="${review.rating}"]`);
//         if (ratingInput) {
//             ratingInput.checked = true;
//         }

//         // Set the review text
//         const reviewTextArea = editArea.querySelector('textarea[name="cancellationReason"]');
//         if (reviewTextArea) {
//             reviewTextArea.value = review.review_text || '';
//         }

//         // Clear existing preview images
//         const imagesContainer = editArea.querySelector('.previewImages');
//         imagesContainer.innerHTML = '';

//         // Create array of review images (excluding null values)
//         const reviewImages = [
//             review.review_image_1,
//             review.review_image_2,
//             review.review_image_3,
//             review.review_image_4,
//             review.review_image_5
//         ].filter(img => img !== null);

//         // Add existing images to preview
//         if (reviewImages.length > 0) {
//             reviewImages.forEach(image => {
//                 const imgBox = document.createElement('div');
//                 imgBox.className = 'oneImageBox';
//                 imgBox.innerHTML = `
//                     <a href="/MSM_Backend/images/reviews/${image}" target="_blank">
//                         <img src="/MSM_Backend/images/reviews/${image}" alt="Review image">
//                     </a>
//                     <button type="button" onclick="removeReviewImage(this, '${image}')">
//                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
//                             <g fill="none" stroke="currentColor">
//                                 <circle cx="12" cy="12" r="10" />
//                                 <path stroke-linecap="round" d="m14.5 9.5l-5 5m0-5l5 5" />
//                             </g>
//                         </svg>
//                     </button>
//                 `;
//                 imagesContainer.appendChild(imgBox);
//             });
//         }

//         // Show the edit area
//         editArea.style.opacity = 1;
//         editArea.style.transform = "translateX(0%)";

//         // Close the view area if open
//         const viewArea = document.querySelector('.viewReviewArea');
//         if (viewArea) {
//             viewArea.style.opacity = 0;
//             viewArea.style.transform = "translateX(110%)";
//         }

//     } catch (error) {
//         console.error('Error in openEditReviewArea:', error);
//         alert('Failed to load review details for editing. Please try again.');
//     }
// }






// // Helper function to remove an image from the preview
// function removeReviewImage(buttonElement, imageName) {
//     if (confirm('Are you sure you want to remove this image?')) {
//         const imageBox = buttonElement.closest('.oneImageBox');
//         if (imageBox) {
//             imageBox.remove();
//         }
//         // Here you would also need to track which images to remove from the server
//         // when the form is submitted
//     }
// }


















































































// Update the global functions
window.openEditReviewArea = openEditReviewArea;
window.removeReviewImage = removeReviewImage;










// Make functions available globally
window.openViewReviewArea = openViewReviewArea;
window.closeViewReviewArea = closeViewReviewArea;
window.openEditReviewArea = openEditReviewArea;





