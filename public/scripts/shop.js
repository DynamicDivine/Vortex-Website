const items = {
    clouds: [
      { 
        name: "500 Clouds", 
        image: "images/500clouds.png", 
        buyText: "Buy 500 Clouds for $5?", 
        viewText: "500 Clouds: Best for beginners!" 
      },
      { 
        name: "1,000 (+100 Bonus) Clouds", 
        image: "images/1100clouds.png", 
        buyText: "Buy 1,000 Clouds for $10?", 
        viewText: "1,000 (+100 Bonus) Clouds: Great value!" 
      },
      { 
        name: "2,500 (+250 Bonus) Clouds", 
        image: "images/1100clouds.png", 
        buyText: "Buy 2,500 Clouds for $20?", 
        viewText: "2,500 (+250 Bonus) Clouds: Best for frequent players!" 
      },
      { 
        name: "5,000 (+500 Bonus) Clouds", 
        image: "images/5500clouds.png", 
        buyText: "Buy 5,000 Clouds for $50?", 
        viewText: "5,000 (+500 Bonus) Clouds: Premium package!" 
      },
      { 
        name: "10,000 (+2,000 Bonus) Clouds", 
        image: "images/12000clouds.png", 
        buyText: "Buy 10,000 Clouds for $100?", 
        viewText: "10,000 (+2,000 Bonus) Clouds: Ultimate value!" 
      },
    ],
    ranks: [
      { 
        name: "Zeus Rank", 
        image: "images/zues-rank.png", 
        buyText: "Purchase Zeus Rank for $5?", 
        viewText: "Zeus Rank: The power of the gods awaits!" 
      },
      { 
        name: "Hades Rank", 
        image: "images/hades-rank.png", 
        buyText: "Purchase Hades Rank for $10?", 
        viewText: "Hades Rank: Command the underworld!" 
      },
      { 
        name: " Wither Rank", 
        image: "images/wither-rank.png", 
        buyText: "Purchase Hades Rank for $25?", 
        viewText: "Hades Rank: Command the dark monsters!" 
      },
      { 
        name: "Dragon Rank", 
        image: "images/dragon-rank.png", 
        buyText: "Purchase Hades Rank for $35?", 
        viewText: "Hades Rank: Command the dragons!" 
      },
      { 
        name: "Astro Rank", 
        image: "images/astro-rank.png", 
        buyText: "Purchase Hades Rank for $50?", 
        viewText: "Hades Rank: Command the skys!" 
      },
    ],
    punishments: [
        { 
          name: "Unban", 
          image: "images/unban.png", 
          buyText: "Purchase unban for $15?", 
          viewText: "Comeback from a perm ban on our server" 
        },
        { 
            name: "Unmute", 
            image: "images/unmute.png", 
            buyText: "Purchase unmute for $5?", 
            viewText: "Comeback from a perm mute on our server" 
          },
        ],
  };
  
  let selectedItem = { name: "" };

  // Function to check if user is logged in
  function isLoggedIn() {
  const loggedInUser = localStorage.getItem("loggedInUser");
  console.log("Logged in user:", loggedInUser); // Debugging
  return loggedInUser && loggedInUser.trim() !== ""; // Ensure it's not null or empty
  }
  
  // Handle Buy Button
  async function handleBuy(itemName, buyText) {
  // Check if user is logged in
  if (!isLoggedIn()) {
    alert("You must be logged in to complete a purchase. Please log in on the dashboard.");
    return;
  }
  
  // Confirm the purchase
  if (!confirm(`Do you want to purchase "${itemName}"?`)) {
    return; // User canceled the purchase
  }
  
  // Send the purchase request to the server
  try {
    const response = await fetch("/buy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemName }),
    });
  
    const result = await response.json();
  
    if (response.ok) {
      alert(`Purchase successful: ${itemName}`);
      console.log("Purchase result:", result);
    } else {
      alert(`Purchase failed: ${result.message}`);
      console.error("Purchase error:", result.message);
    }
  } catch (error) {
    console.error("Error sending purchase request:", error);
    alert("An error occurred while processing your purchase. Please try again.");
  }
  }
  
  // Handle View Button
  function handleView(itemName, viewText) {
  document.getElementById("viewItemName").textContent = viewText;
  openModal("viewModal");
  }
  
  // Open Modal
  function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = "block";
  }
  
  // Close Modal
  function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = "none";
  }
  
  // Populate Items in Shop
  function switchCategory(category) {
  const shopGrid = document.getElementById("shopGrid");
  shopGrid.innerHTML = ""; // Clear existing items
  
  items[category].forEach(item => {
    const shopItem = document.createElement("div");
    shopItem.className = "shop-item";
  
    shopItem.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="item-image">
      <div class="item-buttons">
        <button class="buy-button" onclick="handleBuy('${item.name}', '${item.buyText}')">Buy</button>
        <button class="view-button" onclick="handleView('${item.name}', '${item.viewText}')"><span class="icon">i</span></button>
      </div>
    `;
  
    shopGrid.appendChild(shopItem);
  });
  }
  
  // On Page Load
  document.addEventListener("DOMContentLoaded", () => {
  switchCategory("clouds");
  });