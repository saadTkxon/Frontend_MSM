document.addEventListener('DOMContentLoaded', function() {
    // Add event listener for date filter
    const dateFilter = document.querySelector('.dateFilter');
    if (dateFilter) {
        const startDateInput = dateFilter.querySelector('input:nth-child(1)');
        const endDateInput = dateFilter.querySelector('input:nth-child(3)');
        const applyButton = dateFilter.querySelector('button');
        
        applyButton.addEventListener('click', function(e) {
            e.preventDefault();
            applyDateFilter(startDateInput.value, endDateInput.value);
        });
        
        // Also allow Enter key to trigger filter
        startDateInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                applyDateFilter(startDateInput.value, endDateInput.value);
            }
        });
        
        endDateInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                applyDateFilter(startDateInput.value, endDateInput.value);
            }
        });
    }
});

function applyDateFilter(startDateStr, endDateStr) {
    // If both dates are empty, show all rows
    if (!startDateStr && !endDateStr) {
        const allRows = document.querySelectorAll('.tableOneOrder');
        allRows.forEach(row => row.style.display = '');
        updateVisibleOrderCount();
        checkEmptyState();
        return;
    }
    
    // Parse date strings into Date objects
    const startDate = startDateStr ? new Date(startDateStr) : null;
    const endDate = endDateStr ? new Date(endDateStr) : null;
    
    // If end date is provided without time, set it to end of day
    if (endDate) {
        endDate.setHours(23, 59, 59, 999);
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
        
        // Check if date is within range
        let shouldShow = true;
        
        if (startDate && orderDate < startDate) {
            shouldShow = false;
        }
        
        if (endDate && orderDate > endDate) {
            shouldShow = false;
        }
        
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
        document.querySelector('.dateFilter').appendChild(countDisplay);
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