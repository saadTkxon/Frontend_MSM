// DOM Elements
const changeAddressArea = document.querySelector('.changeAddressArea');
const addAddressArea = document.querySelector('.addAddressArea');
const changeAddressForm = document.querySelector('.changeAddressForm');
const addAddressForm = document.querySelector('.addAddressForm');
const changeAddressSaveBtn = document.querySelector('.changeAddressSaveBtn');
const addAddressSaveBtn = document.querySelector('.addAddressSaveBtn');
const checkoutAddressHere = document.querySelector('.checkoutAddressHere');

// API Endpoints
const GET_ADDRESSES_URL = 'http://localhost:5000/usertrs/get_addresses';
const ADD_ADDRESS_URL = 'http://localhost:5000/usertrs/add_address';

// Global variable to store selected address
let selectedAddress = null;
let allAddresses = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    fetchAddresses();
    
    // // Set up event listeners for radio buttons
    // if (changeAddressForm) {
    //     changeAddressForm.addEventListener('change', (e) => {
    //         if (e.target.name === 'checkoutAddress') {
    //             const addressId = e.target.dataset.addressId;
    //             selectedAddress = allAddresses.find(addr => addr.address_id == addressId);
    //         }
    //     });
    // }

    // Set up event listeners for radio buttons
if (changeAddressForm) {
    changeAddressForm.addEventListener('change', (e) => {
        if (e.target.name === 'checkoutAddress') {
            const addressId = e.target.dataset.addressId;
            selectedAddress = allAddresses.find(addr => addr.address_id == addressId);
            
            // Store the selected address ID in localStorage
            localStorage.setItem('selectedAddressId', addressId);
            console.log('Selected address ID stored:', addressId);
        }
    });
}
});

// // Fetch addresses from API
// async function fetchAddresses() {
//     try {
//         const authToken = localStorage.getItem("auth_token");
//         const response = await fetch(GET_ADDRESSES_URL, {
//             method: 'GET',
//             headers: {
//                 "Authorization": `Bearer ${authToken}`
//             }
//         });
        
//         if (!response.ok) {
//             throw new Error('Failed to fetch addresses');
//         }
        
//         const data = await response.json();
//         allAddresses = data.response.addresses;
//         renderAddresses(allAddresses);
        
//         // Set the first address as default if none is selected
//         if (allAddresses.length > 0 && !selectedAddress) {
//             selectedAddress = allAddresses[0];
//             updateCheckoutAddressDisplay(selectedAddress);
//         }
//     } catch (error) {
//         console.error('Error fetching addresses:', error);
//         showAlert('Failed to load addresses. Please try again.');
//     }
// }

