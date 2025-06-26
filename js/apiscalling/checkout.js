document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    // const connectPayId = localStorage.getItem('connectPayId');
    // if (connectPayId) {
    //     // Show the confirmation overlay
    //     showPaymentConfirmationOverlay(connectPayId);
    // }

    // Add this code somewhere in your DOMContentLoaded function

// // Function to check for connectPayId periodically
// function startConnectPayIdChecker() {
//     // Check immediately
//     const connectPayId = localStorage.getItem('connectPayId');
//     if (connectPayId) {
//         showPaymentConfirmationOverlay(connectPayId);
//     }
    
//     // Then check every 5 seconds (adjust interval as needed)
//     setInterval(() => {
//         const currentConnectPayId = localStorage.getItem('connectPayId');
//         if (currentConnectPayId && (!connectPayId || currentConnectPayId !== connectPayId)) {
//             showPaymentConfirmationOverlay(currentConnectPayId);
//         }
//     }, 5000); // 5000ms = 5 seconds
// }

// // Start the checker when page loads
// startConnectPayIdChecker();




// Function to check if any modal/overlay is currently open
function isAnyModalOpen() {
    // Check if EasyPaisa modal is open
    const easypaisaModal = document.getElementById('easypaisaModal');
    if (easypaisaModal && easypaisaModal.style.display === 'block') {
        return true;
    }
    fetchUserProfile().then(autofillEasyPaisaForm);
    
    // Check if payment confirmation overlay is already open
    const paymentOverlay = document.querySelector('.payment-confirmation-overlay');
    if (paymentOverlay && paymentOverlay.style.display !== 'none') {
        return true;
    }
    
    // Add checks for other modals/overlays if needed
    // ...
    
    return false;
}

// Modified function to check for connectPayId periodically
function startConnectPayIdChecker() {
    // Check immediately if no modal is open
    if (!isAnyModalOpen()) {
        const connectPayId = localStorage.getItem('connectPayId');
        if (connectPayId) {
            showPaymentConfirmationOverlay(connectPayId);
        }
    }
    
    // Then check every 5 seconds (adjust interval as needed)
    setInterval(() => {
        // Only proceed if no modal is currently open
        if (!isAnyModalOpen()) {
            const currentConnectPayId = localStorage.getItem('connectPayId');
            const previousConnectPayId = localStorage.getItem('lastCheckedConnectPayId');
            
            if (currentConnectPayId && currentConnectPayId !== previousConnectPayId) {
                showPaymentConfirmationOverlay(currentConnectPayId);
                localStorage.setItem('lastCheckedConnectPayId', currentConnectPayId);
            }
        }
    }, 3000); // 5000ms = 5 seconds
}

// Start the checker when page loads
startConnectPayIdChecker();





    const checkoutItemsContainer = document.querySelector('.checkoutItemsHere');
    const checkoutForm = document.querySelector('.checkoutForm');
    const voucherInput = document.querySelector('.enterVoucherHere input');
    const voucherApplyButton = document.querySelector('.enterVoucherHere button');
    const subtotalSpan = document.querySelector('.checkoutDets .oneDet:nth-child(1) h1 span');
    const shippingSpan = document.querySelector('.checkoutDets .oneDet:nth-child(2) h1 span');
    // const voucherDiscountSpan = document.querySelector('.checkoutDets .oneDet:nth-child(3) h1 span:nth-child(3)');
   
    const voucherDiscountSpan = document.querySelector('.checkoutDets .oneDet:nth-child(3) h1 span:last-child');
    const totalSpan = document.querySelector('.checkoutDets .oneDet:last-child h1 span');
    const itemCountSpan = document.querySelector('.checkoutDets .oneDet:first-child h2 span');
    const voucherCodeSpan = document.querySelector('.checkoutDets .oneDet:nth-child(3) h2 span');
    const alertDiv = document.querySelector('.alert');
    const alertBadge = document.querySelector('.alertBadge p');
    
    // Initialize variables
    let voucherData = null;
    
    // Function to show alert
    function showAlert(message, isError = false) {
        if (!alertDiv || !alertBadge) return;
        
        alertBadge.textContent = message;
        alertDiv.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            alertDiv.style.display = 'none';
        }, 5000);
    }
    
    // Clear any existing placeholder items
    checkoutItemsContainer.innerHTML = '';
    
    // Retrieve checkout items from localStorage
    const checkoutItems = JSON.parse(localStorage.getItem('checkoutItems')) || [];
    
    // If no items, show a message
    if (checkoutItems.length === 0) {
        checkoutItemsContainer.innerHTML = '<p>No items in your cart</p>';
        return;
    }
    
    // Calculate initial totals
    let subtotal = 0;
    let shippingFee = 0; // Will be calculated based on products
    
    checkoutItems.forEach(item => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 1;
        subtotal += price * quantity;
        
        // Get shipping fee for each product and find the largest one
        const itemShippingFee = parseFloat(item.shippingFee) || 0;
        if (itemShippingFee > shippingFee) {
            shippingFee = itemShippingFee;
        }
    });


