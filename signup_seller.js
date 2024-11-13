// script.js

document.querySelector(".signup-btn").addEventListener("click", async function(event) {
    event.preventDefault(); // Prevents the default form submission behavior

    // Capture the values from the form fields
    const firstName = document.getElementById("first-name").value;
    const lastName = document.getElementById("last-name").value;
    const email = document.getElementById("email").value;
    const confirmEmail = document.getElementById("confirm-email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    // Basic form validation
    if (email !== confirmEmail) {
        alert("Emails do not match.");
        return;
    }
    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    // Send form data to the backend
    try {
        const response = await fetch("http://localhost:3000/signup_seller", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                firstName,
                lastName,
                email,
                password
            })
        });

        const result = await response.json();
        if (result.success) {
            alert("Sign-up successful!");
            window.location.href = "login_page_seller.html"; // Redirect to login page or another page
        } else {
            alert(result.message || "Sign-up failed.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again.", error);
    }
});