// Function to show custom alert
function showAlert(message) {
    const alertElement = document.querySelector('.alert');
    alertElement.querySelector('p').textContent = message;
    alertElement.style.display = 'block';
    setTimeout(() => {
        alertElement.style.display = 'none';
    }, 5000);
}

// Function to show custom confirmation
function showConfirmation(message, callback) {
    const confirmationElement = document.querySelector('.confirmation');
    confirmationElement.querySelector('h1').textContent = message;
    const [cancelBtn, confirmBtn] = confirmationElement.querySelectorAll('.confirmationButtons button');
    
    // Set up event listeners
    const handleConfirm = () => {
        confirmationElement.style.display = 'none';
        callback(true);
        confirmBtn.removeEventListener('click', handleConfirm);
    };
    
    const handleCancel = () => {
        confirmationElement.style.display = 'none';
        callback(false);
        cancelBtn.removeEventListener('click', handleCancel);
    };
    
    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
    
    confirmationElement.style.display = 'block';
}

function closeConfirmation() {
    document.querySelector('.confirmation').style.display = 'none';
}