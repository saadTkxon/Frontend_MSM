document.addEventListener("DOMContentLoaded", async () => {
    document.body.style.display = "none";

    async function checkAuthToken() {
        const authToken = localStorage.getItem("auth_token");
        if (!authToken) {
            window.location.href = "/account.html";
            return;
        }

        try {
            const response = await fetch("http://145.223.33.250:5000/check-token", {
                method: "GET",
                headers: { "Authorization": `Bearer ${authToken}` },
            });
            const data = await response.json();

            if (response.ok && data.status === 200) {
                const userType = data.response.user_type;
                const currentPage = window.location.pathname.toLowerCase();
                const isAdminPage = currentPage.includes("/admin");

                if ((isAdminPage && userType !== "admin") || (!isAdminPage && userType === "admin")) {
                    console.warn("Unauthorized access. Redirecting...");
                    window.location.href = "/account.html";
                    return;
                }

                const userAgent = navigator.userAgent || navigator.vendor || window.opera;
                const isAndroid = /android/i.test(userAgent);
                const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
                const allowedUserPages = [
                    "/indexlite.html",
                    "/index.html",
                    "/shop.html",
                    "/profile.html",
                    "/orders.html",
                    "/contact.html",
                    "/user-reviews.html",
                    "/user-profile.html",
                    "/user-orders.html",
                    "/order-tracking.html",
                    "/checkout.html",
                    "/cart.html"


                ];
                const expectedPage = isAndroid
                    ? "/index.html"
                    : "/index.html";
                
                if (userType !== "admin" && !allowedUserPages.some(page => currentPage.endsWith(page))) {
                    window.location.href = `${expectedPage}`;
                    return;
                }
                
                document.body.style.display = "block";
            } else {
                window.location.href = "/account.html";
            }
        } catch (error) {
            console.error("Error validating token:", error);
            window.location.href = "/account.html";
        }
    }
    
    await checkAuthToken();
});
