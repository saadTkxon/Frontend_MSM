// // Function to handle form submission
// async function submitProductEditForm(event) {
//     event.preventDefault();
    
//     // Get auth token from local storage
//     const authToken = localStorage.getItem("auth_token");
//     if (!authToken) {
//         alert('Please login first');
//         return;
//     }

//     const form = event.target;
//     const submitBtn = form.querySelector('.submitBtn');
//     submitBtn.disabled = true;
//     submitBtn.textContent = 'Submitting...';

//     // const form = document.querySelector('.productEditOrDeleteForm');
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
//             const formData = form;
//             console.log(formData);
            
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
//             console.log(productImagesInput);
//             if (productImagesInput.files.length > 0) {
//                 for (let i = 0; i < productImagesInput.files.length; i++) {
//                     formData.append(`image_${i+1}`, productImagesInput.files[i]);
//                 }
//             }
            
//             // Send the request
//             const authToken = localStorage.getItem("auth_token");
//             const response = await fetch(`http://localhost:5000/products/add-product`, {
//                 method: "POST",
//                 headers: {
//                     "Authorization": `Bearer ${authToken}`
//                 },
//                 body: formData
               
//             });
//             console.log(formData);

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


// // Initialize event listeners when DOM is loaded
// document.addEventListener('DOMContentLoaded', function() {
//     const productEditOrDeleteForm = document.querySelector('.productEditOrDeleteForm');
//     console.log(productEditOrDeleteForm)
//     if (productEditOrDeleteForm) {
//         productEditOrDeleteForm.addEventListener('submit', submitProductEditForm);
//     }
// });