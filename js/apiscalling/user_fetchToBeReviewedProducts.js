// Function to fetch and display to-be-reviewed products
async function fetchToBeReviewedProducts() {
    try {
        const authToken = localStorage.getItem("auth_token");
        if (!authToken) {
            console.error("No auth token found");
            return;
        }

        // Show loading indicator
        document.querySelector('.loading').style.display = 'flex';

        const response = await fetch('http://localhost:5000/products/get-delivered-products', {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.status && data.products && data.products.length > 0) {
            displayToBeReviewedProducts(data.products);
        } else {
            // Show empty state if no products
            document.querySelector('.toBeReviewedOrdersPack .empty').style.display = 'flex';
        }
    } catch (error) {
        console.error("Error fetching to-be-reviewed products:", error);
        showAlert("Error loading products. Please try again.");
    } finally {
        // Hide loading indicator
        document.querySelector('.loading').style.display = 'none';
    }
}





// Add this to your DOMContentLoaded event listener
document.getElementById('orderFilter').addEventListener('change', function() {
    filterOrdersByCount(this.value);
});

// Function to filter orders by count
function filterOrdersByCount(count) {
    const container = document.querySelector('.toBeReviewedOrdersPack');
    const allItems = container.querySelectorAll('.oneToBeReviewedItem');
    
    // First show all items
    allItems.forEach(item => item.style.display = 'flex');
    
    if (count === 'all') return;
    
    const numToShow = parseInt(count);
    const totalItems = allItems.length;
    
    // Hide items beyond the selected count (showing most recent first)
    allItems.forEach((item, index) => {
        if (index >= numToShow) {
            item.style.display = 'none';
        }
    });
}

// Modify your displayToBeReviewedProducts function to sort by date
function displayToBeReviewedProducts(products) {
    const container = document.querySelector('.toBeReviewedOrdersPack');
    const emptyMessage = container.querySelector('.empty');
    
    // Clear existing items (except the empty message)
    const existingItems = container.querySelectorAll('.oneToBeReviewedItem');
    existingItems.forEach(item => item.remove());
    
    // Hide empty message since we have products
    emptyMessage.style.display = 'none';
    
    // Sort products by delivered date (newest first)
    products.sort((a, b) => {
        return new Date(b.delivered_date) - new Date(a.delivered_date);
    });
    
    // Create and append product items
    products.forEach(product => {
        const productItem = createToBeReviewedProductItem(product);
        container.appendChild(productItem);
    });
    
    // Apply the current filter
    const currentFilter = document.getElementById('orderFilter').value;
    filterOrdersByCount(currentFilter);
}


function createToBeReviewedProductItem(product) {
    const item = document.createElement('div');
    item.className = 'oneToBeReviewedItem oneReviewItem';
    
    // Format variations if they exist
    let variationsHtml = '';
    if (product.variations && product.variations.length > 0) {
        variationsHtml = `<div class="variations">
            <p><span>${product.variations.join('</span>&nbsp;-&nbsp;<span>')}</span></p>
        </div>`;
    }
    
    // Format date
    const deliveredDate = new Date(product.delivered_date);
    const formattedDate = deliveredDate.toLocaleString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    // // Safely escape strings for HTML attributes
    // const escapedTitle = product.title.replace(/'/g, "\\'");
    // const escapedImage = product.image.replace(/'/g, "\\'");
    const escapedVariations = JSON.stringify(product.variations || [])
        .replace(/'/g, "\\'")
        .replace(/"/g, '&quot;');

    // Better string escaping using encodeURIComponent
    const escapedTitle = encodeURIComponent(product.title.replace(/'/g, "\\'"));
    const escapedImage = encodeURIComponent(product.image);
    // const escapedVariations = encodeURIComponent(JSON.stringify(product.variations || []));
    const escapedDate = encodeURIComponent(formattedDate);
    
    item.innerHTML = `
        <div class="itemImageBox">
            <img src="/MSM_Backend/images/${product.image}" alt="${escapedTitle}">
        </div>
        <div class="itemDets">
            <h1>${escapedTitle}</h1>
            ${variationsHtml}
            <div class="detsPlusAcc">
                <div class="placedOn">
                    <p>Delivered on:&nbsp;&nbsp;<span>${formattedDate}</span></p>
                </div>
                <button type="button" class="accButton" 
                    onclick="openWriteOrEditReviewArea('${product.product_id}', ${product.order_id}, '${escapedTitle}', '${escapedImage}', '${escapedVariations}', '${formattedDate}')">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path fill="currentColor" fill-rule="evenodd"
                            d="M14.1 2.391a3.896 3.896 0 0 1 5.509 5.51l-7.594 7.594c-.428.428-.69.69-.98.917a6 6 0 0 1-1.108.684c-.334.159-.685.276-1.259.467l-2.672.891l-.642.214a1.598 1.598 0 0 1-2.022-2.022l1.105-3.314c.191-.574.308-.925.467-1.259a6 6 0 0 1 .685-1.107c.227-.291.488-.553.916-.98zM5.96 16.885l-.844-.846l.728-2.185c.212-.636.3-.895.414-1.135q.212-.443.513-.83c.164-.21.356-.404.83-.879l5.891-5.89a6.05 6.05 0 0 0 1.349 2.04a6.05 6.05 0 0 0 2.04 1.348l-5.891 5.89c-.475.475-.668.667-.878.83q-.388.302-.83.514c-.24.114-.5.202-1.136.414zm12.116-9.573a4 4 0 0 1-.455-.129a4.5 4.5 0 0 1-1.72-1.084a4.54 4.54 0 0 1-1.084-1.72a4 4 0 0 1-.13-.455l.473-.472a2.396 2.396 0 0 1 3.388 3.388zM3.25 22a.75.75 0 0 1 .75-.75h16v1.5H4a.75.75 0 0 1-.75-.75"
                            clip-rule="evenodd" />
                    </svg>&nbsp;Write a review
                </button>
            </div>
        </div>
    `;
    
    return item;
}


// Function to show alert messages
function showAlert(message) {
    const alertElement = document.querySelector('.alert');
    const alertBadge = alertElement.querySelector('.alertBadge p');
    
    alertBadge.textContent = message;
    alertElement.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        alertElement.style.display = 'none';
    }, 5000);
}







// Call the function when the page loads
window.addEventListener('DOMContentLoaded', () => {
    fetchToBeReviewedProducts();
});




function openWriteOrEditReviewArea(productId, orderId, productTitle, productImage, productVariations, formattedDate) {
    try {
        console.log("=== openWriteOrEditReviewArea Called ===");
        console.log("Input Parameters:");
        console.log("productId:", productId);
        console.log("orderId:", orderId);
        console.log("productTitle:", productTitle);
        console.log("productImage:", productImage);
        console.log("productVariations (raw):", productVariations);
        console.log("formattedDate:", formattedDate);

        const writeOrEditReviewArea = document.querySelector('.writeOrEditReviewArea');
        console.log("writeOrEditReviewArea element found:", !!writeOrEditReviewArea);



        if (!writeOrEditReviewArea) {
            throw new Error("Review area element not found.");
        }


        // Show the review form
        writeOrEditReviewArea.style.opacity = 1;
        writeOrEditReviewArea.style.transform = "translateX(0%)";
        console.log("Review form made visible.");

        // Set the product image
        const imgElement = writeOrEditReviewArea.querySelector('.oneReviewItem .itemImageBox img');
        console.log("imgElement found:", !!imgElement);
        imgElement.src = `/MSM_Backend/images/${productImage}`;
        imgElement.alt = productTitle;
        console.log("Image src set to:", imgElement.src);
        console.log("Image alt set to:", imgElement.alt);

        // Set the product title
        const titleElement = writeOrEditReviewArea.querySelector('.oneReviewItem .itemDets h1');
        console.log("titleElement found:", !!titleElement);
        titleElement.textContent = productTitle;
        console.log("Product title set to:", titleElement.textContent);

        // Parse variations
        let parsedVariations = productVariations;
        if (typeof productVariations === 'string') {
            try {
                parsedVariations = JSON.parse(productVariations);
                console.log("Parsed variations:", parsedVariations);
            } catch (error) {
                console.error('Error parsing productVariations:', error);
                parsedVariations = [];
            }
        }

        const variationsElement = writeOrEditReviewArea.querySelector('.oneReviewItem .variations p');
        console.log("variationsElement found:", !!variationsElement);

        if (Array.isArray(parsedVariations) && parsedVariations.length > 0) {
            variationsElement.innerHTML = parsedVariations.map(v => `<span>${v}</span>`).join('&nbsp;-&nbsp;');
            console.log("Variations displayed as:", variationsElement.innerHTML);
        } else {
            variationsElement.innerHTML = '';
            console.log("No variations to display.");
        }

        // Set delivered date
        const dateElement = writeOrEditReviewArea.querySelector('.oneReviewItem .placedOn span');
        console.log("dateElement found:", !!dateElement);
        dateElement.textContent = formattedDate;
        console.log("Delivered date set to:", formattedDate);

        // Store data in form
        const form = writeOrEditReviewArea.querySelector('form');
        console.log("Form found:", !!form);
        form.dataset.productId = productId;
        form.dataset.orderId = orderId;
        form.dataset.variations = productVariations;
        console.log("Form dataset set:", form.dataset);

        // Clear form inputs
        form.querySelector('textarea').value = '';
        form.querySelector('input[name="rate"][value="5"]').checked = true;
        form.querySelector('input[type="file"]').value = '';
        console.log("Form inputs cleared.");

        // Clear image previews
        const previewImages = document.querySelector('.previewImages');
        if (previewImages) {
            previewImages.innerHTML = '';
            console.log("Preview images cleared.");
        } else {
            console.warn("Preview images element not found.");
        }


    } catch (error) {
        console.error("Error in openWriteOrEditReviewArea:", error);
        showAlert("Error opening review form. Please try again.");
    }
}




// Function to close the review form
function closeWriteOrEditReviewArea() {
    const writeOrEditReviewArea = document.querySelector('.writeOrEditReviewArea');
    writeOrEditReviewArea.style.opacity = 0;
    writeOrEditReviewArea.style.transform = "translateX(110%)";
}
// Function to handle form submission
async function submitReviewForm(event) {
    console.log('submitReviewForm function called');
    event.preventDefault();
    console.log('Form submission prevented');
    
    const form = event.target;
    console.log('Form element:', form);
    
    const productId = form.dataset.productId;
    const orderId = form.dataset.orderId;



    //  With this (ensure it's always an array):
let variations = [];
try {
    variations = JSON.parse(form.dataset.variations || '[]');
    // Ensure it's an array even if the data was malformed
    if (!Array.isArray(variations)) {
        variations = [];
    }
} catch (e) {
    console.error('Error parsing variations:', e);
    variations = [];
}
console.log('Final variations array:', variations);




    // Get rating value
    const ratingInput = form.querySelector('input[name="rate"]:checked');
    if (!ratingInput) {
        console.log('No rating selected - showing alert');
        showAlert('Please select a rating');
        return;
    }
    const rating = ratingInput.value;
    console.log('Selected rating:', rating);
    
    // Get review text
    const reviewText = form.querySelector('textarea').value.trim();
    console.log('Review text:', reviewText);
    
    try {
        console.log('Starting review submission process');
        const authToken = localStorage.getItem("auth_token");
        if (!authToken) {
            console.log('No auth token found - user not logged in');
            showAlert('You need to be logged in to submit a review');
            return;
        }
        console.log('Auth token found');
        
        // Get all image files
        const fileInput = form.querySelector('input[type="file"]');
        const files = Array.from(fileInput.files);
        console.log('Number of files selected:', files.length);
        
        // Validate files
        if (files.length > 5) {
            console.log('Too many files selected - showing alert');
            showAlert('Maximum 5 images can be uploaded');
            return;
        }
        
        // Create FormData for the request
        const formData = new FormData();
        formData.append('order_id', orderId);
        formData.append('product_id', productId);
      formData.append('variations', `{${variations.map(v => `"${v}"`).join(',')}}`);
        formData.append('rating', rating);
        formData.append('review_text', reviewText);
        console.log('FormData created with basic fields');
        
        // Add each image file
        files.forEach((file, index) => {
            formData.append(`review_image_${index + 1}`, file);
            console.log(`Added file ${index + 1} to FormData:`, file.name);
        });
        
        // Show loading indicator
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
        console.log('Submit button disabled and text changed');
        
        console.log('Making API request to submit-review endpoint');
        const response = await fetch('http://localhost:5000/products/submit-review', {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${authToken}`
            },
            body: formData
        });
        console.log('API request completed, response:', response);
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (!response.ok) {
            console.log('API returned error:', data.message || 'Unknown error');
            throw new Error(data.message || 'Failed to submit review');
        }
        
        if (data.status) {
            console.log('Review submission successful');
            showAlert('Review submitted successfully!');
            closeWriteOrEditReviewArea();
            console.log('Refreshing to-be-reviewed products list');
            fetchToBeReviewedProducts(); // Refresh the list
        } else {
            console.log('API returned failure status');
            showAlert(data.message || 'Failed to submit review');
        }
    } catch (error) {
        console.error('Error in submitReviewForm:', error);
        showAlert(error.message || 'An error occurred while submitting the review');
    } finally {
        console.log('In finally block - cleaning up');
        // Show loading indicator
const submitButton = form.querySelector('button[type="submit"]');
if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
    console.log('Submit button disabled and text changed');
} else {
    console.error('Submit button not found in form');
    // You might want to continue with submission anyway or show an error
}
    }
}





function setupImagePreview() {
    const fileInput = document.querySelector('.reviewImages input[type="file"]');
    const previewContainer = document.querySelector('.previewImages');
    
    if (!fileInput) return;
    
    // Allow multiple file selection
    fileInput.multiple = true;
    
    fileInput.addEventListener('change', function() {
        previewContainer.innerHTML = ''; // Clear previous previews
        
        // Create an array to track files
        const files = Array.from(this.files);
        
        // Display up to 5 images
        files.slice(0, 5).forEach((file, index) => {
            if (!file.type.match('image.*')) return;
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const previewBox = document.createElement('div');
                previewBox.className = 'oneImageBox';
                
                previewBox.innerHTML = `
                    <a href="${e.target.result}" target="_blank">
                        <img src="${e.target.result}" alt="Preview ${index + 1}">
                    </a>
                    <button type="button" data-index="${index}">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <g fill="none" stroke="currentColor">
                                <circle cx="12" cy="12" r="10" />
                                <path stroke-linecap="round" d="m14.5 9.5l-5 5m0-5l5 5" />
                            </g>
                        </svg>
                    </button>
                `;
                
                previewContainer.appendChild(previewBox);
                
                // Add click handler for remove button
                previewBox.querySelector('button').addEventListener('click', function() {
                    removeImageFromPreview(index);
                });
            };
            reader.readAsDataURL(file);
        });
        
        // If more than 5 files selected, show alert
        if (files.length > 5) {
            showAlert('Maximum 5 images can be uploaded. Only first 5 will be used.');
        }
    });
}




function removeImageFromPreview(index) {
    const fileInput = document.querySelector('.reviewImages input[type="file"]');
    const dataTransfer = new DataTransfer();
    const files = Array.from(fileInput.files);
    
    // Remove the file at the specified index
    files.splice(index, 1);
    
    // Add remaining files to the new FileList
    files.forEach(file => dataTransfer.items.add(file));
    
    // Update the file input
    fileInput.files = dataTransfer.files;
    
    // Trigger change event to update preview
    const event = new Event('change');
    fileInput.dispatchEvent(event);
}







// Initialize the form when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');
    console.log('Fetching to-be-reviewed products');
    fetchToBeReviewedProducts();
    
    console.log('Setting up image preview functionality');
    setupImagePreview();
    
    // Attach submit handler to the form
    const reviewForm = document.querySelector('.writeOrEditReviewArea form');
    if (reviewForm) {
        console.log('Review form found, adding submit event listener');
        reviewForm.addEventListener('submit', submitReviewForm);
    } else {
        console.log('Review form not found');
    }
});





















