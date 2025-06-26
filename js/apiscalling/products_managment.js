
// // DOM Elements
// const addProductArea = document.querySelector('.addProductArea');
// const editOrDeleteProductArea = document.querySelector('.editOrDeleteProductArea');

// // Toggle functions for product areas
// function openAddProductArea() {
//     addProductArea.style.opacity = 1;
//     addProductArea.style.transform = "translateY(0%)";
// }

// function closeAddProductArea() {
//     addProductArea.style.opacity = 0;
//     addProductArea.style.transform = "translateY(110%)";
// }

// function openEditOrDeleteProductArea(productId) {
//     editOrDeleteProductArea.style.opacity = 1;
//     editOrDeleteProductArea.style.transform = "translateY(0%)";
//     loadProductForEditing(productId);
// }

// function closeEditOrDeleteProductArea() {
//     editOrDeleteProductArea.style.opacity = 0;
//     editOrDeleteProductArea.style.transform = "translateY(110%)";
// }

// // Function to show custom alert
// function showAlert(message) {
//     const alertElement = document.querySelector('.alert');
//     alertElement.querySelector('p').textContent = message;
//     alertElement.style.display = 'block';
//     setTimeout(() => {
//         alertElement.style.display = 'none';
//     }, 5000);
// }

// // Function to show custom confirmation
// function showConfirmation(message, callback) {
//     const confirmationElement = document.querySelector('.confirmation');
//     confirmationElement.querySelector('h1').textContent = message;
//     const [cancelBtn, confirmBtn] = confirmationElement.querySelectorAll('.confirmationButtons button');
    
//     // Set up event listeners
//     const handleConfirm = () => {
//         confirmationElement.style.display = 'none';
//         callback(true);
//         confirmBtn.removeEventListener('click', handleConfirm);
//     };
    
//     const handleCancel = () => {
//         confirmationElement.style.display = 'none';
//         callback(false);
//         cancelBtn.removeEventListener('click', handleCancel);
//     };
    
//     confirmBtn.addEventListener('click', handleConfirm);
//     cancelBtn.addEventListener('click', handleCancel);
    
//     confirmationElement.style.display = 'block';
// }

// function closeConfirmation() {
//     document.querySelector('.confirmation').style.display = 'none';
// }

// // Function to fetch and display products
// async function fetchAndDisplayProducts() {
//     try {
//         const authToken = localStorage.getItem("auth_token");
//         const response = await fetch("http://localhost:5000/products/fetch-products-all", {
//             method: "GET",
//             headers: {
//                 "Authorization": `Bearer ${authToken}`
//             }
//         });
        
//         const data = await response.json();
        
//         if (data.status === "success") {
//             displayProducts(data.response);
//         } else {
//             console.error("Failed to fetch products:", data.message);
//             showAlert("Failed to fetch products: " + (data.message || "Unknown error"));
//         }
//     } catch (error) {
//         console.error("Error fetching products:", error);
//         showAlert("Error fetching products: " + error.message);
//     }
// }

// // Function to display all products with latest first
// function displayProducts(products) {
//     const productsContainer = document.querySelector(".productsHere");
//     productsContainer.innerHTML = ""; // Clear existing content
    
//     // Convert products object to an array of [id, product] pairs
//     const productEntries = Object.entries(products);
    
//     // Sort products by created_at date (newest first)
//     productEntries.sort((a, b) => {
//         const dateA = new Date(a[1].created_at);
//         const dateB = new Date(b[1].created_at);
//         return dateB - dateA; // Sort newest to oldest
//     });
    
//     for (const [productId, product] of productEntries) {
//         // Format variations
//         let variationsText = "";
//         if (product.variations && product.variations.length > 0) {
//             const cleanedVariations = product.variations.join("").replace(/[\[\]"]/g, "").split(",");
//             variationsText = cleanedVariations.map(v => v.trim()).filter(v => v).join("</span>&nbsp;-&nbsp;<span>");
//         }
        
