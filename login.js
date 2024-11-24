// login.js

// Add event listener for form submission
document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    // Capture email and password values from the form
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        // Send a POST request to the server with email and password
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (result.success) {
            window.location.href = "index.html";
            localStorage.setItem("userEmail", email);
            localStorage.setItem("userPassword",password);
        } else {
            alert(result.message || "Invalid email or password.");
        }
    } catch (error) {
        // Log any errors in the console and show a general error message
        console.error("Error:", error);
        alert("An error occurred while attempting to log in. Please try again.");
    }
});