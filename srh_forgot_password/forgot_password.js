document.getElementById("resetForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;

    // Basic email validation
    if (!validateEmail(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    // Simulate API call
    alert("Password reset link has been sent to " + email);
    
    // Clear the input field
    document.getElementById("email").value = "";
});

function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}
