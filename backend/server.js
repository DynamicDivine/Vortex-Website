const express = require("express");
const fs = require("fs");
const path = require("path");
const session = require("express-session");
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = 3000;

// Discord Bot Setup
const discordClient = new Client({ intents: [GatewayIntentBits.Guilds] });
discordClient.login('MTMyMjU5MzAxMTU0NDM1ODk1NA.GfIXBv.W0MLrEgcCb6szd7bjosZ_kWrq795NM6_V2lXqA');

// Discord Channel IDs
const SIGNUP_CHANNEL_ID = "1325506996916457472";
const PURCHASE_CHANNEL_ID = "1325507032559911044";
const EVENT_CHANNEL_ID = "1325628424798343310";

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// Session Middleware
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    }
  }),
);

// Middleware to check if user is logged in
function isLoggedIn(req, res, next) {
  if (req.session && req.session.username) {
    next(); // Proceed to the next middleware/route
  } else {
    res.status(401).json({ message: "Unauthorized. Please log in." });
  }
}

// Middleware to check if user is an admin
function isAdmin(req, res, next) {
  if (req.session && req.session.role === "admin") {
    next(); // Proceed to the next middleware/route
  } else {
    res.status(403).json({ message: "Access denied. Admins only." });
  }
}

// Paths to data files
const accountsFile = path.join(__dirname, "data", "accounts.json");
const eventsFile = path.join(__dirname, "data", "events.json");
const purchasesFile = path.join(__dirname, "data", "purchases.json");

// Signup Route
app.post("/signup", (req, res) => {
  const { username, email, password, role = "user" } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  fs.readFile(accountsFile, (err, data) => {
    if (err) {
      console.error("Error reading accounts.json:", err);
      return res.status(500).json({ message: "Error reading accounts file." });
    }

    let accounts = JSON.parse(data || "[]");
    if (accounts.some((account) => account.email === email)) {
      return res.status(400).json({ message: "Email already exists." });
    }

    const newAccount = { username, email, password, role };
    accounts.push(newAccount);

    fs.writeFile(accountsFile, JSON.stringify(accounts, null, 2), (err) => {
      if (err) {
        console.error("Error writing to accounts.json:", err);
        return res.status(500).json({ message: "Error saving account." });
      }

      // Discord Signup Notification
      const signupEmbed = new EmbedBuilder()
        .setColor("#00FFFF")
        .setTitle("📝 New Signup")
        .setDescription("A new user has signed up on the website!")
        .addFields(
          { name: "Username", value: username, inline: true },
          { name: "Email", value: email, inline: true }
        )
        .setFooter({ text: "Signup Notification" })
        .setTimestamp();

      const signupChannel = discordClient.channels.cache.get(SIGNUP_CHANNEL_ID);
      if (signupChannel) {
        signupChannel.send({ embeds: [signupEmbed] }).catch((error) => {
          console.error("Error sending signup embed to Discord:", error);
        });
      } else {
        console.error("Discord channel not found for signup notifications.");
      }

      res.status(201).json({ message: "Signup successful!" });
    });
  });
});

// Login Route
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  fs.readFile(accountsFile, (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading accounts file." });

    const accounts = JSON.parse(data);
    const user = accounts.find(
      (account) => account.email === email && account.password === password
    );

    if (user) {
      req.session.email = user.email;
      req.session.username = user.username;
      req.session.role = user.role;

      return res.status(200).json({ username: user.username, email: user.email, role: user.role });
    } else {
      return res.status(400).json({ message: "Invalid email or password." });
    }
  });
});