//         // Format categories
//         let categoriesText = "";
//         if (product.categories && product.categories.length > 0) {
//             const cleanedCategories = product.categories.join("").replace(/[\[\]"]/g, "").split(",");
//             categoriesText = cleanedCategories.map(c => c.trim()).filter(c => c).join(", ");
//         }
        
//         // Create product element
//         const productElement = document.createElement("div");
//         productElement.className = "oneProduct";
//         productElement.setAttribute("data-product-id", productId);
//         productElement.style.borderLeft = `5px solid #${productId.substring(0, 6)}`;
        
//         productElement.innerHTML = `
//             <div class="itemImageBox">
//                 <img src="/MSM_Backend/images/${product.product_cover_image}" alt="${product.title}" 
//                      onerror="this.src='/assets/misc/default-product-image.png'; this.onerror=null;">
//             </div>
//             <div class="itemDets">
//                 <h1>${product.title}</h1>
//                 <div class="categories">
//                     <p>Categories: <span>${categoriesText || "No categories"}</span></p>
//                 </div>
//                 <div class="variations">
//                     <p>Variations: <span>${variationsText || "No variations"}</span></p>
//                 </div>
//                 <div class="status">
//                     <h2 class="${product.status === "active" ? "active" : "inactive"}">${product.status.charAt(0).toUpperCase() + product.status.slice(1)}</h2>
//                 </div>
//                 <div class="unitPrice">
//                     <p>Actual price:&nbsp;&nbsp;<span>Rs.</span>&nbsp;<span>${product.actual_price}</span></p>
//                     ${product.discount_price ? `<p>Discounted price:&nbsp;&nbsp;<span>Rs.</span>&nbsp;<span>${product.discount_price}</span></p>` : ""}
//                     <p>Shipping:&nbsp;&nbsp;<span>Rs.</span>&nbsp;<span>${product.shipping_fee}</span></p>
//                     <p>Stock left:&nbsp;&nbsp;<span>${product.stock}</span>&nbsp;<span>Pcs</span></p>
//                 </div>
//                 <button type="button" class="accButton" onclick="openEditOrDeleteProductArea('${productId}')">
//                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
//                         <path fill="currentColor" fill-rule="evenodd"
//                             d="M14.1 2.391a3.896 3.896 0 0 1 5.509 5.51l-7.594 7.594c-.428.428-.69.69-.98.917a6 6 0 0 1-1.108.684c-.334.159-.685.276-1.259.467l-2.672.891l-.642.214a1.598 1.598 0 0 1-2.022-2.022l1.105-3.314c.191-.574.308-.925.467-1.259a6 6 0 0 1 .685-1.107c.227-.291.488-.553.916-.98zM5.96 16.885l-.844-.846l.728-2.185c.212-.636.3-.895.414-1.135q.212-.443.513-.83c.164-.21.356-.404.83-.879l5.891-5.89a6.05 6.05 0 0 0 1.349 2.04a6.05 6.05 0 0 0 2.04 1.348l-5.891 5.89c-.475.475-.668.667-.878.83q-.388.302-.83.514c-.24.114-.5.202-1.136.414zm12.116-9.573a4 4 0 0 1-.455-.129a4.5 4.5 0 0 1-1.72-1.084a4.54 4.54 0 0 1-1.084-1.72a4 4 0 0 1-.13-.455l.473-.472a2.396 2.396 0 0 1 3.388 3.388zM3.25 22a.75.75 0 0 1 .75-.75h16v1.5H4a.75.75 0 0 1-.75-.75"
//                             clip-rule="evenodd" />
//                     </svg>&nbsp;edit/delete product
//                 </button>
//             </div>
//         `;
        
//         productsContainer.appendChild(productElement);
//     }
    
