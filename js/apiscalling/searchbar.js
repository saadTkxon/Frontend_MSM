// search-products.js
document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.querySelector('.searchForm');
    const searchInput = searchForm.querySelector('input[type="text"]');
    const productsContainer = document.querySelector('.productsHere form');
    const productsFoundElement = document.querySelector('.productsFound span');
    const cartButtonArea = document.querySelector('.cartButtonArea button span');
    
    let currentProducts = {};

    // Initialize search functionality
    setupSearch();

    function setupSearch() {
        // Handle form submission
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                performSearch(searchTerm);
            } else {
                // If search is empty, fetch all products
                fetchProducts(1);
            }
        });

        // Add debounced input for real-time search
        searchInput.addEventListener('input', debounce(function() {
            const searchTerm = searchInput.value.trim();
            if (searchTerm.length > 2) {
                performSearch(searchTerm);
            } else if (searchTerm.length === 0) {
                // If search is cleared, fetch all products
                fetchProducts(1);
            }
        }, 300));

        // Add clear button functionality if you have one
        const clearButton = searchForm.querySelector('.clear-search');
        if (clearButton) {
            clearButton.addEventListener('click', function() {
                searchInput.value = '';
                fetchProducts(1);
            });
        }
    }

    // Debounce function to limit API calls during typing
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                func.apply(context, args);
            }, wait);
        };
    }

    // Function to fetch all products (similar to your products-display.js)
    function fetchProducts(page) {
        const itemsPerPage = 12;
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;

        fetch('http://localhost:5000/products/fetch-products-allopen', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ start, end })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                currentProducts = sortProductsByDate(data.response);
                displayProducts(currentProducts);
                productsFoundElement.textContent = Object.keys(currentProducts).length;
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

    // Sort products by date (newest first)
    function sortProductsByDate(products) {
        const productArray = Object.entries(products);
        
        productArray.sort((a, b) => {
            const dateA = new Date(a[1].created_at);
            const dateB = new Date(b[1].created_at);
            return dateB - dateA; // Sort in descending order (newest first)
        });
        
        return Object.fromEntries(productArray);
    }

    // Perform search using API
    function performSearch(searchTerm) {
        fetch('http://localhost:5000/products/search-productstitle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title: searchTerm })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                currentProducts = data.response;
                displayProducts(currentProducts);
                productsFoundElement.textContent = Object.keys(currentProducts).length;
            } else {
                console.error('Error searching products:', data.message);
                showAlert('Error searching products: ' + data.message);
                productsContainer.innerHTML = '<p class="noResults">No products found matching your search.</p>';
                productsFoundElement.textContent = '0';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('Error searching products. Please try again.');
            productsContainer.innerHTML = '<p class="noResults">Error loading search results.</p>';
            productsFoundElement.textContent = '0';
        });
    }

    // Display products in the UI
    function displayProducts(products) {
        productsContainer.innerHTML = '';

        if (!products || Object.keys(products).length === 0) {
            productsContainer.innerHTML = '<p class="noResults">No products found matching your search.</p>';
            return;
        }

        for (const productId in products) {
            const product = products[productId];
            
            let discountTag = '';
            if (product.discount_price && product.actual_price && product.discount_price < product.actual_price) {
                const discountPercent = Math.round(((product.actual_price - product.discount_price) / product.actual_price) * 100);
                discountTag = `<h2 class="saleTag"><span>${discountPercent}%</span>&nbsp;Off</h2>`;
            }

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

        // Add event listeners to cart buttons
        document.querySelectorAll('.addToCart').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const productElement = this.closest('.oneProduct');
                const productId = productElement.dataset.productId;
                toggleCart(productId);
            });
        });
    }

    // Toggle product in cart
    function toggleCart(productId) {
        let cart = JSON.parse(localStorage.getItem('cart')) || {};
        
        if (cart[productId]) {
            // Remove from cart
            delete cart[productId];
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCounter();
            showAlert('Product removed from cart!');
        } else {
            // Add to cart
            const product = currentProducts[productId];
            if (product) {
                cart[productId] = {
                    quantity: 1,
                    addedAt: new Date().toISOString(),
                    title: product.title,
                    price: product.discount_price || product.actual_price,
                    image: product.product_cover_image ? 
                         `/MSM_Backend/images/${product.product_cover_image}` : 
                         (product.product_images && product.product_images.length > 0 ? 
                         `/MSM_Backend/images/${product.product_images[0]}` : 
                         '/assets/misc/default-product-image.png')
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