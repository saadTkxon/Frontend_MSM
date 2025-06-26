// products-display.js
document.addEventListener('DOMContentLoaded', function() {
    const productsContainer = document.querySelector('.productsHere form');
    const paginationArea = document.querySelector('.paginationArea .pagination');
    const currentPageElement = document.querySelector('.currentPage');
    const totalPagesElement = paginationArea.querySelector('p:nth-child(4)');
    const productsFoundElement = document.querySelector('.productsFound span');
    const cartButtonArea = document.querySelector('.cartButtonArea button span');
    const filtersButton = document.querySelector('.filtersButton button');
    const filtersArea = document.querySelector('.filtersArea');
    const closeFiltersButton = document.querySelector('.sideTitlePlusCloseButton button');
    
    let currentPage = 1;
    const itemsPerPage = 12;
    let totalProducts = 0;
    let totalPages = 1;
    let currentProducts = {};
    let activeFilters = {
        categories: [],
        min_price: null,
        max_price: null,
        min_rating: null,
        on_sale: false,
        free_delivery: false
    };

    // Initialize the page
    fetchProducts(currentPage);
    setupPagination();
    updateCartCounter();
    setupFilterEvents();

    // Toggle filters area visibility
    filtersButton.addEventListener('click', function(e) {
        e.preventDefault();
        filtersArea.style.display = 'block';
    });

    closeFiltersButton.addEventListener('click', function(e) {
        e.preventDefault();
        filtersArea.style.display = 'none';
    });

    function closeFiltersArea() {
        filtersArea.style.display = 'none';
    }

    // Setup filter event listeners
    function setupFilterEvents() {
        // Category filters
        document.querySelectorAll('.categoriesFilters button').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const category = this.textContent.toLowerCase().trim();
                
                if (this.getAttribute('aria-selected') === 'true') {
                    this.setAttribute('aria-selected', 'false');
                    activeFilters.categories = activeFilters.categories.filter(c => c !== category);
                } else {
                    this.setAttribute('aria-selected', 'true');
                    if (!activeFilters.categories.includes(category)) {
                        activeFilters.categories.push(category);
                    }
                }
                
                currentPage = 1;
                fetchProducts(currentPage);
            });
        });

        // Price range filter
        const priceRangeButton = document.querySelector('.priceRangeFilters button');
        priceRangeButton.addEventListener('click', function(e) {
            e.preventDefault();
            const minInput = document.querySelector('.priceRangeFilters input:nth-child(1)');
            const maxInput = document.querySelector('.priceRangeFilters input:nth-child(2)');
            
            activeFilters.min_price = minInput.value ? parseFloat(minInput.value) : null;
            activeFilters.max_price = maxInput.value ? parseFloat(maxInput.value) : null;
            
            currentPage = 1;
            fetchProducts(currentPage);
        });

        // Rating filters
        document.querySelectorAll('.ratingFilters button').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const ratingText = this.textContent.trim();
                const ratingMatch = ratingText.match(/(\d+\.?\d*)/);
                
                if (ratingMatch) {
                    activeFilters.min_rating = parseFloat(ratingMatch[1]);
                    currentPage = 1;
                    fetchProducts(currentPage);
                }
            });
        });

        // Promotion filters
        document.querySelectorAll('.variationFilters input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                if (this.id === 'promotionVariationOnSale') {
                    activeFilters.on_sale = this.checked;
                } else if (this.id === 'promotionVariationFreeDelivery') {
                    activeFilters.free_delivery = this.checked;
                }
                
                currentPage = 1;
                fetchProducts(currentPage);
            });
        });
    }

    // Fetch products from API with filters
    function fetchProducts(page) {
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;

        // Build query parameters based on active filters
        const queryParams = new URLSearchParams();
        
        if (activeFilters.categories.length > 0) {
            activeFilters.categories.forEach(cat => queryParams.append('categories[]', cat));
        }
        
        if (activeFilters.min_price !== null) {
            queryParams.append('min_price', activeFilters.min_price);
        }
        
        if (activeFilters.max_price !== null) {
            queryParams.append('max_price', activeFilters.max_price);
        }
        
        if (activeFilters.min_rating !== null) {
            queryParams.append('min_rating', activeFilters.min_rating);
        }
        
        if (activeFilters.on_sale) {
            queryParams.append('on_sale', 'true');
        }
        
        if (activeFilters.free_delivery) {
            queryParams.append('free_delivery', 'true');
        }

        const url = `http://localhost:5000/products/filter-products?${queryParams.toString()}`;

        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Process the response data
                const products = {};
                data.data.forEach(product => {
                    products[product.product_id] = {
                        ...product,
                        created_at: product.created_at,
                        actual_price: product.actual_price,
                        discount_price: product.discount_price,
                        shipping_fee: product.shipping_fee,
                        product_cover_image: product.product_cover_image,
                        product_images: [
                            product.product_img_1,
                            product.product_img_2,
                            product.product_img_3,
                            product.product_img_4,
                            product.product_img_5
                        ].filter(img => img)
                    };
                });

                // Sort products by creation date (newest first)
                const sortedProducts = sortProductsByDate(products);
                currentProducts = sortedProducts;
                displayProducts(sortedProducts);
                productsFoundElement.textContent = data.pagination?.total || Object.keys(sortedProducts).length;
                
                totalProducts = data.pagination?.total || (Object.keys(sortedProducts).length === itemsPerPage ? page * itemsPerPage + 1 : page * itemsPerPage);
                totalPages = Math.ceil(totalProducts / itemsPerPage);
                updatePagination();
            } else {
                console.error('Error fetching products:', data.message);
                showAlert('Error fetching products: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('Error fetching products. Please try again.');
        });
    }

    // Sort products by creation date (newest first)
    function sortProductsByDate(products) {
        const productArray = Object.entries(products);
        
        productArray.sort((a, b) => {
            const dateA = new Date(a[1].created_at);
            const dateB = new Date(b[1].created_at);
            return dateB - dateA; // Sort in descending order (newest first)
        });
        
        return Object.fromEntries(productArray);
    }

    // Display products in the UI
    function displayProducts(products) {
        productsContainer.innerHTML = '';

        for (const productId in products) {
            const product = products[productId];
            
            let discountTag = '';
            if (product.discount_price && product.actual_price && product.discount_price < product.actual_price) {
                const discountPercent = Math.round(((product.actual_price - product.discount_price) / product.actual_price) * 100);
                discountTag = `<h2 class="saleTag"><span>${discountPercent}%</span>&nbsp;Off</h2>`;
            }

            // Updated image path to use /MSM_Backend/images/
            const productImage = product.product_cover_image ? 
                               `/MSM_Backend/images/${product.product_cover_image}` : 
                               (product.product_images && product.product_images.length > 0 ? 
                               `/MSM_Backend/images/${product.product_images[0]}` : 
                               '/assets/misc/default-product-image.png');

            const displayPrice = product.discount_price || product.actual_price;

            const productElement = document.createElement('a');
            productElement.href = `#`;
            productElement.className = 'oneProduct';
            productElement.dataset.productId = productId;
            
            productElement.innerHTML = `
                <img src="${productImage}" alt="${product.title}" loading="lazy">
                <div class="produceDets">
                    <p>${product.title}</p>
                    <h2>Rs.&nbsp;<span>${displayPrice}</span>.00</h2>
                </div>
                ${discountTag}
                <button class="addToCart">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor">
                            <path d="M3.742 20.555C4.942 22 7.174 22 11.64 22h.72c4.466 0 6.699 0 7.899-1.445m-16.517 0c-1.2-1.446-.788-3.64.035-8.03c.585-3.12.877-4.681 1.988-5.603M3.742 20.555Zm16.517 0c1.2-1.446.788-3.64-.035-8.03c-.585-3.12-.878-4.681-1.989-5.603m2.024 13.633ZM18.235 6.922C17.125 6 15.536 6 12.361 6h-.722c-3.175 0-4.763 0-5.874.922m12.47 0Zm-12.47 0Z"/>
                            <path stroke-linecap="round" d="M9 6V5a3 3 0 1 1 6 0v1"/>
                        </g>
                    </svg>
                </button>
            `;

            productsContainer.appendChild(productElement);
        }

        // Add click event to product elements
        document.querySelectorAll('.oneProduct').forEach(product => {
            product.addEventListener('click', function(e) {
                e.preventDefault();
                const productId = this.dataset.productId;
                if (e.target.closest('.addToCart')) {
                    // If clicked on add to cart button, let that handler deal with it
                    return;
                }
                // Navigate to product page with the product ID
                window.location.href = `product.html?id=${productId}`;
            });
        });

        document.querySelectorAll('.addToCart').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const productElement = this.closest('.oneProduct');
                const productId = productElement.dataset.productId;
                toggleCart(productId);
            });
        });
    }

    function toggleCart(productId) {
        let cart = JSON.parse(localStorage.getItem('cart')) || {};
        
        if (cart[productId]) {
            delete cart[productId];
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCounter();
            showAlert('Product removed from cart!');
        } else {
            const product = currentProducts[productId];
            if (product) {
                let variationValues = []; // This will store just the values in order
                
                if (product.variations) {
                    try {
                        if (Array.isArray(product.variations)) {
                            let variationsString = product.variations.join('');
                            
                            variationsString = variationsString
                                .replace(/\\"/g, '"')
                                .replace(/"\s*"/g, '", "')
                                .replace(/"\s*}\s*"/g, '"}]')
                                .replace(/"\s*{\s*"/g, '[{"');
                            
                            try {
                                const allVariations = JSON.parse(variationsString);
                                
                                // Extract just the first value from each variation
                                if (Array.isArray(allVariations)) {
                                    allVariations.forEach(variation => {
                                        if (variation.values && variation.values.length > 0) {
                                            variationValues.push(variation.values[0]);
                                        }
                                    });
                                }
                            } catch (e) {
                                const variationBlocks = variationsString.split('{').filter(Boolean);
                                
                                variationBlocks.forEach(block => {
                                    const valuesMatch = /"values"\s*:\s*\[([^\]]+)\]/.exec(block);
                                    
                                    if (valuesMatch) {
                                        let values = valuesMatch[1]
                                            .split(',')
                                            .map(v => v.trim().replace(/^"|"$/g, ''))
                                            .filter(v => v);
                                        
                                        if (values.length > 0) {
                                            variationValues.push(values[0]);
                                        }
                                    }
                                });
                            }
                        }
                    } catch (e) {
                        console.error('Error parsing variations:', e);
                        console.log('Raw variations data:', product.variations);
                    }
                }
                
                const productImage = product.product_cover_image ? 
                     `${product.product_cover_image}` : 
                     (product.product_images && product.product_images.length > 0) ? 
                     `${product.product_images[0]}` : 
                     '/assets/misc/default-product-image.png';
                
                cart[productId] = {
                    quantity: 1,
                    addedAt: new Date().toISOString(),
                    title: product.title,
                    price: product.discount_price || product.actual_price,
                    actual_price: product.actual_price,
                    discount_price: product.discount_price,
                    image: productImage,
                    variations: variationValues, // Now storing just the array of values
                    productId: productId,
                    shipping_fee: product.shipping_fee || '0.00'// Add shipping fee here
                };
                
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartCounter();
                showAlert('Product added to cart!');
            } else {
                showAlert('Product not found!');
            }
        }
    }

    function updateCartCounter() {
        const cart = JSON.parse(localStorage.getItem('cart')) || {};
        const totalItems = Object.keys(cart).length;
        cartButtonArea.textContent = totalItems || '0';
    }

    function showAlert(message) {
        const alertElement = document.querySelector('.alert');
        if (alertElement) {
            const alertBadge = alertElement.querySelector('.alertBadge p');
            alertBadge.textContent = message;
            alertElement.style.display = 'block';
            
            // Auto-hide after 3 seconds
            setTimeout(() => {
                alertElement.style.display = 'none';
            }, 3000);
        }
    }

    function setupPagination() {
        const prevButton = paginationArea.querySelector('button:first-child');
        const nextButton = paginationArea.querySelector('button:last-child');
        
        prevButton.addEventListener('click', function(e) {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                fetchProducts(currentPage);
            }
        });
        
        nextButton.addEventListener('click', function(e) {
            e.preventDefault();
            if (currentPage < totalPages) {
                currentPage++;
                fetchProducts(currentPage);
            }
        });
    }

    function updatePagination() {
        currentPageElement.textContent = currentPage;
        totalPagesElement.textContent = totalPages;
    }
});

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
            <p>Alert data will be shown here.</p>
        </div>
    `;
    document.body.appendChild(alertDiv);
}

// Make closeFiltersArea function available globally
window.closeFiltersArea = closeFiltersArea;