//     // Add the "Add Product" block after all products
//     const addProductBlock = document.createElement("div");
//     addProductBlock.className = "addProductBlock";
//     addProductBlock.innerHTML = `
//         <button type="button" onclick="openAddProductArea()">
//             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
//                 <g fill="none" stroke="currentColor">
//                     <circle cx="12" cy="12" r="10" />
//                     <path stroke-linecap="round" d="M15 12h-3m0 0H9m3 0V9m0 3v3" />
//                 </g>
//             </svg>
//         </button>
//     `;
    
//     productsContainer.appendChild(addProductBlock);
// }



// // Function to load product data for editing
// async function loadProductForEditing(productId) {
//     try {
//         // Show loading state
//         const editArea = document.querySelector('.editOrDeleteProductArea .editOrDeleteProductAreaContent');
//         if (!editArea) {
//             editOrDeleteProductArea.innerHTML = `
//                 <div class="editOrDeleteProductAreaContent">
//                     <div class="sideTitlePlusCloseButton">
//                         <h1>Edit/Delete product</h1>
//                         <button type="button" onclick="closeEditOrDeleteProductArea()"><svg xmlns="http://www.w3.org/2000/svg"
//                                 viewBox="0 0 24 24">
//                                 <g fill="none" stroke="currentColor">
//                                     <circle cx="12" cy="12" r="10" />
//                                     <path stroke-linecap="round" d="m14.5 9.5l-5 5m0-5l5 5" />
//                                 </g>
//                             </svg>&nbsp;Close</button>
//                     </div>
//                     <div class="loading">Loading product details...</div>
//                 </div>
//             `;
//         } else {
//             editArea.innerHTML = '<div class="loading">Loading product details...</div>';
//         }

//         // Fetch product details
//         const authToken = localStorage.getItem("auth_token");
//         const productResponse = await fetch("http://localhost:5000/products/get-product", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 "Authorization": `Bearer ${authToken}`
//             },
//             body: JSON.stringify({ product_id: productId })
//         });

//         const productData = await productResponse.json();
        
//         if (productData.status !== "success") {
//             throw new Error(productData.message || "Failed to fetch product details");
//         }

//         const product = productData.response;

//         // Fetch categories and variations
//         const catVarResponse = await fetch('http://localhost:5000/products/get-categories-variations', {
//             method: 'GET',
//             headers: {
//                 "Authorization": `Bearer ${authToken}`
//             }
//         });

//         const catVarData = await catVarResponse.json();
        
//         if (!catVarData.response) {
//             throw new Error("Failed to fetch categories and variations");
//         }

//         // Render the edit form
//         await populateEditForm(product, catVarData.response, productId);

//     } catch (error) {
//         console.error("Error loading product for editing:", error);
//         document.querySelector('.editOrDeleteProductArea .editOrDeleteProductAreaContent').innerHTML = `
//             <div class="error">
//                 <p>Error loading product: ${error.message}</p>
//                 <button onclick="closeEditOrDeleteProductArea()">Close</button>
//             </div>
//         `;
//     }
// }






// // Function to populate the edit form
// async function populateEditForm(product, categoriesAndVariations, productId) {
//     const editArea = document.querySelector('.editOrDeleteProductArea .editOrDeleteProductAreaContent');
    
//     editArea.innerHTML = `
//         <div class="sideTitlePlusCloseButton">
//             <h1>Edit/Delete product</h1>
//             <button type="button" onclick="closeEditOrDeleteProductArea()"><svg xmlns="http://www.w3.org/2000/svg"
//                     viewBox="0 0 24 24">
//                     <g fill="none" stroke="currentColor">
//                         <circle cx="12" cy="12" r="10" />
//                         <path stroke-linecap="round" d="m14.5 9.5l-5 5m0-5l5 5" />
//                     </g>
//                 </svg>&nbsp;Close</button>
//         </div>

//         <form class="productEditOrDeleteForm" data-product-id="${productId}">
//             <div class="oneInput">
//                 <label for="productTitle">Title <span>*</span></label>
//                 <input type="text" value="${escapeHtml(product.title)}" name="productTitle" id="productTitle" required>
//             </div>

