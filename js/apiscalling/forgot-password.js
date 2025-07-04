/* ========== DEBUGGING SETUP ========== */
const DEBUG_MODE = true; // Set to false in production

function debugLog(message, data = null) {
    if (!DEBUG_MODE) return;
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] DEBUG: ${message}`);
    if (data) {
        console.log(`[${timestamp}] DATA:`, data);
    }
}

/* ========== UI HELPER FUNCTIONS ========== */
function showAlert(message, type = "info", callback = null) {
    const alertBox = document.querySelector('.alert');
    const alertBadge = alertBox.querySelector('.alertBadge');
    
    // Clear previous classes
    alertBox.className = 'alert';
    alertBadge.className = 'alertBadge';
    
    // Add type-specific classes
    alertBox.classList.add(type);
    alertBadge.classList.add(type);
    
    // Set message and show
    alertBadge.querySelector('p').textContent = message;
    alertBox.style.display = 'flex';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        alertBox.style.display = 'none';
        if (callback) callback();
    }, 5000);
}

function showLoadingIndicator(show) {
    const loader = document.getElementById("loadingIndicator") || 
                   document.createElement("div");
    loader.id = "loadingIndicator";
    loader.className = "loader";
    loader.style.display = show ? "block" : "none";
    
    if (show && !document.getElementById("loadingIndicator")) {
        document.body.appendChild(loader);
    }
}

/* ========== FORM HANDLING ========== */
document.getElementById("resetPasswordForm")?.addEventListener("submit", async function (e) {
    e.preventDefault();
    debugLog("Form submission initiated");

    const email = document.getElementById("resetPasswordEmail").value.trim();
    debugLog("Email entered", email);

    if (!email) {
        debugLog("Empty email detected");
        showAlert("Please enter your email address", "error");
        return;
    }

    if (!email.includes('@') || !email.includes('.')) {
        debugLog("Invalid email format detected");
        showAlert("Please enter a valid email address", "error");
        return;
    }

    try {
        debugLog("Initiating password reset request");
        showLoadingIndicator(true);

        const response = await fetch("http://127.0.0.1:5000/usertrs/forgot_password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: email }),
        });

        debugLog("Raw response received", response);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        debugLog("Parsed response data", data);

        if (data.status === "success") {
            debugLog("Password reset initiated successfully");
            const { user_id, email: userEmail } = data.response;
            
           // If you want to use localStorage instead, store it like this initially:
localStorage.setItem("reset_user_id", user_id);
localStorage.setItem("reset_email", userEmail);
            
            debugLog("Stored temporary reset data", { 
                user_id: user_id, 
                email: userEmail 
            });

            showAlert("Password reset link has been sent to your email. Please check your inbox.", "success", () => {
                // Clear form after successful submission
                document.getElementById("resetPasswordForm").reset();
            });

        } else {
            debugLog("Password reset failed", data.message);
            showAlert(data.message || "Failed to initiate password reset", "error");
        }
    } catch (error) {
        debugLog("Error during password reset", error);
        showAlert(error.message || "An error occurred while processing your request", "error");
    } finally {
        showLoadingIndicator(false);
    }
});

// Close button functionality
document.querySelector('.alertBadge button')?.addEventListener('click', function() {
    document.querySelector('.alert').style.display = 'none';
});