//     // In your updateTotals function, add this:
// function updateTotals(subtotal, shipping, discount) {
//     if (subtotalSpan) subtotalSpan.textContent = subtotal.toFixed(2);
//     if (shippingSpan) shippingSpan.textContent = shipping.toFixed(2);
//     if (itemCountSpan) itemCountSpan.textContent = checkoutItems.reduce((total, item) => total + (parseInt(item.quantity) || 1), 0);
    
//     const total = subtotal + shipping - discount;
//     if (totalSpan) totalSpan.textContent = total.toFixed(2);
    
//     // Save shipping fee to localStorage
//     localStorage.setItem('calculatedShippingFee', shipping.toFixed(2));
// }
    

function updateTotals(subtotal, shipping, discount) {
    if (subtotalSpan) subtotalSpan.textContent = subtotal.toFixed(2);
    if (shippingSpan) shippingSpan.textContent = shipping.toFixed(2);
    if (itemCountSpan) itemCountSpan.textContent = checkoutItems.reduce((total, item) => total + (parseInt(item.quantity) || 1), 0);
    
    // Update voucher discount display
    if (voucherDiscountSpan) {
        voucherDiscountSpan.textContent = discount.toFixed(2);
    }
    
    const total = subtotal + shipping - discount;
    if (totalSpan) totalSpan.textContent = total.toFixed(2);
    
    // Save shipping fee to localStorage
    localStorage.setItem('calculatedShippingFee', shipping.toFixed(2));
}


    // Update UI with initial values
    updateTotals(subtotal, shippingFee, 0);
    
    // Loop through each item and create HTML
    checkoutItems.forEach(item => {
        // Create the item container
        const itemElement = document.createElement('div');
        itemElement.className = 'oneCheckoutItem';
        
        // Create the image box with server-side image
        const imageBox = document.createElement('div');
        imageBox.className = 'itemImageBox';
        const image = document.createElement('img');
        image.src = `http://localhost:5000/products/coverimage/${item.id}`;
        image.alt = item.title;
        imageBox.appendChild(image);
        
        // Create the details container
        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'itemDets';
        
        // Add title
        const title = document.createElement('h1');
        title.textContent = item.title || 'No title available';
        
        // Add variations if they exist (from localStorage)
        const variationsDiv = document.createElement('div');
        variationsDiv.className = 'variations';
        if (item.variations && item.variations.length > 0) {
            const variationsText = item.variations.join(' - ');
            const variationsP = document.createElement('p');
            variationsP.innerHTML = `<span>${variationsText}</span>`;
            variationsDiv.appendChild(variationsP);
        }
        
        // Calculate total price for this item
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 1;
        const totalPrice = (price * quantity).toFixed(2);
        
        // Add unit price, quantity and total price
        const priceDiv = document.createElement('div');
        priceDiv.className = 'priceContainer';
        priceDiv.innerHTML = `
            <div class="unitPrice">
                <p>Unit price: <span>${price.toFixed(2)}</span></p>
                <h2>(<span>${quantity}</span>x)</h2>
            </div>
            <div class="totalPrice">
                <p>Total: <span>${totalPrice}</span></p>
            </div>
        `;
        
        // Create description container (will be filled after API call)
        const descriptionDiv = document.createElement('div');
        descriptionDiv.className = 'itemDescription';
        descriptionDiv.innerHTML = '<p>Loading description...</p>';
        
        // Add all elements to details container
        detailsContainer.appendChild(title);
        if (item.variations && item.variations.length > 0) {
            detailsContainer.appendChild(variationsDiv);
        }
        detailsContainer.appendChild(priceDiv);
        detailsContainer.appendChild(descriptionDiv);
      
        // add the image

        // Add image and details to main item container
        itemElement.appendChild(imageBox);
        itemElement.appendChild(detailsContainer);
        
        // Add item to the checkout container
        checkoutItemsContainer.appendChild(itemElement);
        
        // Fetch product description from server
        if (item.id) {
            fetch(`http://localhost:5000/products/productdescription?product_id=${item.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success' && data.response.description_short) {
                    // Truncate description to one line with ellipsis
                    const description = data.response.description_short;
                    const truncatedDesc = description.length > 100 
                        ? description.substring(0, 100) + '...' 
                        : description;
                    
                    // Update the description in the DOM
                    descriptionDiv.innerHTML = `<p>${truncatedDesc}</p>`;
                } else {
                    descriptionDiv.innerHTML = '<p>No description available</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching product description:', error);
                descriptionDiv.innerHTML = '<p>Failed to load description</p>';
            });
        }
    });
    
    // Voucher validation handler for Enter key
    voucherInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            applyVoucher();
        }
    });
    
    // Voucher validation handler for button click
    voucherApplyButton.addEventListener('click', function() {
        applyVoucher();
    });
    
    // Function to apply voucher
    function applyVoucher() {
        const voucherCode = voucherInput.value.trim();
        if (!voucherCode) {
            showAlert('Please enter a voucher code');
            return;
        }
        
        validateVoucher(voucherCode);
    }
    
    // Function to validate voucher
    function validateVoucher(voucherCode) {
        console.log('Attempting to validate voucher:', voucherCode);
        
        // Check if already applied
        if (voucherData && voucherData.voucher_id === voucherCode) {
            showAlert('This voucher is already applied');
            return;
        }
        
        fetch('http://localhost:5000/voucher/validate-voucher', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                voucher_id: voucherCode
            })
        })
        .then(response => {
            console.log('Raw API response:', response);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Parsed API response data:', data);
            
            if (data.status === 'success') {
                // Store voucher data in localStorage as well for persistence
                localStorage.setItem('currentVoucher', JSON.stringify(data.response));
                
                voucherData = data.response;
                if (voucherCodeSpan) voucherCodeSpan.textContent = voucherData.voucher_id;
                if (voucherDiscountSpan) voucherDiscountSpan.textContent = voucherData.price;
                voucherInput.value = '';
                
                console.log('Voucher code span:', voucherCodeSpan);
                console.log('Voucher discount span:', voucherDiscountSpan);
                console.log('Voucher data:', voucherData);


                // Update totals with voucher discount
                updateTotals(subtotal, shippingFee, parseFloat(voucherData.price));
                
                // Show success message
                showAlert(`Voucher applied successfully: ${voucherData.voucher_id} (Rs. ${voucherData.price} discount)`);
            } else {
                removeVoucher();
                showAlert(data.message || 'Invalid voucher code', true);
            }
        })
        .catch(error => {
            console.error('Error validating voucher:', error);
            removeVoucher();
            showAlert('Error validating voucher. Please try again.', true);
        });
    }
    
    // Function to remove voucher
    function removeVoucher() {
        voucherData = null;
        localStorage.removeItem('currentVoucher');
        if (voucherCodeSpan) voucherCodeSpan.textContent = '';
        if (voucherDiscountSpan) voucherDiscountSpan.textContent = '0';
        updateTotals(subtotal, shippingFee, 0);
    }
    
    // Check for existing voucher in localStorage
    const savedVoucher = localStorage.getItem('currentVoucher');
    if (savedVoucher) {
        try {
            voucherData = JSON.parse(savedVoucher);
            if (voucherCodeSpan) voucherCodeSpan.textContent = voucherData.voucher_id;
            if (voucherDiscountSpan) voucherDiscountSpan.textContent = voucherData.price;
            updateTotals(subtotal, shippingFee, parseFloat(voucherData.price));
        } catch (e) {
            console.error('Error loading saved voucher:', e);
            localStorage.removeItem('currentVoucher');
        }
    }
    
    // Function to update all totals in the UI
    function updateTotals(subtotal, shipping, discount) {
        if (subtotalSpan) subtotalSpan.textContent = subtotal.toFixed(2);
        if (shippingSpan) shippingSpan.textContent = shipping.toFixed(2);
        if (itemCountSpan) itemCountSpan.textContent = checkoutItems.reduce((total, item) => total + (parseInt(item.quantity) || 1), 0);
        
        const total = subtotal + shipping - discount;
        if (totalSpan) totalSpan.textContent = total.toFixed(2);
    }
    












// Add this near the top of your DOMContentLoaded function
const easypaisaModal = document.getElementById('easypaisaModal');
const closeModal = document.querySelector('.close-modal');
const easypaisaForm = document.getElementById('easypaisaForm');





// // Function to show EasyPaisa modal
// function showEasyPaisaModal() {
//   easypaisaModal.style.display = 'block';
// }


// // Modify your showEasyPaisaModal function to include autofill
// async function showEasyPaisaModal() {
//     // Show modal first
//     easypaisaModal.style.display = 'block';
    
//     // Then fetch and autofill
//     try {
//         const userProfile = await fetchUserProfile();
//         autofillEasyPaisaForm(userProfile);

// // Set timeout to auto-click the submit button after 5 seconds
// setTimeout(() => {
//     const submitButton = document.querySelector('.submit-payment');
//     if (submitButton) {
//         submitButton.click();
//     }
// }, 1);

//     } catch (error) {
//         console.error('Error fetching profile for autofill:', error);
//     }
// }

async function showEasyPaisaModal() {
    try {
        const userProfile = await fetchUserProfile();
        // Process payment immediately without showing form
        processEasyPaisaPayment(userProfile);
    } catch (error) {
        console.error('Error fetching profile:', error);
        showSsaadAlert('Error processing payment. Please try again.', 'error');
    }
}


// Close modal when clicking X
closeModal.addEventListener('click', hideEasyPaisaModal);

// Close modal when clicking outside
window.addEventListener('click', function(event) {
  if (event.target === easypaisaModal) {
    hideEasyPaisaModal();
  }
});



// Replace the existing form submission handler with this new version
checkoutForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Show loading state
    showAlert('Processing your order...');
    
    try {
        // Get the selected address ID from localStorage
        const selectedAddressId = localStorage.getItem('selectedAddressId');
        
        if (!selectedAddressId) {
            showAlert('Please select a shipping address', true);
            return;
        }
        
        // Get the selected payment method
        const selectedPaymentMethod = document.querySelector('input[name="paymentOption"]:checked');
        if (!selectedPaymentMethod) {
            showAlert('Please select a payment method', true);
            return;
        }
         // If EasyPaisa is selected, show the modal instead of submitting
  if (selectedPaymentMethod.id === 'easypaisa') {
    showEasyPaisaModal();
    return;
  }
        
        // Map payment method IDs to API values
        const paymentMethods = {
            'cashOnDelivery': 'cash_on_delivery',
            'alfalah': 'alfalah',
            'easypaisa': 'easypaisa'
        };
        
        const paymentType = paymentMethods[selectedPaymentMethod.id];
        if (!paymentType) {
            showAlert('Invalid payment method selected', true);
            return;
        }
        
        // Prepare the order data
        const orderData = {
            voucher_id: voucherData ? voucherData.voucher_id : null,
            shipping_fee: parseFloat(shippingSpan.textContent) || 0,
            items: checkoutItems.map(item => ({
                product_id: item.id,
                quantity: parseInt(item.quantity) || 1,
                variations: item.variations || []
            })),
            address_id: parseInt(selectedAddressId),
            payment_type: paymentType  // Add the payment type to the order data
        };
        
        // Filter out null voucher_id if no voucher is applied
        if (orderData.voucher_id === null) {
            delete orderData.voucher_id;
        }
        
        console.log('Submitting order with data:', orderData);
        const authToken = localStorage.getItem("auth_token");
        // Call the create-order API
        const response = await fetch('http://localhost:5000/products/create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                 "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify(orderData)
        });
        
        const data = await response.json();
        console.log('Order API response:', data);
        
        if (data.status === true) {
            showAlert('Order placed successfully!');
            
            // Clear cart and voucher after successful order
            localStorage.removeItem('checkoutItems');
            localStorage.removeItem('currentVoucher');
            localStorage.removeItem('cart');

            // Delay redirection slightly to let user see alert
            setTimeout(() => {
                const orderId = data.order_id;
                if (!orderId) {
                    showAlert("Order placed but missing order ID in response", true);
                    return;
                }
                
                // Handle different payment methods differently
                if (paymentType === 'cash_on_delivery') {
                    // For cash on delivery, just redirect to success page
                    window.location.href = `/msm_kosmetika_fin/success_order.html?orderId=${orderId}`;
                } else {
                    // For online payments, redirect to payment gateway
                    // You'll need to implement this based on your payment gateway's requirements
                    // For example:
                    // window.location.href = `/payment-gateway?orderId=${orderId}&amount=${totalAmount}`;
                    showAlert('Online payment integration not yet implemented', true);
                }
            }, 1000);
        } else {
            showAlert(data.message || 'Failed to place order', true);
        }
    } catch (error) {
        console.error('Error placing order:', error);
        showAlert('Error placing order. Please try again.', true);
    }
});











    // Go back button handler
    const goBackButton = document.querySelector('.goBack');
    if (goBackButton) {
        goBackButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.history.back();
        });
    }
});






// for the user profile
async function fetchUserProfile() {
    try {
        const authToken = localStorage.getItem("auth_token");
        if (!authToken) {
            console.log("No auth token found");
            return null;
        }

        const response = await fetch('http://localhost:5000/usertrs/get_profile', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();
        if (data.status === 'success') {
            return data.response;
        } else {
            console.log('Error fetching profile:', data.message);
            return null;
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
}








// Function to hide EasyPaisa modal
function hideEasyPaisaModal() {
    easypaisaModal.style.display = 'none';
  }





// Function to show SSAAD alert
function showSsaadAlert(message, type = 'success') {
    const alert = document.querySelector('.ssaad-alert');
    const alertBadge = document.querySelector('.ssaad-alert-badge');
    const alertMessage = document.querySelector('.ssaad-alert-message');
    
    if (!alert || !alertBadge || !alertMessage) return;
    
    // Set message and type
    alertMessage.textContent = message;
    
    // Remove all previous classes
    alertBadge.className = 'ssaad-alert-badge';
    
    // Add type class
    if (type === 'error') {
        alertBadge.classList.add('error');
    } else if (type === 'warning') {
        alertBadge.classList.add('warning');
    }
    
    // Show alert
    alert.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        alert.style.display = 'none';
    }, 5000);
}



// Close button handler
document.querySelector('.ssaad-close-btn')?.addEventListener('click', function() {
    document.querySelector('.ssaad-alert').style.display = 'none';
});





// Function to generate 12-digit random ID
function generateOrderId() {
    return 'EP' + Math.floor(100000000000 + Math.random() * 900000000000).toString();
}








// Add this near your EasyPaisa modal code
function autofillEasyPaisaForm(userProfile) {
    if (!userProfile) return;
    
    // Get primary address or first address if no primary
    const primaryAddress = userProfile.primary_address || 
                         (userProfile.addresses && userProfile.addresses.length > 0 ? userProfile.addresses[0] : null);
    
    // Fill form fields
    if (document.getElementById('customerName')) {
        document.getElementById('customerName').value = 
            primaryAddress?.full_name || 
            `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 
            'Customer';
    }
    
    if (document.getElementById('customerMobile')) {
        document.getElementById('customerMobile').value = 
            primaryAddress?.phone_number || 
            userProfile.phone_number || 
            '';
    }
    
    if (document.getElementById('customerEmail')) {
        document.getElementById('customerEmail').value = userProfile.email || '';
    }
    
    if (document.getElementById('customerAddress') && primaryAddress) {
        document.getElementById('customerAddress').value = 
            `${primaryAddress.address || ''}, ${primaryAddress.city || ''}, ${primaryAddress.postal_code || ''}`.trim();
    }
}





// Handle EasyPaisa form submission
easypaisaForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Show loading state
    showSsaadAlert('Processing your Paypro payment...');
    
    // Show the form for 5 seconds before processing
    const formContainer = document.querySelector('.easypaisa-form-container');
    if (formContainer) {
        formContainer.style.display = 'block';
        
        // Set a timeout to hide the form after 5 seconds
        setTimeout(() => {
            formContainer.style.display = 'none';
            processEasyPaisaPayment();
        }, 0);
    } else {
        // If no form container, process immediately
        processEasyPaisaPayment();
    }
});


