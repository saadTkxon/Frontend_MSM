document.getElementById("logoutBtn").addEventListener("click", async () => {
    const authToken = localStorage.getItem("auth_token");

    try {
      const response = await fetch("http://localhost:5000/usertrs/logout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        // Optionally: clear localStorage
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_id");
        localStorage.removeItem("user_email");
        // Redirect to login page
        window.location.href = "http://127.0.0.1:5500/msm_kosmetika_fin/account.html"; // update with your actual login path
      } else {
        const error = await response.json();
        alert("Logout failed: " + error.message);
      }
    } catch (err) {
      alert("Error logging out: " + err.message);
    }
  });