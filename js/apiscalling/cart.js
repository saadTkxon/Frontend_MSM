// cart.js - Complete cart functionality with error handling

// Base URL for product images and API
const IMAGE_BASE_URL = 'http://localhost:5000/products/images12/';
const API_BASE_URL = 'http://localhost:5000/products/';
const DEFAULT_IMAGE = '/assets/misc/productItem2.png';

function getBaseProductId(productId) {
    if (!productId) return null;
    
    // Handle cases like "a84e7643-green|" or "76c82fa-1744364816473"
    const parts = productId.split(/[-|]/);
    return parts[0]; // Always return the first part
}

// Function to get cart items from local storage
async function getCartItems() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || {};
        const cartItems = Object.entries(cart).map(([key, item]) => {
            // Process image URL - always use the image from the product data
            let imageUrl = item.image ? `${IMAGE_BASE_URL}${encodeURIComponent(item.image)}` : DEFAULT_IMAGE;
            const baseId = getBaseProductId(item.id || key);

            return {
                id: baseId,
                uniqueKey: key, // Store the unique key for identification
                title: item.title || 'Untitled Product',
                price: parseFloat(item.price || 0),
                actual_price: parseFloat(item.actual_price || item.price || 0),
                discount_price: parseFloat(item.discount_price || item.price || 0),
                quantity: parseInt(item.quantity || 1),
                image: imageUrl,
                variations: item.variations || [],
                shippingFee: parseFloat(item.shippingFee || item.shipping_fee || 0)
            };
        });

        // Fetch descriptions for all items
        const itemsWithDescriptions = await Promise.all(
            cartItems.map(async item => {
                const description = await fetchProductDescription(item.id);
                return {
                    ...item,
                    description_short: description || "No description available"
                };
            })
        );

        return itemsWithDescriptions;
    } catch (error) {
        console.error('Error getting cart items:', error);
        return [];
    }
}

// Function to fetch product description from API
async function fetchProductDescription(productId) {
    try {
        const baseId = getBaseProductId(productId);
        const response = await fetch(`${API_BASE_URL}productdescription?product_id=${baseId}`);
        const data = await response.json();
        
        if (data.message === "Product description fetched successfully") {
            return data.response.description_short;
        } else {
            console.error('Error fetching product description:', data.message);
            return null;
        }
    } catch (error) {
        console.error('Error making API request:', error);
        return null;
    }
}

