const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const analyticsRoutes = require('./routes/analyticsRoutes');
const productRoutes = require('./routes/productRoutes');
const app = express();

app.use('/api/analytics', analyticsRoutes);
app.use('/api/products', productRoutes);
app.use(cors());
app.use(express.json());

console.log("🔄 Starting server...");

// Database configuration
const dbConfig = {
  host: "localhost",
  user: "root", 
  password: "Mandakini@1",
  database: "grocery_db"
};

const db = mysql.createConnection(dbConfig);
let isDbConnected = false;

// Database connection
db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed: " + err.message);
    isDbConnected = false;
    return;
  }
  console.log("✅ Connected to MySQL database");
  isDbConnected = true;
});

// Utility function to check database connection
const checkDbConnection = (res) => {
  if (!isDbConnected) {
    res.status(500).json({ error: "Database not connected" });
    return false;
  }
  return true;
};

// ==================== ROUTES ====================

// ✅ HEALTH CHECK
app.get("/test", (req, res) => {
  res.json({ 
    message: "Backend is running!", 
    database: isDbConnected ? "Connected" : "Disconnected",
    timestamp: new Date() 
  });
});

// ✅ GET ALL PRODUCTS
app.get("/products", (req, res) => {
  if (!checkDbConnection(res)) return;
  
  console.log("📦 Fetching products from database...");
  
  db.query("SELECT * FROM products", (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ error: "Failed to fetch products" });
    }
    
    console.log(`✅ Found ${results.length} products`);
    res.json(results);
  });
});

// ✅ GET RELATED PRODUCTS
app.get("/products/related/:category", (req, res) => {
  if (!checkDbConnection(res)) return;
  
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

// ✅ UPDATE PRODUCT STOCK
app.put("/products/:id/stock", (req, res) => {
  if (!checkDbConnection(res)) return;

  const productId = req.params.id;
  const { stock } = req.body;
  console.log(`📊 Updating stock for product ${productId} to ${stock}`);

  const query = "UPDATE products SET stock = ? WHERE id = ?";
  
  db.query(query, [stock, productId], (err, result) => {
    if (err) {
      console.error("❌ Stock update error:", err);
      return res.status(500).json({ error: "Failed to update stock" });
    }
    
    console.log(`✅ Stock updated for product ${productId}`);
    res.json({ message: "Stock updated successfully!" });
  });
});

// ✅ GET REVIEWS
app.get("/reviews/:productId", (req, res) => {
  if (!checkDbConnection(res)) return;
  
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

// ✅ ADD REVIEW
app.post("/reviews", (req, res) => {
  if (!checkDbConnection(res)) return;

  const { productId, author, rating, comment } = req.body;
  console.log(`⭐ Adding review for product ${productId} by ${author}`);

  const query = "INSERT INTO reviews (product_id, author, rating, comment, date) VALUES (?, ?, ?, ?, CURDATE())";
  
  db.query(query, [productId, author, rating, comment], (err, result) => {
    if (err) {
      console.error("❌ Review creation error:", err);
      return res.status(500).json({ error: "Failed to add review" });
    }
    
    console.log(`✅ Review added with ID: ${result.insertId}`);
    res.json({ 
      message: "Review added successfully!", 
      reviewId: result.insertId 
    });
  });
});

// ✅ USER REGISTRATION
app.post("/users/register", (req, res) => {
  if (!checkDbConnection(res)) return;

  const { username, email, password, role } = req.body;
  console.log(`👤 Registering user: ${username}, ${email}`);

  const query = "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)";
  
  db.query(query, [username, email, password, role || 'customer'], (err, result) => {
    if (err) {
      console.error("❌ User registration error:", err);
      return res.status(500).json({ error: "Failed to register user" });
    }
    
    console.log(`✅ User registered with ID: ${result.insertId}`);
    res.json({ 
      message: "User registered successfully!", 
      userId: result.insertId 
    });
  });
});

// ✅ USER LOGIN
app.post("/users/login", (req, res) => {
  if (!checkDbConnection(res)) return;

  const { email, password } = req.body;
  console.log(`🔐 Login attempt for: ${email}`);

  const query = "SELECT id, username, email, role FROM users WHERE email = ? AND password = ?";
  
  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error("❌ Login error:", err);
      return res.status(500).json({ error: "Login failed" });
    }
    
    if (results.length === 0) {
      console.log("❌ Invalid login credentials");
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    const user = results[0];
    console.log(`✅ Login successful for user: ${user.username}`);
    res.json({ 
      message: "Login successful!", 
      user: user
    });
  });
});

// ✅ CREATE ORDER
app.post("/orders", (req, res) => {
  if (!checkDbConnection(res)) return;

  const { userId, items, total, status } = req.body;
  console.log(`🛒 Creating order for user: ${userId}, Total: ₹${total}`);

  const orderQuery = "INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)";
  
  db.query(orderQuery, [userId, total, status || 'pending'], (err, result) => {
    if (err) {
      console.error("❌ Order creation error:", err);
      return res.status(500).json({ error: "Failed to create order" });
    }
    
    const orderId = result.insertId;
    console.log(`✅ Order created with ID: ${orderId}`);
    
    // Insert order items
    const orderItemsQuery = "INSERT INTO order_items (order_id, product_id, quantity, price, discount) VALUES ?";
    const orderItemsValues = items.map(item => [
      orderId, 
      item.id, 
      item.quantity, 
      item.price, 
      item.discount || 0
    ]);
    
    db.query(orderItemsQuery, [orderItemsValues], (err) => {
      if (err) {
        console.error("❌ Order items error:", err);
        return res.status(500).json({ error: "Failed to add order items" });
      }
      
      console.log(`✅ Added ${items.length} items to order ${orderId}`);
      res.json({ 
        message: "Order created successfully!", 
        orderId: orderId 
      });
    });
  });
});

// ✅ GET USER ORDERS
app.get("/orders/user/:userId", (req, res) => {
  if (!checkDbConnection(res)) return;

  const userId = req.params.userId;
  console.log(`📋 Fetching orders for user: ${userId}`);

  const query = `
    SELECT o.*, oi.product_id, oi.quantity, oi.price, oi.discount, p.name, p.image_url
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE o.user_id = ?
    ORDER BY o.order_date DESC
  `;
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("❌ Orders fetch error:", err);
      return res.status(500).json({ error: "Failed to fetch orders" });
    }
    
    console.log(`✅ Found ${results.length} order records for user ${userId}`);
    res.json(results);
  });
});

// ==================== SERVER START ====================

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`✅ Backend ready with WRITE APIs!`);
  console.log(`📝 Available endpoints:`);
  console.log(`   GET  /test`);
  console.log(`   GET  /products`);
  console.log(`   GET  /products/related/:category`);
  console.log(`   PUT  /products/:id/stock`);
  console.log(`   GET  /reviews/:productId`);
  console.log(`   POST /reviews`);
  console.log(`   POST /users/register`);
  console.log(`   POST /users/login`);
  console.log(`   POST /orders`);
  console.log(`   GET  /orders/user/:userId`);
});