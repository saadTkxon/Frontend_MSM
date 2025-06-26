console.log('categories script loaded - Enhanced Version with Confirmation');

// Categories functions
async function fetchCategories() {
  const authToken = localStorage.getItem("auth_token");
  const response = await fetch("http://localhost:5000/products/show-categories", {
      method: "GET",
      headers: {
          "Authorization": `Bearer ${authToken}`
      }
  });

  const data = await response.json();

  if (response.ok) {
      renderCategories(data.response.categories);
  } else {
      console.error("Failed to fetch categories:", data.message);
  }
}

function renderCategories(categories) {
  const categoriesContainer = document.querySelector(".categoriesHere");
  categoriesContainer.innerHTML = ""; // Clear existing categories

  categories.forEach(category => {
      const categoryElement = document.createElement("div");
      categoryElement.classList.add("oneElementBlock");
      categoryElement.innerHTML = `
          <button type="button" class="deleteElementButton" onclick="showDeleteConfirmation('${category.category_name}')">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <g fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" />
                      <path stroke-linecap="round" d="m14.5 9.5l-5 5m0-5l5 5" />
                  </g>
              </svg>
          </button>
          <p>${category.category_name}</p>
      `;
      categoriesContainer.appendChild(categoryElement);
  });

  // Add the "Add Category" button
  const addCategoryElement = document.createElement("div");
  addCategoryElement.classList.add("addElementBlock");
  addCategoryElement.innerHTML = `
      <button type="button" onclick="openAddCategoryForm()">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                  <path stroke-linecap="round" d="M15 12h-3m0 0H9m3 0V9m0 3v3"/>
              </g>
          </svg>
      </button>
  `;
  categoriesContainer.appendChild(addCategoryElement);
}

// Add Category Form functions
function openAddCategoryForm() {
  const formOverlay = document.createElement('div');
  formOverlay.className = 'form-overlay';
  formOverlay.innerHTML = `
    <div class="add-category-form">
      <div class="form-header">
        <h3>Add New Category</h3>
        <button onclick="closeAddCategoryForm()" class="close-btn">&times;</button>
      </div>
      <form id="addCategoryForm">
        <div class="form-group">
          <label for="categoryName">Category Name</label>
          <input type="text" id="categoryName" required>
        </div>
        <div class="form-buttons">
          <button type="button" onclick="closeAddCategoryForm()" class="cancel-btn">Cancel</button>
          <button type="submit" class="submit-btn">Add Category</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(formOverlay);
  
  const form = formOverlay.querySelector('#addCategoryForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const categoryName = document.getElementById('categoryName').value.trim();
    if (categoryName) {
      await addCategory(categoryName);
      closeAddCategoryForm();
    }
  });
}

function closeAddCategoryForm() {
  const formOverlay = document.querySelector('.form-overlay');
  if (formOverlay) {
    formOverlay.remove();
  }
}

async function addCategory(categoryName) {
  const authToken = localStorage.getItem("auth_token");

  const response = await fetch("http://localhost:5000/products/add-category", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
      },
      body: JSON.stringify({ category_name: categoryName })
  });

  const data = await response.json();

  if (response.ok) {
      showAlert("Category added successfully!", 'success');
      fetchCategories(); // Refresh the category list
  } else {
      showAlert(`Failed to add category: ${data.message}`, 'error');
      console.error("Failed to add category:", data.message);
  }
}

// Confirmation Dialog functions
function showDeleteConfirmation(categoryName) {
  const confirmationOverlay = document.createElement('div');
  confirmationOverlay.className = 'confirmation-overlay';
  confirmationOverlay.innerHTML = `
    <div class="confirmation-dialog">
      <div class="confirmation-content">
        <h1>Are you sure to continue?</h1>
        <p>You are about to delete the category "${categoryName}". This action cannot be undone.</p>
        <div class="confirmation-buttons">
          <button type="button" class="cancel-btn" onclick="closeDeleteConfirmation()">Go back</button>
          <button type="button" class="confirm-btn" onclick="confirmDeleteCategory('${categoryName}')">Continue</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(confirmationOverlay);
}

function closeDeleteConfirmation() {
  const confirmationOverlay = document.querySelector('.confirmation-overlay');
  if (confirmationOverlay) {
    confirmationOverlay.remove();
  }
}

async function confirmDeleteCategory(categoryName) {
  closeDeleteConfirmation();
  await deleteCategory(categoryName);
}

