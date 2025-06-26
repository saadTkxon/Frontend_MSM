const DEBUG_MODE = false; // Could be set from localStorage or URL parameter

function debugLog(message, data = null) {
    if (!DEBUG_MODE) return;
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] DEBUG: ${message}`);
    if (data) {
        console.log(`[${timestamp}] DATA:`, data);
    }
}

// Function to fetch categories and variations from API
async function fetchCategoriesAndVariations() {
    const authToken = localStorage.getItem("auth_token");
    debugLog("Fetching categories and variations...");
    
    try {
        debugLog("Making API request to get categories and variations");
        const response = await fetch('http://localhost:5000/products/get-categories-variations', {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${authToken}`
            }
        });

        debugLog("API response status:", response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            debugLog("API response not OK", errorText);
            throw new Error(`Network response was not ok: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        debugLog("API response data received", data);
        
        if (!data.response) {
            debugLog("No response data in API response", data);
            throw new Error("Invalid API response structure");
        }
        
        return data.response;
    } catch (error) {
        console.error('Error fetching categories and variations:', error);
        debugLog("Error in fetchCategoriesAndVariations", error);
        return null;
    }
}

// Function to populate categories in the form
function populateCategories(categories) {
    debugLog("Populating categories...", categories);
    
    try {
        const categoriesContainer = document.querySelector('.productDetsForm .checkableElements:first-of-type');
        if (!categoriesContainer) {
            debugLog("Categories container not found");
            throw new Error("Categories container element not found");
        }
        
        // Clear existing checkboxes (except the first two which are hardcoded in HTML)
        const existingCheckboxes = categoriesContainer.querySelectorAll('.oneCheckableElement');
        debugLog(`Found ${existingCheckboxes.length} existing category checkboxes`);
        
        for (let i = 2; i < existingCheckboxes.length; i++) {
            categoriesContainer.removeChild(existingCheckboxes[i]);
        }
        
        // Add categories from API
        categories.forEach(category => {
            if (!category.category_id || !category.category_name) {
                debugLog("Invalid category format", category);
                return;
            }
            
            const categoryId = `category_${category.category_id}`;
            
            const categoryElement = document.createElement('div');
            categoryElement.className = 'oneCheckableElement';
            
            categoryElement.innerHTML = `
                <input type="checkbox" name="${category.category_name}" id="${categoryId}">
                <label for="${categoryId}">${category.category_name}</label>
            `;
            
            categoriesContainer.appendChild(categoryElement);
            debugLog(`Added category checkbox for ${category.category_name}`);
        });
    } catch (error) {
        console.error('Error populating categories:', error);
        debugLog("Error in populateCategories", error);
    }
}



// Function to remove hardcoded variations
function removeHardcodedVariations() {
    debugLog("Removing hardcoded variations...");
    
    try {
        const form = document.querySelector('.productDetsForm');
        if (!form) {
            debugLog("Form not found");
            throw new Error("Form element not found");
        }

        // Remove color variations section
        const colorLabel = Array.from(document.querySelectorAll('.productDetsForm label'))
            .find(el => el.textContent.includes('Color variations'));
        
        if (colorLabel) {
            const colorSection = colorLabel.parentElement;
            form.removeChild(colorSection);
            debugLog("Removed color variations section");
        }

        // Remove size variations section
        const sizeLabel = Array.from(document.querySelectorAll('.productDetsForm label'))
            .find(el => el.textContent.includes('size variations'));
        
        if (sizeLabel) {
            const sizeSection = sizeLabel.parentElement;
            form.removeChild(sizeSection);
            debugLog("Removed size variations section");
        }
    } catch (error) {
        console.error('Error removing hardcoded variations:', error);
        debugLog("Error in removeHardcodedVariations", error);
    }
}

// Function to populate variations in the form
function populateVariations(variations) {
    debugLog("Populating variations...", variations);
    
    try {
        const form = document.querySelector('.productDetsForm');
        if (!form) {
            debugLog("Form not found");
            throw new Error("Form element not found");
        }

        // Remove any existing variations container if it exists
        const existingVariationsContainer = document.querySelector('.variations-container');
        if (existingVariationsContainer) {
            form.removeChild(existingVariationsContainer);
            debugLog("Removed existing variations container");
        }

        // Create a new container for all variations
        const variationsContainer = document.createElement('div');
        variationsContainer.className = 'variations-container';
        
        // Process each variation from API
        variations.forEach(variation => {
            if (!variation.title || !variation.variations || variation.variations.length === 0) {
                debugLog("Skipping empty variation", variation);
                return;
            }

            // Create section for this variation type
            const variationSection = document.createElement('div');
            variationSection.className = 'oneInput';
            
            const variationLabel = document.createElement('label');
            variationLabel.textContent = variation.title;
            variationSection.appendChild(variationLabel);
            
            const variationOptions = document.createElement('div');
            variationOptions.className = 'checkableElements';
            variationSection.appendChild(variationOptions);
            
            // Add each variation value
            variation.variations.forEach(value => {
                const valueId = `var_${value.variation_id}`;
                
                const valueElement = document.createElement('div');
                valueElement.className = 'oneCheckableElement';
                
                valueElement.innerHTML = `
                    <input type="checkbox" name="${variation.title}_${value.value}" id="${valueId}">
                    <label for="${valueId}">${value.value}</label>
                `;
                
                variationOptions.appendChild(valueElement);
                debugLog(`Added ${variation.title} variation: ${value.value}`);
            });
            
            variationsContainer.appendChild(variationSection);
        });

        // Insert variations after categories
        const categoriesSection = document.querySelector('.oneInput label[for="productCategories"]').parentElement;
        form.insertBefore(variationsContainer, categoriesSection.nextSibling);
        
    } catch (error) {
        console.error('Error populating variations:', error);
        debugLog("Error in populateVariations", error);
    }
}

// Function to initialize the form
async function initializeProductForm() {
    debugLog("Initializing product form...");
    
    try {
        const data = await fetchCategoriesAndVariations();
        
        if (data) {
            debugLog("Data received, populating form");
            
            // First remove hardcoded variations
            removeHardcodedVariations();
            
            if (data.categories) {
                populateCategories(data.categories);
            } else {
                debugLog("No categories data found");
            }
            
            if (data.variations) {
                populateVariations(data.variations);
            } else {
                debugLog("No variations data found");
            }
        } else {
            debugLog("No data received from API");
        }
    } catch (error) {
        console.error('Error initializing product form:', error);
        debugLog("Error in initializeProductForm", error);
    }
}

// Call the initialize function when the form is opened
// function onAddProductFormOpen() {
//     debugLog("Add product form opened");
//     initializeProductForm();
// }


// SAAD Image Handling Functions for Add Product Form
function saadPreviewImage(input, previewContainer, isMultiple) {
    // Clear previous previews
    previewContainer.innerHTML = '';

    if (input.files && input.files.length > 0) {
        Array.from(input.files).forEach(file => {
            if (!file.type.match('image.*')) return;

            const reader = new FileReader();
            
            reader.onload = function(e) {
                const imgBox = document.createElement('div');
                imgBox.className = 'oneImageBox';
                imgBox.setAttribute('data-saad-new-image', 'true');
                imgBox.setAttribute('data-saad-filename', file.name);

                imgBox.innerHTML = `
                    <a href="${e.target.result}" target="_blank">
                        <img src="${e.target.result}" alt="Preview">
                    </a>
                    <button type="button" onclick="saadRemovePreviewImage(this, '${file.name}')">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <g fill="none" stroke="currentColor">
                                <circle cx="12" cy="12" r="10" />
                                <path stroke-linecap="round" d="m14.5 9.5l-5 5m0-5l5 5" />
                            </g>
                        </svg>
                    </button>
                `;

                previewContainer.appendChild(imgBox);
            };
            reader.readAsDataURL(file);
        });
    }
}

function saadRemovePreviewImage(button, filename) {
    const imgBox = button.closest('.oneImageBox');
    if (imgBox) {
        imgBox.remove();
        
        // Update the file input to remove the deleted file
        const input = button.closest('form').querySelector('input[type="file"]');
        if (input) {
            const dataTransfer = new DataTransfer();
            Array.from(input.files)
                .filter(file => file.name !== filename)
                .forEach(file => dataTransfer.items.add(file));
            input.files = dataTransfer.files;
        }
    }
}

function saadClearAllImagePreviews() {
    const coverPreview = document.querySelector('.coverImagePreview');
    const productPreviews = document.querySelector('.productImagesPreview');
    
    if (coverPreview) coverPreview.innerHTML = '';
    if (productPreviews) productPreviews.innerHTML = '';
    
    // Clear file inputs
    const coverInput = document.getElementById('coverPicture');
    const productInput = document.getElementById('productPictures');
    
    if (coverInput) coverInput.value = '';
    if (productInput) productInput.value = '';
}

// Updated onAddProductFormOpen function using SAAD functions
function onAddProductFormOpen() {
    debugLog("Add product form opened");
    
    // Clear all image previews using SAAD function
    saadClearAllImagePreviews();
    
    // Initialize the form
    initializeProductForm();
}

// function onAddProductFormOpen() {
//     debugLog("Add product form opened");
    
//     // Clear all image previews
//     const coverPreview = document.querySelector('.coverImagePreview');
//     const productPreviews = document.querySelector('.productImagesPreview');
    
//     if (coverPreview) coverPreview.innerHTML = '';
//     if (productPreviews) productPreviews.innerHTML = '';
    
//     // Clear file inputs
//     const coverInput = document.getElementById('coverPicture');
//     const productInput = document.getElementById('productPictures');
    
//     if (coverInput) coverInput.value = '';
//     if (productInput) productInput.value = '';
    
//     // Initialize the form
//     initializeProductForm();
// }


document.addEventListener('DOMContentLoaded', function() {
    // Add product form image previews
    const coverImageInput = document.getElementById('coverPicture');
    const coverPreviewContainer = document.querySelector('.coverImagePreview');
    if (coverImageInput && coverPreviewContainer) {
        coverImageInput.addEventListener('change', function() {
            previewImage(this, coverPreviewContainer, false);
        });
    }

    const productImagesInput = document.getElementById('productPictures');
    const productPreviewContainer = document.querySelector('.productImagesPreview');
    if (productImagesInput && productPreviewContainer) {
        productImagesInput.addEventListener('change', function() {
            if (this.files.length > 5) {
                alert('You can only upload up to 5 images');
                this.value = '';
                return;
            }
            previewImage(this, productPreviewContainer, true);
        });
    }

    // Form submission
    const productForm = document.querySelector('.productDetsForm');
    if (productForm) {
        productForm.addEventListener('submit', handleProductFormSubmit);
    }
});






// For manual testing/debugging
window.debugFormHandler = {
    fetchCategoriesAndVariations,
    populateCategories,
    populateVariations,
    initializeProductForm
};




























// Function to close the add product area
function closeAddProductArea() {
    document.querySelector('.addProductArea').style.display = 'none';
}

// Function to handle form submission
async function handleProductFormSubmit(event) {
    event.preventDefault();
    
    // Get auth token from local storage
    const authToken = localStorage.getItem("auth_token");
    if (!authToken) {
        alert('Please login first');
        return;
    }

    // Get form elements
    const form = event.target;
    const submitBtn = form.querySelector('.submitBtn');
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
        // Get all form data
        const title = form.querySelector('#productTitle').value;
        const actualPrice = form.querySelector('#productActualPrice').value;
        const discountPrice = form.querySelector('#productDiscountedPrice').value;
        const shippingFee = form.querySelector('#productShippingCharges').value;
        const stock = form.querySelector('#productStock').value;
        const shortHtmlDescription = form.querySelector('#shortHTMLDescription').value;
        const longHtmlDescription = form.querySelector('#longHTMLDescription').value;
        const longDescription = form.querySelector('#longDescription').value;
        
        // Get categories (both hardcoded and dynamic)
        // In the handleProductFormSubmit function, modify the categories mapping part:

// Get categories (both hardcoded and dynamic)
const categoryCheckboxes = form.querySelectorAll('.checkableElements input[type="checkbox"]:checked');
const categories = Array.from(categoryCheckboxes)
    .map(checkbox => {
        return {
            category_id: checkbox.id.replace('category_', ''),
            category_name: checkbox.nextElementSibling.textContent.trim()
        };
    })
    .filter(category => {
        // Only include categories with numeric IDs (not variation IDs starting with "var_")
        return /^\d+$/.test(category.category_id);
    });

if (categories.length === 0) {
    throw new Error('Please select at least one valid category');
}

        // Get variations (grouped by variation type)
        const variationGroups = {};
        const variationCheckboxes = form.querySelectorAll('.variations-container input[type="checkbox"]:checked');
        
        variationCheckboxes.forEach(checkbox => {
            const parts = checkbox.name.split('_');
            const variationTitle = parts[0];
            const variationValue = parts.slice(1).join('_');
            
            if (!variationGroups[variationTitle]) {
                variationGroups[variationTitle] = [];
            }
            
            variationGroups[variationTitle].push(variationValue);
        });
        
        // Convert variation groups to proper array format
        const variations = Object.keys(variationGroups).map(title => {
            return {
                title: title,
                values: variationGroups[title]
            };
        });
        
    // DOM Elements
const addProductArea = document.querySelector('.addProductArea');
const editOrDeleteProductArea = document.querySelector('.editOrDeleteProductArea');

// Toggle functions for product areas
function openAddProductArea() {
    addProductArea.style.opacity = 1;
    addProductArea.style.transform = "translateY(0%)";
}

function closeAddProductArea() {
    addProductArea.style.opacity = 0;
    addProductArea.style.transform = "translateY(110%)";
}

function openEditOrDeleteProductArea(productId) {
    editOrDeleteProductArea.style.opacity = 1;
    editOrDeleteProductArea.style.transform = "translateY(0%)";
    loadProductForEditing(productId);
}

function closeEditOrDeleteProductArea() {
    editOrDeleteProductArea.style.opacity = 0;
    editOrDeleteProductArea.style.transform = "translateY(110%)";
}

// Function to load product data for editing
async function loadProductForEditing(productId) {
    try {
        // Show loading state
        const editArea = document.querySelector('.editOrDeleteProductArea .editOrDeleteProductAreaContent');
        if (!editArea) {
            editOrDeleteProductArea.innerHTML = `
                <div class="editOrDeleteProductAreaContent">
                    <div class="sideTitlePlusCloseButton">
                        <h1>Edit/Delete product</h1>
                        <button type="button" onclick="closeEditOrDeleteProductArea()"><svg xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24">
                                <g fill="none" stroke="currentColor">
                                    <circle cx="12" cy="12" r="10" />
                                    <path stroke-linecap="round" d="m14.5 9.5l-5 5m0-5l5 5" />
                                </g>
                            </svg>&nbsp;Close</button>
                    </div>
                    <div class="loading">Loading product details...</div>
                </div>
            `;
        } else {
            editArea.innerHTML = '<div class="loading">Loading product details...</div>';
        }

        // Fetch product details
        const authToken = localStorage.getItem("auth_token");
        const productResponse = await fetch("http://localhost:5000/products/get-product", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({ product_id: productId })
        });
        // console.log("Product response received", productResponse); // Debug log
        const productData = await productResponse.json();
        
        if (productData.status !== "success") {
            throw new Error(productData.message || "Failed to fetch product details");
        }

        const product = productData.response;
        // console.log("Product details:", product); // Debug log
        // Fetch categories and variations
        const catVarResponse = await fetch('http://localhost:5000/products/get-categories-variations', {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${authToken}`
            }
        });

        const catVarData = await catVarResponse.json();
        
        if (!catVarData.response) {
            throw new Error("Failed to fetch categories and variations");
        }

        // Render the edit form
        await populateEditForm(product, catVarData.response, productId);

    } catch (error) {
        console.error("Error loading product for editing:", error);
        document.querySelector('.editOrDeleteProductArea .editOrDeleteProductAreaContent').innerHTML = `
            <div class="error">
                <p>Error loading product: ${error.message}</p>
                <button onclick="closeEditOrDeleteProductArea()">Close</button>
            </div>
        `;
    }
}

