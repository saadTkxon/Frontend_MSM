// Function to get URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(window.location.href);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Function to fetch order details
async function fetchOrderDetails(orderId) {
    try {
        // Show loading indicator
        document.querySelector('.loading').style.display = 'flex';
        
        const authToken = localStorage.getItem("auth_token");
        if (!authToken) {
            window.location.href = '/msm_kosmetika_fin/login.html';
            return;
        }

        const response = await fetch('http://localhost:5000/products/user-order-details', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({ order_id: orderId })
        });

        const data = await response.json();

        if (data.status && data.order) {
            displayOrderDetails(data.order);
        } else {
            showAlert(data.message || 'Failed to fetch order details');
        }
    } catch (error) {
        console.error('Error fetching order details:', error);
        showAlert('An error occurred while fetching order details');
    } finally {
        // Hide loading indicator
        document.querySelector('.loading').style.display = 'none';
    }
}










// Function to display order details
function displayOrderDetails(order) {
    // Set order ID
    document.querySelector('.orderNumber span').textContent = order.order_id;

    // Set courier info if available
    const courierInfo = document.querySelector('.courierInfoDets');
    if (order.items[0].tracking_info) {
        courierInfo.querySelector('p:nth-child(1) span').textContent = order.items[0].tracking_info.courier;
        courierInfo.querySelector('p:nth-child(2) span').textContent = order.items[0].tracking_info.tracking_id;
    } else {
        courierInfo.querySelector('p:nth-child(1) span').textContent = 'Not assigned yet';
        courierInfo.querySelector('p:nth-child(2) span').textContent = 'Not available';
    }

    // Set delivery date range (example - you might need to calculate this)
    const deliveryDate = new Date(order.order_date);
    deliveryDate.setDate(deliveryDate.getDate() + 2);
    const endDate = new Date(deliveryDate);
    endDate.setDate(deliveryDate.getDate() + 5);
    
    const options = { day: 'numeric', month: 'short' };
    courierInfo.querySelector('h2 span:nth-child(1)').textContent = deliveryDate.toLocaleDateString('en-US', options);
    courierInfo.querySelector('h2 span:nth-child(2)').textContent = endDate.toLocaleDateString('en-US', options);

    // Set status indicators based on order status
    const statusElements = document.querySelectorAll('.oneStatus');
    statusElements.forEach(el => el.setAttribute('aria-selected', 'false'));

    if (order.status === 'processing') {
        statusElements[0].setAttribute('aria-selected', 'true');
    } else if (order.status === 'packed') {
        statusElements[0].setAttribute('aria-selected', 'true');
        statusElements[1].setAttribute('aria-selected', 'true');
    } else if (order.status === 'shipped') {
        statusElements[0].setAttribute('aria-selected', 'true');
        statusElements[1].setAttribute('aria-selected', 'true');
        statusElements[2].setAttribute('aria-selected', 'true');
    } else if (order.status === 'delivered') {
        statusElements.forEach(el => el.setAttribute('aria-selected', 'true'));
    }

    // Set tracking history (this is example data - you might need to get real tracking events)
    const trackDataHere = document.querySelector('.trackDataHere');
    trackDataHere.innerHTML = ''; // Clear existing items

    // Example tracking events - you should replace this with actual tracking data from your API
    const trackingEvents = [
        {
            title: "Order Reached at MSM Kosmetika Distribution Center",
            description: "Your order has arrived at MSM Kosmetika Distribution Center from where it will be sent to the delivery facility",
            date: new Date(order.order_date).toLocaleString('en-US', { 
                day: 'numeric', 
                month: 'short', 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        },
        {
            title: "Package Handed over to Logistics Partner",
            description: "Your order has been dropped off by the seller and will soon arrive at MSM Kosmetika distribution center",
            date: new Date(order.order_date).toLocaleString('en-US', { 
                day: 'numeric', 
                month: 'short', 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        },
        {
            title: "Processed and Ready to Ship",
            description: "Your order has been processed and will be with MSM Kosmetika distribution center soon",
            date: new Date(order.order_date).toLocaleString('en-US', { 
                day: 'numeric', 
                month: 'short', 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        },
        {
            title: "Order Processing",
            description: "Order packed",
            date: new Date(order.order_date).toLocaleString('en-US', { 
                day: 'numeric', 
                month: 'short', 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        },
        {
            title: "Order Received by the MSM Kosmetika",
            description: "Seller is preparing your order",
            date: new Date(order.order_date).toLocaleString('en-US', { 
                day: 'numeric', 
                month: 'short', 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        }
    ];

    trackingEvents.forEach((event, index) => {
        const eventElement = document.createElement('div');
        eventElement.className = 'oneTrackDet';
        eventElement.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
        
        eventElement.innerHTML = `
            <h1>${event.title}</h1>
            <h2>${event.description}</h2>
            <h3>${event.date}</h3>
        `;
        
        trackDataHere.appendChild(eventElement);
    });

    // Set go back button functionality
    document.querySelector('.goBack').addEventListener('click', (e) => {
        e.preventDefault();
        window.history.back();
    });
}


















// Function to show alert messages
function showAlert(message) {
    const alertElement = document.querySelector('.alert');
    alertElement.querySelector('p').textContent = message;
    alertElement.style.display = 'block';
    
    setTimeout(() => {
        alertElement.style.display = 'none';
    }, 5000);
}

// Main function to initialize the page
function initTrackingPage() {
    const orderId = getUrlParameter('order_id');
    
    if (orderId) {
        fetchOrderDetails(orderId);
    } else {
        showAlert('No order ID found in URL');
        // Redirect to orders page or home page after a delay
        setTimeout(() => {
            window.location.href = '/msm_kosmetika_fin/orders.html';
        }, 3000);
    }
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', initTrackingPage);