async function fetchAddresses() {
    try {
        const authToken = localStorage.getItem("auth_token");
        const response = await fetch(GET_ADDRESSES_URL, {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${authToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch addresses');
        }
        
        const data = await response.json();
        allAddresses = data.response.addresses;
        renderAddresses(allAddresses);
        
        // Get any previously selected address from localStorage
        const savedAddressId = localStorage.getItem('selectedAddressId');
        
        // Try to find the saved address in the fetched addresses
        if (savedAddressId) {
            selectedAddress = allAddresses.find(addr => addr.address_id == savedAddressId);
        }
        
        // If no address is selected (or saved address not found), select the first one
        if (allAddresses.length > 0 && !selectedAddress) {
            selectedAddress = allAddresses[0];
            localStorage.setItem('selectedAddressId', selectedAddress.address_id);
        }
        
        // Update the UI with the selected address
        if (selectedAddress) {
            updateCheckoutAddressDisplay(selectedAddress);
        }
    } catch (error) {
        console.error('Error fetching addresses:', error);
        showAlert('Failed to load addresses. Please try again.');
    }
}





// Render addresses in the change address form
function renderAddresses(addresses) {
    if (!changeAddressForm) return;
    
    // Clear existing addresses (except the first one which is the template)
    const existingAddresses = changeAddressForm.querySelectorAll('.oneSavedAddress');
    for (let i = 1; i < existingAddresses.length; i++) {
        existingAddresses[i].remove();
    }
    
    // Add each address to the form
    addresses.forEach((address, index) => {
        const addressElement = createAddressElement(address, index + 1);
        const buttonsContainer = changeAddressForm.querySelector('.changeAddressFormActButtons');
        if (buttonsContainer) {
            changeAddressForm.insertBefore(addressElement, buttonsContainer);
        }
    });
}

// Create HTML element for an address
function createAddressElement(address, index) {
    const addressElement = document.createElement('div');
    addressElement.className = 'oneSavedAddress';
    
    addressElement.innerHTML = `
        <div class="checkoutAddressSelection">
            <input type="radio" name="checkoutAddress" id="checkoutAddress${index}" 
                   data-address-id="${address.address_id}" 
                   ${selectedAddress && selectedAddress.address_id === address.address_id ? 'checked' : ''}>
            <label for="checkoutAddress${index}"><span class="circle"></span></label>
        </div>
        <div class="oneSavedAddressHere">
            <p>
                <span class="oneSavedAddressName">${address.full_name || 'N/A'}</span>&nbsp;&nbsp;-&nbsp;&nbsp;
                <span class="oneSavedAddressPhoneNumber">${address.phone_number || 'N/A'}</span>
            </p>
            <div class="oneSavedAddressAddressArea">
                <p>
                    <span class="oneSavedAddressAddress">${address.address || 'N/A'}</span>,&nbsp;
                    <span class="shippingCity">${address.city || 'N/A'}</span>,&nbsp;
                    <span class="shippingPostalCode">${address.postal_code || 'N/A'}</span>
                </p>
                <h2>${address.address_origin || 'N/A'}</h2>
            </div>
        </div>
    `;
    
    return addressElement;
}

// Update the displayed address in the checkout section
function updateCheckoutAddressDisplay(address) {
    if (!address || !checkoutAddressHere) return;
    
    const nameElement = checkoutAddressHere.querySelector('#shippingName');
    const phoneElement = checkoutAddressHere.querySelector('#shippingPhoneNumber');
    const addressElement = checkoutAddressHere.querySelector('#shippingAddress');
    const cityElement = checkoutAddressHere.querySelector('#shippingCity');
    const postalCodeElement = checkoutAddressHere.querySelector('#shippingPostalCode');
    const addressOriginElement = checkoutAddressHere.querySelector('.shippingAddressArea h2');
    
    if (nameElement) nameElement.textContent = address.full_name || '';
    if (phoneElement) phoneElement.textContent = address.phone_number || '';
    if (addressElement) addressElement.textContent = address.address || '';
    if (cityElement) cityElement.textContent = address.city || '';
    if (postalCodeElement) postalCodeElement.textContent = address.postal_code || '';
    if (addressOriginElement) addressOriginElement.textContent = address.address_origin || '';
}

// Save selected address
if (changeAddressSaveBtn) {
    changeAddressSaveBtn.addEventListener('click', () => {
        if (!selectedAddress) {
            showAlert('Please select an address');
            return;
        }
        
        // Update the displayed address
        updateCheckoutAddressDisplay(selectedAddress);
        closeChangeAddress();
        
        showAlert('Address updated successfully');
    });
}

// // Save new address
// if (addAddressSaveBtn) {
//     addAddressSaveBtn.addEventListener('click', async () => {
//         const formData = {
//             full_name: `${document.getElementById('registerFirstName').value} ${document.getElementById('registerLastName').value}`.trim(),
//             phone_number: document.getElementById('registerPhoneNumber').value,
//             address: document.getElementById('registerAddress').value,
//             city: document.getElementById('registerCity').value,
//             postal_code: document.getElementById('registerPostalCode').value,
//             address_origin: document.querySelector('input[name="addressOrigin"]:checked')?.id.replace('addressOrigin', '').toLowerCase() || 'home'
//         };
        
//         // Validate form
//         if (!formData.full_name || !formData.phone_number || !formData.address || !formData.city || !formData.postal_code) {
//             showAlert('Please fill all required fields');
//             return;
//         }
        
//         try {
//             const authToken = localStorage.getItem("auth_token");
//             const response = await fetch(ADD_ADDRESS_URL, {
//                 method: 'POST',
//                 headers: {
//                     "Authorization": `Bearer ${authToken}`,
//                     "Content-Type": "application/json"
//                 },
//                 body: JSON.stringify(formData)
//             });
            
//             const responseData = await response.json();
//             console.log('API Response:', responseData); // Log the full response

//             if (!response.ok) {
//                 throw new Error('Failed to add address');
//             }
            
//             const data = await response.json();
//             showAlert('Address added successfully');
            
//             // Refresh the addresses list
//             await fetchAddresses();
            
//             // Select the newly added address
//             if (data.response && data.response.address_id) {
//                 selectedAddress = {
//                     ...formData,
//                     address_id: data.response.address_id
//                 };
//                 updateCheckoutAddressDisplay(selectedAddress);
//             }
            
//             closeAddAddress();
            
//             // Clear the form
//             addAddressForm.reset();
//             document.getElementById('addressOriginHome').checked = true;
            
//         } catch (error) {
//             console.error('Error adding address:', error);
//             showAlert('Failed to add address. Please try again.');
//         }
//     });
// }

addAddressSaveBtn.addEventListener('click', async () => {
    const formData = {
        full_name: document.getElementById('registerFirstName').value.trim(),
        last_name: document.getElementById('registerLastName').value.trim(),
        phone_number: document.getElementById('registerPhoneNumber').value,
        address: document.getElementById('registerAddress').value,
        city: document.getElementById('registerCity').value,
        postal_code: document.getElementById('registerPostalCode').value,
        address_origin: document.querySelector('input[name="addressOrigin"]:checked')?.id.replace('addressOrigin', '').toLowerCase() || 'home'
    };
    
    // Validate form
    if (!formData.full_name || !formData.last_name || !formData.phone_number || 
        !formData.address || !formData.city || !formData.postal_code) {
        showAlert('Please fill all required fields');
        return;
    }
    
    try {
        const authToken = localStorage.getItem("auth_token");
        const response = await fetch(ADD_ADDRESS_URL, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });
        
        const responseData = await response.json();
        console.log('API Response:', responseData);

        if (!response.ok || responseData.message !== "Address added successfully") {
            throw new Error(responseData.message || 'Failed to add address');
        }
        
        showAlert('Address added successfully');
        
        // Simply refresh the addresses list without selecting the new one
        await fetchAddresses();
        
        // Close the add address form
        closeAddAddress();
        
        // Clear the form
        addAddressForm.reset();
        document.getElementById('addressOriginHome').checked = true;
        
    } catch (error) {
        console.error('Error adding address:', error);
        showAlert(error.message || 'Failed to add address. Please try again.');
    }
});





// Show alert message
function showAlert(message) {
    const alertElement = document.querySelector('.alert');
    if (!alertElement) return;
    
    const alertMessage = alertElement.querySelector('p');
    if (alertMessage) {
        alertMessage.textContent = message;
    }
    
    alertElement.style.display = 'block';
    
    // Hide after 3 seconds
    setTimeout(() => {
        alertElement.style.display = 'none';
    }, 3000);
}

// Modal control functions
function openAddAddress() {
    if (!changeAddressArea || !addAddressArea) return;
    
    closeChangeAddress();
    addAddressArea.style.display = 'block';
    setTimeout(() => {
        addAddressArea.style.opacity = 1;
        addAddressArea.style.transform = "translateX(0%)";
    }, 10);
}

function closeAddAddress() {
    if (!addAddressArea) return;
    
    addAddressArea.style.opacity = 0;
    addAddressArea.style.transform = "translateX(110%)";
    setTimeout(() => {
        addAddressArea.style.display = 'none';
    }, 300);
}

function openChangeAddress() {
    if (!changeAddressArea) return;
    
    fetchAddresses();
    changeAddressArea.style.display = 'block';
    setTimeout(() => {
        changeAddressArea.style.opacity = 1;
        changeAddressArea.style.transform = "translateX(0%)";
    }, 10);
}

function closeChangeAddress() {
    if (!changeAddressArea) return;
    
    changeAddressArea.style.opacity = 0;
    changeAddressArea.style.transform = "translateX(110%)";
    setTimeout(() => {
        changeAddressArea.style.display = 'none';
    }, 300);
}

// Make functions available globally
window.openAddAddress = openAddAddress;
window.closeAddAddress = closeAddAddress;
window.openChangeAddress = openChangeAddress;
window.closeChangeAddress = closeChangeAddress;




