// Add this function to fetch and display related products
function fetchAndDisplayRelatedProducts() {
    fetch("http://localhost:5000/products/fetchproductsallshoe", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log("Related Products API Response:", data);
        if (data.message === "Products retrieved successfully") {
            const products = data.response;
            const productIds = Object.keys(products);
            
            // Shuffle the product IDs to get random ones
            const shuffledIds = productIds.sort(() => 0.5 - Math.random());
            
            // Get first 8 products (or less if there aren't enough)
            const selectedIds = shuffledIds.slice(0, 8);
            
            renderRelatedProducts(selectedIds, products);
        } else {
            console.error('Error fetching related products:', data.message);
        }
    })
    .catch(error => {
        console.error('Fetch error:', error);
    });
}

// Add this function to render the related products
function renderRelatedProducts(productIds, products) {
    const container = document.querySelector('.relatedProductsShowsHere');
    if (!container) return;
    
    container.innerHTML = '';
    
    productIds.forEach(id => {
        const product = products[id];
        if (!product) return;
        
        // Determine pricing display
        const actualPrice = parseFloat(product.actual_price) || 0;
        const discountPrice = parseFloat(product.discount_price) || 0;
        const isOnSale = discountPrice > 0 && discountPrice < actualPrice;
        const displayPrice = isOnSale ? discountPrice : actualPrice;
        
        // Get the first available image
        const productImage = product.product_cover_image ? 
            `/MSM_Backend/images/${product.product_cover_image}` : 
            (product.product_images && product.product_images.length > 0 ? 
            `/MSM_Backend/images/${product.product_images[0]}` : 
            '/assets/misc/default-product-image.png');
        
        // Calculate discount percentage if on sale
        const discountPercent = isOnSale ? 
            Math.round(((actualPrice - discountPrice) / actualPrice) * 100) : 0;
        
        // Create the product element
        const productElement = document.createElement('a');
        productElement.href = `product.html?id=${id}`;
        productElement.className = 'oneProduct';
        productElement.dataset.productId = id; // Add product ID as data attribute
        productElement.innerHTML = `
            <img src="${productImage}" alt="${product.title}">
            <div class="produceDets">
                <p>${product.title}</p>
                <h2>$${displayPrice.toFixed(2)}</h2>
            </div>
            ${isOnSale ? `<h2 class="saleTag"><span>${discountPercent}%</span>&nbsp;Off</h2>` : ''}
            <button class="addToCart">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <g fill="none" stroke="currentColor">
                        <path d="M3.742 20.555C4.942 22 7.174 22 11.64 22h.72c4.466 0 6.699 0 7.899-1.445m-16.517 0c-1.2-1.446-.788-3.64.035-8.03c.585-3.12.877-4.681 1.988-5.603M3.742 20.555Zm16.517 0c1.2-1.446.788-3.64-.035-8.03c-.585-3.12-.878-4.681-1.989-5.603m2.024 13.633ZM18.235 6.922C17.125 6 15.536 6 12.361 6h-.722c-3.175 0-4.763 0-5.874.922m12.47 0Zm-12.47 0Z" />
                        <path stroke-linecap="round" d="M9 6V5a3 3 0 1 1 6 0v1" />
                    </g>
                </svg>
            </button>
        `;
        
        // Add click handler for the add to cart button
        const addToCartBtn = productElement.querySelector('.addToCart');
        addToCartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCart(product, 1);
        });
        
        container.appendChild(productElement);
    });
    
    // Add click event to product elements
    container.querySelectorAll('.oneProduct').forEach(product => {
        product.addEventListener('click', function(e) {
            if (e.target.closest('.addToCart')) {
                // If clicked on add to cart button, let that handler deal with it
                return;
            }
            // Prevent default only if not add to cart button
            e.preventDefault();
            const productId = this.dataset.productId;
            // Navigate to product page with the product ID
            window.location.href = `product.html?id=${productId}`;
        });
    });
}

// Modify the DOMContentLoaded event listener to include the related products fetch
document.addEventListener('DOMContentLoaded', function() {
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        // If no product ID, redirect back to products page
        window.location.href = 'http://127.0.0.1:5500/msm_kosmetika_fin/shop.html#';
        return;
    }
    setupQuantityControls();
    // Fetch product details
    fetchProductDetails(productId);
    
    // Fetch and display related products
    fetchAndDisplayRelatedProducts();

    
    setupQuantityControls();
    // Initialize cart counter
    updateCartCounter();
});







