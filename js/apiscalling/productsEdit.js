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
 // Call setupCheckboxEvents after the form is populated
 setupCheckboxEvents();
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

// // Helper function to generate category checkboxes
// function generateCategoryCheckboxes(categories, productCategories) {
//     if (!categories || !Array.isArray(categories)) return '';
    
//     // Clean up product categories
//     const cleanedProductCategories = cleanArrayData(productCategories);
    
//     return categories.map(category => {
//         const isChecked = cleanedProductCategories.includes(category.category_name);
//         return `
//             <div class="oneCheckableElement">
//                 <input type="checkbox" name="categories" id="category_${category.category_id}" 
//                     value="${category.category_id}" ${isChecked ? 'checked' : ''}>
//                 <label for="category_${category.category_id}">${category.category_name}</label>
//             </div>
//         `;
//     }).join('');
// }

// // Helper function to generate variation sections
// function generateVariationSections(variations, productVariations) {
//     if (!variations || !Array.isArray(variations)) return '';
    
//     // Clean up product variations
//     const cleanedProductVariations = cleanArrayData(productVariations);
    
//     return variations.map(variation => {
//         const options = variation.variations.map(option => {
//             const isChecked = cleanedProductVariations.includes(option.value);
//             return `
//                 <div class="oneCheckableElement">
//                     <input type="checkbox" name="${variation.title}" id="var_${option.variation_id}" 
//                         value="${option.variation_id}" ${isChecked ? 'checked' : ''}>
//                     <label for="var_${option.variation_id}">${option.value}</label>
//                 </div>
//             `;
//         }).join('');
        
//         return `
//             <div class="oneInput">
//                 <label for="variation_${variation.title}"><b>${variation.title}</b> variations <span>*</span></label>
//                 <div class="checkableElements" id="variation_${variation.title}">
//                     ${options}
//                 </div>
//             </div>
//         `;
//     }).join('');
// }

// // Helper function to clean array data
// function cleanArrayData(arrayData) {
//     if (!arrayData || !Array.isArray(arrayData)) return [];
    
//     return arrayData
//         .join('') // Combine all array elements
//         .replace(/[\[\]"]/g, '') // Remove brackets and quotes
//         .split(',') // Split by comma
//         .map(item => item.trim()) // Trim whitespace
//         .filter(item => item); // Remove empty items
// }


// Helper function to generate category checkboxes


function generateCategoryCheckboxes(categories, productCategories) {
    if (!categories || !Array.isArray(categories)) return '';
    
    // Clean up product categories - they should be category IDs
    const cleanedProductCategories = cleanArrayData(productCategories);
    
    return categories.map(category => {
        // Check if this category ID is in the product's categories
        const isChecked = cleanedProductCategories.includes(category.category_id.toString());
        return `
            <div class="oneCheckableElement" style="position:relative";>
                <input type="checkbox" style="opacity:0;z-index:12;display:block;position:absolute;width:100%;height:100%;" name="categories" id="category_${category.category_id}" 
                    value="${category.category_id}" ${isChecked ? 'checked' : ''}>
                <label for="category_${category.category_id}" style="color: ${isChecked ? '#bc9c22' : 'inherit'}">
                    ${category.category_name}
                </label>
            </div>
        `;
    }).join('');



}


