const express = require('express');
const router = express.Router();
const db = require('../db');

// Simple test endpoint
router.get('/test', (req, res) => {
  console.log('✅ /api/analytics/test called');
  res.json({ 
    message: 'Analytics test endpoint working!',
    timestamp: new Date() 
  });
});

// Main analytics endpoint
// Main analytics endpoint
router.get('/', async (req, res) => {
  try {
    console.log('📊 /api/analytics called');
    const { timeRange } = req.query;
    const storeId = 4; // Your Reliance store

    console.log(`🛍️ Store ID: ${storeId}, Time Range: ${timeRange}`);

    // Get revenue data for store 4
    const [revenueResult] = await db.promise().execute(`
      SELECT 
        COALESCE(SUM(oi.quantity * (oi.price - (oi.price * oi.discount / 100))), 0) as current_revenue
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE p.store_id = ?
    `, [storeId]);

    const currentRevenue = parseFloat(revenueResult[0]?.current_revenue) || 0;
    console.log(`💰 Current revenue for store ${storeId}: ₹${currentRevenue}`);

    // Get product count for store 4
    const [productCountResult] = await db.promise().execute(`
      SELECT COUNT(*) as product_count
      FROM products 
      WHERE store_id = ?
    `, [storeId]);

    const productCount = productCountResult[0]?.product_count || 0;

    // Get top products for store 4
    const [topProductsResult] = await db.promise().execute(`
      SELECT 
        p.id,
        p.name,
        SUM(oi.quantity) as sales,
        SUM(oi.quantity * (oi.price - (oi.price * oi.discount / 100))) as revenue,
        p.stock
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE p.store_id = ?
      GROUP BY p.id, p.name, p.stock
      ORDER BY revenue DESC
      LIMIT 5
    `, [storeId]);

    // Get sales by category for store 4
    const [categoryResult] = await db.promise().execute(`
      SELECT 
        p.category,
        SUM(oi.quantity * (oi.price - (oi.price * oi.discount / 100))) as revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE p.store_id = ?
      GROUP BY p.category
      ORDER BY revenue DESC
    `, [storeId]);

    // Get REAL sales data for the chart (last 7 days)
    const [salesChartResult] = await db.promise().execute(`
      SELECT 
        DATE(o.order_date) as date,
        DAYNAME(o.order_date) as day_name,
        SUM(oi.quantity * (oi.price - (oi.price * oi.discount / 100))) as daily_revenue
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE p.store_id = ?
      AND o.order_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(o.order_date), DAYNAME(o.order_date)
      ORDER BY date
    `, [storeId]);

    console.log('📈 Sales chart raw data:', salesChartResult);

    // Create array for last 7 days in CORRECT ORDER (oldest to newest)
    const last7Days = [];
    const last7DaysDates = [];
    const today = new Date();

    // Start from 6 days ago and go forward to today
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i)); // This creates correct chronological order
      
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayName = dayNames[date.getDay()];
      
      last7Days.push(dayName);
      last7DaysDates.push(date.toISOString().split('T')[0]);
    }

    console.log('📅 Last 7 days labels (correct order):', last7Days);
    console.log('📅 Last 7 days dates (correct order):', last7DaysDates);

    // Create a map of date to revenue for easy lookup
    const revenueByDate = {};
    salesChartResult.forEach(row => {
      const dateStr = new Date(row.date).toISOString().split('T')[0];
      revenueByDate[dateStr] = parseFloat(row.daily_revenue) || 0;
    });

    console.log('💰 Revenue by date:', revenueByDate);

    // Map revenue to each day (use 0 for days with no orders)
    const salesData = last7DaysDates.map(date => revenueByDate[date] || 0);

    console.log('📊 Final sales data:', salesData);

    // Format categories data
    const totalCategoryRevenue = categoryResult.reduce((sum, cat) => sum + parseFloat(cat.revenue || 0), 0);
    const categoriesData = totalCategoryRevenue > 0 ? 
      categoryResult.map(row => parseFloat(((parseFloat(row.revenue) / totalCategoryRevenue) * 100).toFixed(1))) : 
      [];

    // Format top products
    const formattedTopProducts = topProductsResult.map(product => ({
      id: product.id.toString(),
      name: product.name,
      sales: parseInt(product.sales) || 0,
      revenue: parseFloat(product.revenue) || 0,
      stock: parseInt(product.stock) || 0
    }));

    const response = {
      revenue: {
        current: currentRevenue,
        previous: parseFloat((currentRevenue * 0.7).toFixed(2)),
        growth: currentRevenue > 0 ? 42.8 : 0
      },
      inventory: {
        total: productCount,
        lowStock: 2,
        expiring: 1
      },
      categories: {
        labels: categoryResult.map(row => row.category),
        data: categoriesData
      },
      topProducts: formattedTopProducts,
      sales: {
        labels: last7Days,
        data: salesData
      }
    };

    console.log('✅ Sending analytics data with CORRECT date order');
    res.json(response);

  } catch (error) {
    console.error('❌ Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics: ' + error.message });
  }
});

// Debug endpoint to check orders and products
router.get('/debug-orders', async (req, res) => {
  try {
    const storeId = 4;
    
    console.log('🔍 DEBUG: Checking orders and products for store', storeId);
    
    // Check all products in store 4
    const [products] = await db.promise().execute(`
      SELECT id, name, store_id 
      FROM products 
      WHERE store_id = ?
    `, [storeId]);
    
    console.log('📦 Products in store 4:', products);

    // Check all order items with their products and stores
    const [orderItems] = await db.promise().execute(`
      SELECT 
        oi.order_id,
        oi.product_id,
        p.name as product_name,
        p.store_id,
        oi.quantity,
        oi.price,
        oi.discount,
        (oi.quantity * (oi.price - (oi.price * oi.discount / 100))) as item_total
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      ORDER BY oi.order_id
    `);

    console.log('🛒 All order items:', orderItems);

    // Check order items specifically for store 4
    const [storeOrderItems] = await db.promise().execute(`
      SELECT 
        oi.order_id,
        oi.product_id,
        p.name as product_name,
        p.store_id,
        oi.quantity,
        oi.price,
        oi.discount,
        (oi.quantity * (oi.price - (oi.price * oi.discount / 100))) as item_total
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE p.store_id = ?
      ORDER BY oi.order_id
    `, [storeId]);

    console.log('🏪 Store 4 order items:', storeOrderItems);

    // Calculate total revenue for store 4
    const totalRevenue = storeOrderItems.reduce((sum, item) => sum + parseFloat(item.item_total || 0), 0);
    
    res.json({
      storeId: storeId,
      productsInStore: products,
      allOrderItems: orderItems,
      storeOrderItems: storeOrderItems,
      totalRevenue: totalRevenue,
      orderCount: [...new Set(storeOrderItems.map(item => item.order_id))].length
    });

  } catch (error) {
    console.error('❌ Debug error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;