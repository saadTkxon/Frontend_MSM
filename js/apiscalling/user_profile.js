// DOM Elements
const accountForm = document.querySelector('.accountForm');
const personalInfoHere = document.querySelector('.personalInfoHere');
const primaryAddressHere = document.querySelector('.userAddressHere');
const allAddressesHere = document.querySelector('.allUserAddressesHere');
const editAddressForm = document.querySelector('.editAddressForm');
const editAddressSaveBtn = document.querySelector('.editAddressSaveBtn');
const changePasswordForm = document.querySelector('.changePasswordForm');
const changePasswordSaveBtn = document.querySelector('.changePasswordSaveBtn');

// API Endpoints
const GET_PROFILE_URL = 'http://localhost:5000/usertrs/get_profile';
const UPDATE_PROFILE_URL = 'http://localhost:5000/usertrs/update_profile';
// const CHANGE_PASSWORD_URL = 'http://localhost:5000/usertrs/change_password';
const GET_ADDRESSES_URL = 'http://localhost:5000/usertrs/get_addresses';
const ADD_ADDRESS_URL = 'http://localhost:5000/usertrs/add_address';
const UPDATE_ADDRESS_URL = 'http://localhost:5000/usertrs/update_address';
const DELETE_ADDRESS_URL = 'http://localhost:5000/usertrs/delete_address';

// Global variables
let userProfile = null;
let userAddresses = [];
let selectedAddressId = localStorage.getItem('selectedAddressId');

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    fetchUserProfile();
    
    // Go back button
    const goBackBtn = document.querySelector('.goBack');
    if (goBackBtn) {
        goBackBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.history.back();
        });
    }
});

