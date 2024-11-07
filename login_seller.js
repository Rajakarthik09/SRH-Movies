// login.js

// Add event listener for form submission
document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // Prevents the form from submitting the traditional way

    // Capture email and password values from the form
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        // Send a POST request to the server with email and password
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json" // Inform the server of the request format
            },
            body: JSON.stringify({ email, password }) // Convert email and password to JSON
        });

        const result = await response.json(); // Parse JSON response from the server

        if (result.success) {
            // If login is successful, redirect to index.html
            //window.location.href = "homepage_registered.html";
            alert("Seller page is in progress please wait!!!")
        } else {
            // If login fails, display an error message to the user
            alert(result.message || "Invalid email or password.");
        }
    } catch (error) {
        // Log any errors in the console and show a general error message
        console.error("Error:", error);
        alert("An error occurred while attempting to log in. Please try again.");
    }
});