//             <div class="twoInputs">
//                 <div class="oneInput">
//                     <label for="productActualPrice">Actual price <span>*</span></label>
//                     <input type="number" value="${product.actual_price}" name="productActualPrice" id="productActualPrice" required>
//                 </div>
//                 <div class="oneInput">
//                     <label for="productDiscountedPrice">Discounted price</label>
//                     <input type="number" value="${product.discount_price || ''}" name="productDiscountedPrice" id="productDiscountedPrice">
//                 </div>
//             </div>

//             <div class="twoInputs">
//                 <div class="oneInput">
//                     <label for="productShippingCharges">Shipping <span>*</span></label>
//                     <input type="number" value="${product.shipping_fee}" name="productShippingCharges" id="productShippingCharges" required>
//                 </div>
//                 <div class="oneInput">
//                     <label for="productStock">Stock <span>*</span></label>
//                     <input type="number" value="${product.stock}" name="productStock" id="productStock" required>
//                 </div>
//             </div>

//             <div class="oneInput">
//                 <label for="shortHTMLDescription">Short HTML description</label>
//                 <textarea name="shortHTMLDescription" id="shortHTMLDescription">${escapeHtml(product.short_html_description || '')}</textarea>
//             </div>

//             <div class="oneInput">
//                 <label for="longHTMLDescription">Long HTML description</label>
//                 <textarea name="longHTMLDescription" id="longHTMLDescription">${escapeHtml(product.long_html_description || '')}</textarea>
//             </div>

//             <div class="oneInput">
//                 <label>Categories <span>*</span></label>
//                 <div class="checkableElements" id="categoriesContainer">
//                     ${generateCategoryCheckboxes(categoriesAndVariations.categories, product.categories)}
//                 </div>
//             </div>

//             <div id="variationsContainer">
//                 ${generateVariationSections(categoriesAndVariations.variations, product.variations)}
//             </div>

//             <div class="oneInput">
//                 <label for="coverPicture">Product cover <span>*</span></label>
//                 <label class="custum-file-upload" for="coverPicture">
//                     <div class="icon">
//                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
//                             <g fill="none" stroke="currentColor" stroke-linecap="round">
//                                 <path
//                                     d="M6.286 19C3.919 19 2 17.104 2 14.765s1.919-4.236 4.286-4.236q.427.001.83.08m7.265-2.582a5.8 5.8 0 0 1 1.905-.321c.654 0 1.283.109 1.87.309m-11.04 2.594a5.6 5.6 0 0 1-.354-1.962C6.762 5.528 9.32 3 12.476 3c2.94 0 5.361 2.194 5.68 5.015m-11.04 2.594a4.3 4.3 0 0 1 1.55.634m9.49-3.228C20.392 8.78 22 10.881 22 13.353c0 2.707-1.927 4.97-4.5 5.52" />
//                                 <path stroke-linejoin="round" d="M12 16v6m0-6l2 2m-2-2l-2 2" />
//                             </g>
//                         </svg>
//                     </div>
//                     <div class="text">
//                         <span>Click to upload cover picture</span>
//                     </div>
//                     <input type="file" id="coverPicture" accept="image/*">
//                 </label>
//             </div>

//             <div class="previewImages coverImagePreview" id="coverImagePreview">
//                 ${product.product_cover_image ? `
//                 <div class="oneImageBox">
//                     <a href="/MSM_Backend/images/${product.product_cover_image}" target="_blank">
//                         <img src="/MSM_Backend/images/${product.product_cover_image}" alt="Cover Image" 
//                              onerror="this.parentNode.style.display='none'">
//                     </a>
//                     <button type="button" onclick="removeImage('cover', '${product.product_cover_image}')">
//                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
//                             <g fill="none" stroke="currentColor">
//                                 <circle cx="12" cy="12" r="10" />
//                                 <path stroke-linecap="round" d="m14.5 9.5l-5 5m0-5l5 5" />
//                             </g>
//                         </svg>
//                     </button>
//                 </div>
//                 ` : ''}
//             </div>

