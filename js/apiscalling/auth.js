document.addEventListener("DOMContentLoaded", async () => {
    document.body.style.display = "none";

    async function checkAuthToken() {
        const authToken = localStorage.getItem("auth_token");
        if (!authToken) {
            window.location.href = "http://127.0.0.1:5500/msm_kosmetika_fin/account.html";
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/check-token", {
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
                    window.location.href = "http://127.0.0.1:5500/msm_kosmetika_fin/account.html";
                    return;
                }

                const userAgent = navigator.userAgent || navigator.vendor || window.opera;
                const isAndroid = /android/i.test(userAgent);
                const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
                const allowedUserPages = [
                    "/msm_kosmetika_fin/indexlite.html",
                    "/msm_kosmetika_fin/index.html",
                    "/msm_kosmetika_fin/shop.html",
                    "/msm_kosmetika_fin/profile.html",
                    "/msm_kosmetika_fin/orders.html",
                    "/msm_kosmetika_fin/contact.html",
                    "/msm_kosmetika_fin/user-reviews.html",
                    "/msm_kosmetika_fin/user-profile.html",
                    "/msm_kosmetika_fin/user-orders.html",
                    "/msm_kosmetika_fin/order-tracking.html",
                    "/msm_kosmetika_fin/checkout.html",
                    "/msm_kosmetika_fin/cart.html"


                ];
                const expectedPage = isAndroid
                    ? "/msm_kosmetika_fin/index.html"
                    : "/msm_kosmetika_fin/index.html";
                
                if (userType !== "admin" && !allowedUserPages.some(page => currentPage.endsWith(page))) {
                    window.location.href = `http://127.0.0.1:5500${expectedPage}`;
                    return;
                }
                
                document.body.style.display = "block";
            } else {
                window.location.href = "http://127.0.0.1:5500/msm_kosmetika_fin/account.html";
            }
        } catch (error) {
            console.error("Error validating token:", error);
            window.location.href = "http://127.0.0.1:5500/msm_kosmetika_fin/account.html";
        }
    }
    
    await checkAuthToken();
});