// Call the processEasyPaisaPayment function to handle the payment processing




// Function to handle the actual payment processing
async function processEasyPaisaPayment() {
    try {
        // Get form values
        const customerName = document.getElementById('customerName').value;
        let customerMobile = document.getElementById('customerMobile').value;
        const customerEmail = document.getElementById('customerEmail').value;
        const customerAddress = document.getElementById('customerAddress').value;
        
        // Get total amount from the checkout page
        const totalAmountElement = document.querySelector('.checkoutDets .oneDet:last-child h1 span');
        let totalAmount = totalAmountElement ? parseFloat(totalAmountElement.textContent) : 0;
        
        // Validate form inputs
        if (!customerName || !customerMobile || !customerEmail || !customerAddress) {
            showSsaadAlert('Please fill all EasyPaisa details', 'error');
            return;
        }
        
        // Fix the amount - remove decimals and convert to string
        totalAmount = Math.round(totalAmount).toString();
        
        // Clean and convert mobile number to +92 format
        customerMobile = customerMobile.replace(/\D/g, ''); // Remove non-digit characters

        // Ensure the number starts with 0 and has exactly 11 digits
        if (customerMobile.startsWith('0') && customerMobile.length === 11) {
            customerMobile = '+92' + customerMobile.substring(1); // Replace starting 0 with +92
        } else {
            showSsaadAlert('Please enter a valid Pakistani mobile number (e.g. 03331234567)', 'error');
            return;
        }

        // Generate 12-digit random order ID
        const orderId = generateOrderId();
        
        // Prepare EasyPaisa payment data
        const today = new Date();
        const dueDate = new Date();
        dueDate.setDate(today.getDate() + 7); // 7 days from now
        
        const paymentData = [
            {
                "MerchantId": "MSM_KOSM_USD",
                "MerchantPassword": "Live@m25"
            },
            {
                "OrderNumber": orderId,
                "OrderAmount": totalAmount,
                "OrderDueDate": dueDate.toISOString().split('T')[0],
                "OrderType": "Service",
                "IssueDate": today.toISOString().split('T')[0],
                "CustomerName": customerName,
                "CustomerMobile": customerMobile,
                "CustomerEmail": customerEmail,
                "CustomerAddress": customerAddress
            }
        ];
        
        console.log('Sending to Paypro API:', paymentData);
        
        // Encode the JSON for URL
        const encodedPaymentData = encodeURIComponent(JSON.stringify(paymentData));
        const apiUrl = `https://api.PayPro.com.pk/cpay/co?oJson=${encodedPaymentData}`;
        
        console.log('API URL:', apiUrl);
        
        // Make the API call
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        const responseText = await response.text();
        console.log('EasyPaisa API Raw Response:', responseText);
        
        try {
            const responseData = JSON.parse(responseText);
            console.log('EasyPaisa API Parsed Response:', responseData);
            
            // Check if the response indicates success
            if (responseData[0]?.Status === '00') {
                showSsaadAlert('Payment request created successfully!', 'success');
                
                // Find the ConnectPayId in the response
                const connectPayId = responseData.find(item => item.ConnectPayId)?.ConnectPayId;
                
                // Store only the ConnectPayId in localStorage
                if (connectPayId) {
                    localStorage.setItem('connectPayId', connectPayId);
                }

               
                
                // Hide the modal
                hideEasyPaisaModal();
                
                // Find the payment links in the response
                const paymentLinks = responseData.find(item => item.Click2Pay && item.IframeClick2Pay);
                
                if (paymentLinks) {
                    // Open both payment links in new tabs
                    window.open(paymentLinks.Click2Pay, '_blank');
                    window.open(paymentLinks.IframeClick2Pay, '_blank');
                    
                    // Show success message with links
                    showSsaadAlert('Payment links opened in new tabs. Please complete your payment.', 'success');
                } else {
                    showSsaadAlert('Payment created but could not find payment links in response', 'warning');
                }
            } else {
                const errorMsg = responseData[1]?.Description || 'Payment gateway returned an error';
                showSsaadAlert(errorMsg, 'error');
            }
        } catch (e) {
            console.log('Response is not JSON:', responseText);
            showSsaadAlert('Unexpected response from payment gateway', 'error');
        }
    } catch (error) {
        console.error('Error processing Paypro payment:', error);
        showSsaadAlert('Error processing Paypro payment. Please try again.', 'error');
    }
}




