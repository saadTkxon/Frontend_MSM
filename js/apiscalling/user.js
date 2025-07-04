
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("registerForm").addEventListener("submit", async (event) => {
      console.log("Form submission started...");
  
      event.preventDefault(); // Stop form from refreshing the page
      console.log("Default form submission prevented.");
  
      // Collect form data
      const formData = {
        first_name: document.getElementById("registerFirstName").value,
        last_name: document.getElementById("registerLastName").value,
        email: document.getElementById("registerEmail").value,
        phone_number: document.getElementById("registerPhoneNumber").value,
        city: document.getElementById("registerCity").value,
        postal_code: document.getElementById("registerPostalCode").value,
        password: document.getElementById("registerPassword").value,
        addresses: [
          {
            address: document.getElementById("registerAddress").value,
            address_origin: document.getElementById("addressOriginHome").checked ? "home" : "office"
          }
        ]
      };
  
      console.log("Form data collected:", formData);
  
      // Check if passwords match
      const password = document.getElementById("registerPassword").value;
      const confirmPassword = document.getElementById("registerConfirmPassword").value;
  
      if (password !== confirmPassword) {
        showAlert("Passwords do not match!");
        console.warn("Passwords do not match!");
        return;
      }
      console.log("Passwords match. Proceeding with API call...");
  
      // Send the data to the backend API
      try {
        console.log("Sending data to the backend...");
        const response = await fetch("http://145.223.33.250:5000/usertrs/signup_user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
  
        console.log("Response received:", response);
        const result = await response.json();
        console.log("Result received:", result);
  
        if (result.status === "success") {
          const userData = result.response;
  
          // Store user_id in localStorage
          if (userData.user_id) {
            localStorage.setItem("user_id", userData.user_id);
            console.log("User ID saved to localStorage:", userData.user_id);
          }
  
          // Show OTP in alert
          if (userData.otp_send) {
            // alert(`OTP: ${userData.otp_send}`);
            // console.log("OTP shown in alert:", userData.otp_send);
          }
  
          showAlert("User registered successfully!");
          setTimeout(() => {
            window.location.href = "/account-verification.html";
          }, 2000);
        } else {
          showAlert(result.message || "An error occurred during registration.");
        }
      } catch (error) {
        console.error("Error during API call:", error);
        showAlert("Failed to connect to the server.");
      }
    });
  });
  
  // Function to show the alert with custom messages
  function showAlert(message) {
    const alertBox = document.querySelector(".alert");
    const alertMessage = alertBox.querySelector("p");
    alertMessage.textContent = message;
    alertBox.style.display = "block";
  }
  
  
document.getElementById('loginForm').addEventListener('submit', async (event) => {
    console.log("Login form submission started...");

    event.preventDefault();  // Prevent form from reloading the page
    console.log("Default form submission prevented.");

    // Get form data
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    console.log("Email entered:", email);
    console.log("Password entered:", password);
    console.log("Remember me checked:", rememberMe);

    // Function to show alert message
    const showAlert = (message) => {
        const alertBox = document.querySelector('.alert');
        const alertMessage = alertBox.querySelector('p');
        alertMessage.textContent = message;
        alertBox.style.display = 'block';
    };

    // Prepare request body
    const requestBody = {
        email: email,
        password: password
    };

    // Add auth_token_validity if remember me is checked
    if (rememberMe) {
        requestBody.auth_token_validity = 10;
        console.log("Added auth_token_validity to request body");
    }

    // Send POST request to Flask login API
    try {
        console.log("Sending POST request to login API...");

        const response = await fetch('http://145.223.33.250:5000/usertrs/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        console.log("Response received:", response);
        
        // Handle response
        if (!response.ok) {
            console.warn(`HTTP error! Status: ${response.status}`);
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Data received from API:", data);

        if (data.status === "success") {
            console.log("Login successful, token received:", data.response.auth_token);

            // Save auth_token, user_id, and user_email in localStorage
            localStorage.setItem("auth_token", data.response.auth_token);
            localStorage.setItem("user_id", data.response.user_id);
            localStorage.setItem("user_email", data.response.email);
            console.log("Auth Token, User ID, and Email saved to localStorage.");

            // Check if cart exists in localStorage
            const cart = localStorage.getItem('cart');
            if (cart) {
                window.location.href = "/cart.html";  // Redirect to cart page if cart exists
                console.log("Redirecting to cart page...");
            } else {
                // Check user type and redirect accordingly if no cart exists
                if (data.response.user_type === "admin") {
                    window.location.href = "/admin-dashboard.html";  // Redirect for admin
                    console.log("Redirecting to admin dashboard...");
                } else {
                    window.location.href = "/index.html";  // Redirect for regular user
                    console.log("Redirecting to user dashboard...");
                }
            }

        } else {
            showAlert(data.message);
            console.warn("Login failed:", data.message);
        }

    } catch (error) {
        console.error("Error during login:", error);
        showAlert("Login failed. Please try again.");
    }

    console.log("Login form submission process completed.");
});