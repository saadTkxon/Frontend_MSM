document.addEventListener('DOMContentLoaded', function() {
    // Fetch orders data when the page loads with default duration (30 days)
    fetchOrders('shipped', 30);
    
    // Add event listener for select all checkbox
    const selectAllCheckbox = document.getElementById('selectAllOrders');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.orderSelection input[type="checkbox"]:not(#selectAllOrders)');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
            updateSelectedCount();
        });
    }

    // Add event listener for individual checkboxes to update select all
    // Add this to your existing code, preferably in the DOMContentLoaded event listener
document.addEventListener('change', function(e) {
    if (e.target.matches('.orderSelection input[type="checkbox"]:not(#selectAllOrders)')) {
        updateSelectedCount();
        checkSelectAllState();
        
        // Update the hidden input with the selected order ID
        const checkbox = e.target;
        const orderId = checkbox.checked ? 
            checkbox.closest('tr').querySelector('.orderCell span').textContent : 
            '';
            
        document.getElementById('order_id_hidden').value = orderId;
    }
});

    // Add event listener for status update action
    const statusActionSelect = document.querySelector('.tableActionArea select');
    const statusActionButton = document.querySelector('.tableActionArea button');
    if (statusActionSelect && statusActionButton) {
        statusActionButton.addEventListener('click', function(e) {
            e.preventDefault();
            const selectedStatus = statusActionSelect.value;
            if (!selectedStatus || selectedStatus === 'Action') return;
            
            const statusMap = {
                'Set delivered': 'delivered',
                'Set cancelled': 'cancelled',
                'Set failed delivery': 'failed delivery',
                'Set returned': 'returned'
            };
            
            const status = statusMap[selectedStatus];
            if (!status) return;
            
            updateSelectedOrdersStatus(status);
        });
    }

    // Add event listener for search
    const searchInput = document.querySelector('.searchFilter input');
    const searchButton = document.querySelector('.searchFilter button');
    if (searchInput && searchButton) {
        searchButton.addEventListener('click', function(e) {
            e.preventDefault();
            const orderId = searchInput.value.trim();
            if (orderId) {
                searchOrderById(orderId);
            } else {
                // If search is empty, fetch all orders again
                const currentStatus = document.querySelector('.orderCategoriesButtons a[aria-selected="true"]')
                    .getAttribute('href').split('-').pop().replace('.html', '');
                const duration = document.querySelector('.durationFilter').value || 30;
                fetchOrders(currentStatus, duration);
            }
        });
        
        // Also allow Enter key to trigger search
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const orderId = searchInput.value.trim();
                if (orderId) {
                    searchOrderById(orderId);
                } else {
                    // If search is empty, fetch all orders again
                    const currentStatus = document.querySelector('.orderCategoriesButtons a[aria-selected="true"]')
                        .getAttribute('href').split('-').pop().replace('.html', '');
                    const duration = document.querySelector('.durationFilter').value || 30;
                    fetchOrders(currentStatus, duration);
                }
            }
        });
    }

    // Add event listener for sort
    const sortSelect = document.querySelector('.sortFilter');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const currentStatus = document.querySelector('.orderCategoriesButtons a[aria-selected="true"]')
                .getAttribute('href').split('-').pop().replace('.html', '');
            const duration = document.querySelector('.durationFilter').value || 30;
            fetchOrders(currentStatus, duration);
        });
    }

    // Add event listener for duration filter
    const durationFilter = document.querySelector('.durationFilter');
    if (durationFilter) {
        durationFilter.addEventListener('change', function() {
            const currentStatus = document.querySelector('.orderCategoriesButtons a[aria-selected="true"]')
                .getAttribute('href').split('-').pop().replace('.html', '');
            const durationMap = {
                'Last 30 days': 30,
                'Last 60 days': 60,
                'Last 90 days': 90,
                'Last 6 months': 180,
                'Last 1 year': 365
            };
            const days = durationMap[this.value] || 30;
            fetchOrders(currentStatus, days);
        });
    }








// Add popstate event listener for back/forward navigation
window.addEventListener('popstate', function(event) {
    if (event.state) {
        const { status, duration } = event.state;
        const path = `/msm_kosmetika_fin/admin-orders-${status}.html`;
        
        // Find and activate the corresponding button
        const activeButton = document.querySelector(`.orderCategoriesButtons a[href="${path}"]`);
        if (activeButton) {
            categoryButtons.forEach(btn => btn.setAttribute('aria-selected', 'false'));
            activeButton.setAttribute('aria-selected', 'true');
            fetchOrders(status, duration);
        }
    } else {
        handleInitialLoad();
    }
});

// Call this on initial page load
document.addEventListener('DOMContentLoaded', handleInitialLoad);
});

function fetchOrders(status, days = 30) {
    const authToken = localStorage.getItem("auth_token");
    const url = 'http://localhost:5000/products/ADMIN/get-orders-by-status';
    const sortOrder = document.querySelector('.sortFilter').value;
    
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ 
            status: status,
            sort: sortOrder === 'Oldest order first' ? 'asc' : 'desc', // default is newest first
            days: days
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        renderOrders(data.data);
    })
    .catch(error => {
        console.error('Error fetching orders:', error);
        // Show empty state if there's an error or no data
        showEmptyState();
    });
}