// Add this CSS style to your page (or in a separate CSS file)
const style = document.createElement('style');
style.textContent = `
    .payment-confirmation-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    .payment-confirmation-box {
        background-color: white;
        padding: 20px;
        border-radius: 10px;
        max-width: 500px;
        text-align: center;
    }
    .payment-confirmation-buttons {
        margin-top: 20px;
        display: flex;
        justify-content: center;
        gap: 10px;
    }
    .payment-confirmation-buttons button {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }
    .confirm-payment-btn {
        background-color: #4CAF50;
        color: white;
    }
    .cancel-payment-btn {
        background-color: #f44336;
        color: white;
    }
`;
document.head.appendChild(style);






function showPaymentConfirmationOverlay(connectPayId) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'payment-confirmation-overlay';
    
    // Show loading message immediately
    overlay.innerHTML = `
        <div class="payment-confirmation-box">
            <h2>Checking Payment Status...</h2>
            <p>Please wait while we verify your payment.</p>
        </div>
    `;
    document.body.appendChild(overlay);

    // Start checking payment status immediately
    checkPaymentStatus(connectPayId, overlay);
}










async function checkPaymentStatus(connectPayId, overlay, attempts = 0) {
    try {
        const response = await fetch(`https://api.PayPro.com.pk/cpay/gos?Username=MSM_KOSM_USD&Password=Live@m25&cpayId=${connectPayId}`);
        const data = await response.json();

        if (data[0]?.Status === '00') {
            const paymentInfo = data[1];

            if (paymentInfo.OrderStatus === 'PAID') {
                // Payment is completed - create the order
                try {
                    const orderId = await createOrderAfterPayment(connectPayId, paymentInfo.AmountPayable);
                    
                    // Clear the connectPayId from localStorage
                    localStorage.removeItem('connectPayId');
                    
                    // Show success message
                    overlay.innerHTML = `
                        <div class="payment-confirmation-box">
                            <h2>✅ Payment Completed</h2>
                            <p>Your payment was completed successfully.</p>
                            <p><strong>Amount Paid:</strong> ${paymentInfo.AmountPayable}</p>
                            <p><strong>Order ID:</strong> ${orderId}</p>
                            <button onclick="window.location.href='/msm_kosmetika_fin/success_order.html?orderId=${orderId}'"
                                    style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                View Order Details
                            </button>
                        </div>
                    `;
                } catch (error) {
                    console.error('Error creating order:', error);
                    overlay.innerHTML = `
                        <div class="payment-confirmation-box">
                            <h2>✅ Payment Completed</h2>
                            <p>Payment was successful but we encountered an issue saving your order.</p>
                            <p>Please contact support with your payment reference: ${connectPayId}</p>
                            <p>Error: ${error.message}</p>
                            <button onclick="window.location.href='/msm_kosmetika_fin/contact.html'"
                                    style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                Contact Support
                            </button>
                        </div>
                    `;
                }
                return; // Stop checking
            } else if (paymentInfo.OrderStatus === 'UNPAID' && attempts < 30) {
                // Payment still pending, check again after 2 seconds
                setTimeout(() => {
                    checkPaymentStatus(connectPayId, overlay, attempts + 1);
                }, 2000);
                return;
            } else {
                // Payment not completed after max attempts or other status
                showPaymentOptions(connectPayId, overlay, paymentInfo);
            }
        } else {
            // Error from API
            showPaymentOptions(connectPayId, overlay, null, 'Could not verify payment status');
        }
    } catch (error) {
        console.error('Error checking payment status:', error);
        if (attempts < 5) {
            // Retry on error
            setTimeout(() => {
                checkPaymentStatus(connectPayId, overlay, attempts + 1);
            }, 2000);
        } else {
            showPaymentOptions(connectPayId, overlay, null, 'Error checking payment status');
        }
    }
}