//             <div class="oneInput">
//                 <label for="productPictures">Product pictures <span>*</span></label>
//                 <label class="custum-file-upload" for="productPictures">
//                     <div class="icon">
//                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
//                             <g fill="none" stroke="currentColor" stroke-linecap="round">
//                                 <path
//                                     d="M6.286 19C3.919 19 2 17.104 2 14.765s1.919-4.236 4.286-4.236q.427.001.83.08m7.265-2.582a5.8 5.8 0 0 1 1.905-.321c.654 0 1.283.109 1.87.309m-11.04 2.594a5.6 5.6 0 0 1-.354-1.962C6.762 5.528 9.32 3 12.476 3c2.94 0 5.361 2.194 5.68 5.015m-11.04 2.594a4.3 4.3 0 0 1 1.55.634m9.49-3.228C20.392 8.78 22 10.881 22 13.353c0 2.707-1.927 4.97-4.5 5.52" />
//                                 <path stroke-linejoin="round" d="M12 16v6m0-6l2 2m-2-2l-2 2" />
//                             </g>
//                         </svg>
//                     </div>
//                     <div class="text">
//                         <span>Click to upload product pictures</span>
//                     </div>
//                     <input type="file" id="productPictures" multiple accept="image/*">
//                 </label>
//             </div>

//             <div class="previewImages" id="productImagesPreview">
//                 ${(product.product_images && product.product_images.length > 0) ? 
//                     product.product_images.map(image => `
//                     <div class="oneImageBox">
//                         <a href="/MSM_Backend/images/${image}" target="_blank">
//                             <img src="/MSM_Backend/images/${image}" alt="Product Image" 
//                                  onerror="this.parentNode.style.display='none'">
//                         </a>
//                         <button type="button" onclick="removeImage('product', '${image}')">
//                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
//                                 <g fill="none" stroke="currentColor">
//                                     <circle cx="12" cy="12" r="10" />
//                                     <path stroke-linecap="round" d="m14.5 9.5l-5 5m0-5l5 5" />
//                                 </g>
//                             </svg>
//                         </button>
//                     </div>
//                     `).join('') : ''}
//             </div>

//             <div class="oneInput">
//                 <label for="productAction">Make this product</label>
//                 <select name="productAction" id="productAction">
//                     <option value="">Action</option>
//                     <option value="active" ${product.status === 'active' ? 'selected' : ''}>Active</option>
//                     <option value="inactive" ${product.status === 'inactive' ? 'selected' : ''}>Inactive</option>
//                     <option value="delete">Delete permanently</option>
//                 </select>
//             </div>

//             <div class="submitBtnArea">
//                 <button type="button" class="submitBtn" onclick="submitProductEditForm()">Save changes</button>
//             </div>
//         </form>
//     `;
// }

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

// // Helper function to escape HTML
// function escapeHtml(unsafe) {
//     if (!unsafe) return '';
//     return unsafe
//         .replace(/&/g, "&amp;")
//         .replace(/</g, "&lt;")
//         .replace(/>/g, "&gt;")
//         .replace(/"/g, "&quot;")
//         .replace(/'/g, "&#039;");
// }

// // Function to handle image removal
// function removeImage(type, imageName) {
//     console.log(`Would remove ${type} image: ${imageName}`);
//     // Implementation would go here
// }

// // Function to handle form submission
// async function submitProductEditForm() {
//     const form = document.querySelector('.productEditOrDeleteForm');
//     const productId = form.getAttribute('data-product-id');
//     const actionSelect = document.getElementById('productAction');
//     const selectedAction = actionSelect.value;

//     if (!selectedAction) {
//         showAlert('Please select an action for this product');
//         return;
//     }

