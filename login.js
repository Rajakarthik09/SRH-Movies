// Sample credentials for authentication
const validEmail = "email@123";
const validPassword = "password";

// Handle form submission
document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent default form submission

        // Get email and password values
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        // Check if the email and password are correct
        if (email === validEmail && password === validPassword) {
            // Redirect to another page (e.g., dashboard.html)
            window.location.href = "signup_page.html"; // Change this to your desired page
        } else {
            // Alert the user of incorrect credentials
            alert("Invalid email or password. Please try again.");
        }
    });
});