function searchOrderById(orderId) {
    console.log("🔍 Searching for order with ID:", orderId);

    const authToken = localStorage.getItem("auth_token");
    console.log("🛡️ Retrieved Auth Token:", authToken);

    const url = 'http://localhost:5000/products/ADMIN/search-order';
    console.log("📡 Sending request to:", url);

    const requestData = { order_id: orderId };
    console.log("📦 Request Body:", requestData);

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify(requestData)
    })
    .then(response => {
        console.log("📥 Response Status:", response.status);
        if (!response.ok) {
            throw new Error('❌ Network response was not ok');
        }
        return response.json();
    })
    // In your searchOrderById function:
.then(data => {
    
    if (data.order) {

          // Get current page category from the active tab
          const currentPageCategory = document.querySelector('.orderCategoriesButtons a[aria-selected="true"]')
          ?.getAttribute('href')?.split('-').pop()?.replace('.html', '') || 'all';
      
      // Check if order status matches current page category
      if (currentPageCategory !== 'shipped' && data.order.status.toLowerCase() !== currentPageCategory.toLowerCase()) {
          console.warn("⚠️ Order found but doesn't match current page category");
          showEmptyState(`Order found but doesn't match ${currentPageCategory} category`);
          return;
      }
        // Normalize the data to match the expected structure
        const normalizedOrder = {
            order_info: {
                order_id: data.order.order_id,
                order_date: data.order.order_date,
                status: data.order.status
            },
            order_summary: data.order.summary || {
                shipping: data.order.shipping_fee || 0,
                total: data.order.total_amount || 0,
                item_count: data.order.items ? data.order.items.length : 0
            },
            voucher: data.order.voucher,
            items: data.order.items // Make sure items are included
        };
        renderOrders([normalizedOrder]);
    } else {
        console.warn("⚠️ No order data found for this ID");
        showEmptyState("No order found with ID: " + orderId);
    }
})
    .catch(error => {
        console.error("🚨 Error searching order:", error.message);
        showEmptyState("Error searching for order");
    });
}









