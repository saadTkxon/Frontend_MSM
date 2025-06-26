async function fetchRefundData() {
    try {
        console.log('Fetching refund data...'); // Debug log
        const authToken = localStorage.getItem("auth_token");
        if (!authToken) {
            console.log('No auth token, redirecting to login'); // Debug log
            window.location.href = "/msm_kosmetika_fin/admin-login.html";
            return;
        }

        // Show loading indicator
        document.querySelector('.loading').style.display = 'flex';

        const response = await fetch('http://localhost:5000/products/admin/refunds', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${authToken}`
            }
        });

        console.log('Response status:', response.status); // Debug log

        if (!response.ok) {
            throw new Error('Failed to fetch refund data');
        }

        const data = await response.json();
        console.log('Refund data received:', data); // Debug log

        if (data.status && data.refunds && data.refunds.length > 0) {
            // Filter refunds to only show "pending" (in-process) status
            const inProcessRefunds = data.refunds.filter(refund => refund.status === 'paid');
            
            if (inProcessRefunds.length > 0) {
                console.log('Displaying in-process refund data...'); // Debug log
                displayRefundData(inProcessRefunds);
            } else {
                console.log('No in-process refunds found, showing empty state'); // Debug log
                document.querySelector('.empty').style.display = 'table-row';
                document.querySelectorAll('.tableOneOrder').forEach(row => {
                    row.style.display = 'none';
                });
            }
        } else {
            console.log('No refunds found, showing empty state'); // Debug log
            document.querySelector('.empty').style.display = 'table-row';
            document.querySelectorAll('.tableOneOrder').forEach(row => {
                row.style.display = 'none';
            });
        }
    } catch (error) {
        console.error('Error fetching refund data:', error);
        showAlert('Failed to load refund data. Please try again.');
    } finally {
        // Hide loading indicator
        document.querySelector('.loading').style.display = 'none';
    }
}

// Function to display refund data in the table
function displayRefundData(refunds) {
    const tableBody = document.querySelector('.ordersTable');
    const emptyRow = document.querySelector('.empty');
    
    // Hide empty row if shown
    emptyRow.style.display = 'none';
    
    // Remove existing rows (keep only the header and empty row)
    document.querySelectorAll('.tableOneOrder').forEach(row => row.remove());
    
    // Add new rows for each refund
    refunds.forEach(refund => {
        const row = document.createElement('tr');
        row.className = 'tableOneOrder';
        
        // Format the date
        const requestedDate = new Date(refund.requested_at);
        const formattedDate = requestedDate.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
        const formattedTime = requestedDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        // Set status to "in-process" since we're filtering for pending refunds
        const statusText = 'in-process';
        const statusClass = 'in-process';
        
        row.innerHTML = `
            <td>
                <div class="orderSelection">
                    <input type="checkbox" id="selectOrder${refund.refund_id}">
                    <label for="selectOrder${refund.refund_id}"><span class="circle"></span></label>
                </div>
            </td>
            <td class="orderCell">
                <button type="button" onclick="openCancelledOrderDets('${refund.order_id}')">
                    #<span>${refund.order_id}</span>
                </button>
            </td>
            <td>Rs. <span>${refund.refund_amount.toFixed(2)}</span></td>
            <td>free</td>
            <td><span>1</span>x</td>
            <td>N/A</td>
            <td class="${statusClass}">${statusText}</td>
            <td class="placedOnCell">Placed on:&nbsp;<span>${formattedDate} ${formattedTime}</span></td>
            <td>
                <div class="orderActionArea" data-refund-id="${refund.refund_id}">
                    <select class="statusSelect">
                        <option value="">Action</option>
                        <option value="paid">Set as paid</option>
                        <option value="rejected">Set as rejected</option>
                    </select>
                    <button class="updateStatusBtn">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path fill="none" stroke="currentColor" d="M20.409 9.353a2.998 2.998 0 0 1 0 5.294L7.597 21.614C5.534 22.737 3 21.277 3 18.968V5.033c0-2.31 2.534-3.769 4.597-2.648z"></path>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });

    // Add event listeners to all update buttons
    document.querySelectorAll('.updateStatusBtn').forEach(button => {
        button.addEventListener('click', function() {
            const actionArea = this.closest('.orderActionArea');
            const refundId = actionArea.getAttribute('data-refund-id');
            const select = actionArea.querySelector('.statusSelect');
            const status = select.value;
            
            if (!status) {
                showAlert('Please select an action first');
                return;
            }
            
            updateRefundStatus(refundId, status);
        });
    });
}

