// admin_order_tracking.js

document.addEventListener('DOMContentLoaded', function() {
    // Get the search form and input elements
    const searchForm = document.querySelector('.searchTracking');
    const searchInput = searchForm.querySelector('input[type="number"]');
    const trackButton = searchForm.querySelector('button');
    const emptyMessage = document.querySelector('.empty');
    const trackOrderDetails = document.querySelector('.trackOrderDets');

    // Add event listener to the search form
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const orderId = searchInput.value.trim();
        
        if (orderId) {
            trackOrder(orderId);
        } else {
            showAlert('Please enter an order ID');
        }
    });

    // Function to track an order
    async function trackOrder(orderId) {
        try {
            // Show loading indicator
            document.querySelector('.loading').style.display = 'flex';
            const authToken = localStorage.getItem("auth_token");
            // Make API call to search for the order
            const response = await fetch('http://localhost:5000/products/ADMIN/order-search12', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                  },
                body: JSON.stringify({ order_id: orderId })
            });

            const data = await response.json();

            // Hide loading indicator
            document.querySelector('.loading').style.display = 'none';

            if (data.status && data.order) {
                // Display the order details
                displayOrderDetails(data.order);
                emptyMessage.style.display = 'none';
                trackOrderDetails.style.display = 'block';
            } else {
                // Show empty state
                emptyMessage.style.display = 'flex';
                trackOrderDetails.style.display = 'none';
                showAlert(data.message || 'Order not found');
            }
        } catch (error) {
            console.error('Error tracking order:', error);
            document.querySelector('.loading').style.display = 'none';
            showAlert('An error occurred while tracking the order');
        }
    }

    // Function to display order details
    function displayOrderDetails(order) {
        // Update courier info
        const courierInfo = document.querySelector('.courierInfoDets');
        if (order.items[0].tracking_info) {
            courierInfo.querySelector('p:nth-child(1) span').textContent = order.items[0].tracking_info.courier;
            courierInfo.querySelector('p:nth-child(2) span').textContent = order.items[0].tracking_info.tracking_id;
        } else {
            courierInfo.querySelector('p:nth-child(1) span').textContent = 'Not available';
            courierInfo.querySelector('p:nth-child(2) span').textContent = 'Not available';
        }
        
        // Update delivery estimate (this is just an example - you might need to calculate this)
        const deliveryEstimate = courierInfo.querySelector('h2 span:nth-child(1)');
        const deliveryEstimateEnd = courierInfo.querySelector('h2 span:nth-child(2)');
        const orderDate = new Date(order.order_date);
        deliveryEstimate.textContent = formatDate(addDays(orderDate, 3));
        deliveryEstimateEnd.textContent = formatDate(addDays(orderDate, 7));

        // Update order ID
        document.querySelector('.orderNumber span').textContent = order.order_id;

        // Update status indicators
        updateStatusIndicators(order.status);

        // Update tracking timeline
        updateTrackingTimeline(order);
    }

    // Helper function to update status indicators
    function updateStatusIndicators(status) {
        const statusDiv = document.querySelector('.statusDiv');
        const statusElements = statusDiv.querySelectorAll('.oneStatus');
        
        // Reset all statuses
        statusElements.forEach(el => el.removeAttribute('aria-selected'));
        
        // Activate statuses based on current status
        switch (status.toLowerCase()) {
            case 'delivered':
                statusElements[3].setAttribute('aria-selected', 'true');
            case 'shipped':
                statusElements[2].setAttribute('aria-selected', 'true');
            case 'packed':
                statusElements[1].setAttribute('aria-selected', 'true');
            case 'processing':
                statusElements[0].setAttribute('aria-selected', 'true');
                break;
            default:
                statusElements[0].setAttribute('aria-selected', 'true');
        }
    }

    // Helper function to update tracking timeline
    function updateTrackingTimeline(order) {
        const trackDataContainer = document.querySelector('.trackDataHere');
        trackDataContainer.innerHTML = ''; // Clear existing items
        
        // This is a simplified example - you would need to get actual tracking events from your API
        const trackingEvents = generateTrackingEvents(order);
        
        trackingEvents.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'oneTrackDet';
            if (event.active) eventElement.setAttribute('aria-selected', 'true');
            
            eventElement.innerHTML = `
                <h1>${event.title}</h1>
                <h2>${event.description}</h2>
                <h3>${event.timestamp}</h3>
            `;
            
            trackDataContainer.appendChild(eventElement);
        });
    }

    // Helper function to generate tracking events (replace with actual data from API)
    function generateTrackingEvents(order) {
        const orderDate = new Date(order.order_date);
        
        // This is just sample data - you should replace with actual tracking events from your API
        return [
            {
                title: "Order Reached at MSM Kosmetika Distribution Center",
                description: "Your order has arrived at MSM Kosmetika Distribution Center from where it will be sent to the delivery facility",
                timestamp: formatDate(addHours(orderDate, 5)),
                active: order.status === 'shipped' || order.status === 'delivered'
            },
            {
                title: "Package Handed over to Logistics Partner",
                description: "Your order has been dropped off by the seller and will soon arrive at MSM Kosmetika distribution center",
                timestamp: formatDate(addHours(orderDate, 3)),
                active: order.status === 'shipped' || order.status === 'delivered'
            },
            {
                title: "Processed and Ready to Ship",
                description: "Your order has been processed and will be with MSM Kosmetika distribution center soon",
                timestamp: formatDate(addHours(orderDate, 2)),
                active: order.status === 'shipped' || order.status === 'delivered'
            },
            {
                title: "Order Processing",
                description: "Order packed",
                timestamp: formatDate(addHours(orderDate, 1)),
                active: true
            },
            {
                title: "Order Received by the MSM Kosmetika",
                description: "Seller is preparing your order",
                timestamp: formatDate(orderDate),
                active: true
            }
        ];
    }

    // Helper function to show alerts
    function showAlert(message) {
        const alertElement = document.querySelector('.alert');
        alertElement.querySelector('p').textContent = message;
        alertElement.style.display = 'block';
        
        // Hide alert after 5 seconds
        setTimeout(() => {
            alertElement.style.display = 'none';
        }, 5000);
    }

    // Helper functions for date manipulation
    function addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    function addHours(date, hours) {
        const result = new Date(date);
        result.setHours(result.getHours() + hours);
        return result;
    }

    function formatDate(date) {
        const options = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
        return date.toLocaleDateString('en-US', options);
    }
});