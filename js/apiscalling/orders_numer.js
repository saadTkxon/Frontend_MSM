document.addEventListener('DOMContentLoaded', function() {
    // Add event listener for duration filter
    const durationFilter = document.querySelector('.durationFilter');
    if (durationFilter) {
        durationFilter.addEventListener('change', function() {
            applyDurationFilter(this.value);
        });
    }
});

function applyDurationFilter(duration) {
    // If no duration selected, show all rows
    if (!duration) {
        const allRows = document.querySelectorAll('.tableOneOrder');
        allRows.forEach(row => row.style.display = '');
        updateVisibleOrderCount();
        checkEmptyState();
        return;
    }
    
    // Calculate the cutoff date based on the selected duration
    const cutoffDate = new Date();
    switch (duration) {
        case 'Last 30 days':
            cutoffDate.setDate(cutoffDate.getDate() - 30);
            break;
        case 'Last 60 days':
            cutoffDate.setDate(cutoffDate.getDate() - 60);
            break;
        case 'Last 90 days':
            cutoffDate.setDate(cutoffDate.getDate() - 90);
            break;
        case 'Last 6 months':
            cutoffDate.setMonth(cutoffDate.getMonth() - 6);
            break;
        case 'Last 1 year':
            cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
            break;
        default:
            // If unknown duration, show all rows
            const allRows = document.querySelectorAll('.tableOneOrder');
            allRows.forEach(row => row.style.display = '');
            updateVisibleOrderCount();
            checkEmptyState();
            return;
    }
    
    // Get all order rows
    const orderRows = document.querySelectorAll('.tableOneOrder');
    let hasVisibleOrders = false;
    
    orderRows.forEach(row => {
        // Get the date string from the placedOnCell
        const dateSpan = row.querySelector('.placedOnCell span');
        if (!dateSpan) {
            row.style.display = 'none';
            return;
        }
        
        // Parse the displayed date (format: "22 apr 2025 21:26:57")
        const orderDateStr = dateSpan.textContent.trim();
        const orderDate = parseDisplayedDate(orderDateStr);
        
        // Check if date is valid
        if (isNaN(orderDate.getTime())) {
            row.style.display = 'none';
            return;
        }
        
        // Check if date is within range (after cutoff date)
        const shouldShow = orderDate >= cutoffDate;
        
        if (shouldShow) {
            hasVisibleOrders = true;
        }
        
        row.style.display = shouldShow ? '' : 'none';
    });
    
    // Update the count of visible orders
    updateVisibleOrderCount();
    
    // Check if we need to show empty state
    checkEmptyState();
}

// Reuse these functions from your existing code
function parseDisplayedDate(dateStr) {
    // Parse date string like "22 apr 2025 21:26:57"
    const months = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };
    
    const parts = dateStr.split(' ');
    if (parts.length < 4) return new Date(NaN); // Invalid date
    
    const day = parseInt(parts[0]);
    const month = months[parts[1].toLowerCase()];
    const year = parseInt(parts[2]);
    const timeParts = parts[3].split(':');
    
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
        return new Date(NaN);
    }
    
    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);
    const seconds = parseInt(timeParts[2]);
    
    return new Date(year, month, day, hours, minutes, seconds);
}

function updateVisibleOrderCount() {
    const visibleCount = document.querySelectorAll('.tableOneOrder:not([style*="display: none"])').length;
    const totalCount = document.querySelectorAll('.tableOneOrder').length;
    
    // Update some element to show the count
    const countDisplay = document.querySelector('.filteredCount') || 
        document.createElement('div');
    
    if (!countDisplay.classList.contains('filteredCount')) {
        countDisplay.className = 'filteredCount';
        document.querySelector('.oneStatFilter').appendChild(countDisplay);
    }
    
    countDisplay.textContent = `Showing ${visibleCount} of ${totalCount} orders`;
}

function checkEmptyState() {
    const visibleCount = document.querySelectorAll('.tableOneOrder:not([style*="display: none"])').length;
    const emptyRow = document.querySelector('tr.empty');
    
    if (emptyRow) {
        if (visibleCount === 0) {
            emptyRow.style.display = 'table-row';
        } else {
            emptyRow.style.display = 'none';
        }
    }
}