document.addEventListener('DOMContentLoaded', function() {
    // Add event listener for status update action
    const statusActionSelect = document.getElementById('status_action_select');
    const statusActionButton = document.getElementById('status_update_button');
    
    if (statusActionSelect && statusActionButton) {
        statusActionButton.addEventListener('click', function(e) {
            e.preventDefault();
            const selectedStatus = statusActionSelect.value;
            
            if (!selectedStatus || selectedStatus === 'Action') {
                showNotification('Please select an action first', 'error');
                return;
            }
            
            // Get all selected checkboxes (excluding the "select all" checkbox)
            const selectedCheckboxes = document.querySelectorAll('.orderSelection input[type="checkbox"]:checked:not(#selectAllOrders)');
            
            if (selectedCheckboxes.length === 0) {
                showNotification('Please select at least one order first', 'error');
                return;
            }
            
            // Prepare the orders array for the API
            const ordersToUpdate = Array.from(selectedCheckboxes).map(checkbox => {
                const orderId = checkbox.closest('tr').querySelector('.orderCell span').textContent;
                return {
                    order_id: parseInt(orderId),
                    status: selectedStatus.toLowerCase() // Ensure status is in lowercase if needed
                };
            });
            
            const authToken = localStorage.getItem("auth_token");
            const url = 'http://localhost:5000/products/ADMIN/update-multiple-order-status';
            
            // Make a single API call with all orders
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${authToken}`
                },
                body: JSON.stringify({ 
                    orders: ordersToUpdate 
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Orders updated successfully:', data);
                showNotification(`Updated ${ordersToUpdate.length} order(s) to ${selectedStatus}`, 'success');
                
                // Refresh the current view
                const currentStatus = document.querySelector('.orderCategoriesButtons a[aria-selected="true"]')
                    .getAttribute('href').split('-').pop().replace('.html', '');
                const duration = document.querySelector('.durationFilter').value || 30;
                fetchOrders(currentStatus, duration);
                
                // Reset the select and checkboxes
                statusActionSelect.value = 'Action';
                document.getElementById('selectAllOrders').checked = false;
                selectedCheckboxes.forEach(checkbox => {
                    checkbox.checked = false;
                });
                updateSelectedCount();
            })
            .catch(error => {
                console.error('Error updating order status:', error);
                showNotification('Failed to update orders', 'error');
            });
        });
    } else {
        console.error('Could not find status action elements');
    }
});

async function fetchTrackingDetails(orderId) {
    const authToken = localStorage.getItem("auth_token");
    const url = 'http://localhost:5000/products/ADMIN/get-tracking-details';
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({ order_id: parseInt(orderId) })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.tracking_info || null;
    } catch (error) {
        console.error('Error fetching tracking details:', error);
        return null;
    }
}







// function renderOrders(orders) {
//     const ordersTable = document.querySelector('.ordersTable');
//     const tbody = ordersTable.querySelector('tbody') || ordersTable;
    
//     // Clear existing rows (except the heading row and empty state row)
//     const rowsToRemove = Array.from(tbody.querySelectorAll('tr:not(.tableHeading):not(.empty)'));
//     rowsToRemove.forEach(row => row.remove());
    
//     if (!orders || orders.length === 0) {
//         showEmptyState("No orders found");
//         return;
//     }
    
//     // Hide empty state if it's visible
//     const emptyRow = tbody.querySelector('tr.empty');
//     if (emptyRow) emptyRow.style.display = 'none';
    
//     // Add each order to the table
//     orders.forEach((order, index) => {
//         const orderId = order.order_info.order_id;
//         const status = order.order_info.status.toLowerCase();
//         const date = new Date(order.order_info.order_date);
//         const formattedDate = formatDate(date);
        
//         const shippingFee = order.order_summary.shipping;
//         const shippingText = shippingFee === 0 ? 'free' : `Rs. ${shippingFee}.00`;
        
//         const voucher = order.voucher ? order.voucher.voucher_name : 'N/A';
        
//   // Get item count - fallback to items.length if not in summary
//   const itemCount = order.order_summary.item_count || 
//   (order.items ? order.items.length : 0);


//         const row = document.createElement('tr');
//         row.className = 'tableOneOrder';
//         row.innerHTML = `
//             <td>
//                 <div class="orderSelection">
//                     <input type="checkbox" id="selectOrder${index}">
//                     <label for="selectOrder${index}"><span class="circle"></span></label>
//                 </div>
//             </td>
//             <td class="orderCell"><button type="button">#<span>${orderId}</span></button></td>
//             <td>Rs. <span>${order.order_summary.total.toFixed(2).replace('.00', '')}</span></td>
//             <td>${shippingText}</td>
//               <td><span>${itemCount}</span>x</td>
//             <td>${voucher}</td>
//             <td>${status}</td>
//             <td class="placedOnCell">Placed on:&nbsp;<span>${formattedDate}</span></td>
//         `;
        
//         // Add click handler to the order cell
//         const orderCell = row.querySelector('.orderCell button');
//         orderCell.addEventListener('click', function() {
//             console.log('Order ID clicked:', orderId);
//             openOrderDetails(orderId, status);
//         });
        
//         tbody.appendChild(row);
//     });
// }



function renderOrders(orders) {
    const ordersTable = document.querySelector('.ordersTable');
    const tbody = ordersTable.querySelector('tbody') || ordersTable;
    const sortOrder = document.querySelector('.sortFilter').value;
    
    // Clear existing rows (except the heading row and empty state row)
    const rowsToRemove = Array.from(tbody.querySelectorAll('tr:not(.tableHeading):not(.empty)'));
    rowsToRemove.forEach(row => row.remove());
    
    if (!orders || orders.length === 0) {
        showEmptyState("No orders found");
        return;
    }
    
    // Sort orders based on the selected option
    const sortedOrders = [...orders].sort((a, b) => {
        const dateA = new Date(a.order_info.order_date);
        const dateB = new Date(b.order_info.order_date);
        
        if (sortOrder === 'oldest') {
            return dateA - dateB; // Oldest first
        } else {
            return dateB - dateA; // Newest first (default)
        }
    });
    
    // Hide empty state if it's visible
    const emptyRow = tbody.querySelector('tr.empty');
    if (emptyRow) emptyRow.style.display = 'none';
    
    // Add each order to the table
    sortedOrders.forEach((order, index) => {
        const orderId = order.order_info.order_id;
        const status = order.order_info.status.toLowerCase();
        const date = new Date(order.order_info.order_date);
        const formattedDate = formatDate(date);
        
        const shippingFee = order.order_summary.shipping;
        const shippingText = shippingFee === 0 ? 'free' : `Rs. ${shippingFee}.00`;
        
        const voucher = order.voucher ? order.voucher.voucher_name : 'N/A';
        
        const itemCount = order.order_summary.item_count || 
            (order.items ? order.items.length : 0);

        const row = document.createElement('tr');
        row.className = 'tableOneOrder';
        row.innerHTML = `
            <td>
                <div class="orderSelection">
                    <input type="checkbox" id="selectOrder${index}">
                    <label for="selectOrder${index}"><span class="circle"></span></label>
                </div>
            </td>
            <td class="orderCell"><button type="button">#<span>${orderId}</span></button></td>
            <td>Rs. <span>${order.order_summary.total.toFixed(2).replace('.00', '')}</span></td>
            <td>${shippingText}</td>
            <td><span>${itemCount}</span>x</td>
            <td>${voucher}</td>
            <td>${status}</td>
            <td class="placedOnCell">Placed on:&nbsp;<span>${formattedDate}</span></td>
        `;
        
        // Add click handler to the order cell
        const orderCell = row.querySelector('.orderCell button');
        orderCell.addEventListener('click', function() {
            console.log('Order ID clicked:', orderId);
            openOrderDetails(orderId, status);
        });
        
        tbody.appendChild(row);
    });
}





async function fetchCancelledOrderDetails(orderId) {
    const authToken = localStorage.getItem("auth_token");
    const url = 'http://localhost:5000/products/ADMIN/cancelled-order-details';
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({ order_id: parseInt(orderId) })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.cancelled_order;
    } catch (error) {
        console.error('Error fetching cancelled order details:', error);
        return null;
    }
}

// Function to send tracking details to API
function sendTrackingDetails(orderId, trackingId, courierService) {
    const authToken = localStorage.getItem("auth_token");
    const url = 'http://localhost:5000/products/ADMIN/add-tracking-details';
    
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
            order_id: parseInt(orderId),
            tracking_id: trackingId,
            courier_service_name: courierService
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Tracking details added successfully:', data);
        showNotification('Tracking details added successfully', 'success');
        
        // Close the order details panel and refresh the view
        closeInProcessOrderDets();
        
        // Refresh the current view
        const currentStatus = document.querySelector('.orderCategoriesButtons a[aria-selected="true"]')
            .getAttribute('href').split('-').pop().replace('.html', '');
        const duration = document.querySelector('.durationFilter').value || 30;
        fetchOrders(currentStatus, duration);
    })
    .catch(error => {
        console.error('Error adding tracking details:', error);
        showNotification('Failed to add tracking details', 'error');
    });
}


function showEmptyState(message = "No orders found") {
    const ordersTable = document.querySelector('.ordersTable');
    const emptyRow = ordersTable.querySelector('tr.empty');
    
    if (emptyRow) {
        emptyRow.style.display = 'table-row';
        emptyRow.querySelector('span').textContent = message.toLowerCase();
    } else {
        // Create empty row if it doesn't exist
        const emptyRow = document.createElement('tr');
        emptyRow.className = 'empty';
        emptyRow.innerHTML = `
            <td colspan="8">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <g fill="none" stroke="currentColor">
                        <path d="M2 12c0-4.714 0-7.071 1.464-8.536C4.93 2 7.286 2 12 2s7.071 0 8.535 1.464C22 4.93 22 7.286 22 12s0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12Z"/>
                        <path stroke-linecap="round" d="M2 13h3.16c.905 0 1.358 0 1.756.183s.692.527 1.281 1.214l.606.706c.589.687.883 1.031 1.281 1.214s.85.183 1.756.183h.32c.905 0 1.358 0 1.756-.183s.692-.527 1.281-1.214l.606-.706c.589-.687.883-1.031 1.281-1.214S17.934 13 18.84 13H22"/>
                    </g>
                </svg>
                <span>${message.toLowerCase()}</span>
            </td>
        `;
        ordersTable.appendChild(emptyRow);
    }
}

function formatDate(date) {
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;
}

function updateSelectedCount() {
    const selectedCount = document.querySelectorAll('.orderSelection input[type="checkbox"]:checked:not(#selectAllOrders)').length;
    const countElement = document.querySelector('.selectedCount');
    if (countElement) {
        countElement.textContent = selectedCount > 0 ? `${selectedCount} selected` : '';
    }
}

function checkSelectAllState() {
    const selectAllCheckbox = document.getElementById('selectAllOrders');
    if (!selectAllCheckbox) return;
    
    const checkboxes = document.querySelectorAll('.orderSelection input[type="checkbox"]:not(#selectAllOrders)');
    const allChecked = checkboxes.length > 0 && Array.from(checkboxes).every(checkbox => checkbox.checked);
    
    selectAllCheckbox.checked = allChecked;
    selectAllCheckbox.indeterminate = !allChecked && Array.from(checkboxes).some(checkbox => checkbox.checked);
}

function showNotification(message, type = 'info') {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}



// Add this function to handle fetching order details
async function fetchOrderDetails(orderId) {
    const authToken = localStorage.getItem("auth_token");
    const url = 'http://localhost:5000/products/ADMIN/get-order-details';
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({ order_id: orderId })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        console.log('Fetched order details:', data); // 👉 Log the entire response data for debugging

        return data.order; // Return the order details
    } catch (error) {
        console.error('Error fetching order details:', error);
        showNotification('Failed to fetch order details', 'error');
        return null;
    }
}

async function openOrderDetails(orderId, status) {
    const order = await fetchOrderDetails(orderId);
    if (!order) return;

    // First, ensure all panels are hidden (using transform/opacity like your working version)
    document.querySelectorAll('.orderDetailsArea').forEach(panel => {
        panel.style.transform = "translateY(110%)";
        panel.style.opacity = 0;
    });

    // Store the order ID in local storage
    localStorage.setItem('currentOrderId', orderId);

    // Determine which panel to show based on status
    let panelSelector;
    switch(status.toLowerCase()) {
        case 'in-process':
        case 'placed':
            panelSelector = '.inProcessOrderDets';
            break;
        case 'shipped':
            panelSelector = '.shippedOrderDets';
            break;
        case 'delivered':
            panelSelector = '.deliveredOrderDets';
            break;
        case 'failed delivery':
            panelSelector = '.failedDeliveryOrderDets';
            break;
        case 'cancelled':
            panelSelector = '.cancelledOrderDets';
            break;
        case 'returned':
            panelSelector = '.returnedOrderDets';
            break;
        default:
            panelSelector = '.inProcessOrderDets';
    }

    // Show the appropriate panel
    const orderDetailsPanel = document.querySelector(panelSelector);
    if (orderDetailsPanel) {
        orderDetailsPanel.style.transform = "translateY(0%)";
        orderDetailsPanel.style.opacity = 1;
        // Populate the order details in the panel
        populateOrderDetails(order, orderDetailsPanel, status);
    } else {
        console.error('Could not find order details panel with selector:', panelSelector);
    }
}

async function populateOrderDetails(order, panel, status) {
    // Basic order info
    panel.querySelector('.orderDets h1 span').textContent = order.order_id;
    const orderDate = new Date(order.order_date);
    panel.querySelector('.orderDets h2 span:nth-child(1)').textContent = formatDateShort(orderDate);
    panel.querySelector('.orderDets h2 span:nth-child(2)').textContent = formatTime(orderDate);
    
    // Status
    panel.querySelector('.orderStatus h2').textContent = status.toLowerCase();
    
    // Address
    const address = order.address || order.user;
    panel.querySelector('.addressUsed h2 span').textContent = address.email || order.user.email;
    panel.querySelector('.addressUsed p span:nth-child(1)').textContent = 
        `${address.first_name || ''} ${address.last_name || ''}`.trim();
    panel.querySelector('.addressUsed p span:nth-child(2)').textContent = address.phone_number;
    
    if (order.address) {
        panel.querySelector('.usedAddressArea h2').textContent = order.address.address_type;
        panel.querySelector('.usedAddressArea p span:nth-child(1)').textContent = order.address.address;
        panel.querySelector('.usedAddressArea p span:nth-child(2)').textContent = order.address.city;
        panel.querySelector('.usedAddressArea p span:nth-child(3)').textContent = order.address.postal_code;
    } else {
        // Fallback to user info if address not available
        panel.querySelector('.usedAddressArea h2').textContent = 'user';
        panel.querySelector('.usedAddressArea p span:nth-child(1)').textContent = '';
        panel.querySelector('.usedAddressArea p span:nth-child(2)').textContent = address.city;
        panel.querySelector('.usedAddressArea p span:nth-child(3)').textContent = address.postal_code;
    }
    
    // Order summary
    const summary = order.summary;
    panel.querySelector('.orderBillDets .oneDet:nth-child(1) h1 span').textContent = summary.subtotal.toFixed(2).replace('.00', '');
    panel.querySelector('.orderBillDets .oneDet:nth-child(1) h2 span').textContent = order.item_count;
    
    panel.querySelector('.orderBillDets .oneDet:nth-child(2) h1 span').textContent = summary.shipping.toFixed(2).replace('.00', '');
    
    if (order.voucher) {
        panel.querySelector('.orderBillDets .oneDet:nth-child(3) h2 span').textContent = order.voucher.voucher_name;
        panel.querySelector('.orderBillDets .oneDet:nth-child(3) h1 span:nth-child(2)').textContent = 
            (summary.discount || 0).toFixed(2).replace('.00', '');
    } else {
        panel.querySelector('.orderBillDets .oneDet:nth-child(3) h2 span').textContent = 'N/A';
        panel.querySelector('.orderBillDets .oneDet:nth-child(3) h1 span:nth-child(2)').textContent = '0';
    }
    
    panel.querySelector('.orderBillDets .oneDet:nth-child(5) h1 span').textContent = summary.total.toFixed(2).replace('.00', '');
    
    // // Payment method
    // const paymentMethod = order.payment ? order.payment.method : 'cash on delivery';
    // panel.querySelector('.orderBillDets .oneDet:nth-child(6) h1').textContent = paymentMethod.toLowerCase();
    

// Payment method
let paymentMethod;
let paymentReference = ''; // Initialize reference as empty

if (order.payment) {
    // Check if payment reference exists and is not null
    if (order.payment.reference && order.payment.reference !== 'null' && order.payment.reference !== null) {
        paymentMethod = 'online payment';
        paymentReference = ` (Ref: ${order.payment.reference})`; // Add reference
    } else {
        paymentMethod = 'cash on delivery';
    }
} else {
    // Fallback to status check if payment object doesn't exist
    paymentMethod = order.status === 'online_payment' ? 'online payment' : 'cash on delivery';
}




    // Products
    const productsContainer = panel.querySelector('.orderedProductsHere');
    productsContainer.innerHTML = ''; // Clear existing products
    
    order.items.forEach(item => {
        const productElement = document.createElement('div');
        productElement.className = 'oneProduct';
        
        // for temp used
        // const imageUrl= '/msm_kosmetika_fin/assets/branding/logoOne.webp';



        //  Get the first image from the item's images array (or use a placeholder if none exists)
    const imageUrl = item.images && item.images.length > 0 
        ? `/MSM_Backend/images//${item.images[0]}` 
        : '/path/to/placeholder/image.webp';


        productElement.innerHTML = `
            <div class="itemImageBox">
                <img src="${imageUrl}" alt="${item.title}">
            </div>
            <div class="itemDets">
                <h1>${item.title}</h1>
                <div class="variations">
                    <p>${item.selected_variations.map(v => `<span>${v}</span>`).join('&nbsp;-&nbsp;')}</p>
                </div>
                <div class="totalPricePlusQty">
                    <p>Total price:&nbsp;&nbsp;<span>${item.total_price.toFixed(2)}</span></p>
                    <p>Qty:&nbsp;&nbsp;<span>${item.quantity}</span></p>
                </div>
            </div>
        `;
        
        productsContainer.appendChild(productElement);
    });
    
    // Handle cancelled order details
    if (status.toLowerCase() === 'cancelled') {
        const cancelledDetails = await fetchCancelledOrderDetails(order.order_id);
        const cancelReasonElement = panel.querySelector('.cancelOrderReason p');
        const cancelledByElement = panel.querySelector('.cancelOrderReason h2 small span');
        const cancelledAtElement = panel.querySelector('.cancelOrderReason h2 small:nth-child(3)');
        
        if (cancelledDetails) {
            cancelReasonElement.textContent = cancelledDetails.cancelled_reason || 'No reason provided';
            cancelledByElement.textContent = cancelledDetails.cancelled_by || 'unknown';
            
            if (cancelledDetails.cancelled_at) {
                const cancelledDate = new Date(cancelledDetails.cancelled_at);
                cancelledAtElement.textContent = formatDateShort(cancelledDate) + ' ' + formatTime(cancelledDate);
            }
        } else {
            cancelReasonElement.textContent = 'No cancellation details available';
            cancelledByElement.textContent = 'unknown';
            cancelledAtElement.textContent = 'unknown time';
        }
    }

// In your populateOrderDetails function, add this:
if (status.toLowerCase() === 'placed' || status.toLowerCase() === 'in-process') {
    panel.querySelector('.trackAndCancelOrderButtonArea').style.display = 'block';
    
    // Add click handler for cancel button
    const cancelButton = panel.querySelector('.trackAndCancelOrderButtonArea button');
    cancelButton.addEventListener('click', function(e) {
        e.preventDefault();
        openCancelOrder(order.order_id, order.order_date);
    });
} else {
    panel.querySelector('.trackAndCancelOrderButtonArea').style.display = 'none';
}


    
    // Add event listener for the tracking form submission
    const addTrackingForm = document.querySelector('.inProcessOrderDets form');
    if (addTrackingForm) {
        addTrackingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const courierService = document.querySelector('#courierPartner').value;
            const trackingId = document.querySelector('.addTracking input[type="text"]').value;
            const orderId = document.querySelector('.orderDets h1 span').textContent;
            
            if (!courierService || !trackingId) {
                showNotification('Please select courier service and enter tracking ID', 'error');
                return;
            }
            
            sendTrackingDetails(orderId, trackingId, courierService);
        });
    }

    // Also add click handler for the "Add tracking" button as fallback
    const addTrackingButton = document.querySelector('.addTracking button');
    if (addTrackingButton) {
        addTrackingButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            const courierService = document.querySelector('#courierPartner').value;
            const trackingId = document.querySelector('.addTracking input[type="text"]').value;
            const orderId = document.querySelector('.orderDets h1 span').textContent;
            
            if (!courierService || !trackingId) {
                showNotification('Please select courier service and enter tracking ID', 'error');
                return;
            }
            
            // Trigger form submission
            const form = this.closest('form');
            if (form) {
                form.dispatchEvent(new Event('submit'));
            } else {
                sendTrackingDetails(orderId, trackingId, courierService);
            }
        });
    }
 // Fetch tracking details (will be used for all statuses)
 const trackingInfo = await fetchTrackingDetails(order.order_id);
    
 // Handle tracking display for ALL statuses that might have tracking info
 const statusesWithTracking = [
     'in-process', 'placed', 'shipped', 
     'failed delivery', 'returned'
 ];
 
 if (statusesWithTracking.includes(status.toLowerCase())) {
     const trackingContainer = panel.querySelector('.orderTracking');
     const trackingForm = panel.querySelector('.addTracking');
     const existingTrackingDisplay = panel.querySelector('.existingTracking') || 
         document.createElement('div');
     
     existingTrackingDisplay.className = 'existingTracking';
     
     if (trackingInfo) {
         // For all statuses - show tracking info
         if (trackingContainer) {
             trackingContainer.innerHTML = `
                 <h1>Tracking Information</h1>
                 <div class="tracking-details">
                     <p><strong>Courier:</strong> ${trackingInfo.courier_service_name}</p>
                     <p><strong>Tracking ID:</strong> ${trackingInfo.tracking_id}</p>
                    
                 </div>
             `;
         }
         
         // For in-process/placed - hide form and show existing info
         if (status.toLowerCase() === 'in-process' || status.toLowerCase() === 'placed') {
            //  if (trackingForm) trackingForm.style.display = 'none';
             
            //  existingTrackingDisplay.innerHTML = `
            //      <h3>Tracking Already Added</h3>
            //      <p><strong>Courier:</strong> ${trackingInfo.courier_service_name}</p>
            //      <p><strong>Tracking ID:</strong> ${trackingInfo.tracking_id}</p>
            //      <p><em>Status: ${status.toLowerCase()}</em></p>
            //  `;
            //  trackingForm.parentNode.insertBefore(existingTrackingDisplay, trackingForm.nextSibling);
         }
     } else {
         // No tracking info available
         if (trackingContainer) {
             trackingContainer.innerHTML = `
                 <h1>Tracking Information</h1>
                 <p>No tracking information available</p>
             `;
         }
         
         // For in-process/placed - show the form
         if ((status.toLowerCase() === 'in-process' || status.toLowerCase() === 'placed') && trackingForm) {
             trackingForm.style.display = 'block';
             const existingDisplay = panel.querySelector('.existingTracking');
             if (existingDisplay) existingDisplay.remove();
         }
     }
 }




    
    // Additional status-specific elements
    if (status.toLowerCase() === 'shipped' || status.toLowerCase() === 'delivered' || 
        status.toLowerCase() === 'failed delivery' || status.toLowerCase() === 'returned') {
        // Populate tracking info if available
        const trackingElement = panel.querySelector('.orderTracking h2');
        if (trackingElement) {
            trackingElement.textContent = order.tracking_id || 'N/A';
        }
    }
}