// Helper function to generate category checkboxes
function generateCategoryCheckboxes(categories, productCategories) {
    if (!categories || !Array.isArray(categories)) return '';
    
    // Clean up product categories
    const cleanedProductCategories = cleanArrayData(productCategories);
    
    return categories.map(category => {
        const isChecked = cleanedProductCategories.includes(category.category_name);
        return `
            <div class="oneCheckableElement">
                <input type="checkbox" name="categories" id="category_${category.category_id}" 
                    value="${category.category_id}" ${isChecked ? 'checked' : ''}>
                <label for="category_${category.category_id}">${category.category_name}</label>
            </div>
        `;
    }).join('');
}

// Helper function to generate variation sections
function generateVariationSections(variations, productVariations) {
    if (!variations || !Array.isArray(variations)) return '';
    
    // Clean up product variations
    const cleanedProductVariations = cleanArrayData(productVariations);
    
    return variations.map(variation => {
        const options = variation.variations.map(option => {
            const isChecked = cleanedProductVariations.includes(option.value);
            return `
                <div class="oneCheckableElement">
                    <input type="checkbox" name="${variation.title}" id="var_${option.variation_id}" 
                        value="${option.variation_id}" ${isChecked ? 'checked' : ''}>
                    <label for="var_${option.variation_id}">${option.value}</label>
                </div>
            `;
        }).join('');
        
        return `
            <div class="oneInput">
                <label for="variation_${variation.title}"><b>${variation.title}</b> variations <span>*</span></label>
                <div class="checkableElements" id="variation_${variation.title}">
                    ${options}
                </div>
            </div>
        `;
    }).join('');
}

