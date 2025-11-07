const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json());

console.log("🔄 Starting server...");

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root", 
  password: "Mandakini@1",
  database: "grocery_db"
});

let isDbConnected = false;

// Test database connection
db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed: " + err.message);
    isDbConnected = false;
    return;
  }
  console.log("✅ Connected to MySQL database");
  isDbConnected = true;
});

// Simple test route
app.get("/test", (req, res) => {
  res.json({ 
    message: "Backend is running!", 
    database: isDbConnected ? "Connected" : "Disconnected",
    timestamp: new Date() 
  });
});

// Products route
app.get("/products", (req, res) => {
  if (!isDbConnected) {
    return res.status(500).json({ error: "Database not connected" });
  }
  
  console.log("📦 Fetching products from database...");
  
  db.query("SELECT * FROM products", (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ error: "Failed to fetch products" });
    }
    
    console.log(`✅ Found ${results.length} products in database`);
    
    // Log sample data to verify
    if (results.length > 0) {
      console.log("📝 First product:", results[0].name);
    } else {
      console.log("❌ NO PRODUCTS FOUND IN DATABASE!");
    }
    
    res.json(results);
  });
});

// Related products
app.get("/products/related/:category", (req, res) => {
  if (!isDbConnected) {
    return res.status(500).json({ error: "Database not connected" });
  }
  
  const category = req.params.category;
  console.log(`🔍 Finding related products for: ${category}`);
  
  db.query("SELECT * FROM products WHERE category = ? LIMIT 3", [category], (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ error: "Failed to fetch related products" });
    }
    
    console.log(`✅ Found ${results.length} related products`);
    res.json(results);
  });
});

// Reviews
app.get("/reviews/:productId", (req, res) => {
  if (!isDbConnected) {
    return res.status(500).json({ error: "Database not connected" });
  }
  
  const productId = req.params.productId;
  console.log(`📝 Fetching reviews for product: ${productId}`);
  
  db.query("SELECT * FROM reviews WHERE product_id = ?", [productId], (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ error: "Failed to fetch reviews" });
    }
    
    console.log(`✅ Found ${results.length} reviews`);
    res.json(results);
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`✅ Backend ready!`);
});