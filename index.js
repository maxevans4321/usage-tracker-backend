const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to SQLite DB
const db = new sqlite3.Database("usage.db");

// Create events table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event TEXT,
    properties TEXT,
    userId TEXT,
    accountId TEXT,
    timestamp TEXT
  )
`);


// Track endpoint to receive usage events
app.post("/track", (req, res) => {
  const { event, properties, userId, accountId, timestamp } = req.body;

  db.run(
    `INSERT INTO events (event, properties, userId, accountId, timestamp)
     VALUES (?, ?, ?, ?, ?)`,
    [event, JSON.stringify(properties), userId, accountId, timestamp],
    function (err) {
      if (err) {
        console.error("❌ Failed to insert event:", err.message);
        return res.status(500).send("Database error");
      }
      console.log("✅ Event saved with ID", this.lastID);
      res.status(200).send({ message: "Event saved", id: this.lastID });
    }
  );
});
app.get("/view", (req, res) => {
  console.log("👀 /view route hit");

  db.all("SELECT * FROM events ORDER BY id DESC", (err, rows) => {
    if (err) {
      console.error("❌ Failed to query DB:", err.message);
      return res.status(500).send("Failed to fetch events");
    }

    console.log("📦 Returning rows:", rows.length);
    res.json(rows);
  });
});



// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

