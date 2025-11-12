const express = require('express');
const router = express.Router();
const db = require('../db');

// Get products for store
router.get('/', async (req, res) => {
  try {
    console.log('📦 /api/products called');
    const storeId = 4; // Your Reliance store

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

module.exports = router;