function fetchProductDetails(productId) {
    
    
    fetch("http://localhost:5000/products/getproductopen", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            // "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ product_id: productId })
    })
    .then(response => response.json())
    .then(data => {
        console.log("API Response:", data); // Log API response to console
        if (data.status === 'success') {
            renderProductDetails(data.response);
        } else {
            console.error('Error fetching product:', data.message);
            showAlert('Error fetching product: ' + data.message);
            // Redirect back if product not found
            window.location.href = 'http://127.0.0.1:5500/msm_kosmetika_fin/shop.html#';
        }
    })
    .catch(error => {
        console.error('Fetch error:', error);
        showAlert('Network error fetching product details');
    });
}

function renderProductDetails(product) {
    // Main product image
    const mainImage = document.querySelector('.imagePreview img');
    const mainImageSrc = product.product_cover_image ? 
        `/MSM_Backend/images/${product.product_cover_image}` : 
        (product.product_images && product.product_images.length > 0 ? 
        `/MSM_Backend/images/${product.product_images[0]}` : 
        '/assets/misc/default-product-image.png');
    mainImage.src = mainImageSrc;
    mainImage.alt = product.title;

    // Fellow images
    const fellowImagesContainer = document.querySelector('.fellowImages');
    fellowImagesContainer.innerHTML = '';
    
    // Add cover image if exists
    if (product.product_cover_image) {
        const coverImg = document.createElement('button');
        coverImg.innerHTML = `<img src="/MSM_Backend/images/${product.product_cover_image}" alt="${product.title}">`;
        coverImg.onclick = () => {
            document.querySelector('.previewImage').src = `/MSM_Backend/images/${product.product_cover_image}`;
            document.querySelector('.previewImage').classList.add('coverPreview');
        };
        fellowImagesContainer.appendChild(coverImg);
    }
    
    // Add other images
    if (product.product_images && product.product_images.length > 0) {
        product.product_images.forEach(img => {
            const imgBtn = document.createElement('button');
            imgBtn.innerHTML = `<img src="/MSM_Backend/images/${img}" alt="${product.title}">`;
            imgBtn.onclick = () => {
                document.querySelector('.previewImage').src = `/MSM_Backend/images/${img}`;
                document.querySelector('.previewImage').classList.remove('coverPreview');
            };
            fellowImagesContainer.appendChild(imgBtn);
        });
    }

    // Product title
    document.querySelector('.productTitle').textContent = product.title;

    // Short description
    const shortDesc = document.querySelector('.shortHTMLDescription');
    if (product.description_short) {
        shortDesc.textContent = product.description_short;
    } else {
        shortDesc.textContent = 'No short description available';
    }







// console.log("Raw variations data:", product.variations);
// console.log("Type of variations[0]:", typeof product.variations[0]);

// // Variations
// const variationsArea = document.querySelector('.variationsArea');
// if (product.variations && product.variations.length > 0 && product.variations[0] !== '[]') {
//     variationsArea.innerHTML = '';
    
//     try {
//         // Join all the variation strings together to form a complete JSON string
//         const variationsString = '[' + product.variations.join(',') + ']';

//         console.log("Joined variations string:", variationsString);
        
//         // Parse the complete JSON string
//         const variationsArray = JSON.parse(variationsString);
//         console.log("Parsed variations:", variationsArray);
        
//         // Process each variation
//         variationsArray.forEach(variation => {
//             const variationDiv = document.createElement('div');
//             variationDiv.className = 'oneVariationArea';
//             variationDiv.innerHTML = `
//                 <h1>${variation.title}</h1>
//                 <div class="variationsHere"></div>
//             `;
            
//             const variationsHere = variationDiv.querySelector('.variationsHere');
//             variation.values.forEach((option, index) => {
//                 const optionId = `${variation.title}-${option.replace(/\s+/g, '-').toLowerCase()}`;
//                 const optionDiv = document.createElement('div');
//                 optionDiv.className = 'oneRadioElement';
//                 optionDiv.innerHTML = `
//                     <input type="radio" name="${variation.title}" id="${optionId}" ${index === 0 ? 'checked' : ''}>
//                     <label for="${optionId}">${option}</label>
//                 `;
//                 variationsHere.appendChild(optionDiv);
//             });
            
//             variationsArea.appendChild(variationDiv);
//         });
//     } catch (e) {
//         console.error('Error parsing variations:', e);
//         variationsArea.innerHTML = '<p>No variations available for this product.</p>';
//     }
// } else {
//     variationsArea.innerHTML = '<p>No variations available for this product.</p>';
// }



console.log("Raw variations data:", product.variations);
console.log("Type of variations[0]:", typeof product.variations[0]);

const variationsArea = document.querySelector('.variationsArea');

// Check if variations exist and are not empty
if (product.variations && product.variations.length > 0) {
    variationsArea.innerHTML = '';  // Clear previous content

    try {
        // Join all the variation strings together to form a valid JSON string
        const variationsString = product.variations.join(',');
        console.log("Joined variations string:", variationsString);

        // Ensure the variations string is properly formatted (adding brackets if necessary)
        const properlyFormattedString = `[${variationsString}]`;

        // Parse the complete JSON string
        const variationsArray = JSON.parse(properlyFormattedString);
        console.log("Parsed variations:", variationsArray);

        // Ensure we have an array of variations
        const variationsToProcess = Array.isArray(variationsArray[0]) ? variationsArray[0] : variationsArray;

        // Process each variation
        variationsToProcess.forEach(variation => {
            const variationDiv = document.createElement('div');
            variationDiv.className = 'oneVariationArea';
            variationDiv.innerHTML = `
                <h1>${variation.title}</h1>
                <div class="variationsHere"></div>
            `;
            
            const variationsHere = variationDiv.querySelector('.variationsHere');
            // Ensure 'values' is an array (it can sometimes be a single value)
            const valuesArray = Array.isArray(variation.values) ? variation.values : [variation.values];

            // Process each option for this variation
            valuesArray.forEach((option, index) => {
                const optionId = `${variation.title}-${String(option).replace(/\s+/g, '-').toLowerCase()}`;
                const optionDiv = document.createElement('div');
                optionDiv.className = 'oneRadioElement';
                optionDiv.innerHTML = `
                    <input type="radio" name="${variation.title}" id="${optionId}" ${index === 0 ? 'checked' : ''}>
                    <label for="${optionId}">${option}</label>
                `;
                variationsHere.appendChild(optionDiv);
            });

            variationsArea.appendChild(variationDiv);
        });

    } catch (e) {
        console.error('Error parsing variations:', e);
        variationsArea.innerHTML = '<p>No variations available for this product.</p>';
    }
} else {
    variationsArea.innerHTML = '<p>No variations available for this product.</p>';
}







    


// Short description
const shortDeschtml = document.querySelector('.longDescriptionPlusReviews');
if (product.description_short) {
    
    shortDeschtml.innerHTML = product.short_html_description;
    
} else {
    shortDeschtml.innerHTML = 'No short description available';
}



// Short description
const longDeschtml = document.querySelector('.longDescriptionPlusReviews');
if (product.description_short) {
    longDeschtml.innerHTML = product.long_html_description;
} else {
    longDeschtml.innerHTML = 'No short description available';
}


    

    // Pricing
    const actualPrice = document.querySelector('.actualPrice span');
    const discountPricing = document.querySelector('.discountPricing');
    const discountPercent = document.querySelector('.discountPricing p span');
    const onSaleTag = document.querySelector('.onSale');

    // Convert prices to numbers
    const actualPriceNum = parseFloat(product.actual_price) || 0;
    const discountPriceNum = parseFloat(product.discount_price) || 0;

    if (product.discount_price && product.actual_price && discountPriceNum < actualPriceNum) {
        // Product is on sale
        actualPrice.textContent = `$${discountPriceNum.toFixed(2)}`;
        document.querySelector('.discountPrice').textContent = `$${actualPriceNum.toFixed(2)}`;
        const percent = Math.round(((actualPriceNum - discountPriceNum) / actualPriceNum) * 100);
        discountPercent.textContent = `${percent}%`;
        discountPricing.style.display = 'flex';
        onSaleTag.style.display = 'block';
    } else {
        // Regular price
        actualPrice.textContent = `$${actualPriceNum.toFixed(2)}`;
        discountPricing.style.display = 'none';
        onSaleTag.style.display = 'none';
    }

    // Shipping fee
    const shippingFee = parseFloat(product.shipping_fee) || 0;
    document.querySelector('.shippingFee').textContent = shippingFee > 0 ? `+ $${shippingFee.toFixed(2)} shipping` : 'Free shipping';

     // Long description (HTML content)
     const longDesc = document.querySelector('.longDescription');
     if (product.long_html_description) {
         longDesc.innerHTML = product.long_html_description;
     } else {
         longDesc.innerHTML = '<p>No detailed description available for this product.</p>';
     }



     




     console.log("Backend categories:", product.categories); 
    // Categories
    const categoriesContainer = document.querySelector('.productCategories');
    if (product.categories && product.categories.length > 0) {
        categoriesContainer.innerHTML = '';
        product.categories.forEach(category => {
            // Clean up category string (remove extra quotes and brackets)
            let cleanCategory = category.replace(/[\[\]'"\\]/g, '');
            if (cleanCategory) {
                const categoryElement = document.createElement('span');
                categoryElement.className = 'categoryTag';
                categoryElement.textContent = cleanCategory;
                categoriesContainer.appendChild(categoryElement);
            }
        });
    } else {
        categoriesContainer.innerHTML = '<span class="categoryTag">Uncategorized</span>';
    }




   





    
    // // Quantity handlers
    // const quantityInput = document.querySelector('.quantityCount');
    // const decreaseBtn = document.querySelector('.quantityDecreaseButton');
    // const increaseBtn = document.querySelector('.quantityIncreaseButton');
    
    // decreaseBtn.addEventListener('click', () => {
    //     let value = parseInt(quantityInput.value) || 1;
    //     if (value > 1) {
    //         quantityInput.value = value - 1;
    //     }
    // });
    
    // increaseBtn.addEventListener('click', () => {
    //     let value = parseInt(quantityInput.value) || 1;
    //     quantityInput.value = value + 1;
    // });



// // Quantity handlers - Modified version
// function setupQuantityControls() {
//     const quantityInput = document.querySelector('.quantityCount');
//     const decreaseBtn = document.querySelector('.quantityDecreaseButton');
//     const increaseBtn = document.querySelector('.quantityIncreaseButton');

//     // Remove readonly attribute to allow manual input
//     quantityInput.removeAttribute('readonly');

//     // Set minimum and step attributes for better number input control
//     quantityInput.setAttribute('min', '1');
//     quantityInput.setAttribute('step', '1');

//     decreaseBtn.addEventListener('click', (e) => {
//         e.preventDefault();
//         let value = parseInt(quantityInput.value) || 1;
//         if (value > 1) {
//             quantityInput.value = value - 1;
//         }
//     });

//     increaseBtn.addEventListener('click', (e) => {
//         e.preventDefault();
//         let value = parseInt(quantityInput.value) || 1;
//         quantityInput.value = value + 1;
//     });

//     // Validate manual input
//     quantityInput.addEventListener('change', () => {
//         let value = parseInt(quantityInput.value) || 1;
//         if (value < 1) {
//             quantityInput.value = 1;
//         }
//     });
// }


function setupQuantityControls() {
    const quantityInput = document.querySelector('.quantityCount');
    const decreaseBtn = document.querySelector('.quantityDecreaseButton');
    const increaseBtn = document.querySelector('.quantityIncreaseButton');



    // Remove readonly attribute to allow manual input
    quantityInput.removeAttribute('readonly');

    // Set minimum and step attributes for better number input control
    quantityInput.setAttribute('min', '1');
    quantityInput.setAttribute('step', '1');

    // Remove any existing event listeners first to prevent duplicates
    decreaseBtn.replaceWith(decreaseBtn.cloneNode(true));
    increaseBtn.replaceWith(increaseBtn.cloneNode(true));
    quantityInput.replaceWith(quantityInput.cloneNode(true));

    // Get fresh references after cloning
    const newDecreaseBtn = document.querySelector('.quantityDecreaseButton');
    const newIncreaseBtn = document.querySelector('.quantityIncreaseButton');
    const newQuantityInput = document.querySelector('.quantityCount');

    newDecreaseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        let value = parseInt(newQuantityInput.value) || 1;
        if (value > 1) {
            newQuantityInput.value = value - 1;
        }
    });

    newIncreaseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        let value = parseInt(newQuantityInput.value) || 1;
        newQuantityInput.value = value + 1;
    });

    // Validate manual input
    newQuantityInput.addEventListener('change', () => {
        let value = parseInt(newQuantityInput.value) || 1;
        if (value < 1) {
            newQuantityInput.value = 1;
        }
    });
}




   // Stock status
    const outOfStockBtn = document.querySelector('.outOfStockButton');
    const buyingButtons = document.querySelector('.buyingAccButtons');
    
    if (product.stock <= 0) {
        outOfStockBtn.style.display = 'block';
        buyingButtons.style.display = 'none';
    } else {
        outOfStockBtn.style.display = 'none';
        buyingButtons.style.display = 'flex';
    }

    // Add to cart button
    document.querySelector('.addToCartButton').addEventListener('click', (e) => {
        e.preventDefault();
        addToCart(product, parseInt(quantityInput.value) || 1);
    });

    // Buy now button
    document.querySelector('.buyNowButton').addEventListener('click', (e) => {
        e.preventDefault();
        addToCart(product, parseInt(quantityInput.value) || 1);
        window.location.href = 'checkout.html';
    });

    // Load reviews
    loadReviews(product.product_id);
}

