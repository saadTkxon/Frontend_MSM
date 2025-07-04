document.getElementById("logoutBtn").addEventListener("click", async () => {
    const authToken = localStorage.getItem("auth_token");

    try {
      const response = await fetch("http://145.223.33.250:5000/usertrs/logout", {
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
        window.location.href = "/account.html"; // update with your actual login path
      } else {
        const error = await response.json();
        alert("Logout failed: " + error.message);
      }
    } catch (err) {
      alert("Error logging out: " + err.message);
    }
  });