const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const db = require('../db');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Create this folder in your project
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Get products for store
router.get('/', async (req, res) => {
  try {
    console.log('📦 /api/products called');
    const storeId = 4;

    const [products] = await db.promise().execute(`
      SELECT p.*, s.name as store_name 
      FROM products p 
      LEFT JOIN stores s ON p.store_id = s.id
      WHERE p.store_id = ?
      ORDER BY p.created_at DESC
    `, [storeId]);

    console.log(`✅ Found ${products.length} products for store ${storeId}`);
    res.json(products);

  } catch (error) {
    console.error('❌ Products error:', error);
    res.status(500).json({ error: 'Failed to fetch products: ' + error.message });
  }
});

// ADD PRODUCT WITH IMAGE UPLOAD
router.post('/', upload.single('image'), async (req, res) => {
  try {
    console.log('📤 POST /api/products called');
    
    const { name, category, price, stock, discount, expiryDate, description } = req.body;
    const storeId = 4;
    
    // Get image path if file was uploaded
    const image_url = req.file ? `/uploads/${req.file.filename}` : '';
    
    console.log('📦 Product data:', {
      name, category, price, stock, discount, expiryDate, description, image_url
    });

    // Insert product into database
    const [result] = await db.promise().execute(`
      INSERT INTO products (name, category, price, stock, discount, expiryDate, description, store_id, rating, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, category, price, stock, discount, expiryDate, description, storeId, 0, image_url]);

    console.log('✅ Product added with ID:', result.insertId);
    
    // Get the newly created product
    const [newProduct] = await db.promise().execute(
      'SELECT * FROM products WHERE id = ?', 
      [result.insertId]
    );

    res.status(201).json(newProduct[0]);

  } catch (error) {
    console.error('❌ Add product error:', error);
    res.status(500).json({ error: 'Failed to add product: ' + error.message });
  }
});

module.exports = router;