document.addEventListener("DOMContentLoaded", async () => {
    const purchaseHistoryContainer = document.getElementById("purchase-history");
  
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!user || !user.email) {
      alert("You must be logged in to view your purchase history.");
      window.location.href = "index.html";
      return;
    }
  
    try {
      const response = await fetch("/purchases", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch purchases: ${response.status}`);
      }
  
      const purchases = await response.json();
  
      if (purchases.length === 0) {
        purchaseHistoryContainer.innerHTML = "<p>No purchases found for your account.</p>";
        return;
      }
  
      purchases.forEach((purchase) => {
        const purchaseBar = document.createElement("div");
        purchaseBar.className = "purchase-bar";
        purchaseBar.innerHTML = `
          <div class="item">Item: <span>${purchase.item}</span></div>
          <div class="time">Time: <span>${new Date(purchase.date).toLocaleString()}</span></div>
        `;
        purchaseHistoryContainer.appendChild(purchaseBar);
      });
    } catch (error) {
      console.error("Error fetching purchases:", error);
      alert("An error occurred while fetching your purchase history. Please try again later.");
    }
  });
  