//     if (selectedAction === 'delete') {
//         // Show custom confirmation for delete
//         showConfirmation('Are you sure you want to delete this product permanently? This action cannot be undone.', async (confirmed) => {
//             if (confirmed) {
//                 try {
//                     const authToken = localStorage.getItem("auth_token");
//                     const response = await fetch("http://localhost:5000/products/delete-product", {
//                         method: "DELETE",
//                         headers: {
//                             "Content-Type": "application/json",
//                             "Authorization": `Bearer ${authToken}`
//                         },
//                         body: JSON.stringify({ product_id: productId })
//                     });

//                     const data = await response.json();
                    
//                     if (data.status === "success") {
//                         showAlert('Product deleted successfully');
//                         closeEditOrDeleteProductArea();
//                         fetchAndDisplayProducts();
//                     } else {
//                         showAlert('Failed to delete product: ' + (data.message || 'Unknown error'));
//                     }
//                 } catch (error) {
//                     console.error("Error deleting product:", error);
//                     showAlert('Error deleting product: ' + error.message);
//                 }
//             }
//         });
//     } else {
//         // Handle edit/status change action
//         try {
//             // Collect form data
//             const formData = new FormData();
            
//             // Add text fields
//             formData.append('title', document.getElementById('productTitle').value);
//             formData.append('actual_price', document.getElementById('productActualPrice').value);
//             formData.append('discount_price', document.getElementById('productDiscountedPrice').value || '0');
//             formData.append('shipping_fee', document.getElementById('productShippingCharges').value);
//             formData.append('stock', document.getElementById('productStock').value);
//             formData.append('short_html_description', document.getElementById('shortHTMLDescription').value);
//             formData.append('long_html_description', document.getElementById('longHTMLDescription').value);
//             formData.append('status', selectedAction);
            
//             // Add categories
//             const selectedCategories = Array.from(document.querySelectorAll('#categoriesContainer input[type="checkbox"]:checked'))
//                 .map(checkbox => checkbox.nextElementSibling.textContent);
//             formData.append('categories', JSON.stringify(selectedCategories));
            
//             // Add variations
//             const selectedVariations = [];
//             document.querySelectorAll('#variationsContainer .checkableElements').forEach(container => {
//                 const variationName = container.previousElementSibling.textContent.trim().split(' ')[0];
//                 const options = Array.from(container.querySelectorAll('input[type="checkbox"]:checked'))
//                     .map(checkbox => checkbox.nextElementSibling.textContent);
                
//                 if (options.length > 0) {
//                     selectedVariations.push(...options);
//                 }
//             });
//             formData.append('variations', JSON.stringify(selectedVariations));
            
//             // Only add cover image if a new one is selected
//             const coverImageInput = document.getElementById('coverPicture');
//             if (coverImageInput.files.length > 0) {
//                 formData.append('cover_image', coverImageInput.files[0]);
//             }
            
//             // Only add product images if new ones are selected
//             const productImagesInput = document.getElementById('productPictures');
//             if (productImagesInput.files.length > 0) {
//                 for (let i = 0; i < productImagesInput.files.length; i++) {
//                     formData.append(`image_${i+1}`, productImagesInput.files[i]);
//                 }
//             }
            
//             // Send the request
//             const authToken = localStorage.getItem("auth_token");
//             const response = await fetch(`http://localhost:5000/products/add-product`, {
//                 method: "PUT",
//                 headers: {
//                     "Authorization": `Bearer ${authToken}`
//                 },
//                 body: formData
//             });

//             const data = await response.json();
            
//             if (data.status === "success") {
//                 showAlert('Product updated successfully');
//                 closeEditOrDeleteProductArea();
//                 fetchAndDisplayProducts();
//             } else {
//                 showAlert('Failed to update product: ' + (data.message || 'Unknown error'));
//             }
//         } catch (error) {
//             console.error("Error updating product:", error);
//             showAlert('Error updating product: ' + error.message);
//         }
//     }
// }

// // Initialize the page
// document.addEventListener("DOMContentLoaded", fetchAndDisplayProducts);