// Helper functions for date formatting
function formatDateShort(date) {
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

function formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}
function closeInProcessOrderDets() {
    document.querySelector('.inProcessOrderDets').style.opacity = 0;
    document.querySelector('.inProcessOrderDets').style.transform = "translateY(110%)";
}

function closeShippedOrderDets() {
    document.querySelector('.shippedOrderDets').style.opacity = 0;
    document.querySelector('.shippedOrderDets').style.transform = "translateY(110%)";
}

function closeDeliveredOrderDets() {
    document.querySelector('.deliveredOrderDets').style.opacity = 0;
    document.querySelector('.deliveredOrderDets').style.transform = "translateY(110%)";
}

function closeFailedDeliveryOrderDets() {
    document.querySelector('.failedDeliveryOrderDets').style.opacity = 0;
    document.querySelector('.failedDeliveryOrderDets').style.transform = "translateY(110%)";
}

function closeCancelledOrderDets() {
    document.querySelector('.cancelledOrderDets').style.opacity = 0;
    document.querySelector('.cancelledOrderDets').style.transform = "translateY(110%)";
}

function closeReturnedOrderDets() {
    document.querySelector('.returnedOrderDets').style.opacity = 0;
    document.querySelector('.returnedOrderDets').style.transform = "translateY(110%)";
}

