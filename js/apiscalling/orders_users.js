// Global variables
let currentOrderDetails = null;
let currentFilter = 'all';

// DOM Elements
const orderPacks = {
  all: document.querySelector('.allOrdersPack'),
  toShip: document.querySelector('.toShipOrdersPack'),
  toReceive: document.querySelector('.toReceiveOrdersPack'),
  delivered: document.querySelector('.deliveredOrdersPack'),
  cancelled: document.querySelector('.cancelledOrdersPack')
};

console.log('Order packs elements initialized:', orderPacks);

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM fully loaded and parsed');
  
  // Set up event listeners
  setupEventListeners();
  
  // Load initial orders
  fetchOrders('all');
});

function setupEventListeners() {
  console.log('Setting up event listeners...');
  
  // Filter buttons
  document.querySelector('.allOrdersPackBtn').addEventListener('click', () => {
    console.log('All orders filter button clicked');
    currentFilter = 'all';
    fetchOrders('all');
  });
  
  document.querySelector('.toShipOrdersPackBtn').addEventListener('click', () => {
    console.log('To Ship orders filter button clicked');
    currentFilter = 'to_ship';
    fetchOrders('to_ship');
  });
  
  document.querySelector('.toReceiveOrdersPackBtn').addEventListener('click', () => {
    console.log('To Receive orders filter button clicked');
    currentFilter = 'to_receive';
    fetchOrders('to_receive');
  });
  
  document.querySelector('.deliveredOrdersPackBtn').addEventListener('click', () => {
    console.log('Delivered orders filter button clicked');
    currentFilter = 'delivered';
    fetchOrders('delivered');
  });
  
  document.querySelector('.cancelledOrdersPackBtn').addEventListener('click', () => {
    console.log('Cancelled orders filter button clicked');
    currentFilter = 'cancelled';
    fetchOrders('cancelled');
  });
  
 
  
  // Close order details
  document.querySelector('.orderDetailsAreaContent .sideTitlePlusCloseButton button').addEventListener('click', () => {
    console.log('Order details close button clicked');
    closeOrderDetails();
  });
  
  // Close cancel order
  document.querySelector('.cancelOrderAreaContent .sideTitlePlusCloseButton button').addEventListener('click', () => {
    console.log('Cancel order close button clicked');
    closeCancelOrder();
  });

   
  // Time filter
  document.querySelector('.orderSelectionFilter select').addEventListener('change', function() {
    console.log('Time filter changed to:', this.value);
    fetchOrders(currentFilter, this.value);
  });
  
  console.log('Event listeners setup complete');
}



// Add this function right after your fetchOrders function
function filterOrdersByTime(orders, timeFilter) {
  const now = new Date();
  let filteredOrders = [...orders]; // Create a copy of the original array

  switch(timeFilter) {
    case '5':
      // Last 5 orders (most recent first)
      return filteredOrders.slice(0, 5);
      
    case '15':
      // Last 15 orders
      return filteredOrders.slice(0, 15);
      
    case '30':
      // Last 30 orders
      return filteredOrders.slice(0, 30);
      
    case '6months':
      // Last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return filteredOrders.filter(order => {
        const orderDate = new Date(order.order_date);
        return orderDate >= sixMonthsAgo;
      });
      
    case '1year':
      // Last 1 year
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      return filteredOrders.filter(order => {
        const orderDate = new Date(order.order_date);
        return orderDate >= oneYearAgo;
      });
      
    default:
      // 'all' or unknown filter - return all orders
      return filteredOrders;
  }
}











