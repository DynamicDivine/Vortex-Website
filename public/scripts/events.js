document.addEventListener("DOMContentLoaded", async () => {
    const eventList = document.querySelector(".event-list");

    if (eventList) {
        try {
            // Attempt to fetch events from the backend
            const response = await fetch("/events");

            if (response.ok) {
                const events = await response.json();

                // Clear the existing event list
                eventList.innerHTML = "";

                // Populate events from the backend
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
            } else {
                console.warn("Failed to fetch events from backend. Falling back to localStorage.");
                loadEventsFromLocalStorage(eventList);
            }
        } catch (error) {
            console.error("Error fetching events from backend:", error);
            loadEventsFromLocalStorage(eventList);
        }
    } else {
        console.error("Event list not found.");
    }
});

// Fallback to load events from localStorage
function loadEventsFromLocalStorage(eventList) {
    const events = JSON.parse(localStorage.getItem("events")) || [];

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
}
