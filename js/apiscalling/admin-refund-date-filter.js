document.addEventListener('DOMContentLoaded', function() {
    // Wait for the refund data to be loaded
    const checkDataLoaded = setInterval(function() {
        const refundRows = document.querySelectorAll('.tableOneOrder');
        if (refundRows.length > 0) {
            clearInterval(checkDataLoaded);
            initDateFilter();
        }
    }, 100);

    function initDateFilter() {
        const dateFilterButton = document.querySelector('.dateFilter button');
        const startDateInput = document.querySelector('.dateFilter input:first-of-type');
        const endDateInput = document.querySelector('.dateFilter input:last-of-type');

        dateFilterButton.addEventListener('click', applyDateFilter);

        function applyDateFilter(event) {
            event.preventDefault();  // ⭐ Add this line

            const startDate = startDateInput.value ? new Date(startDateInput.value) : null;
            const endDate = endDateInput.value ? new Date(endDateInput.value) : null;

            // If both dates are empty, show all rows
            if (!startDate && !endDate) {
                document.querySelectorAll('.tableOneOrder').forEach(row => {
                    row.style.display = '';
                });
                document.querySelector('.empty').style.display = 'none';
                return;
            }

            let hasVisibleRows = false;
            
            document.querySelectorAll('.tableOneOrder').forEach(row => {
                const dateText = row.querySelector('.placedOnCell span').textContent;
                // Parse the date text (format: "12 feb 2025 12:23:52")
                const dateParts = dateText.split(' ');
                const day = dateParts[0];
                const month = getMonthNumber(dateParts[1]);
                const year = dateParts[2];
                const time = dateParts[3];
                
                const rowDate = new Date(`${month} ${day}, ${year} ${time}`);
                
                let shouldShow = true;
                
                if (startDate && rowDate < startDate) {
                    shouldShow = false;
                }
                
                if (endDate && rowDate > endDate) {
                    shouldShow = false;
                }
                
                row.style.display = shouldShow ? '' : 'none';
                if (shouldShow) hasVisibleRows = true;
            });

            // Show empty state if no rows match the filter
            document.querySelector('.empty').style.display = hasVisibleRows ? 'none' : 'table-row';
        }

        function getMonthNumber(monthAbbr) {
            const months = {
                'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 
                'may': '05', 'jun': '06', 'jul': '07', 'aug': '08', 
                'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
            };
            return months[monthAbbr.toLowerCase()];
        }
    }
});