function addToCart(product, quantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || {};
    
    // Get selected variations
    const variations = {};
    document.querySelectorAll('.oneVariationArea').forEach(variationArea => {
        const variationName = variationArea.querySelector('h1').textContent;
        const selectedOption = variationArea.querySelector('input[type="radio"]:checked');
        if (selectedOption) {
            variations[variationName] = selectedOption.nextElementSibling.textContent;
        }
    });
    
    // Create cart item key based on product ID and variations
    const cartItemKey = `${product.product_id}_${JSON.stringify(variations)}`;
    
    cart[cartItemKey] = {
        quantity: quantity,
        addedAt: new Date().toISOString(),
        title: product.title,
        price: parseFloat(product.discount_price) || parseFloat(product.actual_price) || 0,
        image: product.product_cover_image ? 
             `/MSM_Backend/images/${product.product_cover_image}` : 
             (product.product_images && product.product_images.length > 0 ? 
             `/MSM_Backend/images/${product.product_images[0]}` : 
             '/assets/misc/default-product-image.png'),
        variations: variations,
        categories: product.categories || [],
        productId: product.product_id,
        shippingFee: parseFloat(product.shipping_fee) || 0
    };
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCounter();
    showAlert('Product added to cart!');
}

function loadReviews(productId) {
    // This would call your reviews API
    // For now, we'll just show the empty state
    const reviewsContainer = document.querySelector('.reviewsShownHere');
    if (reviewsContainer) {
        reviewsContainer.querySelector('.empty').style.display = 'flex';
        reviewsContainer.querySelector('.latestReviews').style.display = 'none';
    }
    
    // TODO: Implement API calls to get reviews here
    // and then render them similar to how we render products
}