// Function to show alert message
function showAlert(message) {
    const alertDiv = document.querySelector('.alert');
    if (alertDiv) {
        const p = alertDiv.querySelector('p');
        if (p) p.textContent = message;
        alertDiv.style.display = 'block';
        
        setTimeout(() => {
            alertDiv.style.display = 'none';
        }, 5000);
    }
}

// Function to fetch and display order details
async function openCancelledOrderDets(orderId) {
    try {
        console.log('Opening order details for:', orderId); // Debug log
        const authToken = localStorage.getItem("auth_token");
        if (!authToken) {
            window.location.href = "/msm_kosmetika_fin/admin-login.html";
            return;
        }

        // Fetch order details from API
        const response = await fetch(`http://localhost:5000/products/admin/refund-order-details?order_id=${orderId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${authToken}`
            }
        });

        console.log('Order details response:', response.status); // Debug log

        if (!response.ok) {
            throw new Error('Failed to fetch order details');
        }

        const data = await response.json();
        console.log('Order details data:', data); // Debug log

        if (data.status && data.data) {
            displayOrderDetails(data.data);
            // Use the single modal you have in HTML
            document.querySelector('.cancelledOrderDets').style.transform = "translateY(0%)";
        } else {
            showAlert('No order details found');
        }
    } catch (error) {
        console.error('Error fetching order details:', error);
        showAlert('Failed to load order details. Please try again.');
    } finally {
        // Hide loading indicator
        document.querySelector('.loading').style.display="none";
    }
}

// Function to update refund status
async function updateRefundStatus(refundId, status) {
    try {
        console.log('Updating refund status:', refundId, status); // Debug log
        const authToken = localStorage.getItem("auth_token");
        if (!authToken) {
            window.location.href = "/msm_kosmetika_fin/admin-login.html";
            return;
        }

        // Show loading indicator
        document.querySelector('.loading').style.display = 'flex';

        const response = await fetch('http://localhost:5000/products/admin/refunds/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({
                refund_id: refundId,
                refund_status: status
            })
        });

        console.log('Update response:', response.status); // Debug log

        if (!response.ok) {
            throw new Error('Failed to update refund status');
        }

        const data = await response.json();
        console.log('Update response data:', data); // Debug log

        if (data.status) {
            showAlert(`Refund status updated to ${status}`);
            // Refresh the refund data
            fetchRefundData();
        } else {
            throw new Error(data.message || 'Update failed');
        }
    } catch (error) {
        console.error('Error updating refund status:', error);
        showAlert(`Failed to update refund status: ${error.message}`);
    } finally {
        // Hide loading indicator
        document.querySelector('.loading').style.display = 'none';
    }
}

