// Function to fetch dashboard data
async function fetchDashboardData(startDate = null, endDate = null) {
    try {
        // Show loading indicator
        document.querySelector('.loading').style.display = 'flex';
        
        const authToken = localStorage.getItem("auth_token");
        let url = "http://145.223.33.250/products/ADMIN/dash";
        
        // Add date parameters if provided
        if (startDate && endDate) {
            url += `?start_date=${startDate}&end_date=${endDate}`;
        }
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${authToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status) {
            // Update the UI with the fetched data
            updateDashboardUI(data.data);
        } else {
            showAlert("Failed to fetch dashboard data: " + (data.message || "Unknown error"));
        }
    } catch (error) {
        showAlert("Error fetching dashboard data: " + error.message);
        console.error("Error fetching dashboard data:", error);
    } finally {
        // Hide loading indicator
        document.querySelector('.loading').style.display = 'none';
    }
}

// Function to update the UI with dashboard data
function updateDashboardUI(data) {
    // Update order stats
    const orderStats = data.order_stats.by_status;
    document.getElementById('allOrders').textContent = data.order_stats.total;
    document.getElementById('inProcessOrders').textContent = orderStats.placed + orderStats.payment_pending;
    document.getElementById('shippedOrders').textContent = orderStats.shipped;
    document.getElementById('deliveredOrders').textContent = orderStats.delivered;
    document.getElementById('cancelledOrders').textContent = orderStats.cancelled;
    document.getElementById('returnedOrders').textContent = orderStats.returned;
    
    // Calculate and display delivery percentage
    const allReceivedOrders = orderStats.delivered + orderStats.returned + orderStats.cancelled + orderStats["failed delivery"];
    const deliveredPercentage = (orderStats.delivered / allReceivedOrders * 100).toFixed(1);
    
    document.getElementById('allReceivedOrders').textContent = allReceivedOrders;
    document.getElementById('deliveredPercentage').textContent = `${deliveredPercentage}%`;
    
    // Update product stats (if needed)
    // document.getElementById('activeProducts').textContent = data.product_stats.by_status.active;
    // document.getElementById('inactiveProducts').textContent = data.product_stats.by_status.inactive;
    
    // Update review stats (if needed)
    // document.getElementById('pendingReviews').textContent = data.review_stats.pending_reviews;
    // document.getElementById('totalReviews').textContent = data.review_stats.total;
    
    // Initialize chart with revenue data
    initializeChart(data.revenue_stats.revenue_data);
}

// Function to initialize the chart
function initializeChart(revenueData) {
    const ctx = document.getElementById('orderChart').getContext('2d');
    
    // Prepare data for chart
    const labels = revenueData.map(item => item.date);
    const revenueValues = revenueData.map(item => item.revenue);
    const orderCounts = revenueData.map(item => item.order_count);
    
    // Destroy previous chart if it exists
    if (window.orderChart) {
        window.orderChart.destroy();
    }
    
    window.orderChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Revenue',
                    data: revenueValues,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Orders',
                    data: orderCounts,
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    type: 'line',
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Revenue and Orders Over Time'
                },
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Revenue'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Order Count'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

// Function to show alert
function showAlert(message) {
    const alertElement = document.querySelector('.alert');
    alertElement.querySelector('p').textContent = message;
    alertElement.style.display = 'block';
    
    // Hide alert after 5 seconds
    setTimeout(() => {
        alertElement.style.display = 'none';
    }, 5000);
}

// Event listener for date filter button
document.querySelector('.dateFilter button').addEventListener('click', function() {
    const startDateInput = document.querySelector('.dateFilter input:first-of-type');
    const endDateInput = document.querySelector('.dateFilter input:last-of-type');
    
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    
    if (startDate && endDate) {
        fetchDashboardData(startDate, endDate);
    } else {
        showAlert("Please select both start and end dates");
    }
});

// Event listener for duration filter
document.querySelector('.durationFilter').addEventListener('change', function(e) {
    const duration = e.target.value;
    let startDate = null;
    let endDate = new Date().toISOString().split('T')[0]; // Today's date
    
    if (duration === "Last 30 days") {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        startDate = startDate.toISOString().split('T')[0];
    } else if (duration === "Last 60 days") {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 60);
        startDate = startDate.toISOString().split('T')[0];
    } else if (duration === "Last 90 days") {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 90);
        startDate = startDate.toISOString().split('T')[0];
    } else if (duration === "Last 6 months") {
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);
        startDate = startDate.toISOString().split('T')[0];
    } else if (duration === "Last 1 year") {
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        startDate = startDate.toISOString().split('T')[0];
    }
    
    if (startDate) {
        fetchDashboardData(startDate, endDate);
    } else {
        fetchDashboardData(); // Fetch all data
    }
});

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    const authToken = localStorage.getItem("auth_token");
    if (!authToken) {
        window.location.href = "/login.html";
        return;
    }
    
    // Load initial dashboard data
    fetchDashboardData();
    
    // Set up logout button
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem("auth_token");
        window.location.href = "/login.html";
    });
});