async function deleteCategory(categoryName) {
  const authToken = localStorage.getItem("auth_token");

  try {
    const response = await fetch("http://localhost:5000/products/delete-category", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      },
      body: JSON.stringify({ category_name: categoryName })
    });

    const data = await response.json();

    if (response.ok) {
      showAlert(`Category "${categoryName}" deleted successfully!`, 'success');
      fetchCategories(); // Refresh categories after deleting
    } else {
      showAlert(`Failed to delete category: ${data.message}`, 'error');
      console.error("Failed to delete category:", data.message);
    }
  } catch (error) {
    showAlert("An error occurred while deleting the category", 'error');
    console.error("Error:", error);
  }
}

// Helper function to show alerts
function showAlert(message, type = 'info') {
  const alertDiv = document.querySelector('.alert');
  const alertBadge = alertDiv.querySelector('.alertBadge');
  
  // Reset classes and add the appropriate one
  alertBadge.className = 'alertBadge';
  alertBadge.classList.add(type);
  
  // Set the message
  alertBadge.querySelector('p').textContent = message;
  
  // Show the alert
  alertDiv.style.display = 'flex';
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    alertDiv.style.display = 'none';
  }, 5000);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  // Load initial data
  fetchCategories();
  
  // Add the CSS for the forms dynamically
  const style = document.createElement('style');
  style.textContent = `
    /* Add Category Form Styles */
    .form-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    
    .add-category-form {
      background-color: white;
      border-radius: 8px;
      width: 400px;
      max-width: 90%;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      overflow: hidden;
    }
    
    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background-color: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
    }
    
    .form-header h3 {
      margin: 0;
      font-size: 18px;
      color: #333;
    }
    
    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #6c757d;
    }
    
    .close-btn:hover {
      color: #495057;
    }
    
    #addCategoryForm {
      padding: 24px;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #495057;
    }
    
    .form-group input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 14px;
    }
    
    .form-group input:focus {
      border-color: #80bdff;
      outline: 0;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }
    
    .form-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    
    .cancel-btn {
      padding: 8px 16px;
      background-color: #f8f9fa;
      border: 1px solid #ced4da;
      border-radius: 4px;
      color: #495057;
      cursor: pointer;
    }
    
    .cancel-btn:hover {
      background-color: #e2e6ea;
    }
    
    .submit-btn {
      padding: 8px 16px;
      background-color: #dc3545;
      border: 1px solid #dc3545;
      border-radius: 4px;
      color: white;
      cursor: pointer;
    }
    
    .submit-btn:hover {
      background-color: #c82333;
      border-color: #bd2130;
    }
    
    /* Confirmation Dialog Styles */
    .confirmation-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    
    .confirmation-dialog {
      width: 100%;
      max-width: 360px;
      height: auto;
      background-color: white;
      border-radius: var(--borderRadius1, 8px);
      box-shadow: var(--shadow1, 0 4px 12px rgba(0, 0, 0, 0.15));
      border: 1px solid var(--borderBlk, #dee2e6);
      overflow-y: auto;
    }
    
    .confirmation-content {
      font-family: var(--font1, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif);
      font-size: 16px;
      font-weight: 500;
      letter-spacing: 0.5px;
      padding: 24px 24px 30px 24px;
    }
    
    .confirmation-content h1 {
      font-size: 20px;
      margin-bottom: 16px;
      color: #333;
    }
    
    .confirmation-content p {
      margin-bottom: 24px;
      color: #6c757d;
    }
    
    .confirmation-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    
    .confirmation-buttons button {
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }
    
    .confirmation-buttons .cancel-btn {
      background-color: #f8f9fa;
      border: 1px solid #ced4da;
      color: #495057;
    }
    
    .confirmation-buttons .cancel-btn:hover {
      background-color: #e2e6ea;
    }
    
    .confirmation-buttons .confirm-btn {
      background-color: #dc3545;
      border: 1px solid #dc3545;
      color: white;
    }
    
    .confirmation-buttons .confirm-btn:hover {
      background-color: #c82333;
      border-color: #bd2130;
    }
  `;
  document.head.appendChild(style);
});

// Expose functions to global scope
window.openAddCategoryForm = openAddCategoryForm;
window.closeAddCategoryForm = closeAddCategoryForm;
window.showDeleteConfirmation = showDeleteConfirmation;
window.closeDeleteConfirmation = closeDeleteConfirmation;
window.confirmDeleteCategory = confirmDeleteCategory;