// Function to display order details
function displayOrderDetails(orderData) {
    console.log('Displaying order details:', orderData);
    
    // First, make sure the modal is visible
    const orderDetailsModal = document.querySelector('.cancelledOrderDets');
    orderDetailsModal.style.display = 'block';
    orderDetailsModal.style.transform = "translateY(0%)";
    orderDetailsModal.style.opacity = 1;

    // Helper function to safely update element text
    const updateElementText = (selector, text) => {
        const element = document.querySelector(selector);
        if (element) element.textContent = text;
    };

    // Helper function to safely set HTML content
    const updateElementHTML = (selector, html) => {
        const element = document.querySelector(selector);
        if (element) element.innerHTML = html;
    };

    // Update order information
    updateElementText('.orderDets h1 span', orderData.order.order_id);
    
    const orderDate = new Date(orderData.order.date);
    updateElementText('.orderDets h2 span:nth-child(1)', 
        orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
    updateElementText('.orderDets h2 span:nth-child(2)', 
        orderDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));

    // Update status
    updateElementText('.orderStatus h2', orderData.order.status);

    // Update cancellation reason and refund information
    if (orderData.refund) {
        const refundStatus = orderData.refund.status === 'pending' ? 'in-process' : orderData.refund.status;
        updateElementText('.cancelOrderReason h2 span', refundStatus);
        
        // Update refund amount
        updateElementHTML('.cancelOrderReason p', `Refund amount: Rs. ${orderData.refund.amount.toFixed(2)}`);
        
        // Update requested by and date
        const requestedDate = new Date(orderData.refund.requested_at);
        updateElementHTML('.cancelOrderReason h2 small:nth-child(3)', 
            `Requested by <span>${orderData.refund.user_name}</span> - ${requestedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ${requestedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}`);
    }

    // Set refund ID in the action area
    if (orderData.refund) {
        const actionArea = document.querySelector('.cancelledOrderDets .orderActionArea');
        if (actionArea) {
            actionArea.setAttribute('data-refund-id', orderData.refund.refund_id);
        }
    }

    // Update cancellation reason
    updateElementHTML('.cancelOrder h1', `Cancellation reason: ${orderData.order.cancellation_reason || 'Not specified'}`);

    // Update user information
    if (orderData.refund) {
        updateElementText('.orderAddress h2:nth-child(1) span', orderData.refund.user_id);
        updateElementText('.orderAddress h2:nth-child(2) span', orderData.refund.user_email);
        updateElementText('.orderAddress p span:nth-child(1)', orderData.refund.user_name);
    }

    // Update bill information
    updateElementText('.orderBillDets .oneDet:nth-child(1) h1 span', (orderData.order.total_amount || 0).toFixed(2));
    updateElementText('.orderBillDets .oneDet:nth-child(1) h2 span', orderData.order.item_count);
    
    // Set shipping cost (assuming it's fixed or you might need to get it from API)
    updateElementText('.orderBillDets .oneDet:nth-child(2) h1 span', '280');
    
    // Update total (same as subtotal in this case)
    updateElementText('.orderBillDets .oneDet:nth-child(4) h1 span', (orderData.order.total_amount || 0).toFixed(2));

    // Update payment reference if available
    if (orderData.refund && orderData.refund.order_payment_reference) {
        updateElementHTML('.orderBillDets .oneDet:last-child h1', 
            `Payment Reference: ${orderData.refund.order_payment_reference}`);
    }

    // Clear existing products
    const productsContainer = document.querySelector('.orderedProductsHere');
    if (productsContainer) {
        productsContainer.innerHTML = '';

        // Add products to the container
        orderData.items.forEach(item => {
            const productDiv = document.createElement('div');
            productDiv.className = 'oneProduct';
            
            // Create variations string if they exist
            let variationsHTML = '';
            if (item.variations && item.variations.length > 0) {
                variationsHTML = `
                    <div class="variations">
                        <p>${item.variations.map(v => `<span>${v}</span>`).join(' - ')}</p>
                    </div>
                `;
            }
            
            productDiv.innerHTML = `
                <div class="itemImageBox">
                    <img src="/MSM_Backend/images/${item.image}" alt="${item.title}" onerror="this.src='/assets/products/default.jpg'">
                </div>
                <div class="itemDets">
                    <h1>${item.title}</h1>
                    ${variationsHTML}
                    <div class="totalPricePlusQty">
                        <p>Total price:&nbsp;&nbsp;<span>${item.total_price.toFixed(2)}</span></p>
                        <p>Qty:&nbsp;&nbsp;<span>${item.quantity}</span></p>
                    </div>
                </div>
            `;
            
            productsContainer.appendChild(productDiv);
        });
    }
}

function closeCancelledOrderDets() {
    document.querySelector('.cancelledOrderDets').style.display = 'none';
}

// Add this event listener at the bottom of your script
document.querySelector('.cancelledOrderDets form').addEventListener('submit', function(e) {
    e.preventDefault(); // This stops the form from submitting and reloading the page
});

// Add this at the bottom of your script
document.querySelector('.cancelledOrderDets .updateStatusBtn')?.addEventListener('click', function() {
    const actionArea = this.closest('.orderActionArea');
    const refundId = actionArea.getAttribute('data-refund-id');
    const select = actionArea.querySelector('.statusSelect');
    const status = select.value;
    
    if (!status) {
        showAlert('Please select an action first');
        return;
    }
    
    updateRefundStatus(refundId, status);
});

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', fetchRefundData);

// Make functions available globally
window.openCancelledOrderDets = openCancelledOrderDets;
window.closeCancelledOrderDets = closeCancelledOrderDets;
window.updateRefundStatus = updateRefundStatus;