

// Simulated user_id and email from memory storage
const userId = localStorage.getItem("user_id") || "12345";
const userEmail = localStorage.getItem("user_email") || "abe@example.com";
console.log("User ID:", userId);
console.log("User Email:", userEmail);
document.getElementById("userEmail").innerText = userEmail;

// OTP Verification
document.getElementById("resetPasswordForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("OTP Form Submitted");

    // Collect OTP from inputs
    const otpInputs = document.querySelectorAll('.otp-input input');
    let otp = '';
    otpInputs.forEach(input => otp += input.value);
    console.log("Collected OTP:", otp);

    // Verify OTP API Call
    try {
        console.log("Sending OTP verification request...");
        const response = await fetch("http://localhost:5000/usertrs/verify_otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId, otp })
        });

        console.log("Response status:", response.status);
        const data = await response.json();
        console.log("Response data:", data);

        if (data.status === "success") {
            // alert("OTP Verified Successfully!");
            window.location.href = "account.html";
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("OTP Verification Error:", error);
    }
});

// Resend OTP with Countdown Timer
const resendOtpBtn = document.getElementById("resendOtpBtn");
let countdown = 27;
resendOtpBtn.addEventListener("click", async () => {
    console.log("Resend OTP Clicked");

    try {
        console.log("Sending Resend OTP request...");
        const response = await fetch("http://localhost:5000/usertrs/resend_otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId })
        });

        console.log("Resend Response status:", response.status);
        const data = await response.json();
        console.log("Resend Response data:", data);

        if (data.status === "success") {
            alert("New OTP sent!");
            resendOtpBtn.disabled = true;

            const countdownSpan = document.getElementById("countdown");
            const timer = setInterval(() => {
                countdown -= 1;
                countdownSpan.textContent = `${countdown}s`;
                console.log("Countdown:", countdown);

                if (countdown <= 0) {
                    clearInterval(timer);
                    resendOtpBtn.disabled = false;
                    countdown = 27;
                    countdownSpan.textContent = "27s";
                }
            }, 1000);
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Resend OTP Error:", error);
    }
});
