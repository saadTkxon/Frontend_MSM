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

/* ========== NEW PASSWORD FORM HANDLER ========== */
document.getElementById("newPasswordForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    debugLog("New password form submitted");

    const urlParams = new URLSearchParams(window.location.search);
    const user_id = urlParams.get('userid');
    const token = urlParams.get('token');
    




    localStorage.setItem("reset_user_id", user_id);
    const email = localStorage.getItem("reset_email");
    
    debugLog("Retrieved stored values", { user_id, email });

    if (!user_id ) {
        debugLog("Missing user_id  in localStorage");
        showAlert("User ID or Email not found. Please request a new reset link.", "error");
        return;
    }

    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("newConfirmedPassword").value;
    
    debugLog("Password values", { newPassword, confirmPassword });

    // Password validation
    if (newPassword !== confirmPassword) {
        debugLog("Password mismatch detected");
        showAlert("Passwords do not match!", "error");
        return;
    }

    try {
        debugLog("Attempting password update");
        showLoadingIndicator(true);

        const response = await fetch("http://localhost:5000/usertrs/setnewpassword", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: user_id,
               
                password: newPassword
            }),
        });

        debugLog("Raw server response", response);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        debugLog("Parsed response data", data);

        if (data.status === "success") {
            debugLog("Password update successful");
            showAlert("Password updated successfully!", "success", () => {
                // Clear localStorage after successful password reset
                localStorage.removeItem("user_id");
                localStorage.removeItem("email");
                localStorage.removeItem("reset_user_id");
                localStorage.removeItem("reset_email");
                // Redirect to login page
                window.location.href = "http://127.0.0.1:5500/msm_kosmetika_fin/account.html";
            });
        } else {
            debugLog("Password update failed", data.message);
            showAlert(data.message || "Failed to update password", "error");
        }
    } catch (error) {
        debugLog("Error during password update", error);
        showAlert("Error: " + error.message, "error");
    } finally {
        showLoadingIndicator(false);
    }
});

/* ========== UI HELPER FUNCTIONS ========== */
function showAlert(message, type = "info", callback = null) {
    debugLog(`Showing alert: ${message}`);
    
    const alertElement = document.querySelector('.alert');
    const alertBadge = document.querySelector('.alertBadge');
    
    if (!alertElement || !alertBadge) return;
    
    // Set message and show alert
    alertBadge.querySelector('p').textContent = message;
    alertElement.style.display = 'block';
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        alertElement.style.display = 'none';
        if (callback) callback();
    }, 5000);
}

function showLoadingIndicator(show) {
    debugLog(`Setting loading indicator: ${show}`);
    let loader = document.getElementById("loadingIndicator");
    if (!loader && show) {
        loader = document.createElement("div");
        loader.id = "loadingIndicator";
        loader.style.position = "fixed";
        loader.style.top = "0";
        loader.style.left = "0";
        loader.style.width = "100%";
        loader.style.height = "100%";
        loader.style.backgroundColor = "rgba(0,0,0,0.5)";
        loader.style.display = "flex";
        loader.style.justifyContent = "center";
        loader.style.alignItems = "center";
        loader.style.zIndex = "9999";
        
        const spinner = document.createElement("div");
        spinner.style.border = "5px solid #f3f3f3";
        spinner.style.borderTop = "5px solid #3498db";
        spinner.style.borderRadius = "50%";
        spinner.style.width = "50px";
        spinner.style.height = "50px";
        spinner.style.animation = "spin 1s linear infinite";
        
        loader.appendChild(spinner);
        document.body.appendChild(loader);
        
        // Add spin animation
        const style = document.createElement("style");
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    } else if (loader && !show) {
        loader.remove();
    }
}