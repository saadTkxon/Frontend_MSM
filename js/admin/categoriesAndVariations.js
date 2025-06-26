console.log('Variations script loaded - Enhanced Version');

/* ========== DEBUGGING SETUP ========== */
const DEBUG_MODE = false; // Could be set from localStorage or URL parameter

function debugLog(message, data = null) {
    if (!DEBUG_MODE) return;
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] DEBUG: ${message}`);
    if (data) {
        console.log(`[${timestamp}] DATA:`, data);
    }
}

/* ========== GLOBAL VARIABLES ========== */
let currentVariationTitleId = null;
let currentConfirmationCallback = null;
let isProcessing = false; // Track ongoing operations

/* ========== DOM ELEMENTS ========== */
const addVariationArea = document.querySelector('.addVariationArea');
const addElementArea = document.querySelector('.addElementArea');
const variationsHere = document.querySelector('.variationsHere');
const alertDiv = document.querySelector('.alert');
const confirmationDiv = document.querySelector('.confirmation');

/* ========== API ENDPOINTS ========== */
const BASE_URL = 'http://localhost:5000/products';
const API_ENDPOINTS = {
    ADD_TITLE: `${BASE_URL}/add-variation-title`,
    GET_ALL: `${BASE_URL}/get-variations`,
    ADD_ELEMENT: `${BASE_URL}/add-variation`,
    DELETE_ELEMENT: `${BASE_URL}/delete-variation`,
    DELETE_TITLE: `${BASE_URL}/delete-variation-title`
};

/* ========== UI FUNCTIONS ========== */
function showAlert(message, type = 'info') {
    if (isProcessing) return;
    
    const alertMessage = alertDiv.querySelector('p');
    alertMessage.textContent = message;
    alertDiv.className = `alert ${type}`;
    alertDiv.style.display = 'block';
    
    setTimeout(() => {
        alertDiv.style.opacity = 1;
    }, 10);
    
    setTimeout(closeAlert, 5000);
}

function closeAlert() {
    alertDiv.style.opacity = 0;
    setTimeout(() => {
        alertDiv.style.display = 'none';
    }, 300);
}

function showConfirmation(message, callback) {
    if (isProcessing) return;
    
    currentConfirmationCallback = callback;
    const confirmationTitle = confirmationDiv.querySelector('h1');
    confirmationTitle.textContent = message;
    confirmationDiv.style.display = 'block';
    
    setTimeout(() => {
        confirmationDiv.style.opacity = 1;
    }, 10);
}

function closeConfirmation() {
    confirmationDiv.style.opacity = 0;
    setTimeout(() => {
        confirmationDiv.style.display = 'none';
    }, 300);
}

function confirmAction() {
    if (currentConfirmationCallback) {
        isProcessing = true;
        currentConfirmationCallback();
    }
    closeConfirmation();
}

function toggleLoading(show) {
    debugLog(`Loading state: ${show}`);
    isProcessing = show;
}

/* ========== API HELPER FUNCTIONS ========== */
function getAuthToken() {
    const token = localStorage.getItem("auth_token");
    if (!token) debugLog('No auth token found');
    return token;
}

function getHeaders() {
    return {
        "Authorization": `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json"
    };
}

async function fetchWithAuth(url, options = {}) {
    try {
        toggleLoading(true);
        debugLog(`Making request to: ${url}`, options);
        
        const response = await fetch(url, {
            ...options,
            headers: getHeaders()
        });
        
        const data = await response.json();
        debugLog(`Response from ${url}`, { status: response.status, data });
        
        return {
            status: response.status,
            response: data
        };
    } catch (error) {
        debugLog(`Fetch error at ${url}`, error);
        showAlert(`Network error: ${error.message}`, 'error');
        throw error;
    } finally {
        toggleLoading(false);
    }
}