// Add these close functions to the window object so they're accessible from HTML
window.closeInProcessOrderDets = closeInProcessOrderDets;
window.closeShippedOrderDets = closeShippedOrderDets;
window.closeDeliveredOrderDets = closeDeliveredOrderDets;
window.closeFailedDeliveryOrderDets = closeFailedDeliveryOrderDets;
window.closeCancelledOrderDets = closeCancelledOrderDets;
window.closeReturnedOrderDets = closeReturnedOrderDets;


// change the status......



function openCancelOrder(orderId, orderDate) {
    const cancelForm = document.querySelector('.cancelOrderArea');
    
    // Populate the order details
    cancelForm.querySelector('.orderDets h1 span').textContent = orderId;
    
    const date = new Date(orderDate);
    const formattedDate = formatDateShort(date);
    const formattedTime = formatTime(date);
    
    cancelForm.querySelector('.orderDets h2 span:nth-child(1)').textContent = formattedDate;
    cancelForm.querySelector('.orderDets h2 span:nth-child(2)').textContent = formattedTime;
    
    // Show the form
    cancelForm.style.transform = "translateY(0%)";
    cancelForm.style.opacity = 1;
    cancelForm.querySelector('textarea').focus();
}

function closeCancelOrder() {
    const cancelForm = document.querySelector('.cancelOrderArea');
    cancelForm.style.transform = "translateY(110%)";
    cancelForm.style.opacity = 0;
    
    // Clear the form
    cancelForm.querySelector('textarea').value = '';
}