async function createOrderAfterPayment(connectPayId, amountPaid) {
    // Get necessary data from localStorage
    const checkoutItems = JSON.parse(localStorage.getItem('checkoutItems')) || [];
    const selectedAddressId = localStorage.getItem('selectedAddressId');
    const voucherData = JSON.parse(localStorage.getItem('currentVoucher')) || null;
    // const shippingFee = parseFloat(localStorage.getItem('calculatedShippingFee')) || 0;
  
     // Get shipping fee from DOM element instead of localStorage
     const shippingFeeElement = document.querySelector('.checkoutDets .oneDet:nth-child(2) h1 span');
     const shippingFee = shippingFeeElement ? parseFloat(shippingFeeElement.textContent) : 0;


    if (!checkoutItems.length) {
        throw new Error('No items in cart');
    }
    
    if (!selectedAddressId) {
        throw new Error('No shipping address selected');
    }

    // Prepare order data
    const orderData = {
        voucher_id: voucherData ? voucherData.voucher_id : null,
        shipping_fee: shippingFee,
        payment_type: "easypaisa",
        payment_reference: connectPayId,
        payment_amount: amountPaid,
        items: checkoutItems.map(item => ({
            product_id: item.id,
            quantity: parseInt(item.quantity) || 1,
            variations: item.variations || []
        })),
        address_id: parseInt(selectedAddressId)
    };

    // Filter out null voucher_id if no voucher is applied
    if (orderData.voucher_id === null) {
        delete orderData.voucher_id;
    }

    // Get auth token
    const authToken = localStorage.getItem("auth_token");
    if (!authToken) {
        throw new Error('User not authenticated');
    }

    // Call the create-order API
    const response = await fetch('http://localhost:5000/products/create-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify(orderData)
    });

    const data = await response.json();
    console.log('Order API response:', data);

    if (data.status !== true || !data.order_id) {
        throw new Error(data.message || 'Failed to create order');
    }

    // Clear cart and voucher after successful order
    localStorage.removeItem('checkoutItems');
    localStorage.removeItem('currentVoucher');
    localStorage.removeItem('cart');
    localStorage.removeItem('calculatedShippingFee');

    return data.order_id;
}