// Fetch user profile from API
async function fetchUserProfile() {
    try {
        const authToken = localStorage.getItem("auth_token");
        const response = await fetch(GET_PROFILE_URL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }
        
        const data = await response.json();
        userProfile = data.response;
        
        // Extract addresses from profile response
        userAddresses = userProfile.addresses || [];
        
        renderProfile(userProfile);
        renderAddresses(userAddresses);
        
        // Set selected address if none is selected
        if (userAddresses.length > 0 && !selectedAddressId) {
            const primaryAddress = userAddresses.find(addr => addr.is_primary === true);
            if (primaryAddress) {
                selectedAddressId = primaryAddress.number_of_addresses;
                localStorage.setItem('selectedAddressId', selectedAddressId);
            } else {
                selectedAddressId = userAddresses[0].number_of_addresses;
                localStorage.setItem('selectedAddressId', selectedAddressId);
            }
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
        showAlert('Failed to load profile. Please try again.');
    }
}

// Render user profile
function renderProfile(profile) {
    if (!profile) return;
    
    // Personal info section
    if (personalInfoHere) {
        const email = profile.email || '';
        const maskedEmail = email.length > 2 ? 
            email.charAt(0) + '*'.repeat(email.split('@')[0].length - 2) + email.charAt(email.split('@')[0].length - 1) + '@' + email.split('@')[1] : 
            email;
        
        personalInfoHere.innerHTML = `
            <p class="personalName">
                <span>${profile.first_name || ''}</span>&nbsp;
                <span>${profile.last_name || ''}</span>
            </p>
            <p><span>${maskedEmail}</span></p>
        `;
    }
    
    // Fill edit form
    if (editAddressForm) {
        document.getElementById('userFirstName').value = profile.first_name || '';
        document.getElementById('userLastName').value = profile.last_name || '';
        document.getElementById('userEmail').value = profile.email || '';
    }
}

// Render addresses
function renderAddresses(addresses) {
    // Find primary address (where is_primary is true)
    const primaryAddress = addresses.find(addr => addr.is_primary === true) || 
                         (addresses.length > 0 ? addresses[0] : null);
    
    if (primaryAddressHere && primaryAddress) {
        primaryAddressHere.innerHTML = `
            <p>
                <span>${primaryAddress.full_name || 'N/A'}</span>&nbsp;&nbsp;-&nbsp;&nbsp;
                <span>${primaryAddress.phone_number || 'N/A'}</span>
            </p>
            <div class="userAddressArea">
                <h2>${primaryAddress.address_origin || 'N/A'}</h2>&nbsp;&nbsp;
                <p>
                    <span>${primaryAddress.address || 'N/A'}</span>,&nbsp;
                    <span>${primaryAddress.city || 'N/A'}</span>,&nbsp;
                    <span>${primaryAddress.postal_code || 'N/A'}</span>
                </p>
            </div>
        `;
    }
    
    // All addresses in address book
    if (allAddressesHere) {
        allAddressesHere.innerHTML = '';
        
        addresses.forEach(address => {
            const addressElement = document.createElement('div');
            addressElement.className = 'userAddressHere';
            addressElement.innerHTML = `
                <p>
                    <span>${address.full_name || 'N/A'}</span>&nbsp;&nbsp;-&nbsp;&nbsp;
                    <span>${address.phone_number || 'N/A'}</span>
                    <button class="editAddressBtn" data-address-id="${address.number_of_addresses}" onclick="editAddress(event, ${address.number_of_addresses})">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path fill="none" stroke="currentColor" stroke-linecap="round" d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                    </button>
                    <button class="deleteAddressBtn" data-address-id="${address.number_of_addresses}" onclick="deleteAddress(event, ${address.number_of_addresses})">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <g fill="none" stroke="currentColor">
                                <circle cx="12" cy="12" r="10" />
                                <path stroke-linecap="round" d="m14.5 9.5l-5 5m0-5l5 5" />
                            </g>
                        </svg>
                    </button>
                </p>
                <div class="userAddressArea">
                    <h2>${address.address_origin || 'N/A'}</h2>&nbsp;&nbsp;
                    <p>
                        <span>${address.address || 'N/A'}</span>,&nbsp;
                        <span>${address.city || 'N/A'}</span>,&nbsp;
                        <span>${address.postal_code || 'N/A'}</span>
                    </p>
                </div>
            `;
            
            // Highlight the selected/primary address
            if (address.is_primary || address.number_of_addresses == selectedAddressId) {
                addressElement.classList.add('selectedAddress');
            }
            
            // Add click handler to set as primary
            addressElement.addEventListener('click', () => {
                setPrimaryAddress(address.number_of_addresses);
            });
            
            allAddressesHere.appendChild(addressElement);
        });
    }
}

// Set primary address
async function setPrimaryAddress(addressId) {
    try {
        const authToken = localStorage.getItem("auth_token");
        const response = await fetch(`${UPDATE_ADDRESS_URL}/${addressId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                is_primary: true
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to set primary address');
        }
        
        selectedAddressId = addressId;
        localStorage.setItem('selectedAddressId', selectedAddressId);
        await fetchUserProfile(); // Refresh the profile to get updated addresses
        showAlert('Primary address updated successfully');
    } catch (error) {
        console.error('Error setting primary address:', error);
        showAlert(error.message || 'Failed to set primary address. Please try again.');
    }
}

// Edit address
async function editAddress(event, addressId) {
    event.stopPropagation();
    
    try {
        const authToken = localStorage.getItem("auth_token");
        const response = await fetch(`${GET_ADDRESSES_URL}/${addressId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch address details');
        }
        
        const address = data.response;
        
        // Fill the edit form with address details
        document.getElementById('addressOrigin').value = address.address_origin || '';
        document.getElementById('fullName').value = address.full_name || '';
        document.getElementById('phoneNumber').value = address.phone_number || '';
        document.getElementById('address').value = address.address || '';
        document.getElementById('city').value = address.city || '';
        document.getElementById('postalCode').value = address.postal_code || '';
        document.getElementById('addressId').value = address.number_of_addresses || '';
        
        // Open edit modal
        openEditAddress();
    } catch (error) {
        console.error('Error fetching address details:', error);
        showAlert(error.message || 'Failed to load address details. Please try again.');
    }
}

// Update profile
if (editAddressSaveBtn) {
    editAddressSaveBtn.addEventListener('click', async () => {
        const formData = {
            first_name: document.getElementById('userFirstName').value.trim(),
            last_name: document.getElementById('userLastName').value.trim(),
            email: document.getElementById('userEmail').value.trim(),
        };
        
        // Validate form
        if (!formData.first_name || !formData.last_name || !formData.email) {
            showAlert('Please fill all required fields');
            return;
        }
        
        try {
            const authToken = localStorage.getItem("auth_token");
            const response = await fetch(UPDATE_PROFILE_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }
            
            showAlert('Profile updated successfully');
            await fetchUserProfile();
            closeEditAddress();
        } catch (error) {
            console.error('Error updating profile:', error);
            showAlert(error.message || 'Failed to update profile. Please try again.');
        }
    });
}



// Delete address
async function deleteAddress(event, addressId) {
    event.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this address?')) {
        return;
    }
    
    try {
        const authToken = localStorage.getItem("auth_token");
        const response = await fetch(`${DELETE_ADDRESS_URL}/${addressId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete address');
        }
        
        showAlert('Address deleted successfully');
        await fetchUserProfile();
    } catch (error) {
        console.error('Error deleting address:', error);
        showAlert(error.message || 'Failed to delete address. Please try again.');
    }
}

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
function openEditAddress() {
    const editAddressArea = document.querySelector('.editAddressArea');
    if (!editAddressArea) return;
    
    editAddressArea.style.display = 'block';
    setTimeout(() => {
        editAddressArea.style.opacity = 1;
        editAddressArea.style.transform = "translateX(0%)";
    }, 10);
}

function closeEditAddress() {
    const editAddressArea = document.querySelector('.editAddressArea');
    if (!editAddressArea) return;
    
    editAddressArea.style.opacity = 0;
    editAddressArea.style.transform = "translateX(110%)";
    setTimeout(() => {
        editAddressArea.style.display = 'none';
    }, 300);
}

function openChangePassword() {
    const changePasswordArea = document.querySelector('.changePasswordArea');
    if (!changePasswordArea) return;
    
    changePasswordArea.style.display = 'block';
    setTimeout(() => {
        changePasswordArea.style.opacity = 1;
        changePasswordArea.style.transform = "translateX(0%)";
    }, 10);
}

function closeChangePassword() {
    const changePasswordArea = document.querySelector('.changePasswordArea');
    if (!changePasswordArea) return;
    
    changePasswordArea.style.opacity = 0;
    changePasswordArea.style.transform = "translateX(110%)";
    setTimeout(() => {
        changePasswordArea.style.display = 'none';
    }, 300);
}


// Add these to your existing modal control functions
function openChangeAddress() {
    const changeAddressArea = document.querySelector('.changeAddressArea');
    if (!changeAddressArea) return;
    
    changeAddressArea.style.display = 'block';
    setTimeout(() => {
        changeAddressArea.style.opacity = 1;
        changeAddressArea.style.transform = "translateX(0%)";
    }, 10);
    
    // Render addresses in the modal
    renderAddressSelectionModal(userAddresses);
}

function closeChangeAddress() {
    const changeAddressArea = document.querySelector('.changeAddressArea');
    if (!changeAddressArea) return;
    
    changeAddressArea.style.opacity = 0;
    changeAddressArea.style.transform = "translateX(110%)";
    setTimeout(() => {
        changeAddressArea.style.display = 'none';
    }, 300);
}

// Function to render addresses in the selection modal
function renderAddressSelectionModal(addresses) {
    const changeAddressForm = document.querySelector('.changeAddressForm');
    if (!changeAddressForm) return;
    
    // Clear existing content
    changeAddressForm.innerHTML = '';
    
    // Add each address as a radio option
    addresses.forEach((address, index) => {
        const addressElement = document.createElement('div');
        addressElement.className = 'oneSavedAddress';
        addressElement.innerHTML = `
            <div class="checkoutAddressSelection">
                <input type="radio" name="checkoutAddress" id="checkoutAddress${index}" 
                    ${address.is_primary || address.number_of_addresses == selectedAddressId ? 'checked' : ''}
                    data-address-id="${address.number_of_addresses}">
                <label for="checkoutAddress${index}"><span class="circle"></span></label>
            </div>
            <div class="oneSavedAddressHere">
                <p><span class="oneSavedAddressName">${address.full_name || 'N/A'}</span>&nbsp;&nbsp;-&nbsp;&nbsp;
                <span class="oneSavedAddressPhoneNumber">${address.phone_number || 'N/A'}</span></p>
                <div class="oneSavedAddressAddressArea">
                    <p><span class="oneSavedAddressAddress">${address.address || 'N/A'}</span>,&nbsp;
                    <span class="shippingCity">${address.city || 'N/A'}</span>,&nbsp;
                    <span class="shippingPostalCode">${address.postal_code || 'N/A'}</span></p>
                    <h2>${address.address_origin || 'N/A'}</h2>
                </div>
            </div>
        `;
        
        changeAddressForm.appendChild(addressElement);
    });
    


    
    // Add action buttons
    const actionButtons = document.createElement('div');
    actionButtons.className = 'changeAddressFormActButtons';
    actionButtons.innerHTML = `
        <button class="changeAddressCloseBtn" type="button" onclick="closeChangeAddress()">close</button>
        <button class="changeAddressSaveBtn" type="button" onclick="saveSelectedAddress()">save</button>
    `;
    changeAddressForm.appendChild(actionButtons);
}
// Function to handle saving the selected address
async function saveSelectedAddress() {
    const selectedRadio = document.querySelector('input[name="checkoutAddress"]:checked');
    if (!selectedRadio) return;
    
    const addressId = selectedRadio.dataset.addressId;
    await updatePrimaryAddress(addressId);
    closeChangeAddress();
}

// Update primary address via API
async function updatePrimaryAddress(addressId) {
    try {
        const authToken = localStorage.getItem("auth_token");
        const response = await fetch('http://localhost:5000/usertrs/update_primary_address', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                number_of_addresses: addressId
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to update primary address');
        }
        
        // Update the selected address in local storage
        selectedAddressId = addressId;
        localStorage.setItem('selectedAddressId', selectedAddressId);
        
        // Refresh the addresses to show the updated primary address
        await fetchUserProfile();
        showAlert('Primary address updated successfully');
    } catch (error) {
        console.error('Error updating primary address:', error);
        showAlert(error.message || 'Failed to update primary address. Please try again.');
    }
}

// Replace the existing setPrimaryAddress function with this one
async function setPrimaryAddress(addressId) {
    await updatePrimaryAddress(addressId);
}








// Function to handle adding a new address
async function addNewAddress() {
    // Get form values
    const firstName = document.getElementById('registerFirstName').value.trim();
    const lastName = document.getElementById('registerLastName').value.trim();
    const phoneNumber = document.getElementById('registerPhoneNumber').value.trim();
    const address = document.getElementById('registerAddress').value.trim();
    const city = document.getElementById('registerCity').value.trim();
    const postalCode = document.getElementById('registerPostalCode').value.trim();
    const addressOrigin = document.querySelector('input[name="addressOrigin"]:checked').value;
    
    // Validate form
    if (!firstName || !lastName || !phoneNumber || !address || !city || !postalCode) {
        showAlert('Please fill all required fields');
        return;
    }
    
    // Prepare the data to send
    const addressData = {
        full_name: `${firstName} ${lastName}`,
        last_name: lastName,
        phone_number: phoneNumber,
        address: address,
        city: city,
        postal_code: postalCode,
        address_origin: addressOrigin
    };
    
    try {
        const authToken = localStorage.getItem("auth_token");
        const response = await fetch(ADD_ADDRESS_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(addressData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to add address');
        }
        
        showAlert('Address added successfully');
        closeAddAddress();
        await fetchUserProfile(); // Refresh the profile to show the new address
    } catch (error) {
        console.error('Error adding address:', error);
        showAlert(error.message || 'Failed to add address. Please try again.');
    }
}

// Add event listener to the save button
document.querySelector('.addAddressSaveBtn')?.addEventListener('click', addNewAddress);
















// Function to handle profile update form submission
document.getElementById('editProfileForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    console.log('[EVENT] Form submitted');

    // Show loading indicator
    document.querySelector('.loading').style.display = 'flex';
    console.log('[LOADING] Show loading indicator');

    try {
        // Get form data
        const firstName = document.getElementById('userFirstName').value;
        const lastName = document.getElementById('userLastName').value;
        const email = document.getElementById('userEmail').value;
        const gender = document.getElementById('userGender').value;
        const dob = document.getElementById('userDob').value;

        console.log('[INPUT] First Name:', firstName);
        console.log('[INPUT] Last Name:', lastName);
        console.log('[INPUT] Email:', email);
        console.log('[INPUT] Gender:', gender);
        console.log('[INPUT] DOB:', dob);

        const formData = {
            first_name: firstName,
            last_name: lastName,
            email: email,
            gender: gender,
            dob: dob
        };

        console.log('[FORM DATA] Prepared data to send:', formData);

        // Get auth token from localStorage
        const token = localStorage.getItem('auth_token');
        console.log('[AUTH TOKEN] Retrieved from localStorage:', token);

        if (!token) {
            console.warn('[AUTH ERROR] No token found in localStorage');
            showAlert('Authentication token missing');
            return;
        }

        // Make API call
        console.log('[REQUEST] Sending PUT request to /usertrs/update_profile');
        const response = await fetch('http://localhost:5000/usertrs/update_profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        console.log('[RESPONSE STATUS]', response.status);
        const data = await response.json();
        console.log('[RESPONSE DATA]', data);

        if (response.ok) {
            console.log('[SUCCESS] Profile updated');
            showAlert('Profile updated successfully');
            closeEditAddress();
            // Optional: fetchUserProfile(); // to refresh UI
        } else {
            console.warn('[ERROR] Failed to update profile:', data.message);
            showAlert(data.message || 'Failed to update profile');
        }
    } catch (error) {
        console.error('[EXCEPTION] Error updating profile:', error);
        showAlert('An error occurred while updating profile');
    } finally {
        // Hide loading indicator
        document.querySelector('.loading').style.display = 'none';
        console.log('[LOADING] Hide loading indicator');
    }
});








// Password change form handler
document.getElementById('changePasswordForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Show loading indicator
    document.querySelector('.loading').style.display = 'flex';
    
    try {
        // Get form values
        const oldPassword = document.getElementById('userCurrentPassword').value;
        const newPassword = document.getElementById('userNewPassword').value;
        const confirmPassword = document.getElementById('userNewPasswordConfirm').value;
        
        // Validate passwords
        if (newPassword !== confirmPassword) {
            throw new Error('New passwords do not match');
        }
        
        if (newPassword.length < 6) {
            throw new Error('Password must be at least 6 characters');
        }
        
        // Get auth token
        const token = localStorage.getItem('auth_token');
        if (!token) {
            throw new Error('Authentication token missing');
        }
        
        // Prepare request data
        const requestData = {
            old_password: oldPassword,
            new_password: newPassword
        };
        
        // Make API call
        const response = await fetch('http://localhost:5000/usertrs/ch_password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to change password');
        }
        
        // Success - show message and reset form
        showAlert('Password changed successfully');
        document.getElementById('changePasswordForm').reset();
        closeChangePassword();
        
    } catch (error) {
        console.error('Password change error:', error);
        showAlert(error.message || 'Failed to change password');
    } finally {
        // Hide loading indicator
        document.querySelector('.loading').style.display = 'none';
    }
});















// Make functions available globally
window.closeAddAddress = closeAddAddress;
window.openAddAddress = openAddAddress;



// Make functions available globally
window.openEditAddress = openEditAddress;
window.closeEditAddress = closeEditAddress;
window.openChangePassword = openChangePassword;
window.closeChangePassword = closeChangePassword;
window.deleteAddress = deleteAddress;
window.editAddress = editAddress;
window.setPrimaryAddress = setPrimaryAddress;
window.openChangeAddress = openChangeAddress;
window.closeChangeAddress = closeChangeAddress;
window.saveSelectedAddress = saveSelectedAddress;