// Add to window object for HTML access
window.openCancelOrder = openCancelOrder;
window.closeCancelOrder = closeCancelOrder;




document.addEventListener('DOMContentLoaded', function() {
    const cancelForm = document.querySelector('.cancelOrderArea form');
    if (cancelForm) {
        cancelForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const orderId = this.querySelector('.orderDets h1 span').textContent;
            const reason = this.querySelector('textarea').value.trim();
            
            if (!reason) {
                showNotification('Please provide a cancellation reason', 'error');
                return;
            }
            
            cancelOrder(orderId, reason);
        });
    }
});

async function cancelOrder(orderId, reason) {
    const authToken = localStorage.getItem("auth_token");
    const url = 'http://localhost:5000/products/Admin/cancel-order';
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({
                order_id: parseInt(orderId),
                cancellation_reason: reason
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        
        showNotification('Order cancelled successfully', 'success');
        closeCancelOrder();
        
        // Refresh the current view
        const currentStatus = document.querySelector('.orderCategoriesButtons a[aria-selected="true"]')
            ?.getAttribute('href')?.split('-').pop()?.replace('.html', '') || 'all';
        const duration = document.querySelector('.durationFilter')?.value || 30;
        fetchOrders(currentStatus, duration);
        
        // Close any open details panel
        const openPanel = document.querySelector('.orderDetailsArea[style*="translateY(0%)"]');
        if (openPanel) {
            openPanel.style.transform = "translateY(110%)";
            openPanel.style.opacity = 0;
        }
        
        return data;
    } catch (error) {
        console.error('Error cancelling order:', error);
        showNotification('Failed to cancel order', 'error');
        throw error;
    }
}







document.addEventListener('click', function(e) {
    const button = e.target.closest('#updateOrderStatusBtn_inner123');
    if (button) {
        e.preventDefault();
        e.stopPropagation();

        // 🔥 Get the parent .orderActionArea div
        const orderActionArea = button.closest('.orderActionArea');
        if (!orderActionArea) {
            showNotification('Could not find action area', 'error');
            return;
        }

        // 🔥 Get the select element inside this action area
        const statusSelect = orderActionArea.querySelector('#orderStatusSelect123');
        if (!statusSelect) {
            showNotification('Status select element not found', 'error');
            return;
        }

        // ✅ Get the selected value
        const selectedValue = statusSelect.value;
        if (!selectedValue) {
            showNotification('Please select an action first', 'error');
            return;
        }

        const newStatus = selectedValue;

        // ✅ Optional: get order ID from data attribute
        const orderId = localStorage.getItem('currentOrderId'); // Or from dataset if available
        if (!orderId) {
            showNotification('Could not find order ID', 'error');
            return;
        }

        updateSingleOrderStatus_last_1ok(orderId, newStatus)
            .catch(error => {
                console.error('Error updating order status:', error);
                showNotification('Failed to update order status', 'error');
            });
    }
});






async function updateSingleOrderStatus_last_1ok(orderId_last_1ok, newStatus_last_1ok) {
    console.log('Starting status update for order:', orderId_last_1ok, 'to status:', newStatus_last_1ok);
    
    const authToken_last_1ok = localStorage.getItem("auth_token");
    if (!authToken_last_1ok) {
        console.error('No auth token found');
        throw new Error('Authentication token missing');
    }

    const url_last_1ok = 'http://localhost:5000/products/ADMIN/update-multiple-order-status';
    console.log('API URL:', url_last_1ok);

    // Correct request format for the multiple orders endpoint
    const requestData_last_1ok = {
        orders: [{
            order_id: parseInt(orderId_last_1ok),
            status: newStatus_last_1ok.toLowerCase()
        }]
    };
    console.log('Request payload:', requestData_last_1ok);

    try {
        const response_last_1ok = await fetch(url_last_1ok, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${authToken_last_1ok}`
            },
            body: JSON.stringify(requestData_last_1ok)
        });

        console.log('Response status:', response_last_1ok.status);
        
        if (!response_last_1ok.ok) {
            const errorData_last_1ok = await response_last_1ok.json().catch(() => ({}));
            console.error('API error response:', errorData_last_1ok);
            throw new Error(`API request failed with status ${response_last_1ok.status}`);
        }

        const data_last_1ok = await response_last_1ok.json();
        console.log('API success response:', data_last_1ok);

        // Check if the update was successful
        if (data_last_1ok.results && data_last_1ok.results.length > 0) {
            const result = data_last_1ok.results[0];
            if (result.status === "failed") {
                showNotification(`Failed to update order: ${result.message}`, 'error');
            } else {
                showNotification(`Order status updated to ${newStatus_last_1ok}`, 'success');
            }
        } else {
            showNotification(`Order status updated to ${newStatus_last_1ok}`, 'success');
        }

        // Close the details panel
        const currentPanel_last_1ok = document.querySelector('.orderDetailsArea[style*="translateY(0%)"]');
        if (currentPanel_last_1ok) {
            currentPanel_last_1ok.style.transform = "translateY(110%)";
            currentPanel_last_1ok.style.opacity = 0;
            console.log('Panel closed');
        }

        // Wait a brief moment before refreshing to ensure everything completes
        setTimeout(() => {
            const currentStatus_last_1ok = document.querySelector('.orderCategoriesButtons a[aria-selected="true"]')
                ?.getAttribute('href')?.split('-').pop()?.replace('.html', '') || 'all';
            const duration_last_1ok = document.querySelector('.durationFilter')?.value || 30;
            console.log('Refreshing view with status:', currentStatus_last_1ok, 'duration:', duration_last_1ok);
            
            if (typeof fetchOrders === 'function') {
                fetchOrders(currentStatus_last_1ok, duration_last_1ok);
            } else {
                console.error('fetchOrders function is not defined');
                window.location.reload();
            }
        }, 500);

        return data_last_1ok;
    } catch (error) {
        console.error('Error in updateSingleOrderStatus_last_1ok:', error);
        showNotification('Failed to update order status', 'error');
        throw error;
    }
}