/* ========== CORE OPERATIONS ========== */
async function refreshVariations() {
    debugLog('Refreshing variations data...');
    try {
        const { status, response } = await fetchWithAuth(API_ENDPOINTS.GET_ALL);
        
        if (status === 200) {
            renderVariations(response);
            return true;
        } else {
            showAlert(response.message || 'Failed to refresh data', 'error');
            return false;
        }
    } catch (error) {
        debugLog('Refresh failed', error);
        return false;
    }
}

async function addVariationTitle(title) {
    if (!title.trim()) {
        showAlert('Variation title cannot be empty', 'error');
        return;
    }

    try {
        const { status, response } = await fetchWithAuth(API_ENDPOINTS.ADD_TITLE, {
            method: 'POST',
            body: JSON.stringify({ title })
        });
        
        if (status === 200 || status === 201) {
            showAlert('Variation title added successfully!', 'success');
            closeAddVariationArea();
            window.location.reload(); // Force page reload
        } else {
            showAlert(response.message || 'Failed to add variation title', 'error');
        }
    } catch (error) {
        debugLog('Add title error', error);
    }
}

async function addVariationElements(variationTitleId, elements) {
    if (!elements || elements.length === 0) {
        showAlert('Please enter at least one element', 'error');
        return;
    }

    try {
        const { status, response } = await fetchWithAuth(API_ENDPOINTS.ADD_ELEMENT, {
            method: 'POST',
            body: JSON.stringify({
                variation_title_id: variationTitleId,
                variations: elements
            })
        });
        
        if (status === 200 || status === 201) {
            showAlert('Elements added successfully!', 'success');
            closeAddElementArea();
            window.location.reload(); // Force page reload
        } else {
            showAlert(response.message || 'Failed to add elements', 'error');
        }
    } catch (error) {
        debugLog('Add elements error', error);
    }
}

async function deleteVariationElement(variationTitleId, element) {
    showConfirmation('Are you sure you want to delete this element?', async () => {
        try {
            const { status, response } = await fetchWithAuth(API_ENDPOINTS.DELETE_ELEMENT, {
                method: 'DELETE',
                body: JSON.stringify({
                    variation_title_id: variationTitleId,
                    variation: element
                })
            });

            if (status === 200) {
                showAlert('Element deleted successfully!', 'success');
                window.location.reload(); // Force page reload
            } else {
                showAlert(response.message || 'Failed to delete element', 'error');
            }
        } catch (error) {
            debugLog('Delete element error', error);
        }
    });
}

async function deleteVariationTitle(variationTitleId) {
    showConfirmation('Are you sure you want to delete this entire variation?', async () => {
        try {
            const { status, response } = await fetchWithAuth(API_ENDPOINTS.DELETE_TITLE, {
                method: 'DELETE',
                body: JSON.stringify({ variation_title_id: variationTitleId })
            });
            
            if (status === 200) {
                showAlert('Variation deleted successfully!', 'success');
                window.location.reload(); // Force page reload
            } else {
                showAlert(response.message || 'Failed to delete variation', 'error');
            }
        } catch (error) {
            debugLog('Delete variation error', error);
        }
    });
}