// Modify the fetchOrders function to handle time filtering
async function fetchOrders(status = 'all', timeFilter = 'all') {
  console.log(`Fetching orders with status: ${status}, time filter: ${timeFilter}`);
  
  try {
    const authToken = localStorage.getItem("auth_token");
    console.log('Auth token retrieved from localStorage:', authToken ? 'exists' : 'missing');
    
    if (!authToken) {
      console.error('No auth token found - user not authenticated');
      return;
    }
    
    // Show loading state
    Object.values(orderPacks).forEach(pack => {
      pack.innerHTML = '<p>Loading orders...</p>';
    });
    console.log('Loading state displayed for all order packs');
    
    const requestBody = {
      status: status,
    };
    console.log('Preparing API request with body:', requestBody);
    
    const response = await fetch('http://localhost:5000/products/get-orders-by-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('API response received, status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API response data:', data);
    
    if (data.status && data.orders && data.orders.length > 0) {
      console.log(`Received ${data.orders.length} orders from API`);
      
      // Apply time filter to the orders
      let filteredOrders = data.orders;
      if (timeFilter !== 'all') {
        filteredOrders = filterOrdersByTime(data.orders, timeFilter);
        console.log(`After time filtering, ${filteredOrders.length} orders remain`);
      }
      
      renderOrders(filteredOrders);
    } else {
      console.log('No orders received from API or empty response');
      showEmptyState();
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    showEmptyState();
  }
}







// Render orders in the UI
function renderOrders(orders) {
  console.log('Rendering orders:', orders);
  
  // Clear existing orders
  Object.values(orderPacks).forEach(pack => {
    pack.innerHTML = '';
  });
  console.log('Cleared all order packs');
  
  // Group orders by status
  const ordersByStatus = {
    all: [],
    to_ship: [],
    to_receive: [],
    delivered: [],
    cancelled: []
  };
  
  orders.forEach(order => {
    console.log(`Processing order ${order.order_id} with status ${order.status}`);
    ordersByStatus.all.push(order);
    
    switch(order.status) {
      case 'placed':
      case 'processing':
        console.log(`Adding order ${order.order_id} to to_ship group`);
        ordersByStatus.to_ship.push(order);
        break;
      case 'shipped':
        console.log(`Adding order ${order.order_id} to to_receive group`);
        ordersByStatus.to_receive.push(order);
        break;
      case 'completed':
        console.log(`Adding order ${order.order_id} to delivered group`);
        ordersByStatus.delivered.push(order);
        break;
      case 'cancelled':
        console.log(`Adding order ${order.order_id} to cancelled group`);
        ordersByStatus.cancelled.push(order);
        break;
      default:
        console.log(`Order ${order.order_id} has unknown status: ${order.status}`);
    }
  });
  
  console.log('Orders grouped by status:', ordersByStatus);
  
  // Render each status group
  for (const [status, orders] of Object.entries(ordersByStatus)) {
    const pack = getPackByStatus(status);
    console.log(`Rendering ${orders.length} orders for status ${status}`);
    
    if (orders.length === 0) {
      console.log(`No orders for status ${status}, showing empty state`);
      pack.innerHTML = `
        <p class="empty">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <g fill="none" stroke="currentColor">
              <path d="M2 12c0-4.714 0-7.071 1.464-8.536C4.93 2 7.286 2 12 2s7.071 0 8.535 1.464C22 4.93 22 7.286 22 12s0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12Z"/>
              <path stroke-linecap="round" d="M2 13h3.16c.905 0 1.358 0 1.756.183s.692.527 1.281 1.214l.606.706c.589.687.883 1.031 1.281 1.214s.85.183 1.756.183h.32c.905 0 1.358 0 1.756-.183s.692-.527 1.281-1.214l.606-.706c.589-.687.883-1.031 1.281-1.214S17.934 13 18.84 13H22"/>
            </g>
          </svg>
          <span>empty</span>
        </p>
      `;
      continue;
    }
    
    orders.forEach(order => {
      const orderElement = createOrderElement(order);
      pack.appendChild(orderElement);
      console.log(`Order ${order.order_id} added to ${status} pack`);
    });
  }
}

function getPackByStatus(status) {
  console.log(`Getting pack for status: ${status}`);
  switch(status) {
    case 'all': return orderPacks.all;
    case 'to_ship': return orderPacks.toShip;
    case 'to_receive': return orderPacks.toReceive;
    case 'delivered': return orderPacks.delivered;
    case 'cancelled': return orderPacks.cancelled;
    default: return orderPacks.all;
  }
}

function createOrderElement(order) {
  console.log(`Creating order element for order ${order.order_id}`);
  
  const orderDate = new Date(order.order_date);
  const formattedDate = orderDate.toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
  
  const orderElement = document.createElement('button');
  orderElement.type = 'button';
  orderElement.className = 'oneOrder';
  orderElement.addEventListener('click', async () => {
    console.log(`Order ${order.order_id} clicked, fetching details`);
    try {
      const orderDetails = await fetchOrderDetails(order.order_id);
      if (orderDetails) {
        openOrderDetails(orderDetails);
      }
    } catch (error) {
      console.error(`Error fetching details for order ${order.order_id}:`, error);
    }
  });
  
  // Map status to display text
  let statusText = order.status;
  switch(order.status) {
    case 'placed':
    case 'processing':
      statusText = 'in-process';
      break;
    case 'shipped':
      statusText = 'shipped';
      break;
    case 'completed':
      statusText = 'completed';
      break;
    case 'cancelled':
      statusText = 'cancelled';
      break;
  }
  console.log(`Order ${order.order_id} status display text: ${statusText}`);
  
  let itemsHTML = '';
  console.log(`Order ${order.order_id} has ${order.items.length} items`);
  order.items.forEach(item => {
    itemsHTML += `
      <div class="oneProduct">
        <div class="itemImageBox">
          <img src="/MSM_Backend/images//${item.image}" alt="${item.title}">
        </div>
        <div class="itemDets">
          <h1>${item.title}</h1>
          <div class="variations">
            <p><span>${item.variations[0]}</span>&nbsp;-&nbsp;<span>${item.variations[1]}</span></p>
          </div>
          <div class="totalPricePlusQty">
            <p>Total price:&nbsp;&nbsp;<span>${item.total_price.toFixed(2)}</span></p>
            <p>Qty:&nbsp;&nbsp;<span>${item.quantity}</span></p>
          </div>
        </div>
      </div>
    `;
  });
  
  orderElement.innerHTML = `
    <div class="orderNumberPlusStatus">
      <h1>#<span>${order.order_id}</span></h1>
      <h2>${statusText}</h2>
    </div>
    ${itemsHTML}
  `;
  
  console.log(`Order element created for order ${order.order_id}`);
  return orderElement;
}

// Fetch detailed order information
async function fetchOrderDetails(orderId) {
  console.log(`Fetching details for order ${orderId}`);
  
  try {
    const authToken = localStorage.getItem("auth_token");
    if (!authToken) {
      console.error('No auth token found - user not authenticated');
      return null;
    }
    
    const response = await fetch(`http://localhost:5000/products/get-order-details/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('Order details API response received, status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Order details API response data:', data);
    
    if (data.status && data.order) {
      console.log(`Successfully fetched details for order ${orderId}`);
      return data.order;
    } else {
      console.log(`Failed to fetch details for order ${orderId}: ${data.message || 'Unknown error'}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching details for order ${orderId}:`, error);
    return null;
  }
}

function showEmptyState() {
  console.log('Showing empty state for all order packs');
  Object.values(orderPacks).forEach(pack => {
    pack.innerHTML = `
      <p class="empty">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor">
            <path d="M2 12c0-4.714 0-7.071 1.464-8.536C4.93 2 7.286 2 12 2s7.071 0 8.535 1.464C22 4.93 22 7.286 22 12s0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12Z"/>
            <path stroke-linecap="round" d="M2 13h3.16c.905 0 1.358 0 1.756.183s.692.527 1.281 1.214l.606.706c.589.687.883 1.031 1.281 1.214s.85.183 1.756.183h.32c.905 0 1.358 0 1.756-.183s.692-.527 1.281-1.214l.606-.706c.589-.687.883-1.031 1.281-1.214S17.934 13 18.84 13H22"/>
          </g>
        </svg>
        <span>empty</span>
      </p>
    `;
  });
}












function openOrderDetails(order) {
    console.log(`Opening order details for order ${order.order_id}`);
    console.log('Full order object:', order); // Log the entire order object
    
    // Debug: Print the status from the order object
    console.log('Order status from API:', order.order_status || 'undefined');
    console.log('Alternative status property:', order.status || 'undefined');
    currentOrderDetails = order;
    const orderDetailsArea = document.querySelector('.orderDetailsArea');
    
    // Check if order details are fetched correctly
    if (!order) {
      console.error('No order details available');
      return;
    }
  
    // Make sure we found the modal element
    if (!orderDetailsArea) {
      console.error('Order details area not found in DOM');
      return;
    }
  
    // Format order date
    const orderDate = new Date(order.order_date);
    const formattedDate = orderDate.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
    const formattedTime = orderDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    console.log(`Order ${order.order_id} date: ${formattedDate} ${formattedTime}`);
    console.log(`${order.status}`);
    // Update your status mapping logic in openOrderDetails()
let statusText = order.status || 'unknown';


switch ((order.order_status || '').toLowerCase()) {
  case 'placed':
  case 'processing':
  case 'online_payment'  :
    statusText = 'In Process';
    break;
  case 'shipped':
    statusText = 'Shipped';
    break;
  case 'received':
    statusText = 'Received';
    break;
  case 'cancelled_by_admin':
    statusText = 'Cancelled by Admin';
    break;
  case 'delivered':
    statusText = 'Delivered';
    break;
  default:
    statusText = order.order_status || 'Unknown';
}

  
    console.log(`Order ${order.order_id} status display text: ${statusText}`);
    
    // Build items HTML
    let itemsHTML = '';
    console.log(`Order ${order.order_id} has ${order.items.length} items`);
    order.items.forEach(item => {
      // Fix image path - remove double slash if present
      const imagePath = item.image.replace(/\/\//g, '/');
      itemsHTML += `
        <div class="oneProduct">
          <div class="itemImageBox">
            <img src="/MSM_Backend/images/${imagePath}" alt="${item.title}" onerror="this.src='/assets/misc/productItem1.png'">
          </div>
          <div class="itemDets">
            <h1>${item.title}</h1>
            <div class="variations">
              <p><span>${item.variations[0] || 'N/A'}</span>&nbsp;-&nbsp;<span>${item.variations[1] || 'N/A'}</span></p>
            </div>
            <div class="totalPricePlusQty">
              <p>Total price:&nbsp;&nbsp;<span>${(item.total_price || 0).toFixed(2)}</span></p>
              <p>Qty:&nbsp;&nbsp;<span>${item.quantity || 1}</span></p>
            </div>
          </div>
        </div>
      `;
    });
    
    // Build address HTML
    const address = order.address || {};
    let addressHTML = '';
    console.log(`Order ${order.order_id} has address data`);
    addressHTML = `
      <p><span>${address.full_name || 'N/A'}</span>&nbsp;&nbsp;-&nbsp;&nbsp;<span>${address.phone_number || 'N/A'}</span></p>
      <div class="usedAddressArea">
        <h2>${address.address_type || 'address'}</h2>&nbsp;&nbsp;
        <p>
          <span>${address.address || 'N/A'}</span>,
          <span>${address.city || 'N/A'}</span>,
          <span>${address.postal_code || 'N/A'}</span>
        </p>
      </div>
    `;
    
    // Build voucher HTML
    let voucherHTML = 'N/A';
    if (order.voucher) {
      const discountAmount = typeof order.voucher.discount_amount === 'number' 
        ? order.voucher.discount_amount.toFixed(2) 
        : '0.00';
      console.log(`Order ${order.order_id} used voucher: ${order.voucher.voucher_name}`);
      voucherHTML = `${order.voucher.voucher_name} (${discountAmount})`;
    } else {
      console.log(`Order ${order.order_id} didn't use a voucher`);
    }





    // Build cancellation HTML (if cancelled)
let cancellationHTML = '';
if (order.order_status === 'cancelled') {
    console.log(`Order ${order.order_id} is cancelled, adding cancellation details`);
    
    // Format the refund amount if it exists
    const refundAmount = order.refund_amount ? `Rs. ${order.refund_amount.toFixed(2)}` : 'N/A';
    
    cancellationHTML = `
        <div class="cancelOrder">
            <h1>Cancellation reason:</h1>
            <div class="cancelOrderReason">
                <p>${order.cancelled_reason || 'No reason provided'}</p>
                <h2>Refund:&nbsp;<span>${refundAmount}</span></h2>
                <h2>
                    <small>Cancelled by <span>${order.cancelled_by || 'system'}</span></small>&nbsp;
                    <small>-</small>&nbsp;
                    <small>${formattedDate} ${formattedTime}</small>
                </h2>
            </div>
        </div>
    `;
}
    
    // Update the order details area
    orderDetailsArea.querySelector('.orderedProductsHere').innerHTML = itemsHTML;
    orderDetailsArea.querySelector('.orderDets h1').innerHTML = `Order #<span>${order.order_id}</span>`;
    orderDetailsArea.querySelector('.orderDets h2').innerHTML = `Placed on&nbsp;<span>${formattedDate}</span>&nbsp;<span>${formattedTime}</span>`;
    orderDetailsArea.querySelector('.orderStatus h2').textContent = statusText;
    orderDetailsArea.querySelector('.orderAddress .addressUsed').innerHTML = addressHTML;
    
    console.log(`Order ${order.order_id} summary:`, order.summary);
    orderDetailsArea.querySelector('.orderBill .orderBillDets').innerHTML = `
      <div class="oneDet">
        <h2>subtotal (<span>${order.item_count || 0}</span>&nbsp;items)</h2>
        <h1>Rs.&nbsp;<span>${(order.summary?.subtotal || 0).toFixed(2)}</span></h1>
      </div>
      <div class="oneDet">
        <h2>shipping</h2>
        <h1>Rs.&nbsp;<span>${(order.summary?.shipping || 0).toFixed(2)}</span></h1>
      </div>
      <div class="oneDet">
        <h2>voucher&nbsp;(<span>${order.voucher?.voucher_name || 'N/A'}</span>)</h2>
        <h1><span>-</span>&nbsp;Rs.&nbsp;<span>${(order.summary?.discount || 0).toFixed(2)}</span></h1>
      </div>
      <hr class="detsLine">
      <div class="oneDet">
        <h2>total</h2>
        <h1>Rs.&nbsp;<span>${(order.summary?.total || 0).toFixed(2)}</span></h1>
      </div>
      <div class="oneDet">
        <h2>payment method</h2>
        <h1>${order.payment_method || 'cash on delivery'}</h1>
      </div>
    `;
    
    // Show/hide cancellation section
    const cancelOrderSection = orderDetailsArea.querySelector('.cancelOrder');
    if (cancelOrderSection) {
      cancelOrderSection.innerHTML = cancellationHTML;
    }
    
    // // Show/hide cancel button based on order status
    // const cancelButton = orderDetailsArea.querySelector('.trackAndCancelOrderButtonArea button:last-child');
    // if (cancelButton) {
    //   if (order.order_status === 'placed' || order.order_status === 'processing' || order.order_status === '"online_payment"' ) {
    //     console.log(`Order ${order.order_id} can be cancelled, showing cancel button`);
    //     cancelButton.style.display = 'inline-flex';
    //     cancelButton.onclick = (e) => {
    //       e.preventDefault();
    //       console.log(`Cancel button clicked for order ${order.order_id}`);
    //       openCancelOrder(order);
    //     };
    //   } else {
    //     console.log(`Order ${order.order_id} cannot be cancelled, hiding cancel button`);
    //     cancelButton.style.display = 'none';
    //   }
    // }
    


    // Show/hide cancel button based on order status
const cancelButton = orderDetailsArea.querySelector('.trackAndCancelOrderButtonArea button:last-child');
if (cancelButton) {
  const cancellableStatuses = ['placed', 'processing', 'online_payment'];
  if (cancellableStatuses.includes(order.order_status.toLowerCase())) {
    console.log(`Order ${order.order_id} can be cancelled, showing cancel button`);
    cancelButton.style.display = 'inline-flex';
    cancelButton.onclick = (e) => {
      e.preventDefault();
      console.log(`Cancel button clicked for order ${order.order_id}`);
      openCancelOrder(order);
    };
  } else {
    console.log(`Order ${order.order_id} cannot be cancelled, hiding cancel button`);
    cancelButton.style.display = 'none';
  }
}









    // Show the order details area
    orderDetailsArea.style.opacity = 1;
    orderDetailsArea.style.transform = "translateX(0%)";
    console.log(`Order details displayed for order ${order.order_id}`);
    
    // Add a class to body to prevent scrolling when modal is open
    document.body.classList.add('modal-open');



// // Inside openOrderDetails() function, after the cancel button logic:
// const trackButton = orderDetailsArea.querySelector('.trackAndCancelOrderButtonArea button:first-child');
// if (trackButton) {
//   trackButton.style.display = 'inline-flex';
//   trackButton.onclick = (e) => {
//     e.preventDefault();
//     console.log(`Track button clicked for order ${order.order_id}`);
//     trackOrder(order.order_id);
//   };
// }



const trackButton = orderDetailsArea.querySelector('.trackAndCancelOrderButtonArea button:first-child');
if (trackButton) {
  trackButton.style.display = 'inline-flex';
  trackButton.onclick = (e) => {
    e.preventDefault();
    console.log(`Track button clicked for order ${order.order_id}`);
    
    // Redirect to the tracking page with order_id as a query parameter
    window.location.href = `http://127.0.0.1:5500/msm_kosmetika_fin/order-tracking.html?order_id=${order.order_id}`;
  };
}


  }









function closeOrderDetails() {
  console.log('Closing order details');
  document.querySelector('.orderDetailsArea').style.opacity = 0;
  document.querySelector('.orderDetailsArea').style.transform = "translateX(110%)";
  currentOrderDetails = null;
}

function openCancelOrder(order) {
  console.log(`Opening cancel order dialog for order ${order.order_id}`);
  const cancelOrderArea = document.querySelector('.cancelOrderArea');
  // document.querySelector('.cancelOrderArea').style.border = '10px solid red';

 // Make sure we found the element
 if (!cancelOrderArea) {
  console.error('Cancel order area not found');
  return;
}


// cancelOrderArea.style.display = 'block';
  // Format order date
  const orderDate = new Date(order.order_date);
  const formattedDate = orderDate.toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
  const formattedTime = orderDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  console.log(`Order ${order.order_id} date: ${formattedDate} ${formattedTime}`);
  
  // Build items HTML
  let itemsHTML = '';
  console.log(`Order ${order.order_id} has ${order.items.length} items`);
  order.items.forEach(item => {
    itemsHTML += `
      <div class="oneProduct">
        <div class="itemImageBox">
          <img src="/MSM_Backend/images/${item.image}" alt="${item.title}">
        </div>
        <div class="itemDets">
          <h1>${item.title}</h1>
          <div class="variations">
            <p><span>${item.variations[0]}</span>&nbsp;-&nbsp;<span>${item.variations[1]}</span></p>
          </div>
          <div class="totalPricePlusQty">
            <p>Total price:&nbsp;&nbsp;<span>${item.total_price.toFixed(2)}</span></p>
            <p>Qty:&nbsp;&nbsp;<span>${item.quantity}</span></p>
          </div>
        </div>
      </div>
    `;
  });
  
  // Update the cancel order area
  cancelOrderArea.querySelector('.productsToCancelHere').innerHTML = itemsHTML;
  cancelOrderArea.querySelector('.orderDets h1').innerHTML = `Order #<span>${order.order_id}</span>`;
  cancelOrderArea.querySelector('.orderDets h2').innerHTML = `Placed on&nbsp;<span>${formattedDate}</span>&nbsp;<span>${formattedTime}</span>`;
  
  // Set up cancel button
  const cancelButton = cancelOrderArea.querySelector('.inputPlusAccBtn button');
  cancelButton.onclick = (e) => {
    e.preventDefault();
    console.log(`Confirm cancel button clicked for order ${order.order_id}`);
    cancelOrder(order.order_id);
  };
  
  // Show the cancel order area
  
  // cancelOrderArea.style.display = "flex";

// Instead, use opacity and transform like your CSS expects:
cancelOrderArea.style.opacity = 1;
cancelOrderArea.style.transform = "translateX(0)";


  console.log(`Cancel order dialog displayed for order ${order.order_id}`);
}
function closeCancelOrder() {
  console.log('Closing cancel order dialog');
  const cancelOrderArea = document.querySelector('.cancelOrderArea');
  if (cancelOrderArea) {
    cancelOrderArea.style.opacity = 0;
    cancelOrderArea.style.transform = "translateX(110%)";
  }
}

async function cancelOrder(orderId) {
  console.log(`Initiating cancellation for order ${orderId}`);
  const reason = document.querySelector('.cancelOrderArea textarea').value.trim();
  console.log(`Cancellation reason: ${reason}`);
  
  if (!reason) {
    console.log('Cancellation failed: no reason provided');
    alert('Please provide a cancellation reason');
    return;
  }
  
  try {
    const authToken = localStorage.getItem("auth_token");
    console.log('Auth token retrieved from localStorage:', authToken ? 'exists' : 'missing');
    
    if (!authToken) {
      console.error('No auth token found - user not authenticated');
      return;
    }
    
    const requestBody = {
      order_id: orderId,
      cancellation_reason: reason
    };
    console.log('Preparing cancel order API request with body:', requestBody);
    
    const response = await fetch('http://localhost:5000/products/cancel-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('Cancel order API response received, status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Cancel order API response data:', data);
    
    if (data.status) {
      console.log(`Order ${orderId} cancelled successfully`);
      alert('Order cancelled successfully');
      closeCancelOrder();
      closeOrderDetails();
      fetchOrders(currentFilter); // Refresh orders
    } else {
      console.log(`Failed to cancel order ${orderId}: ${data.message || 'Unknown error'}`);
      alert('Failed to cancel order: ' + (data.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error cancelling order:', error);
    alert('An error occurred while cancelling the order');
  }
}