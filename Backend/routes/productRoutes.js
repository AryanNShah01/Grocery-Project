const express = require('express');
const router = express.Router();
const db = require('../db'); // Changed to match your connection file

// Get all products
router.get('/', async (req, res) => {
  try {
    const [products] = await db.promise().execute(`
      SELECT p.*, s.name as store_name 
      FROM products p 
      LEFT JOIN stores s ON p.store_id = s.id
      ORDER BY p.created_at DESC
    `);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Add new product
router.post('/', async (req, res) => {
  try {
    const { name, price, category, stock, discount, expiryDate, description, store_id } = req.body;
    
    const [result] = await db.promise().execute(`
      INSERT INTO products (name, price, category, stock, discount, expiryDate, description, store_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, price, category, stock, discount || 0, expiryDate, description, store_id || 1]);
    
    const [newProduct] = await db.promise().execute('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.status(201).json(newProduct[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add product' });
  }
});

module.exports = router;