function updateCartCounter() {
    const cart = JSON.parse(localStorage.getItem('cart')) || {};
    const totalItems = Object.values(cart).reduce((sum, item) => sum + (item.quantity || 0), 0);
    
    // Update counters in header and floating cart button
    document.querySelectorAll('.navCartButton span, .cartGo span').forEach(span => {
        span.textContent = totalItems || '0';
    });
}

function showAlert(message) {
    const alertElement = document.querySelector('.alert');
    if (alertElement) {
        const alertBadge = alertElement.querySelector('.alertBadge p');
        alertBadge.textContent = message;
        alertElement.style.display = 'block';
        
        setTimeout(() => {
            alertElement.style.display = 'none';
        }, 3000);
    } else {
        // Create alert if it doesn't exist
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert';
        alertDiv.style.display = 'block';
        alertDiv.innerHTML = `
            <div class="alertBadge">
                <button onclick="document.querySelector('.alert').style.display='none'">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" />
                            <path stroke-linecap="round" d="m14.5 9.5l-5 5m0-5l5 5" />
                        </g>
                    </svg>
                </button>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.style.display = 'none';
        }, 3000);
    }
}

// Add alert HTML structure if not present
if (!document.querySelector('.alert')) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert';
    alertDiv.style.display = 'none';
    alertDiv.innerHTML = `
        <div class="alertBadge">
            <button onclick="document.querySelector('.alert').style.display='none'">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <g fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" />
                        <path stroke-linecap="round" d="m14.5 9.5l-5 5m0-5l5 5" />
                    </g>
                </svg>
            </button>
            <p>Alert message will appear here</p>
        </div>
    `;
    document.body.appendChild(alertDiv);
}