function showPaymentOptions(connectPayId, overlay, paymentInfo, errorMessage = null) {
    overlay.innerHTML = `
        <div class="payment-confirmation-box">
            <h2>${errorMessage ? '⚠️ Payment Error' : '❌ Payment Not Completed'}</h2>
            ${errorMessage ? `<p>${errorMessage}</p>` : `
                <p>Your payment is still pending or was not processed.</p>
                ${paymentInfo ? `
                    <p><strong>Status:</strong> ${paymentInfo.OrderStatus}</p>
                    <p><strong>Due Date:</strong> ${new Date(paymentInfo.order_duedate).toLocaleString()}</p>
                    <p><strong>Amount Payable:</strong> ${paymentInfo.AmountPayable}</p>
                ` : ''}
            `}
            <div class="payment-confirmation-buttons">
                <button class="confirm-payment-btn">Retry Payment</button>
                <button class="cancel-payment-btn">Start New Payment</button>
            </div>
        </div>
    `;

    // Button listeners
    const confirmBtn = overlay.querySelector('.confirm-payment-btn');
    const cancelBtn = overlay.querySelector('.cancel-payment-btn');

    confirmBtn.addEventListener('click', () => {
        // Remove overlay and let the user complete the payment
        document.body.removeChild(overlay);
    });

    cancelBtn.addEventListener('click', () => {
        localStorage.removeItem('connectPayId');
        document.body.removeChild(overlay);
        location.reload();
    });
}


