// Helper function to clean array data
function cleanArrayData(arrayData) {
    if (!arrayData || !Array.isArray(arrayData)) return [];
    
    return arrayData
        .join('') // Combine all array elements
        .replace(/[\[\]"]/g, '') // Remove brackets and quotes
        .split(',') // Split by comma
        .map(item => item.trim()) // Trim whitespace
        .filter(item => item); // Remove empty items
}












// Helper function to escape HTML
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
// Function to handle image removal
function removeImage(type, imageName) {
    const previewContainer = type === 'cover' 
        ? document.getElementById('EditcoverImagePreview')
        : document.getElementById('EditproductImagesPreview');
    
    // Find and remove the image element
    const imageElements = previewContainer.querySelectorAll('.oneImageBox');
    imageElements.forEach(element => {
        const img = element.querySelector('img');
        if (img && img.src.includes(imageName)) {
            element.remove();
        }
    });
    
    // Add hidden input to track removed images
    const form = document.querySelector('.productEditOrDeleteForm');
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = `removed_${type}_images`;
    hiddenInput.value = imageName;
    form.appendChild(hiddenInput);
}

// // Renamed the original preview function for the add form
// function previewImageForAddForm(input, previewContainer, isMultiple) {
//     // Clear only new previews if it's not a multiple upload
//     const newPreviews = previewContainer.querySelectorAll('.oneImageBox[data-is-new="true"]');
//     newPreviews.forEach(preview => preview.remove());
    
//     if (input.files && input.files.length > 0) {
//         Array.from(input.files).forEach(file => {
//             if (!file.type.match('image.*')) return;
            
//             const reader = new FileReader();
            
//             reader.onload = function(e) {
//                 const imgBox = document.createElement('div');
//                 imgBox.className = 'oneImageBox';
//                 imgBox.setAttribute('data-is-new', 'true');
                
//                 const imgLink = document.createElement('a');
//                 imgLink.href = e.target.result;
//                 imgLink.target = '_blank';
                
//                 const img = document.createElement('img');
//                 img.src = e.target.result;
//                 img.alt = 'Preview';
                
//                 const removeBtn = document.createElement('button');
//                 removeBtn.type = 'button';
//                 removeBtn.innerHTML = `[X]`;
//                 removeBtn.onclick = function() {
//                     imgBox.remove();
//                     // Update the input files
//                     const dataTransfer = new DataTransfer();
//                     Array.from(input.files)
//                         .filter(f => f !== file)
//                         .forEach(f => dataTransfer.items.add(f));
//                     input.files = dataTransfer.files;
//                 };
                
//                 imgLink.appendChild(img);
//                 imgBox.appendChild(imgLink);
//                 imgBox.appendChild(removeBtn);
//                 previewContainer.appendChild(imgBox);
//             };
            
//             reader.readAsDataURL(file);
//         });
//     }
// }





function previewImage(input, previewContainer, isMultiple) {
    // Clear previous previews (only for new images)
    const newPreviews = previewContainer.querySelectorAll('[data-is-new="true"]');
    newPreviews.forEach(el => el.remove());

    if (input.files && input.files.length > 0) {
        Array.from(input.files).forEach(file => {
            if (!file.type.match('image.*')) return;

            const reader = new FileReader();
            reader.onload = function(e) {
                const imgBox = document.createElement('div');
                imgBox.className = 'oneImageBox';
                imgBox.setAttribute('data-is-new', 'true');

                imgBox.innerHTML = `
                    <a href="${e.target.result}" target="_blank">
                        <img src="${e.target.result}" alt="Preview">
                    </a>
                    <button type="button" onclick="removePreviewImage(this)">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <g fill="none" stroke="currentColor">
                                <circle cx="12" cy="12" r="10" />
                                <path stroke-linecap="round" d="m14.5 9.5l-5 5m0-5l5 5" />
                            </g>
                        </svg>
                    </button>
                `;

                previewContainer.appendChild(imgBox);
            };
            reader.readAsDataURL(file);
        });
    }
}

function removePreviewImage(button) {
    const imgBox = button.closest('.oneImageBox');
    if (imgBox) {
        imgBox.remove();
        // Note: This doesn't update the input.files, you may need to handle that separately
    }
}



async function handleProductFormSubmit(event) {
    event.preventDefault();
    
    const authToken = localStorage.getItem("auth_token");
    if (!authToken) {
        alert('Please login first');
        return;
    }

    const form = event.target;
    const submitBtn = form.querySelector('.submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
        // Get form data
        const title = form.querySelector('#productTitle').value;
        const actualPrice = form.querySelector('#productActualPrice').value;
        const discountPrice = form.querySelector('#productDiscountedPrice').value;
        const shippingFee = form.querySelector('#productShippingCharges').value;
        const stock = form.querySelector('#productStock').value;
        const shortHtmlDescription = form.querySelector('#shortHTMLDescription').value;
        const longHtmlDescription = form.querySelector('#longHTMLDescription').value;
        const longDescription = form.querySelector('#longDescription').value;
        
        // Get categories
        const categoryCheckboxes = form.querySelectorAll('.checkableElements input[type="checkbox"]:checked');
        const categories = Array.from(categoryCheckboxes)
            .map(checkbox => checkbox.nextElementSibling.textContent.trim());
        
        // Get variations
        const colorVariations = Array.from(form.querySelectorAll('.checkableElements input[type="checkbox"][name^="black"], .checkableElements input[type="checkbox"][name^="white"], .checkableElements input[type="checkbox"][name^="blue"], .checkableElements input[type="checkbox"][name^="purple"]'))
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.nextElementSibling.textContent.trim());
            
        const sizeVariations = Array.from(form.querySelectorAll('.checkableElements input[type="checkbox"][name$="ml"]'))
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.nextElementSibling.textContent.trim());
            
        const variations = [...colorVariations, ...sizeVariations];
        
        // Validate required fields
        if (!title || !actualPrice || !stock || !shippingFee) {
            throw new Error('Please fill all required fields');
        }

        // Get cover image file
        const coverImageInput = form.querySelector('#coverPicture');
        if (!coverImageInput.files || coverImageInput.files.length === 0) {
            throw new Error('Cover image is required');
        }
        const coverImage = coverImageInput.files[0];
        
        // Get product images (up to 5)
        const productImagesInput = form.querySelector('#productPictures');
        const productImages = productImagesInput.files ? Array.from(productImagesInput.files).slice(0, 5) : [];
        
        if (productImages.length === 0) {
            throw new Error('At least one product image is required');
        }

        // Create FormData
        const formData = new FormData();
        formData.append('cover_image', coverImage);
        productImages.forEach((image, index) => {
            formData.append(`image_${index + 1}`, image);
        });
        
        // Add other form data
        formData.append('title', title);
        formData.append('actual_price', actualPrice);
        if (discountPrice) formData.append('discount_price', discountPrice);
        formData.append('shipping_fee', shippingFee);
        formData.append('stock', stock);
        formData.append('short_html_description', shortHtmlDescription);
        formData.append('long_html_description', longHtmlDescription);
        formData.append('description_short', longDescription);
        formData.append('categories', JSON.stringify(categories));
        formData.append('variations', JSON.stringify(variations));
        formData.append('status', 'active');

        // Send to backend
        const response = await fetch('http://localhost:5000/products/add-product', {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${authToken}`
            },
            body: formData
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to add product');
        }

        if (result.status === 'success') {
            alert('Product added successfully!');
            form.reset();
            document.querySelector('.coverImagePreview').innerHTML = '';
            document.querySelector('.productImagesPreview').innerHTML = '';
            closeAddProductArea();
        } else {
            throw new Error(result.message || 'Unknown error occurred');
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        alert(error.message || 'An error occurred while submitting the form');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
    }
}




















// Function to populate the edit form
async function populateEditForm(product, categoriesAndVariations, productId) {
    const editArea = document.querySelector('.editOrDeleteProductArea .editOrDeleteProductAreaContent');
    
    editArea.innerHTML = `
        <div class="sideTitlePlusCloseButton">
            <h1>Edit/Delete product</h1>
            <button type="button" onclick="closeEditOrDeleteProductArea()"><svg xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24">
                    <g fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" />
                        <path stroke-linecap="round" d="m14.5 9.5l-5 5m0-5l5 5" />
                    </g>
                </svg>&nbsp;Close</button>
        </div>

        <form class="productEditOrDeleteForm" data-product-id="${productId}">
            <div class="oneInput">
                <label for="productTitle">Title <span>*</span></label>
                <input type="text" value="${escapeHtml(product.title)}" name="productTitle" id="productTitle" required>
            </div>

            <div class="twoInputs">
                <div class="oneInput">
                    <label for="productActualPrice">Actual price <span>*</span></label>
                    <input type="number" value="${product.actual_price}" name="productActualPrice" id="productActualPrice" required>
                </div>
                <div class="oneInput">
                    <label for="productDiscountedPrice">Discounted price</label>
                    <input type="number" value="${product.discount_price || ''}" name="productDiscountedPrice" id="productDiscountedPrice">
                </div>
            </div>

            <div class="twoInputs">
                <div class="oneInput">
                    <label for="productShippingCharges">Shipping <span>*</span></label>
                    <input type="number" value="${product.shipping_fee}" name="productShippingCharges" id="productShippingCharges" required>
                </div>
                <div class="oneInput">
                    <label for="productStock">Stock <span>*</span></label>
                    <input type="number" value="${product.stock}" name="productStock" id="productStock" required>
                </div>
            </div>

             <div class="oneInput">
                    <label for="longDescription">Long description <span>*</span></label>
                    <textarea name="longDescription" id="longDescription" required>${product.description_short} </textarea>
                </div>

            <div class="oneInput">
                <label for="shortHTMLDescription">Short HTML description</label>
                <textarea name="shortHTMLDescription" id="shortHTMLDescription">${escapeHtml(product.short_html_description || '')}</textarea>
            </div>

            <div class="oneInput">
                <label for="longHTMLDescription">Long HTML description</label>
                <textarea name="longHTMLDescription" id="longHTMLDescription">${escapeHtml(product.long_html_description || '')}</textarea>
            </div>

            <div class="oneInput">
                <label>Categories <span>*</span></label>
                <div class="checkableElements" id="categoriesContainer">
                    ${generateCategoryCheckboxes(categoriesAndVariations.categories, product.categories)}
                </div>
            </div>

            <div id="variationsContainer">
                ${generateVariationSections(categoriesAndVariations.variations, product.variations)}
            </div>

            <div class="oneInput">
                <label for="coverPicturee">Product cover <span>*</span></label>
                <label class="custum-file-upload" for="coverPicturee">
                    <div class="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <g fill="none" stroke="currentColor" stroke-linecap="round">
                                <path
                                    d="M6.286 19C3.919 19 2 17.104 2 14.765s1.919-4.236 4.286-4.236q.427.001.83.08m7.265-2.582a5.8 5.8 0 0 1 1.905-.321c.654 0 1.283.109 1.87.309m-11.04 2.594a5.6 5.6 0 0 1-.354-1.962C6.762 5.528 9.32 3 12.476 3c2.94 0 5.361 2.194 5.68 5.015m-11.04 2.594a4.3 4.3 0 0 1 1.55.634m9.49-3.228C20.392 8.78 22 10.881 22 13.353c0 2.707-1.927 4.97-4.5 5.52" />
                                <path stroke-linejoin="round" d="M12 16v6m0-6l2 2m-2-2l-2 2" />
                            </g>
                        </svg>
                    </div>
                    <div class="text">
                        <span>Click to upload cover picture</span>
                    </div>
                    <input type="file" id="coverPicturee" accept="image/*" value='${JSON.stringify(product.product_cover_image)}'/>
                </label>
            </div>

              <div class="EditpreviewImages EditcoverImagePreview" id="EditcoverImagePreview">
            ${product.product_cover_image ? `
            <div class="oneImageBox" data-is-existing="true">
                <a href="/MSM_Backend/images/${product.product_cover_image}" target="_blank">
                    <img src="/MSM_Backend/images/${product.product_cover_image}" alt="Cover Image" 
                         onerror="this.parentNode.style.display='none'">
                </a>
                <button type="button" onclick="removeImage('cover', '${product.product_cover_image}')">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" />
                            <path stroke-linecap="round" d="m14.5 9.5l-5 5m0-5l5 5" />
                        </g>
                    </svg>
                </button>
            </div>
            ` : ''}
        </div>

            <div class="oneInput">
                <label for="productPicturess">Product pictures <span>*</span></label>
                <label class="custum-file-upload" for="productPicturess">
                    <div class="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <g fill="none" stroke="currentColor" stroke-linecap="round">
                                <path
                                    d="M6.286 19C3.919 19 2 17.104 2 14.765s1.919-4.236 4.286-4.236q.427.001.83.08m7.265-2.582a5.8 5.8 0 0 1 1.905-.321c.654 0 1.283.109 1.87.309m-11.04 2.594a5.6 5.6 0 0 1-.354-1.962C6.762 5.528 9.32 3 12.476 3c2.94 0 5.361 2.194 5.68 5.015m-11.04 2.594a4.3 4.3 0 0 1 1.55.634m9.49-3.228C20.392 8.78 22 10.881 22 13.353c0 2.707-1.927 4.97-4.5 5.52" />
                                <path stroke-linejoin="round" d="M12 16v6m0-6l2 2m-2-2l-2 2" />
                            </g>
                        </svg>
                    </div>
                    <div class="text">
                        <span>Click to upload product pictures</span>
                    </div>
                    <input type="file" id="productPicturess" multiple accept="image/*" value='${JSON.stringify(product.product_images)}'/>
                </label>
            </div>

              <div class="EditpreviewImages EditproductImagesPreview" id="EditproductImagesPreview">
            ${(product.product_images && product.product_images.length > 0) ? 
                product.product_images.map(image => `
                <div class="oneImageBox" data-is-existing="true">
                    <a href="/MSM_Backend/images/${image}" target="_blank">
                        <img src="/MSM_Backend/images/${image}" alt="Product Image" 
                             onerror="this.parentNode.style.display='none'">
                    </a>
                    <button type="button" onclick="removeImage('product', '${image}')">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <g fill="none" stroke="currentColor">
                                <circle cx="12" cy="12" r="10" />
                                <path stroke-linecap="round" d="m14.5 9.5l-5 5m0-5l5 5" />
                            </g>
                        </svg>
                    </button>
                </div>
                `).join('') : ''}
        </div>

            <div class="oneInput">
                <label for="productAction">Make this product</label>
                <select name="productAction" id="productAction">
                    <option value="">Action</option>
                    <option value="active" ${product.status === 'active' ? 'selected' : ''}>Active</option>
                    <option value="inactive" ${product.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                    <option value="delete">Delete permanently</option>
                </select>
            </div>

            <div class="submitBtnArea">
                <button class="submitBtn">Save changes</button>
            </div>
        </form>
    `;

    const productEditOrDeleteForm = document.querySelector('.productEditOrDeleteForm');
    if (productEditOrDeleteForm) {
        productEditOrDeleteForm.addEventListener('submit', submitProductEditForm);
    }

        // Image preview for cover image (single image) in edit form
    const coverImageInput = document.querySelector('#coverPicturee');
    const coverPreviewContainer = document.querySelector('.EditpreviewImages.EditcoverImagePreview');
    if (coverImageInput && coverPreviewContainer) {
        coverImageInput.addEventListener('change', function() {
            previewImageForEditForm(this, coverPreviewContainer, false);
        });
    }
      
      // Image preview for product images (multiple images)
      const productImagesInput = document.querySelector('#productPicturess');
      const productPreviewContainer = document.querySelector('.EditpreviewImages.EditproductImagesPreview');
      if (productImagesInput && productPreviewContainer) {
          productImagesInput.addEventListener('change', function() {
              // Limit to 5 images
              if (this.files.length > 5) {
                  alert('You can only upload up to 5 images');
                  this.value = ''; // Clear the input
                  return;
              }
              previewImage(this, productPreviewContainer, true);
          });
      }
}    // Validate required fields
        if (!title || !actualPrice || !stock || !shippingFee) {
            throw new Error('Please fill all required fields');
        }

        // Get cover image file
        const coverImageInput = form.querySelector('#coverPicture');
        if (!coverImageInput.files || coverImageInput.files.length === 0) {
            throw new Error('Cover image is required');
        }
        const coverImage = coverImageInput.files[0];
        
        // Get product images (up to 5)
        const productImagesInput = form.querySelector('#productPictures');
        const productImages = productImagesInput.files ? Array.from(productImagesInput.files).slice(0, 5) : [];
        
        if (productImages.length === 0) {
            throw new Error('At least one product image is required');
        }

        // Create FormData to send files and form data
        const formData = new FormData();
        
        // Append cover image
        formData.append('cover_image', coverImage);
        
        // Append product images with consistent naming
        productImages.forEach((image, index) => {
            formData.append(`image_${index + 1}`, image);
        });
        
        // Add other form data
        formData.append('title', title);
        formData.append('actual_price', actualPrice);
        if (discountPrice) formData.append('discount_price', discountPrice);
        formData.append('shipping_fee', shippingFee);
        formData.append('stock', stock);
        formData.append('short_html_description', shortHtmlDescription);
        formData.append('long_html_description', longHtmlDescription);
        formData.append('description_short', longDescription);
        
        // Properly format categories and variations as JSON strings
        formData.append('categories', JSON.stringify(categories));
        formData.append('variations', JSON.stringify(variations));
        
        formData.append('status', 'active'); // Default status
        
        // Send to backend API
        const response = await fetch('http://localhost:5000/products/add-product', {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${authToken}`
            },
            body: formData
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to add product');
        }

        if (result.status === 'success') {
            alert('Product added successfully!');
            form.reset();
            // Clear preview images
            document.querySelector('.previewImages.coverImagePreview').innerHTML = '';
            document.querySelector('.previewImages.productImagesPreview').innerHTML = '';
            // Close the add product area
            closeAddProductArea();
            // Optionally refresh the product list
            if (typeof refreshProductList === 'function') {
                refreshProductList();
            }
        } else {
            throw new Error(result.message || 'Unknown error occurred');
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        alert(error.message || 'An error occurred while submitting the form');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
    }
}
// New function specifically for the edit form
function previewImageForEditForm(input, previewContainer, isMultiple) {
    // Clear only new previews if it's not a multiple upload
    const newPreviews = previewContainer.querySelectorAll('.oneImageBox[data-is-new="true"]');
    newPreviews.forEach(preview => preview.remove());
    
    if (input.files && input.files.length > 0) {
        Array.from(input.files).forEach(file => {
            if (!file.type.match('image.*')) return;
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const imgBox = document.createElement('div');
                imgBox.className = 'oneImageBox';
                imgBox.setAttribute('data-is-new', 'true');
                
                const imgLink = document.createElement('a');
                imgLink.href = e.target.result;
                imgLink.target = '_blank';
                
                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = 'Preview';
                
                const removeBtn = document.createElement('button');
                removeBtn.type = 'button';
                removeBtn.innerHTML = `[X]`;
                removeBtn.onclick = function() {
                    imgBox.remove();
                    // Update the input files
                    const dataTransfer = new DataTransfer();
                    Array.from(input.files)
                        .filter(f => f !== file)
                        .forEach(f => dataTransfer.items.add(f));
                    input.files = dataTransfer.files;
                };
                
                imgLink.appendChild(img);
                imgBox.appendChild(imgLink);
                imgBox.appendChild(removeBtn);
                previewContainer.appendChild(imgBox);
            };
            
            reader.readAsDataURL(file);
        });
    }
}

// Update the event listeners in DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    debugLog("DOM fully loaded and parsed");
    
    // Check if the form is already visible
    const formArea = document.querySelector('.addProductArea');
    if (formArea && formArea.style.display !== 'none') {
        onAddProductFormOpen();
    }

    // Add event listeners for image preview using SAAD functions
    const coverImageInput = document.getElementById('coverPicture');
    const coverPreviewContainer = document.querySelector('.coverImagePreview');
    
    if (coverImageInput && coverPreviewContainer) {
        coverImageInput.addEventListener('change', function(event) {
            saadPreviewImage(event.target, coverPreviewContainer, false);
        });
    }

    const productImagesInput = document.getElementById('productPictures');
    const productPreviewContainer = document.querySelector('.productImagesPreview');
    
    if (productImagesInput && productPreviewContainer) {
        productImagesInput.addEventListener('change', function(event) {
            // Limit to 5 images
            if (event.target.files.length > 5) {
                alert('You can only upload up to 5 images');
                event.target.value = ''; // Clear the input
                return;
            }
            saadPreviewImage(event.target, productPreviewContainer, true);
        });
    }
});