// Admin Route to Add Events
app.post("/admin/add-event", isLoggedIn, isAdmin, (req, res) => {
  const { title, description, time, location } = req.body;

  if (!title || !description || !time || !location) {
    return res.status(400).json({ message: "All fields are required." });
  }

  fs.readFile(eventsFile, (err, data) => {
    if (err) {
      console.error("Error reading events.json:", err);
      return res.status(500).json({ message: "Error reading events file." });
    }

    const events = JSON.parse(data || "[]");
    const newEvent = { title, description, time, location };
    events.push(newEvent);

    fs.writeFile(eventsFile, JSON.stringify(events, null, 2), (err) => {
      if (err) {
        console.error("Error writing to events.json:", err);
        return res.status(500).json({ message: "Error saving event." });
      }

      // Discord Event Notification
      const eventEmbed = new EmbedBuilder()
        .setColor("#00FFFF")
        .setTitle("🎉 New Event Added")
        .setDescription("A new event has been added by an admin.")
        .addFields(
          { name: "Title", value: title, inline: true },
          { name: "Time", value: time, inline: true },
          { name: "Location", value: location, inline: true },
          { name: "Description", value: description }
        )
        .setFooter({ text: "Event Notification" })
        .setTimestamp();

      const eventChannel = discordClient.channels.cache.get(EVENT_CHANNEL_ID);
      if (eventChannel) {
        eventChannel.send({ embeds: [eventEmbed] }).catch((error) => {
          console.error("Error sending event embed to Discord:", error);
        });
      } else {
        console.error("Discord channel not found for event notifications.");
      }

      res.status(201).json({ message: "Event added successfully!" });
    });
  });
});

// Fetch Events
app.get("/events", (req, res) => {
  fs.readFile(eventsFile, (err, data) => {
    if (err) {
      console.error("Error reading events.json:", err);
      return res.status(500).json({ message: "Error reading events file." });
    }

    const events = JSON.parse(data || "[]");
    res.status(200).json(events);
  });
});

// Purchase Route
app.post("/buy", isLoggedIn, (req, res) => {
  const { itemName } = req.body;

  if (!itemName) {
    return res.status(400).json({ message: "Item name is required." });
  }

  fs.readFile(purchasesFile, (err, data) => {
    if (err) {
      console.error("Error reading purchases.json:", err);
      return res.status(500).json({ message: "Error reading purchases file." });
    }

    const purchases = JSON.parse(data || "[]");
    const newPurchase = {
      username: req.session.username || "Unknown User",
      email: req.session.email || "Unknown Email",
      item: itemName,
      date: new Date().toISOString(),
    };
    purchases.push(newPurchase);

    fs.writeFile(purchasesFile, JSON.stringify(purchases, null, 2), (err) => {
      if (err) {
        console.error("Error writing to purchases.json:", err);
        return res.status(500).json({ message: "Error saving purchase." });
      }

      // Discord Purchase Notification
      const purchaseEmbed = new EmbedBuilder()
        .setColor("#00FFFF")
        .setTitle("🛒 New Purchase")
        .setDescription("A user has purchased an item on the website!")
        .addFields(
          { name: "Username", value: req.session.username || "Unknown", inline: true },
          { name: "Email", value: req.session.email || "Unknown", inline: true },
          { name: "Item Purchased", value: itemName, inline: true }
        )
        .setFooter({ text: "Purchase Notification" })
        .setTimestamp();

      const purchaseChannel = discordClient.channels.cache.get(PURCHASE_CHANNEL_ID);
      if (purchaseChannel) {
        purchaseChannel.send({ embeds: [purchaseEmbed] }).catch((error) => {
          console.error("Error sending purchase embed to Discord:", error);
        });
      } else {
        console.error("Discord channel not found for purchase notifications.");
      }

      res.status(201).json({ message: `Successfully purchased: ${itemName}` });
    });
  });
});

app.get("/purchases", isLoggedIn, (req, res) => {
  fs.readFile(purchasesFile, (err, data) => {
    if (err) {
      console.error("Error reading purchases.json:", err);
      return res.status(500).json({ message: "Error reading purchases file." });
    }

    let purchases = [];
    try {
      purchases = JSON.parse(data || "[]");
    } catch (parseError) {
      console.error("Error parsing purchases.json:", parseError);
      return res.status(500).json({ message: "Error parsing purchases data." });
    }

    const userPurchases = purchases.filter(
      (purchase) => purchase.email === req.session.email
    );

    if (userPurchases.length === 0) {
      return res.status(404).json({ message: "No purchase history found." });
    }

    res.status(200).json(userPurchases);
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