// Function to fetch user's cart from server
async function fetchUserCart() {
    try {
        const authToken = localStorage.getItem("auth_token");
        if (!authToken) return null;

        const response = await fetch(`${API_BASE_URL}get-cart`, {
            headers: {
                "Authorization": `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (data.status && data.response && data.response.cart_items) {
            console.log("API response from the get-cart API:", data.response.cart_items);
            return data.response.cart_items;
        }
        return null;
    } catch (error) {
        console.error('Error fetching user cart:', error);
        return null;
    }
}

async function syncServerCartWithLocal() {
    try {
        console.log('[sync] Starting sync process');
        
        const serverCartItems = await fetchUserCart();
        const localCart = JSON.parse(localStorage.getItem('cart')) || {};
        
        console.log('[sync] Server cart:', serverCartItems);
        console.log('[sync] Local cart:', localCart);

        // If no local cart but server has items
        if (Object.keys(localCart).length === 0 && serverCartItems?.length > 0) {
            console.log('[sync] Initializing local cart from server');
            const newLocalCart = {};
            
            serverCartItems.forEach(item => {
                const baseId = getBaseProductId(item.product_id);
                if (!baseId) return;
                
                const newItemKey = `${baseId}-${Date.now()}`;
                newLocalCart[newItemKey] = {
                    id: baseId,
                    title: item.title,
                    price: parseFloat(item.price || 0),
                    actual_price: parseFloat(item.actual_price || item.price || 0),
                    discount_price: parseFloat(item.discount_price || item.price || 0),
                    quantity: parseInt(item.quantity || 1),
                    image: item.product_cover_image_cart || DEFAULT_IMAGE,
                    variations: item.variations || [],
                    description_short: item.description_short,
                    shippingFee: parseFloat(item.shipping_fee || 0)
                };
            });
            
            localStorage.setItem('cart', JSON.stringify(newLocalCart));
            return;
        }
        
        // Merge server items into local cart
        if (serverCartItems?.length > 0) {
            console.log('[sync] Merging server items into local cart');
            
            serverCartItems.forEach(serverItem => {
                const baseId = getBaseProductId(serverItem.product_id);
                if (!baseId) return;
                
                // Check if item exists in local cart (match both product ID and variations)
                const exists = Object.entries(localCart).some(([key, localItem]) => {
                    const localBaseId = getBaseProductId(localItem.id || key);
                    return localBaseId === baseId && 
                           JSON.stringify(localItem.variations) === JSON.stringify(serverItem.variations);
                });
                
                if (!exists) {
                    const newItemKey = `${baseId}-${Date.now()}`;
                    localCart[newItemKey] = {
                        id: baseId,
                        title: serverItem.title,
                        price: parseFloat(serverItem.price || 0),
                        actual_price: parseFloat(serverItem.actual_price || serverItem.price || 0),
                        discount_price: parseFloat(serverItem.discount_price || serverItem.price || 0),
                        quantity: parseInt(serverItem.quantity || 1),
                        image: serverItem.product_cover_image_cart || DEFAULT_IMAGE,
                        variations: serverItem.variations || [],
                        description_short: serverItem.description_short,
                        shippingFee: parseFloat(serverItem.shipping_fee || 0)
                    };
                }
            });
            
            localStorage.setItem('cart', JSON.stringify(localCart));
        }
        
        // Always save the merged cart back to server
        await saveCartToServer();
        
    } catch (error) {
        console.error('[sync] Error during sync:', error);
    }
}

async function saveCartToServer() {
    try {
        console.log('[saveCartToServer] Starting to save cart to server...');
        
        const authToken = localStorage.getItem("auth_token");
        if (!authToken) {
            console.log('[saveCartToServer] No auth token found, skipping server save');
            return;
        }

        const localCart = JSON.parse(localStorage.getItem('cart')) || {};
        console.log('[saveCartToServer] Local cart contents:', localCart);
        
        if (Object.keys(localCart).length === 0) {
            console.log('[saveCartToServer] Cart is empty, nothing to save');
            return;
        }

        const cartItems = [];
        
        // Process each item in the cart
        for (const [key, item] of Object.entries(localCart)) {
            try {
                // Extract base ID (handle all formats)
                let baseId;
                if (item.id) {
                    baseId = getBaseProductId(item.id);
                } else {
                    baseId = getBaseProductId(key);
                }

                // Skip if we still can't get an ID
                if (!baseId) {
                    console.warn('[saveCartToServer] Skipping item with invalid ID:', key, item);
                    continue;
                }

                cartItems.push({
                    product_id: baseId,
                    quantity: parseInt(item.quantity || 1),
                    price: parseFloat(item.price || 0),
                    title: item.title || 'Untitled Product',
                    description_short: item.description_short || 'No description',
                    product_cover_image_cart: item.image || DEFAULT_IMAGE,
                    variations: item.variations || [],
                    shipping_fee: parseFloat(item.shippingFee || item.shipping_fee || 0)
                });
            } catch (error) {
                console.error('[saveCartToServer] Error processing cart item:', key, item, error);
            }
        }

        console.log('[saveCartToServer] Prepared cart items for API:', cartItems);

        const response = await fetch(`${API_BASE_URL}add-to-cart`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({ products: cartItems })
        });

        console.log('[saveCartToServer] API request sent, waiting for response...');

        const data = await response.json();
        console.log('[saveCartToServer] API response:', data);

        if (!data.status) {
            console.error('[saveCartToServer] Error saving cart to server:', data.message);
            throw new Error(data.message || 'Unknown error from server');
        }

        console.log('[saveCartToServer] Cart successfully saved to server');
    } catch (error) {
        console.error('[saveCartToServer] Error saving cart to server:', error);
        throw error;
    }
}




// Function to clear the entire cart from server
async function clearCartFromServer() {
    try {
        const authToken = localStorage.getItem("auth_token");
        if (!authToken) {
            console.log('[clearCart] No auth token found, skipping server clear');
            return false;
        }

        const response = await fetch(`${API_BASE_URL}clear-cart`, {
            method: 'DELETE',
            headers: {
                "Authorization": `Bearer ${authToken}`
            }
        });

        const data = await response.json();
        console.log('[clearCart] API response:', data);

        if (data.status) {
            console.log('[clearCart] Cart successfully cleared from server');
            return true;
        } else {
            console.error('[clearCart] Error clearing cart from server:', data.message);
            return false;
        }
    } catch (error) {
        console.error('[clearCart] Error clearing cart from server:', error);
        return false;
    }
}










// Function to render cart items with error handling
async function renderCartItems() {
    try {
        const cartItemsContainer = document.querySelector('.cartItemsHere');
        const emptyMessage = document.querySelector('.empty');
        const checkoutSection = document.querySelector('.cartCalculationAndAction');
        
        if (!cartItemsContainer || !emptyMessage || !checkoutSection) {
            console.error('Required DOM elements not found');
            return;
        }
        
        await syncServerCartWithLocal();
        const cartItems = await getCartItems();
        
        // Clear existing items
        cartItemsContainer.innerHTML = '';
        
        if (cartItems.length === 0) {
            // Show empty message and hide checkout section
            emptyMessage.style.display = 'flex';
            checkoutSection.style.display = 'none';
            
            // Add the empty cart HTML structure
            cartItemsContainer.innerHTML = `
                <p class="empty" style="display: flex;">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor">
                            <path d="M2 12c0-4.714 0-7.071 1.464-8.536C4.93 2 7.286 2 12 2s7.071 0 8.535 1.464C22 4.93 22 7.286 22 12s0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12Z"/>
                            <path stroke-linecap="round" d="M2 13h3.16c.905 0 1.358 0 1.756.183s.692.527 1.281 1.214l.606.706c.589.687.883 1.031 1.281 1.214s.85.183 1.756.183h.32c.905 0 1.358 0 1.756-.183s.692-.527 1.281-1.214l.606-.706c.589-.687.883-1.031 1.281-1.214S17.934 13 18.84 13H22"/>
                        </g>
                    </svg>
                    <span>No item in cart!</span>
                </p>
            `;
            return;
        } else {
            emptyMessage.style.display = 'none';
            checkoutSection.style.display = 'block';
        }
        
        // Render each cart item
        cartItems.forEach(item => {
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'oneCartItem';
            cartItemElement.innerHTML = `
                <div class="cartItemSelection">
                    <input type="checkbox" name="cartItem${item.uniqueKey}" id="cartItem${item.uniqueKey}" checked>
                    <label for="cartItem${item.uniqueKey}"><span class="circle"></span></label>
                </div>
                <div class="itemImageBox">
                    <img src="${item.image}" alt="${item.title}" 
                         onerror="this.src='${DEFAULT_IMAGE}'; this.onerror=null;">
                </div>
                <div class="itemDets">
                    <h1>${item.title}</h1>
                    ${item.variations && item.variations.length > 0 ? `
                    <div class="variations">
                        <p>${item.variations.map(v => `<span>${v}</span>`).join('&nbsp;-&nbsp;')}</p>
                    </div>
                    ` : ''}
                    <p>Shipping: <span>${item.shippingFee.toFixed(2)}</span></p>
                    <h1 class="product-description">${item.description_short}</h1>
                    <div class="unitPrice">
                        <p>Unit price:&nbsp;&nbsp;<span>${item.price.toFixed(2)}</span></p>&nbsp;&nbsp;
                        ${item.discount_price < item.actual_price ? `
                        <h2>Rs.&nbsp;<span>${item.actual_price.toFixed(2)}</span></h2>
                        ` : ''}
                    </div>
                    
                    <div class="finalPrices">
                        <div class="increasingQuantity">
                            <button type="button" class="decrease-btn" data-id="${item.uniqueKey}">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2s10 4.477 10 10m-6.25 0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1 0-1.5h6a.75.75 0 0 1 .75.75" clip-rule="evenodd"/></svg>
                            </button>
                            <input type="number" value="${item.quantity}" min="1" data-id="${item.uniqueKey}" readonly>
                            <button type="button" class="increase-btn" data-id="${item.uniqueKey}">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12s4.477 10 10 10m.75-13a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25z" clip-rule="evenodd"/></svg>
                            </button>
                        </div>
                        <p>Total price:&nbsp;&nbsp;<span>${(item.price * item.quantity).toFixed(2)}</span></p>
                    </div>
                </div>
                <div class="deleteItemBox">
                    <button class="deleteItemBtn" type="button" data-id="${item.uniqueKey}">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="currentColor"><path d="M2 12c0-4.714 0-7.071 1.464-8.536C4.93 2 7.286 2 12 2s7.071 0 8.535 1.464C22 4.93 22 7.286 22 12s0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12Z"/><path stroke-linecap="round" d="m14.5 9.5l-5 5m0-5l5 5"/></g></svg>
                    </button>
                </div>
            `;
            
            cartItemsContainer.appendChild(cartItemElement);
        });
        
        updateCartTotals();
        addCartEventListeners();
    } catch (error) {
        console.error('Error rendering cart items:', error);
        showAlert('Error loading cart. Please refresh the page.');
    }
}










function updateCartTotals() {
    try {
        const subtotalElement = document.querySelector('.cartDets .oneDet:nth-child(1) h1');
        const shippingElement = document.querySelector('.cartDets .oneDet:nth-child(2) h1');
        const totalElement = document.querySelector('.cartDets .oneDet:nth-child(4) h1');

        if (!subtotalElement || !totalElement || !shippingElement) {
            console.error('Total display elements not found');
            return;
        }

        const cart = JSON.parse(localStorage.getItem('cart')) || {};
        const cartItems = Object.values(cart);

      // Calculate subtotal (sum of price * quantity for all items)
const subtotal = cartItems.reduce((sum, item) => {
    return sum + (parseFloat(item.price || 0) * parseInt(item.quantity || 1));
}, 0);


        // Calculate shipping (sum of shipping fees for all items)
        const shipping = cartItems.reduce((sum, item) => {
            return sum + parseFloat(item.shippingFee || item.shipping_fee || 0);
        }, 0);

        // Calculate total (subtotal + shipping)
        const total = subtotal + shipping;

        // Update the DOM elements
        subtotalElement.innerHTML = `Rs.&nbsp;<span>${subtotal.toFixed(2)}</span>`;
        
        if (shipping > 0) {
            shippingElement.innerHTML = `Rs.&nbsp;<span>${shipping.toFixed(2)}</span>`;
        } else {
            shippingElement.textContent = 'free';
        }
        
        totalElement.innerHTML = `Rs.&nbsp;<span>${total.toFixed(2)}</span>`;

    } catch (error) {
        console.error('Error updating cart totals:', error);
    }
}

// Function to add event listeners with error handling
function addCartEventListeners() {
    try {
        // Quantity buttons
        document.querySelectorAll('.increase-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                updateQuantity(id, 1);
            });
        });
        
        document.querySelectorAll('.decrease-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                updateQuantity(id, -1);
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.deleteItemBtn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                deleteCartItem(id);
            });
        });
        
        // Checkboxes
        document.querySelectorAll('.cartItemSelection input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', updateCartTotals);
        });
    } catch (error) {
        console.error('Error adding cart event listeners:', error);
    }
}

// Function to update item quantity with error handling
async function updateQuantity(id, change) {
    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || {};
        
        if (cart[id]) {
            const newQuantity = parseInt(cart[id].quantity) + change;
            if (newQuantity < 1) return;
            
            cart[id].quantity = newQuantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            
            const quantityInput = document.querySelector(`input[data-id="${id}"]`);
            if (quantityInput) quantityInput.value = newQuantity;
            
            const totalPriceElement = document.querySelector(`.oneCartItem input[data-id="${id}"]`)?.closest('.finalPrices')?.querySelector('p span');
            if (totalPriceElement) {
                totalPriceElement.textContent = (parseFloat(cart[id].price) * newQuantity).toFixed(2);
            }
            
            updateCartTotals();
            await saveCartToServer();
        }
    } catch (error) {
        console.error('Error updating quantity:', error);
        showAlert('Error updating quantity. Please try again.');
    }
}

async function deleteCartItem(id) {
    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || {};
        
        if (cart[id]) {
            delete cart[id];
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // If cart is now empty, clear it from server too
            if (Object.keys(cart).length === 0) {
                await clearCartFromServer();
            } else {
                await saveCartToServer();
            }
            
            showAlert('Item removed from cart');

            // Refresh the page
            setTimeout(() => {
                location.reload();
            }, 300);
        }
    } catch (error) {
        console.error('Error deleting cart item:', error);
        showAlert('Error removing item. Please try again.');
    }
}

// Function to show alert message with error handling
function showAlert(message) {
    try {
        const alertElement = document.querySelector('.alert');
        const alertBadge = document.querySelector('.alertBadge');
        
        if (alertElement && alertBadge) {
            const messageElement = alertBadge.querySelector('p');
            if (messageElement) messageElement.textContent = message;
            alertElement.style.display = 'block';
            
            setTimeout(() => {
                alertElement.style.display = 'none';
            }, 3000);
        }
    } catch (error) {
        console.error('Error showing alert:', error);
    }
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // First sync server cart with local cart
        await syncServerCartWithLocal();
        
        // Then render the cart items
        await renderCartItems();
        
        // Go back button
        const goBackBtn = document.querySelector('.goBack');
        if (goBackBtn) {
            goBackBtn.addEventListener('click', function(e) {
                e.preventDefault();
                window.history.back();
            });
        }
        
        // // Checkout button
        // const checkoutBtn = document.querySelector('.submitBtn');
        // if (checkoutBtn) {
        //     checkoutBtn.addEventListener('click', async function(e) {
        //         e.preventDefault();
        //         try {
        //             const cartItems = await getCartItems();
        //             const selectedItems = cartItems.filter(item => {
        //                 const checkbox = document.querySelector(`#cartItem${item.uniqueKey}`);
        //                 return checkbox ? checkbox.checked : false;
        //             });
                    
        //             if (selectedItems.length === 0) {
        //                 showAlert('Please select at least one item to checkout');
        //                 return;
        //             }
                    
        //             // Store selected items in localStorage for checkout page
        //             localStorage.setItem('checkoutItems', JSON.stringify(selectedItems));
                    
        //             // Redirect to checkout page
        //             window.location.href = 'http://127.0.0.1:5500/msm_kosmetika_fin/checkout.html';
        //         } catch (error) {
        //             console.error('Checkout error:', error);
        //             showAlert('Error during checkout. Please try again.');
        //         }
        //     });
        // }



// Checkout button
const checkoutBtn = document.querySelector('.submitBtn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        try {
            const cartItems = await getCartItems();
            const selectedItems = cartItems.filter(item => {
                // Create a safe selector by escaping special characters
                const safeId = item.uniqueKey.replace(/([!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, '\\$1');
                const checkbox = document.querySelector(`#cartItem${safeId}`);
                return checkbox ? checkbox.checked : false;
            });
            
            if (selectedItems.length === 0) {
                showAlert('Please select at least one item to checkout');
                return;
            }
            
            // Process items to only include base product ID (remove variations part)
            const processedItems = selectedItems.map(item => ({
                ...item,
                id: getBaseProductId(item.id) // Only keep the base product ID
            }));
            
            // Store selected items in localStorage for checkout page
            localStorage.setItem('checkoutItems', JSON.stringify(processedItems));
            
            // Redirect to checkout page
            window.location.href = 'http://127.0.0.1:5500/msm_kosmetika_fin/checkout.html';
        } catch (error) {
            console.error('Checkout error:', error);
            showAlert('Error during checkout. Please try again.');
        }
    });
}








        // Alert close button
        const alertCloseBtn = document.querySelector('.alertBadge button');
        if (alertCloseBtn) {
            alertCloseBtn.addEventListener('click', function() {
                const alertElement = document.querySelector('.alert');
                if (alertElement) alertElement.style.display = 'none';
            });
        }
    } catch (error) {
        console.error('Error initializing cart:', error);
        showAlert('Error initializing cart. Please refresh the page.');
    }
});





