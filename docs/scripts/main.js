// Function to handle the "Join Discord" button
function openDiscord() {
    window.open("https://discord.gg/RgGmTjSMby", "_blank"); // Replace with your Discord invite link
}

// Open and Close Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "flex"; // Show the modal (use flex to center content)
    } else {
        console.error(`Modal with id "${modalId}" not found.`);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none"; // Hide the modal
    } else {
        console.error(`Modal with id "${modalId}" not found.`);
    }
}

// Close Modal on Outside Click
window.addEventListener("click", (event) => {
    const modals = document.querySelectorAll(".modal");
    modals.forEach((modal) => {
        if (event.target === modal) {
            closeModal(modal.id);
        }
    });
});

// Close Modal on "X" Button Click
document.querySelectorAll(".close").forEach(button => {
    button.addEventListener("click", () => {
        const modal = button.closest(".modal");
        if (modal) {
            modal.style.display = "none";
        }
    });
});

// Signup Handler with Password Validation
async function handleSignup(event) {
    event.preventDefault();

    const username = document.getElementById("signupUsername").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value.trim();
    const confirmPassword = document.getElementById("signupConfirmPassword").value.trim();

    if (!username || !email || !password || !confirmPassword) {
        alert("Please fill out all fields.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match. Please try again.");
        return;
    }

    // Include the default role
    const account = { username, email, password, role: "user" }; // Default role is 'user'

    try {
        const response = await fetch("/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(account),
        });

        if (!response.ok) {
            const result = await response.json();
            alert(result.message || "Signup failed.");
            return;
        }

        alert("Signup successful! Please log in.");
        closeModal("signupModal");
    } catch (error) {
        console.error("Error during signup:", error);
        alert("An error occurred while signing up. Please try again later.");
    }
}

// Login Handler
async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!email || !password) {
        alert("Please fill out all fields.");
        return;
    }

    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (response.ok) {
            // Store user data in localStorage
            localStorage.setItem(
                "loggedInUser",
                JSON.stringify({
                    username: result.username,
                    email: result.email,
                    role: result.role, // Include the role
                })
            );

            alert("Login successful!");
            window.location.href = "dashboard.html"; // Redirect to the dashboard
        } else {
            alert(result.message || "Login failed.");
        }
    } catch (error) {
        console.error("Error during login:", error);
        alert("An error occurred while logging in.");
    }
}

// Attach Event Listeners for Login and Signup Forms
document.getElementById("signupForm")?.addEventListener("submit", handleSignup);
document.getElementById("loginForm")?.addEventListener("submit", handleLogin);

// Attach Event Listener for "Join Discord" Button
document.querySelector(".discord-button")?.addEventListener("click", openDiscord);