// Updated handleProductFormSubmit using SAAD functions
async function handleProductFormSubmit(event) {
    event.preventDefault();
    
    const authToken = localStorage.getItem("auth_token");
    if (!authToken) {
        alert('Please login first');
        return;
    }

    const form = event.target;
    const submitBtn = form.querySelector('.submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
        // Get form data
        const title = form.querySelector('#productTitle').value;
        const actualPrice = form.querySelector('#productActualPrice').value;
        const discountPrice = form.querySelector('#productDiscountedPrice').value;
        const shippingFee = form.querySelector('#productShippingCharges').value;
        const stock = form.querySelector('#productStock').value;
        const shortHtmlDescription = form.querySelector('#shortHTMLDescription').value;
        const longHtmlDescription = form.querySelector('#longHTMLDescription').value;
        const longDescription = form.querySelector('#longDescription').value;
        
        // Get categories
        const categoryCheckboxes = form.querySelectorAll('.checkableElements input[type="checkbox"]:checked');
        const categories = Array.from(categoryCheckboxes)
            .map(checkbox => checkbox.nextElementSibling.textContent.trim());
        
        // Get variations
        const variationCheckboxes = form.querySelectorAll('.variations-container input[type="checkbox"]:checked');
        const variations = Array.from(variationCheckboxes)
            .map(checkbox => checkbox.nextElementSibling.textContent.trim());
        
        // Validate required fields
        if (!title || !actualPrice || !stock || !shippingFee) {
            throw new Error('Please fill all required fields');
        }

        // Get cover image file
        const coverImageInput = form.querySelector('#coverPicture');
        if (!coverImageInput.files || coverImageInput.files.length === 0) {
            throw new Error('Cover image is required');
        }
        const coverImage = coverImageInput.files[0];
        
        // Get product images (up to 5)
        const productImagesInput = form.querySelector('#productPictures');
        const productImages = productImagesInput.files ? Array.from(productImagesInput.files).slice(0, 5) : [];
        
        if (productImages.length === 0) {
            throw new Error('At least one product image is required');
        }

        // Create FormData
        const formData = new FormData();
        formData.append('cover_image', coverImage);
        productImages.forEach((image, index) => {
            formData.append(`image_${index + 1}`, image);
        });
        
        // Add other form data
        formData.append('title', title);
        formData.append('actual_price', actualPrice);
        if (discountPrice) formData.append('discount_price', discountPrice);
        formData.append('shipping_fee', shippingFee);
        formData.append('stock', stock);
        formData.append('short_html_description', shortHtmlDescription);
        formData.append('long_html_description', longHtmlDescription);
        formData.append('description_short', longDescription);
        formData.append('categories', JSON.stringify(categories));
        formData.append('variations', JSON.stringify(variations));
        formData.append('status', 'active');

        // Send to backend
        const response = await fetch('http://localhost:5000/products/add-product', {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${authToken}`
            },
            body: formData
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to add product');
        }

        if (result.status === 'success') {
            alert('Product added successfully!');
            form.reset();
            // Clear previews using SAAD function
            saadClearAllImagePreviews();
            closeAddProductArea();
        } else {
            throw new Error(result.message || 'Unknown error occurred');
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        alert(error.message || 'An error occurred while submitting the form');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
    }
}

// Function to remove existing image in edit form
function removeImage(type, imageName) {
    const previewContainer = type === 'cover' 
        ? document.getElementById('EditcoverImagePreview')
        : document.getElementById('EditproductImagesPreview');
    
    if (!previewContainer) return;
    
    // Find and remove the image element
    const imageElements = previewContainer.querySelectorAll('.oneImageBox');
    imageElements.forEach(element => {
        const img = element.querySelector('img');
        if (img && img.src.includes(imageName)) {
            element.remove();
        }
    });
    
    // Add hidden input to track removed images
    const form = document.querySelector('.productEditOrDeleteForm');
    if (!form) return;
    
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = `removed_${type}_images`;
    hiddenInput.value = imageName;
    form.appendChild(hiddenInput);
}