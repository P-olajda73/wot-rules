document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();
    
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("error-message");
    
    const adminUser = "admin";
    const adminPass = "4KILLPOLY";

    if (username === adminUser && password === adminPass) {
        localStorage.setItem("loggedIn", "true");
        window.location.href = "admin.html"; 
    } else {
        errorMessage.textContent = "Nesprávne meno alebo heslo!";
        errorMessage.style.color = "red";
    }
});