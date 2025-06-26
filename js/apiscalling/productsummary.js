document.addEventListener("DOMContentLoaded", async () => {
    const authToken = localStorage.getItem("auth_token");

    if (!authToken) {
        console.error("No auth token found.");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/products/products-summary", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();

        if (data.status === "success") {
            document.querySelector(".productsFound p:nth-child(1) span").textContent = data.response.total_products;
            document.querySelector(".productsFound p:nth-child(2) span").textContent = data.response.active_products;
            document.querySelector(".productsFound p:nth-child(3) span").textContent = data.response.inactive_products;
        } else {
            console.error("Failed to fetch product summary:", data.message);
        }
    } catch (error) {
        console.error("Error fetching product summary:", error);
    }
});
