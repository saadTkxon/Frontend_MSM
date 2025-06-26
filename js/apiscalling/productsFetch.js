// Function to fetch and display products (excluding disabled ones)
async function fetchAndDisplayProducts() {
    try {
        const authToken = localStorage.getItem("auth_token");
        const response = await fetch("http://localhost:5000/products/fetch-products-all", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (data.status === "success") {
            // Filter out disabled products before displaying
            const filteredProducts = Object.fromEntries(
                Object.entries(data.response).filter(([_, product]) => product.status !== "disabled")
            );
            displayProducts(filteredProducts);
        } else {
            console.error("Failed to fetch products:", data.message);
            showAlert("Failed to fetch products: " + (data.message || "Unknown error"));
        }
    } catch (error) {
        console.error("Error fetching products:", error);
        showAlert("Error fetching products: " + error.message);
    }
}

// Function to display all products with latest first (no changes needed here)
function displayProducts(products) {
    const productsContainer = document.querySelector(".productsHere");
    productsContainer.innerHTML = ""; // Clear existing content
    
    // Convert products object to an array of [id, product] pairs
    const productEntries = Object.entries(products);
    
    // Sort products by created_at date (newest first)
    productEntries.sort((a, b) => {
        const dateA = new Date(a[1].created_at);
        const dateB = new Date(b[1].created_at);
        return dateB - dateA; // Sort newest to oldest
    });
    
    for (const [productId, product] of productEntries) {
        // Format variations
        let variationsText = "";
        if (product.variations && product.variations.length > 0) {
            const cleanedVariations = product.variations.join("").replace(/[\[\]"]/g, "").split(",");
            variationsText = cleanedVariations.map(v => v.trim()).filter(v => v).join("</span>&nbsp;-&nbsp;<span>");
        }
        
        // Format categories - new improved version
        let categoriesText = "";
        if (product.categories && product.categories.length > 0) {
            try {
                // Join the array into a string and parse it as JSON
                const categoriesString = product.categories.join("").replace(/(\w+)\s*:/g, '"$1":');
                const categoriesArray = JSON.parse(categoriesString);
                
                // Extract just the category names
                const categoryNames = categoriesArray.map(cat => {
                    if (typeof cat === 'object' && cat.category_name) {
                        return cat.category_name;
                    }
                    return "";
                }).filter(name => name);
                
                categoriesText = categoryNames.join(", ");
            } catch (error) {
                console.error("Error parsing categories:", error);
                // Fallback to simple string extraction if JSON parsing fails
                const categoryNames = [];
                product.categories.forEach(cat => {
                    const nameMatch = cat.match(/"category_name":"([^"]+)"/) || 
                                      cat.match(/category_name[ a-z:]*([^,}]+)/);
                    if (nameMatch && nameMatch[1]) {
                        categoryNames.push(nameMatch[1].trim());
                    }
                });
                categoriesText = categoryNames.join(", ");
            }
        }
        
        // Create product element
        const productElement = document.createElement("div");
        productElement.className = "oneProduct";
        productElement.setAttribute("data-product-id", productId);
        productElement.style.borderLeft = `5px solid #${productId.substring(0, 6)}`;
        
        productElement.innerHTML = `
        <div class="itemImageBox">
            <img src="/MSM_Backend/images/${product.product_cover_image}" alt="${product.title}" 
                 onerror="this.src='/assets/misc/default-product-image.png'; this.onerror=null;">
        </div>
        <div class="itemDets">
            <h1>${product.title}</h1>
            <div class="categories">
                <p>Categories: <span>${categoriesText || "No categories"}</span></p>
            </div>
            <div class="variations">
                <p>Variations: <span>${variationsText || "No variations"}</span></p>
            </div>
            <div class="status">
                <h2 class="${product.status === "active" ? "active" : "inactive"}">${product.status.charAt(0).toUpperCase() + product.status.slice(1)}</h2>
            </div>
            <div class="unitPrice">
                <p>Actual price:&nbsp;&nbsp;<span>Rs.</span>&nbsp;<span>${product.actual_price}</span></p>
                ${product.discount_price ? `<p>Discounted price:&nbsp;&nbsp;<span>Rs.</span>&nbsp;<span>${product.discount_price}</span></p>` : ""}
                <p>Shipping:&nbsp;&nbsp;<span>Rs.</span>&nbsp;<span>${product.shipping_fee}</span></p>
                <p>Stock left:&nbsp;&nbsp;<span>${product.stock}</span>&nbsp;<span>Pcs</span></p>
            </div>
    
            <!-- 👇 ADD THIS BLOCK for Dropdown + Apply button -->
            <div class="statusDropdown">
                <select class="statusSelect" id="statusSelect-${productId}">
                    <option value="">-- Select Status --</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="disabled">Disable</option>
                </select>
                <button type="button" class="applyStatusButton" onclick="applyStatusChange('${productId}')">Apply</button>
            </div>
    
            <button type="button" class="accButton" onclick="openEditOrDeleteProductArea('${productId}')">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path fill="currentColor" fill-rule="evenodd"
                        d="M14.1 2.391a3.896 3.896 0 0 1 5.509 5.51l-7.594 7.594c-.428.428-.69.69-.98.917a6 6 0 0 1-1.108.684c-.334.159-.685.276-1.259.467l-2.672.891l-.642.214a1.598 1.598 0 0 1-2.022-2.022l1.105-3.314c.191-.574.308-.925.467-1.259a6 6 0 0 1 .685-1.107c.227-.291.488-.553.916-.98zM5.96 16.885l-.844-.846l.728-2.185c.212-.636.3-.895.414-1.135q.212-.443.513-.83c.164-.21.356-.404.83-.879l5.891-5.89a6.05 6.05 0 0 0 1.349 2.04a6.05 6.05 0 0 0 2.04 1.348l-5.891 5.89c-.475.475-.668.667-.878.83q-.388.302-.83.514c-.24.114-.5.202-1.136.414zm12.116-9.573a4 4 0 0 1-.455-.129a4.5 4.5 0 0 1-1.72-1.084a4.54 4.54 0 0 1-1.084-1.72a4 4 0 0 1-.13-.455l.473-.472a2.396 2.396 0 0 1 3.388 3.388zM3.25 22a.75.75 0 0 1 .75-.75h16v1.5H4a.75.75 0 0 1-.75-.75"
                        clip-rule="evenodd" />
                </svg>&nbsp;edit/delete product
            </button>
        </div>
    `;
        
        productsContainer.appendChild(productElement);
    }
    
    // Add the "Add Product" block after all products
    const addProductBlock = document.createElement("div");
    addProductBlock.className = "addProductBlock";
    addProductBlock.innerHTML = `
        <button type="button" onclick="openAddProductArea()">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <g fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" />
                    <path stroke-linecap="round" d="M15 12h-3m0 0H9m3 0V9m0 3v3" />
                </g>
            </svg>
        </button>
    `;
    
    productsContainer.appendChild(addProductBlock);
}

















async function applyStatusChange(productId) {
    const selectedStatus = document.getElementById(`statusSelect-${productId}`).value;
    if (!selectedStatus) {
        showAlert("Please select a status to apply.");
        return;
    }

    // If status is not "disable", proceed normally
    if (selectedStatus !== "disabled") {
        await updateProductStatus(productId, selectedStatus);
        return;
    }

    // For "disable" status, show confirmation modal
    const modal = document.getElementById('disableConfirmationModal');
    modal.style.display = 'flex';

    // Store the productId in the confirm button's dataset
    const confirmBtn = document.getElementById('confirmDisableBtn');
    confirmBtn.dataset.productId = productId;

    // Set up event listeners for modal buttons
    confirmBtn.onclick = async function() {
        await updateProductStatus(productId, selectedStatus);
        modal.style.display = 'none';
    };

    document.getElementById('cancelDisableBtn').onclick = function() {
        modal.style.display = 'none';
        // Reset the select dropdown to its previous value
        document.getElementById(`statusSelect-${productId}`).value = '';
    };
}

// Separate function to handle the actual status update
async function updateProductStatus(productId, status) {
    try {
        const authToken = localStorage.getItem("auth_token");
        const response = await fetch("http://localhost:5000/products/update-product-status", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({
                product_id: productId,
                status: status
            })
        });

        const data = await response.json();
        
        if (data.status === "success") {
            showAlert(`Product status updated to ${status} successfully!`);
            // Refresh the products list to show the updated status
            fetchAndDisplayProducts();
        } else {
            console.error("Failed to update product status:", data.message);
            showAlert("Failed to update product status: " + (data.message || "Unknown error"));
        }
    } catch (error) {
        console.error("Error updating product status:", error);
        showAlert("Error updating product status: " + error.message);
    }
}



document.addEventListener("DOMContentLoaded", fetchAndDisplayProducts);