function generateVariationSections(variations, productVariations) {
    if (!variations || !Array.isArray(variations)) return '';
    
    // Clean up product variations - they should be variation IDs
    const cleanedProductVariations = cleanArrayData(productVariations);
    
    return variations.map(variation => {
        const options = variation.variations.map(option => {
            // Check if this variation ID is in the product's variations
            const isChecked = cleanedProductVariations.includes(option.variation_id.toString());
            return `
                <div class="oneCheckableElement" style="position:relative";>
                <input type="checkbox" style="opacity:0;z-index:12;display:block;position:absolute;width:100%;height:100%;" name="${variation.title}" id="var_${option.variation_id}" 
                        value="${option.value}" ${isChecked ? 'checked' : ''}>
                    <label for="var_${option.variation_id}" style="color: ${isChecked ? '#bc9c22' : 'inherit'}">
                        ${option.value}
                    </label>
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


function cleanArrayData(arrayData) {
    if (!arrayData || !Array.isArray(arrayData)) return [];
    
    // If it's already an array of strings/numbers, return as is
    if (arrayData.every(item => typeof item === 'string' || typeof item === 'number')) {
        return arrayData.map(item => item.toString());
    }
    
    // Handle case where arrayData might be an array of objects
    if (arrayData.every(item => typeof item === 'object')) {
        return arrayData.map(item => {
            // Try to get ID if available
            if (item.variation_id) return item.variation_id.toString();
            if (item.category_id) return item.category_id.toString();
            if (item.id) return item.id.toString();
            return '';
        }).filter(item => item);
    }
    
    // Fallback for stringified arrays
    return arrayData
        .join('') // Combine all array elements
        .replace(/[\[\]"]/g, '') // Remove brackets and quotes
        .split(',') // Split by comma
        .map(item => item.trim()) // Trim whitespace
        .filter(item => item); // Remove empty items
}



function setupCheckboxEvents() {
    document.querySelectorAll('.checkableElements input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const label = this.nextElementSibling;
            if (label && label.tagName === 'LABEL') {
                label.style.color = this.checked ? '#fff' : 'inherit';
            }
        });
    });
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




// // Updated removeImage function
// function removeImage(type, imageName) {
//     const previewContainer = type === 'cover' 
//         ? document.getElementById('EditcoverImagePreview')
//         : document.getElementById('EditproductImagesPreview');
//     const fileInput = type === 'cover'
//         ? document.getElementById('coverPicturee')
//         : document.getElementById('productPicturess');
    
//     // Find and remove the image element from preview
//     const imageElements = previewContainer.querySelectorAll('.oneImageBox');
//     imageElements.forEach(element => {
//         const img = element.querySelector('img');
//         if (img && (img.src.includes(imageName) || img.alt === imageName)) {
//             element.remove();
//         }
//     });
    
//     // For multiple images (product images)
//     if (type === 'product') {
//         const dataTransfer = new DataTransfer();
        
//         // If there are files selected in the input, filter them
//         if (fileInput.files && fileInput.files.length > 0) {
//             Array.from(fileInput.files).forEach(file => {
//                 if (!file.name.includes(imageName)) {
//                     dataTransfer.items.add(file);
//                 }
//             });
//             fileInput.files = dataTransfer.files;
//         }
        
//         // Update hidden input value
//         const hiddenInput = document.querySelector('#product_image_names');
//         const currentImages = hiddenInput.value.split(',').filter(img => img && img !== imageName);
//         hiddenInput.value = currentImages.join(',');
        
//         // Also update with any newly selected files
//         if (fileInput.files && fileInput.files.length > 0) {
//             const newFiles = Array.from(fileInput.files).map(f => f.name);
//             hiddenInput.value = [...currentImages, ...newFiles].filter(Boolean).join(',');
//         }
//     }
    
//     // // For cover image
//     // if (type === 'cover') {
//     //     fileInput.value = ''; // Clear the file input
//     //     const hiddenInput = document.querySelector('#cover_image_name');
//     //     hiddenInput.value = '';
//     // }
    
//     if (type === 'cover') {
//         fileInput.value = ''; // Clear the file input
//         const hiddenInput = document.querySelector('#cover_image_name');
//         hiddenInput.value = ''; // Clear the hidden input
//     }

//     // Add hidden input to track removed images
//     const form = document.querySelector('.productEditOrDeleteForm');
//     let hiddenInput = form.querySelector(`input[name="removed_${type}_images"]`);
    
//     if (!hiddenInput) {
//         hiddenInput = document.createElement('input');
//         hiddenInput.type = 'hidden';
//         hiddenInput.name = `removed_${type}_images`;
//         form.appendChild(hiddenInput);
//     }
    
//     // Update the value with all removed images
//     const currentRemoved = hiddenInput.value ? hiddenInput.value.split(',') : [];
//     if (!currentRemoved.includes(imageName)) {
//         hiddenInput.value = [...currentRemoved, imageName].filter(Boolean).join(',');
//     }
// }







// // Updated previewImage function
// function previewImage(input, previewContainer, isMultiple) {
//     if (!isMultiple) {
//         previewContainer.innerHTML = ''; // Clear previous previews for single image
//         // Clear the hidden input when new file is selected
//         document.querySelector('#cover_image_name').value = '';
//     } else {
//         // For product images, clear the hidden input
//         document.querySelector('#product_image_names').value = '';
//     }
    
//     if (input.files && input.files.length > 0) {
//         const hiddenInput = isMultiple 
//             ? document.querySelector('#product_image_names')
//             : document.querySelector('#cover_image_name');

//         Array.from(input.files).forEach(file => {
//             if (!file.type.match('image.*')) return;
            
//             const reader = new FileReader();
            
//             reader.onload = function(e) {
//                 const imgBox = document.createElement('div');
//                 imgBox.className = 'oneImageBox';
                
//                 const imgLink = document.createElement('a');
//                 imgLink.href = e.target.result;
//                 imgLink.target = '_blank';
                
//                 const img = document.createElement('img');
//                 img.src = e.target.result;
//                 img.alt = 'Preview';
                
//                 const removeBtn = document.createElement('button');
//                 removeBtn.type = 'button';
//                 removeBtn.innerHTML = `
//                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
//                         <g fill="none" stroke="currentColor">
//                             <circle cx="12" cy="12" r="10" />
//                             <path stroke-linecap="round" d="m14.5 9.5l-5 5m0-5l5 5" />
//                         </g>
//                     </svg>
//                 `;
//                 removeBtn.onclick = function() {
//                     imgBox.remove();
                    
//                     // Update file input
//                     if (isMultiple) {
//                         const dataTransfer = new DataTransfer();
//                         Array.from(input.files)
//                             .filter(f => f !== file)
//                             .forEach(f => dataTransfer.items.add(f));
//                         input.files = dataTransfer.files;
//                     } else {
//                         input.value = ''; // Clear for single file input
//                     }
                    
//                     // Update hidden input value
//                     if (isMultiple) {
//                         hiddenInput.value = Array.from(input.files).map(f => f.name).join(',');
//                     } else {
//                         hiddenInput.value = '';
//                     }
//                 };
                
//                 imgLink.appendChild(img);
//                 imgBox.appendChild(imgLink);
//                 imgBox.appendChild(removeBtn);
//                 previewContainer.appendChild(imgBox);
                
//                 // Update hidden input value
//                 if (isMultiple) {
//                     hiddenInput.value = Array.from(input.files).map(f => f.name).join(',');
//                 } else {
//                     hiddenInput.value = input.files[0].name;
//                 }
//             };
            
//             reader.readAsDataURL(file);
//         });
//     }
// }






























function removeImage(type, imageName) {
    const previewContainer = type === 'cover' 
        ? document.getElementById('EditcoverImagePreview')
        : document.getElementById('EditproductImagesPreview');
    const fileInput = type === 'cover'
        ? document.getElementById('coverPicturee')
        : document.getElementById('productPicturess');
    
    // Find and remove the image element from preview
    const imageElements = previewContainer.querySelectorAll('.oneImageBox');
    imageElements.forEach(element => {
        const img = element.querySelector('img');
        if (img && (img.src.includes(imageName) || img.alt === imageName)) {
            element.remove();
        }
    });
    
    // For multiple images (product images)
    if (type === 'product') {
        const dataTransfer = new DataTransfer();
        
        // If there are files selected in the input, filter them
        if (fileInput.files && fileInput.files.length > 0) {
            Array.from(fileInput.files).forEach(file => {
                if (!file.name.includes(imageName)) {
                    dataTransfer.items.add(file);
                }
            });
            fileInput.files = dataTransfer.files;
        }
        
        // Update hidden input value
        const hiddenInput = document.querySelector('#product_image_names');
        const currentImages = hiddenInput.value.split(',').filter(img => img && img !== imageName);
        hiddenInput.value = currentImages.join(',');
        
        // Also update with any newly selected files
        if (fileInput.files && fileInput.files.length > 0) {
            const newFiles = Array.from(fileInput.files).map(f => f.name);
            hiddenInput.value = [...currentImages, ...newFiles].filter(Boolean).join(',');
        }
    }
    
    if (type === 'cover') {
        fileInput.value = ''; // Clear the file input
        const hiddenInput = document.querySelector('#cover_image_name');
        hiddenInput.value = ''; // Clear the hidden input
    }

    // Add hidden input to track removed images
    const form = document.querySelector('.productEditOrDeleteForm');
    let hiddenInput = form.querySelector(`input[name="removed_${type}_images"]`);
    
    if (!hiddenInput) {
        hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = `removed_${type}_images`;
        form.appendChild(hiddenInput);
    }
    
    // Update the value with all removed images
    const currentRemoved = hiddenInput.value ? hiddenInput.value.split(',') : [];
    if (!currentRemoved.includes(imageName)) {
        hiddenInput.value = [...currentRemoved, imageName].filter(Boolean).join(',');
    }
}





function previewImage(input, previewContainer, isMultiple) {
    if (!isMultiple) {
        previewContainer.innerHTML = ''; // Clear previous previews for single image
        document.querySelector('#cover_image_name').value = '';
    } else {
        // // For product images, check total count first
        // const existingImages = document.querySelector('#product_image_names').value 
        //     ? document.querySelector('#product_image_names').value.split(',') 
        //     : [];
        // const newFiles = input.files ? Array.from(input.files) : [];
        
// For product images, check total count first
const existingImages = document.querySelector('#product_image_names').value 
    ? document.querySelector('#product_image_names').value.split(',')
        .filter(image => 
            image && 
            typeof image === 'string' && 
            /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)$/i.test(image.trim())
        )
    : [];

const newFiles = input.files 
    ? Array.from(input.files).filter(file => 
        file.name && 
        /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)$/i.test(file.name)
      )
    : [];


        // Calculate total images (existing + new)
        const totalImages = existingImages.filter(img => img).length + newFiles.length;
        
        if (totalImages > 5) {
            showAlert('(previewImage)You can only have up to 5 product images. Please remove some existing images first.');
            input.value = ''; // Clear the input
            return;
        }
        
        document.querySelector('#product_image_names').value = '';
    }
    
    // Rest of the previewImage function remains the same...
    if (input.files && input.files.length > 0) {
        const hiddenInput = isMultiple 
            ? document.querySelector('#product_image_names')
            : document.querySelector('#cover_image_name');

        Array.from(input.files).forEach(file => {
            if (!file.type.match('image.*')) return;
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const imgBox = document.createElement('div');
                imgBox.className = 'oneImageBox';
                
                const imgLink = document.createElement('a');
                imgLink.href = e.target.result;
                imgLink.target = '_blank';
                
                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = 'Preview';
                
                const removeBtn = document.createElement('button');
                removeBtn.type = 'button';
                removeBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" />
                            <path stroke-linecap="round" d="m14.5 9.5l-5 5m0-5l5 5" />
                        </g>
                    </svg>
                `;
                removeBtn.onclick = function() {
                    imgBox.remove();
                    
                    // Update file input
                    if (isMultiple) {
                        const dataTransfer = new DataTransfer();
                        Array.from(input.files)
                            .filter(f => f !== file)
                            .forEach(f => dataTransfer.items.add(f));
                        input.files = dataTransfer.files;
                    } else {
                        input.value = ''; // Clear for single file input
                    }
                    
                    // Update hidden input value
                    if (isMultiple) {
                        hiddenInput.value = Array.from(input.files).map(f => f.name).join(',');
                    } else {
                        hiddenInput.value = '';
                    }
                };
                
                imgLink.appendChild(img);
                imgBox.appendChild(imgLink);
                imgBox.appendChild(removeBtn);
                previewContainer.appendChild(imgBox);
                
                // Update hidden input value
                if (isMultiple) {
                    hiddenInput.value = Array.from(input.files).map(f => f.name).join(',');
                } else {
                    hiddenInput.value = input.files[0].name;
                }
            };
            
            reader.readAsDataURL(file);
        });
    }
}




// Function to validate images before submission
function validateImages(productImagesInput) {
    // const existingImages = document.querySelector('#product_image_names').value 
    //     ? document.querySelector('#product_image_names').value.split(',') 
    //     : [];
    
    // const newFiles = productImagesInput.files ? Array.from(productImagesInput.files) : [];
    
// For product images, check total count first
const existingImages = document.querySelector('#product_image_names').value 
    ? document.querySelector('#product_image_names').value.split(',')
        .filter(image => 
            image && 
            typeof image === 'string' && 
            /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)$/i.test(image.trim())
        )
    : [];

const newFiles = input.files 
    ? Array.from(input.files).filter(file => 
        file.name && 
        /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)$/i.test(file.name)
      )
    : [];


    // Calculate total images (existing + new)
    const totalImages = existingImages.filter(img => img).length + newFiles.length;

    if (totalImages > 5) {
        showAlert('(existingImages)You can only have up to 5 product images. Please remove some existing images first.');
        return false; // Validation failed
    }
    
    if (totalImages === 0) {
        showAlert('(existingImages)At least one product image is required.');
        return false; // Validation failed
    }

    // Update the hidden input with the current state of images
    const updatedImageNames = [...existingImages, ...newFiles.map(file => file.name)];
    document.querySelector('#product_image_names').value = updatedImageNames.join(',');

    return true; // Validation passed
}








async function submitProductEditForm(event) {
    event.preventDefault();
    
    // Get auth token from local storage
    const authToken = localStorage.getItem("auth_token");
    if (!authToken) {
        alert('Please login first');
        return;
    }

    const form = event.target;
    const submitBtn = form.querySelector('.submitBtn');

    const productId = form.getAttribute('data-product-id');
    const actionSelect = document.getElementById('productAction');
    const selectedAction = actionSelect.value;

    if (!selectedAction) {
        showAlert('Please select an action for this product');
        return;
    }

    if (selectedAction === 'delete') {
        // Show custom confirmation for delete
        showConfirmation('Are you sure you want to delete this product permanently? This action cannot be undone.', async (confirmed) => {
            if (confirmed) {
                try {
                    const authToken = localStorage.getItem("auth_token");
                    const response = await fetch("http://localhost:5000/products/delete-product", {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${authToken}`
                        },
                        body: JSON.stringify({ product_id: productId })
                    });

                    const data = await response.json();
                    
                    if (data.status === "success") {
                        showAlert('Product deleted successfully');
                        closeEditOrDeleteProductArea();
                        fetchAndDisplayProducts();
                    } else {
                        showAlert('Failed to delete product: ' + (data.message || 'Unknown error'));
                    }
                } catch (error) {
                    console.error("Error deleting product:", error);
                    showAlert('Error deleting product: ' + error.message);
                }
            }
        });
    } else {
        // Handle edit/status change action
        try {
            categoriesContainer


            const formData = new FormData();
            
            // Get all form data
            const title = form.querySelector('#productTitle').value;
            const actualPrice = form.querySelector('#productActualPrice').value;
            const discountPrice = form.querySelector('#productDiscountedPrice').value;
            const shippingFee = form.querySelector('#productShippingCharges').value;
            const stock = form.querySelector('#productStock').value;
            const shortHtmlDescription = form.querySelector('#shortHTMLDescription').value;
            const longHtmlDescription = form.querySelector('#longHTMLDescription').value;
            const longDescription = form.querySelector('#longDescription').value;
            
            // // Get categories and variations (same as before)
            // const categoryCheckboxes = form.querySelectorAll('.checkableElements input[type="checkbox"][name="categories"]:checked');
            // const categories = Array.from(categoryCheckboxes)
            // .map(checkbox => checkbox.nextElementSibling.textContent.trim());
       
                // Get categories - we want to send category IDs, not names
                const categoryCheckboxes = form.querySelectorAll('.checkableElements input[type="checkbox"][name="categories"]:checked');
                const categories = Array.from(categoryCheckboxes).map(checkbox => {
                    return {
                        category_id: checkbox.value,
                        category_name: checkbox.nextElementSibling.textContent.trim()
                    };
                });


 
            // const variationGroups = {};
            // const variationCheckboxes = form.querySelectorAll('.checkableElements input[type="checkbox"]:checked:not([name="categories"])');
            // variationCheckboxes.forEach(checkbox => {
            //     const variationName = checkbox.name;
            //     const variationValue = checkbox.value;
            //     if (!variationGroups[variationName]) {
            //         variationGroups[variationName] = [];
            //     }
            //     variationGroups[variationName].push(variationValue);
            // });
            // const variations = Object.keys(variationGroups).map(title => {
            //     return {
            //         title: title,
            //         values: variationGroups[title]
            //     };
            // });


// Get variations
const variationGroups = {};
const variationCheckboxes = form.querySelectorAll('.checkableElements input[type="checkbox"]:checked:not([name="categories"])');
variationCheckboxes.forEach(checkbox => {
    const variationName = checkbox.name;
    const variationValue = checkbox.value;
    if (!variationGroups[variationName]) {
        variationGroups[variationName] = [];
    }
    variationGroups[variationName].push(variationValue);
});

// Convert to the format your backend expects
const variations = Object.keys(variationGroups).map(title => {
    return {
        title: title,
        values: variationGroups[title]
    };
});




                        // Handle cover image
            // const coverImageInput = form.querySelector('#coverPicturee');
            // const coverImageName = form.querySelector('#cover_image_name').value;
            // const removedCoverImages = form.querySelector('input[name="removed_cover_images"]')?.value || '';

            // // Check if a new cover image was uploaded
            // if (coverImageInput.files && coverImageInput.files.length > 0) {
            //     formData.append('cover_image', coverImageInput.files[0]);
            // } 
            // // If no new image but existing image wasn't removed, keep the existing one
            // else if (coverImageName && !removedCoverImages.includes(coverImageName)) {
            //     formData.append('cover_image_name', coverImageName);
            // }
            // // Only throw error if there's no existing image and no new image was uploaded
            // else if (!coverImageName || removedCoverImages.includes(coverImageName)) {
            //     throw new Error('Cover image is required');
            // }





// // Handle cover image
//         const coverImageInput = form.querySelector('#coverPicturee');
//         const coverImageName = form.querySelector('#cover_image_name').value;
//         const removedCoverImages = form.querySelector('input[name="removed_cover_images"]')?.value || '';

//         // If new cover image is uploaded
//         if (coverImageInput.files && coverImageInput.files.length > 0) {
//             formData.append('cover_image', coverImageInput.files[0]);
//         } 
//         // If existing cover image is kept (not removed)
//         else if (coverImageName && !removedCoverImages.includes(coverImageName)) {
//             formData.append('existing_cover_image', coverImageName);
//         }
//         // If cover image was removed and no new one uploaded
//         else if (removedCoverImages.includes(coverImageName)) {
//             formData.append('existing_cover_image', ''); // Clear cover image
//         }
//         // If no cover image exists at all
//         else {
//             throw new Error('Cover image is required');
//         }






// // Handle cover image
// const coverImageInput = form.querySelector('#coverPicturee');
// const existingCoverImage = form.querySelector('#cover_image_name').value;
// const removedCoverImages = form.querySelector('input[name="removed_cover_images"]')?.value || '';

// // Case 1: New cover image uploaded
// if (coverImageInput.files && coverImageInput.files.length > 0) {
//     formData.append('cover_image', coverImageInput.files[0]);
// } 
// // Case 2: Existing cover image is kept (not removed)
// else if (existingCoverImage && !removedCoverImages.includes(existingCoverImage)) {
//     // Send the existing image name to the backend
//     formData.append('cover_image_name', existingCoverImage);
    
//     // If you need to send the actual image file, you'll need to fetch it first

//     try {
//         const response = await fetch(`http://localhost:5000/products/images12/${existingCoverImage}`);
//         if (response.ok) {
//             console.log("ok");
//             const blob = await response.blob();
//             formData.append('cover_image_file', blob, existingCoverImage);
//         }
//     } catch (error) {
//         console.log(" not ok");
//         console.error("Error fetching existing cover image:", error);
//     }
// }
// // Case 3: No cover image provided at all
// else {
//     throw new Error('Cover image is required');
// }





















// Handle cover image
const coverImageInput = form.querySelector('#coverPicturee');
const existingCoverImage = form.querySelector('#cover_image_name').value;
const removedCoverImages = form.querySelector('input[name="removed_cover_images"]')?.value || '';

// Case 1: New cover image uploaded
if (coverImageInput.files && coverImageInput.files.length > 0) {
    formData.append('cover_image', coverImageInput.files[0]);
} 
// Case 2: Existing cover image is kept (not removed)
else if (existingCoverImage && !removedCoverImages.includes(existingCoverImage)) {
    try {
        // Fetch the existing image from the server
        const response = await fetch(`http://localhost:5000/products/images12/${existingCoverImage}`);
        if (response.ok) {
            const blob = await response.blob();
            
            // Create a new File object from the blob
            const file = new File([blob], existingCoverImage, { type: blob.type });
            
            // Create a new DataTransfer object to assign the file to the input
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            
            // Assign the file to the cover image input
            coverImageInput.files = dataTransfer.files;
            
            // Now we can treat it like a newly uploaded file
            formData.append('cover_image', coverImageInput.files[0]);
            
            // Also send the original filename for reference
            formData.append('original_cover_image_name', existingCoverImage);
            
            console.log("Existing cover image processed successfully");
        } else {
            throw new Error('Failed to fetch existing cover image');
        }
    } catch (error) {
        console.error("Error processing existing cover image:", error);
        throw new Error('Error processing existing cover image');
    }
}
// Case 3: No cover image provided at all
else {
    throw new Error('Cover image is required');
}

























    //         // Handle product images
    //         const productImagesInput = form.querySelector('#productPicturess');
    //         const productImageNames = form.querySelector('#product_image_names').value;
    //         const removedProductImages = form.querySelector('input[name="removed_product_images"]')?.value || '';
    //          // Validate images before proceeding
    // if (!validateImages(productImagesInput)) {
    //     return; // Stop submission if validation fails
    // }


           
    //         // Get existing images that weren't removed
    //          const keptImages = productImageNames.split(',')
    //          .filter(img => img && !removedProductImages.includes(img));

    //         // Add new images
    //         if (productImagesInput.files && productImagesInput.files.length > 0) {
    //             Array.from(productImagesInput.files).forEach((file, index) => {
    //                 formData.append(`new_image_${index}`, file);
    //             });
    //         }
            
    //         // Add kept images
    //         keptImages.forEach((img, index) => {
    //             formData.append(`kept_image_${index}`, img);
    //         });
            
    //         // Add removed images
    //         if (removedProductImages) {
    //             removedProductImages.split(',').filter(img => img).forEach((img, index) => {
    //                 formData.append(`removed_image_${index}`, img);
    //             });
    //         }

    //         // Validate total images don't exceed 5
    //         const totalImages = keptImages.length + 
    //                           (productImagesInput.files ? productImagesInput.files.length : 0);
    //         if (totalImages > 5) {
    //             throw new Error('You can only have up to 5 product images');
    //         }
    //         if (totalImages === 0) {
    //             throw new Error('At least one product image is required');
    //         }





//   // Handle product images
//   const productImagesInput = form.querySelector('#productPicturess');
// //   const existingProductImages = form.querySelector('#product_image_names').value.split(',').filter(img => img);


//   const removedProductImages = form.querySelector('input[name="removed_product_images"]')?.value.split(',').filter(img => img) || [];
  
//   // Filter out removed images from existing images
//   const keptImages = existingProductImages.filter(img => !removedProductImages.includes(img));
  
//   // Get new images
//   const newImages = productImagesInput.files ? Array.from(productImagesInput.files) : [];


//  // Log the counts for debugging
//  console.log("Existing Product Images:", existingProductImages);
//  console.log("Removed Product Images:", removedProductImages);
//  console.log("Kept Images:", keptImages);
//  console.log("New Images:", newImages);


//   // Combine kept images and new images
//   const allImages = [...keptImages];

//   // Fetch existing images from the server and append them to allImages
//   for (const img of keptImages) {
//       const response = await fetch(`http://localhost:5000/products/images12/${img}`);
//       if (response.ok) {
//           const blob = await response.blob();
//           const file = new File([blob], img, { type: blob.type });
//           allImages.push(file);
//       }
//   }

//   // Add new images to allImages
//   allImages.push(...newImages);

//  // Log the total number of images
//  console.log("Total Images Count:", allImages.length);

//   // Validate total images don't exceed 5
//   if (allImages.length > 5) {
//       throw new Error('You can only have up to 5 product images');
//   }
  
//   if (allImages.length === 0) {
//       throw new Error('At least one product image is required');
//   }

//   // Add images to formData
//   allImages.forEach((img, index) => {
//       if (img instanceof File) {
//           formData.append(`image_${index + 1}`, img);
//       } else {
//           formData.append(`image_${index + 1}`, img); // For existing images
//       }
//   });



// // Handle product images
// const productImagesInput = form.querySelector('#productPicturess');
// const existingProductImages = form.querySelector('#product_image_names').value
//     .split(',')
//     .filter(img => img && img.match(/\.(png|jpg|jpeg|gif|webp)$/i));
// const removedProductImages = form.querySelector('input[name="removed_product_images"]')?.value.split(',').filter(img => img) || [];

// // 1. Filter out removed images
// const keptImages = existingProductImages.filter(img => !removedProductImages.includes(img));

// // 2. Get new images (limit to 5 total)
// const newImages = productImagesInput.files ? Array.from(productImagesInput.files) : [];
// const totalImages = keptImages.length + newImages.length;

// if (totalImages > 5) {
//     throw new Error('Maximum 5 images allowed');
// }
// if (totalImages === 0) {
//     throw new Error('At least one image required');
// }

// // 3. Prepare final images array (new images first, then kept images)
// const finalImages = [];
// const maxNewImages = Math.min(newImages.length, 5);
// const maxKeptImages = 5 - maxNewImages;

// // Add new images
// for (let i = 0; i < maxNewImages; i++) {
//     finalImages.push(newImages[i]);
// }

// // Add kept images (only until we reach 5 total)
// for (let i = 0; i < keptImages.length && finalImages.length < 5; i++) {
//     try {
//         const response = await fetch(`http://localhost:5000/products/images12/${keptImages[i]}`);
//         if (response.ok) {
//             const blob = await response.blob();
//             const file = new File([blob], keptImages[i], { type: blob.type });
//             finalImages.push(file);
//         } else {
//             console.error(`Failed to fetch image: ${keptImages[i]}`);
//         }
//     } catch (error) {
//         console.error(`Error fetching kept image: ${keptImages[i]}`, error);
//     }
// }

// // 4. Add images to FormData
// finalImages.forEach((img, index) => {
//     formData.append(`image_${index + 1}`, img);
  
// });








// // Handle product images
// const productImagesInput = form.querySelector('#productPicturess');
// const existingProductImages = form.querySelector('#product_image_names').value
//     .split(',')
//     .filter(img => img && img.match(/\.(png|jpg|jpeg|gif|webp)$/i));
// const removedProductImages = form.querySelector('input[name="removed_product_images"]')?.value.split(',').filter(img => img) || [];

// // Filter out removed images
// const keptImages = existingProductImages.filter(img => !removedProductImages.includes(img));

// // Get new images
// const newImages = productImagesInput.files ? Array.from(productImagesInput.files) : [];
// const totalImages = keptImages.length + newImages.length;

// if (totalImages > 5) {
//     throw new Error('Maximum 5 images allowed');
// }
// if (totalImages === 0) {
//     throw new Error('At least one image required');
// }

// // Prepare final images array
// const finalImages = [];

// // Add new images first
// for (let i = 0; i < newImages.length && finalImages.length < 5; i++) {
//     finalImages.push(newImages[i]);
// }

// // Then add kept images until we reach 5 total
// for (let i = 0; i < keptImages.length && finalImages.length < 5; i++) {
//     try {
//         const response = await fetch(`http://localhost:5000/products/images12/${keptImages[i]}`);
//         if (response.ok) {
//             const blob = await response.blob();
//             const file = new File([blob], keptImages[i], { type: blob.type });
//             finalImages.push(file);
//         }
//     } catch (error) {
//         console.error(`Error fetching kept image: ${keptImages[i]}`, error);
//     }
// }

// // 4. Add images to FormData
// finalImages.forEach((img, index) => {
//     formData.append(`image_${index + 1}`, img);
  
// });








// const totalImages = keptImages.length + newImages.length;

// if (totalImages > 5) {
//     throw new Error('(productImagesInput)Maximum 5 images allowed');
// }
// if (totalImages === 0) {
//     throw new Error('(productImagesInput)At least one image required');
// }

// // Prepare final images array
// const finalImages = [];

// // Add new images first
// for (let i = 0; i < newImages.length && finalImages.length < 5; i++) {
//     finalImages.push(newImages[i]);
// }

// // Then add kept images until we reach 5 total
// for (let i = 0; i < keptImages.length && finalImages.length < 5; i++) {
//     try {
//         const response = await fetch(`http://localhost:5000/products/images12/${keptImages[i]}`);
//         if (response.ok) {
//             const blob = await response.blob();
//             const file = new File([blob], keptImages[i], { type: blob.type });
//             finalImages.push(file);
//         } else {
//             console.warn(`Image not found: ${keptImages[i]}`); // Log if the image is not found
//         }
//     } catch (error) {
//         console.error(`Error fetching kept image: ${keptImages[i]}`, error);
//     }
// }

// // Add images to FormData
// finalImages.forEach((img, index) => {
//     formData.append(`image_${index + 1}`, img);
// });










// this one is  wokring pereefeenbelyyyy

// // Handle product images
// const productImagesInput = form.querySelector('#productPicturess');
// const existingProductImages = form.querySelector('#product_image_names').value
//     .split(',')
//     .filter(img => img && img.match(/\.(png|jpg|jpeg|gif|webp)$/i));
//     const removedProductImages = (form.querySelector('input[name="removed_product_images"]')?.value || '')
//     .split(',')
//     .filter(img => img && /\.(png|jpg|jpeg|gif|webp)$/i.test(img.trim()));
// // Filter out removed images from existing images
// const keptImages = existingProductImages.filter(img => 
//     !removedProductImages.includes(img) && 
//     /\.(png|jpg|jpeg|gif|webp)$/i.test(img)
// );
// // Get new images


// // Get new images - filter to only include valid image files
// const newImages = productImagesInput.files ? 
//     Array.from(productImagesInput.files).filter(file => 
//         file.type.match('image.*') && 
//         /\.(png|jpg|jpeg|gif|webp)$/i.test(file.name)
//     ) : 
//     [];


//     // First validate we have at least one image
// if (keptImages.length === 0 && newImages.length === 0) {
//     throw new Error('(productImagesInput) At least one image required');
// }

// // Process kept images (try to fetch them)
// const processedKeptImages = [];
// for (const imgName of keptImages) {
//     try {
//         const response = await fetch(`http://localhost:5000/products/images12/${imgName}`);
//         if (response.ok) {
//             const blob = await response.blob();
//             const file = new File([blob], imgName, { type: blob.type });
//             processedKeptImages.push(file);
//         } else {
//             console.warn(`Image not found: ${imgName}`);
//         }
//     } catch (error) {
//         console.error(`Error fetching kept image: ${imgName}`, error);
//     }
// }

// // Combine all valid images
// const finalImages = [...processedKeptImages, ...newImages];

// // Validate total count after processing
// if (finalImages.length > 5) {
//     throw new Error('(productImagesInput) Maximum 5 images allowed');
// }
// if (finalImages.length === 0) {
//     throw new Error('(productImagesInput) No valid images found');
// }

// // Add images to FormData
// finalImages.forEach((img, index) => {
//     formData.append(`image_${index + 1}`, img);
// });











// 3 errors in thats belwio the above one is perefcete but you will neend to uncoemoee api for data the api lie number that you want to uncommeet


// Handle product images
const productImagesInput = form.querySelector('#productPicturess');
const existingProductImages = form.querySelector('#product_image_names').value
    .split(',')
    .filter(img => img && img.match(/\.(png|jpg|jpeg|gif|webp)$/i));
const removedProductImages = (form.querySelector('input[name="removed_product_images"]')?.value || '')
    .split(',')
    .filter(img => img && /\.(png|jpg|jpeg|gif|webp)$/i.test(img.trim()));

// Filter out removed images from existing images
const keptImages = existingProductImages.filter(img => 
    !removedProductImages.includes(img) && 
    /\.(png|jpg|jpeg|gif|webp)$/i.test(img)
);

// Get new images - filter to only include valid image files
const newImages = productImagesInput.files ? 
    Array.from(productImagesInput.files).filter(file => 
        file.type.match('image.*') && 
        /\.(png|jpg|jpeg|gif|webp)$/i.test(file.name)
    ) : 
    [];

// First validate we have at least one image
if (keptImages.length === 0 && newImages.length === 0) {
    throw new Error('At least one image required');
}

// Calculate how many existing images we need to include
const maxNewImages = Math.min(newImages.length, 5);
const remainingSlots = 5 - maxNewImages;
const imagesToKeep = keptImages.slice(0, remainingSlots);

// Add new images first (image_1, image_2, etc.)
newImages.slice(0, maxNewImages).forEach((img, index) => {
    formData.append(`image_${index + 1}`, img);
});

// Then add kept existing images to fill remaining slots (existing_image_1, etc.)
imagesToKeep.forEach((img, index) => {
    formData.append(`existing_image_${index + 1}`, img);
});

// Debug logs
console.log("New Images to Upload:", newImages.length);
console.log("Existing Images to Keep:", imagesToKeep.length);
console.log("Total Images Being Sent:", maxNewImages + imagesToKeep.length);














// // 4. Add images to FormData
// for (let index = 0; index < finalImages.length; index++) {
//     const img = finalImages[index];

//     // Check file name or type before proceeding
//     const isValidImage = img.name && img.name.match(/\.(png|jpg|jpeg|gif|webp)$/i);

//     if (!isValidImage) {
//         console.log(`Image ${index + 1} skipped: Invalid format.`);
//         continue; // Skip this one if not valid
//     }

//     // Ask user before appending
//     const userConfirmed = await new Promise((resolve) => {
//         const confirmed = window.confirm(`Do you want to add image ${index + 1}?`);
//         resolve(confirmed);
//     });

//     if (userConfirmed) {
//         formData.append(`image_${index + 1}`, img);
//         console.log(`Image ${index + 1} added.`);
//     } else {
//         console.log(`Image ${index + 1} skipped by user.`);
//     }
// }























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
            formData.append('status', selectedAction);
            formData.append('product_id', productId);  

            console.log("Data being sent to API:");
            let alertContent = "Form data being sent:\n\n";
            
            // Log each form data entry and build alert content
            for (let [key, value] of formData.entries()) {
                let valueStr;
                
                if (value instanceof File) {
                    valueStr = `File: ${value.name} (${value.size} bytes)`;
                    console.log(key, '->', valueStr);
                } else if (key === 'categories' || key === 'variations') {
                    try {
                        valueStr = JSON.parse(value);
                        valueStr = JSON.stringify(valueStr, null, 2);
                        console.log(key, '->', valueStr);
                    } catch {
                        valueStr = value;
                        console.log(key, '->', value);
                    }
                } else {
                    valueStr = value;
                    console.log(key, '->', value);
                }
                
                // Add to alert content (limit length to prevent huge alerts)
                if (valueStr.length > 100) {
                    valueStr = valueStr.substring(0, 100) + '... [truncated]';
                }
                alertContent += `${key}: ${valueStr}\n\n`;
            }
            
            // Show the alert with all data
            showAlert(alertContent);

            // Send the request
            const authToken = localStorage.getItem("auth_token");
            const response = await fetch(`http://localhost:5000/products/add-product`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${authToken}`
                },
                body: formData
               
            });
            console.log(formData);

            const data = await response.json();


            console.log("API Response:", data); // Print the response to console



            if (data.status === "success") {
                showAlert('Product updated successfully');
                closeEditOrDeleteProductArea();
                fetchAndDisplayProducts();
            } else {
                showAlert('Failed to update product: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error("Error updating product:", error);
            showAlert('Error updating product: ' + error.message);
        }
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

        <form class="productEditOrDeleteForm" data-product-id="${productId}" >
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
                <div class="oneImageBox">
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
        product.product_images
            .filter(image => image && /\.(jpg|jpeg|png|gif|webp)$/i.test(image))
            .map(image => `
                    <div class="oneImageBox">
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
 

<input type="" name="cover_image_name" id="cover_image_name" value="${product.product_cover_image || ''}" />
<input type="text" name="product_image_names" id="product_image_names"
  value="${(product.product_images || []).filter(img => img && img.match(/\.(png|jpg|jpeg|gif|webp)$/i)).join(',')}" />


            <div class="submitBtnArea">
                <button class="submitBtn">Save changes</button>
            </div>
        </form>
         
    `;
    setupCheckboxEvents(); // Ensure this is called after the form is populated
   
   
    setupCheckboxEvents();
    const productEditOrDeleteForm = document.querySelector('.productEditOrDeleteForm');
    if (productEditOrDeleteForm) {
        productEditOrDeleteForm.addEventListener('submit', submitProductEditForm);
    }

      // Image preview for cover image (single image)
      const coverImageInput = document.querySelector('#coverPicturee');
      const coverPreviewContainer = document.querySelector('.EditpreviewImages.EditcoverImagePreview');
      if (coverImageInput && coverPreviewContainer) {
          coverImageInput.addEventListener('change', function() {
              previewImage(this, coverPreviewContainer, false);
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
}



