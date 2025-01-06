// Simulate user data (replace with your actual user role check logic)
const user = JSON.parse(localStorage.getItem("loggedInUser")) || {};
const isAdmin = user.role === "admin"; // Add 'role' to user object during login

// Handle Admin Panel click
const adminPanelCard = document.getElementById("adminPanelCard");
if (adminPanelCard) {
    if (isAdmin) {
        adminPanelCard.addEventListener("click", () => {
            openModal("adminModal");
        });
    } else {
        adminPanelCard.style.display = "none"; // Hide the Admin Panel for non-admins
    }
} else {
    console.error("Admin Panel card not found.");
}

// Open and Close Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "flex"; // Display modal
    } else {
        console.error(`Modal with id "${modalId}" not found.`);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none"; // Hide modal
    } else {
        console.error(`Modal with id "${modalId}" not found.`);
    }
}

// Add Event Functionality
const addEventForm = document.getElementById("addEventForm");
if (addEventForm) {
    addEventForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Get event details from form
        const eventTitle = document.getElementById("eventTitle").value.trim();
        const eventDescription = document.getElementById("eventDescription").value.trim();
        const eventTime = document.getElementById("eventTime").value.trim();
        const eventLocation = document.getElementById("eventLocation").value.trim();

        if (!eventTitle || !eventDescription || !eventTime || !eventLocation) {
            alert("Please fill out all fields.");
            return;
        }

        const newEvent = { title: eventTitle, description: eventDescription, time: eventTime, location: eventLocation };

        try {
            // Send event to the backend
            const response = await fetch("/admin/add-event", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newEvent),
            });

            if (response.ok) {
                alert("Event added successfully!");
                addEventForm.reset();
                closeModal("adminModal");

                // Reload events after successful addition
                loadEvents();
            } else {
                const result = await response.json();
                alert(result.message || "Failed to add event.");
            }
        } catch (error) {
            console.error("Error adding event:", error);
            alert("An error occurred while adding the event.");
        }
    });
} else {
    console.error("Add Event form not found.");
}

// Load Events from Backend and Display
async function loadEvents() {
    const eventList = document.querySelector(".event-list");

    if (eventList) {
        try {
            const response = await fetch("/events");
            if (!response.ok) {
                throw new Error("Failed to fetch events.");
            }

            const events = await response.json();

            // Clear the existing event list
            eventList.innerHTML = "";

            // Add events to the event list
            events.forEach((event) => {
                const eventCard = document.createElement("div");
                eventCard.className = "event-card";
                eventCard.innerHTML = `
                    <h3>${event.title}</h3>
                    <p>${event.description}</p>
                    <p><strong>Time:</strong> ${event.time}</p>
                    <p><strong>Location:</strong> ${event.location}</p>
                `;
                eventList.appendChild(eventCard);
            });
        } catch (error) {
            console.error("Error loading events:", error);
        }
    } else {
        console.error("Event list not found on the dashboard.");
    }
}

// Load events on page load
document.addEventListener("DOMContentLoaded", loadEvents);


// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("loggedInUser")); // Parse the stored user object
    const usernameElement = document.getElementById("dashboardUsername");

    console.log("LoggedInUser from localStorage:", user); // Debugging: Check the value of loggedInUser

    if (user && user.username) {
        usernameElement.textContent = user.username; // Display the username
    } else {
        usernameElement.textContent = "Guest"; // Default to "Guest"
    }
});

// Redirect to events.html when the card is clicked
const eventsCard = document.getElementById("eventsCard");

if (eventsCard) {
    eventsCard.addEventListener("click", () => {
        window.location.href = "events.html";
    });
} else {
    console.error("Events card not found.");
}

// Logout Function
function logoutUser() {
    // Remove the loggedInUser from localStorage
    localStorage.removeItem("loggedInUser");

    // Redirect to the login page
    alert("You have been logged out.");
    window.location.href = "index.html";
}

// Open and Close Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "flex"; // Display modal
    } else {
        console.error(`Modal with id "${modalId}" not found.`);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none"; // Hide modal
    } else {
        console.error(`Modal with id "${modalId}" not found.`);
    }
}

// Change Password Handler
async function handleChangePassword(event) {
    event.preventDefault();

    const currentPassword = document.getElementById("currentPassword").value.trim();
    const newPassword = document.getElementById("newPassword").value.trim();
    const confirmNewPassword = document.getElementById("confirmNewPassword").value.trim();

    if (!currentPassword || !newPassword || !confirmNewPassword) {
        alert("Please fill out all fields.");
        return;
    }

    if (newPassword !== confirmNewPassword) {
        alert("New passwords do not match.");
        return;
    }

    try {
        const response = await fetch("/change-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentPassword, newPassword }),
        });

        const result = await response.json();

        if (response.ok) {
            alert("Password changed successfully!");
            closeModal("changePasswordModal");
        } else {
            alert(result.message || "Failed to change password.");
        }
    } catch (error) {
        console.error("Error during password change:", error);
        alert("An error occurred while changing the password.");
    }
}

// Change Username Handler
async function handleChangeUsername(event) {
    event.preventDefault();

    const currentUsername = document.getElementById("currentUsername").value.trim();
    const newUsername = document.getElementById("newUsername").value.trim();

    if (!currentUsername || !newUsername) {
        alert("Please fill out all fields.");
        return;
    }

    try {
        const response = await fetch("/change-username", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentUsername, newUsername }),
        });

        const result = await response.json();

        if (response.ok) {
            alert("Username changed successfully!");
            localStorage.setItem("loggedInUser", JSON.stringify({ username: newUsername })); // Update username in localStorage
            const usernameElement = document.getElementById("dashboardUsername");
            usernameElement.textContent = newUsername; // Update the displayed username
            closeModal("changeUsernameModal");
        } else {
            alert(result.message || "Failed to change username.");
        }
    } catch (error) {
        console.error("Error during username change:", error);
        alert("An error occurred while changing the username.");
    }
}

// Function to handle the "Join Discord" button
function openDiscord() {
    window.open("https://discord.gg/RgGmTjSMby", "_blank"); // Replace with your Discord invite link
}

// Attach Event Listeners for Form Submissions
const passwordForm = document.getElementById("changePasswordForm");
const usernameForm = document.getElementById("changeUsernameForm");

if (passwordForm) {
    passwordForm.addEventListener("submit", handleChangePassword);
} else {
    console.error("Change Password form not found.");
}

if (usernameForm) {
    usernameForm.addEventListener("submit", handleChangeUsername);
} else {
    console.error("Change Username form not found.");
}

// Optional: Add a logout button handler
const logoutButton = document.getElementById("logoutButton"); // Ensure the button exists in your HTML
if (logoutButton) {
    logoutButton.addEventListener("click", logoutUser);
}

// Attach Event Listener for "Join Discord" Button
const discordButton = document.querySelector(".discord-button");
if (discordButton) {
    discordButton.addEventListener("click", openDiscord);
} else {
    console.error("Discord button not found.");
}