/* ========== RENDERING FUNCTIONS ========== */
function renderVariations(apiResponse) {
    if (!apiResponse || !apiResponse.response || !Array.isArray(apiResponse.response)) {
        variationsHere.innerHTML = '<p class="error-message">No variations found or invalid data format.</p>';
        return;
    }

    const variations = apiResponse.response;

    if (variations.length === 0) {
        variationsHere.innerHTML = '<p class="info-message">No variations found. Add one to get started.</p>';
        return;
    }

    variationsHere.innerHTML = '';
    
    variations.forEach(variation => {
        const variationDiv = document.createElement('div');
        variationDiv.className = 'oneVariationArea';
        variationDiv.dataset.variationId = variation.variation_title_id;
        
        variationDiv.innerHTML = `
            <div class="variationTileAndButton">
                <li>${escapeHtml(variation.title)}</li>
                <button type="button" onclick="window.deleteVariationTitle(${variation.variation_title_id})">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" />
                            <path stroke-linecap="round" d="m14.5 9.5l-5 5m0-5l5 5" />
                        </g>
                    </svg>
                </button>
            </div>
            <div class="oneVaritaionElementsHere">
                ${variation.variations && variation.variations.length > 0 ? 
                    variation.variations.map(element => `
                        <div class="oneElementBlock" data-element="${escapeAttr(element.value)}">
                            <button type="button" class="deleteElementButton" 
                                onclick="window.deleteVariationElement(${variation.variation_title_id}, '${escapeAttr(element.value)}')">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <g fill="none" stroke="currentColor">
                                        <circle cx="12" cy="12" r="10" />
                                        <path stroke-linecap="round" d="m14.5 9.5l-5 5m0-5l5 5" />
                                    </g>
                                </svg>
                            </button>
                            <p>${escapeHtml(element.value)}</p>
                        </div>
                    `).join('') : ''
                }
                <div class="addElementBlock">
                    <button type="button" onclick="window.openAddElementArea(${variation.variation_title_id})">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <g fill="none" stroke="currentColor">
                                <circle cx="12" cy="12" r="10"/>
                                <path stroke-linecap="round" d="M15 12h-3m0 0H9m3 0V9m0 3v3"/>
                            </g>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        variationsHere.appendChild(variationDiv);
    });
}

/* ========== UTILITY FUNCTIONS ========== */
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeAttr(unsafe) {
    return unsafe.replace(/"/g, '&quot;').replace(/'/g, "\\'");
}

/* ========== INITIALIZATION ========== */
function initializeUI() {
    // Set initial styles
    [addVariationArea, addElementArea, alertDiv, confirmationDiv].forEach(el => {
        el.style.display = 'none';
        el.style.opacity = 0;
        el.style.transition = "all 0.3s ease";
    });

    // Set up event listeners
    alertDiv.querySelector('button').addEventListener('click', closeAlert);
    
    const confirmationButtons = confirmationDiv.querySelectorAll('.confirmationButtons button');
    confirmationButtons[0].addEventListener('click', closeConfirmation);
    confirmationButtons[1].addEventListener('click', confirmAction);
    
    // Form submissions
    document.querySelector('.addVariationArea form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('newVariation').value;
        await addVariationTitle(title);
        e.target.reset();
    });
    
    document.querySelector('.addElementArea form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const element = document.getElementById('newElement').value;
        await addVariationElements(currentVariationTitleId, [element]);
        e.target.reset();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
    refreshVariations().catch(error => {
        debugLog('Initialization error', error);
    });
});

/* ========== GLOBAL EXPORTS ========== */
window.openAddVariationArea = () => {
    addVariationArea.style.display = 'block';
    setTimeout(() => {
        addVariationArea.style.opacity = 1;
        addVariationArea.style.transform = "translateY(0%)";
    }, 10);
};

window.closeAddVariationArea = () => {
    addVariationArea.style.opacity = 0;
    addVariationArea.style.transform = "translateY(110%)";
    setTimeout(() => {
        addVariationArea.style.display = 'none';
    }, 300);
};

window.openAddElementArea = (variationTitleId) => {
    currentVariationTitleId = variationTitleId;
    addElementArea.style.display = 'block';
    setTimeout(() => {
        addElementArea.style.opacity = 1;
        addElementArea.style.transform = "translateY(0%)";
    }, 10);
};

window.closeAddElementArea = () => {
    addElementArea.style.opacity = 0;
    addElementArea.style.transform = "translateY(110%)";
    setTimeout(() => {
        addElementArea.style.display = 'none';
    }, 300);
};

// Export other functions
window.deleteVariationElement = deleteVariationElement;
window.deleteVariationTitle = deleteVariationTitle;
window.closeAlert = closeAlert;
window.closeConfirmation = closeConfirmation;