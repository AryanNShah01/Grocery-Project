const express = require('express');
const router = express.Router();
const db = require('../db'); // Changed to match your connection file

router.get('/', async (req, res) => {
  try {
    const { timeRange } = req.query;
    
    // Calculate date range based on timeRange
    let startDate;
    const endDate = new Date();
    
    switch(timeRange) {
      case '7d':
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get total revenue - using promise() for async/await
    const [revenueResult] = await db.promise().execute(`
      SELECT 
        COALESCE(SUM(oi.quantity * (oi.price - oi.discount)), 0) as current_revenue,
        COALESCE(SUM(oi.quantity * oi.price), 0) as total_before_discount
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.order_date BETWEEN ? AND ?
    `, [startDate, endDate]);

    // Get previous period revenue for growth calculation
    const prevStartDate = new Date(startDate.getTime() - (endDate - startDate));
    const [prevRevenueResult] = await db.promise().execute(`
      SELECT COALESCE(SUM(oi.quantity * (oi.price - oi.discount)), 0) as previous_revenue
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.order_date BETWEEN ? AND ?
    `, [prevStartDate, startDate]);

    // Get sales by category
    const [categoryResult] = await db.promise().execute(`
      SELECT 
        p.category,
        SUM(oi.quantity * (oi.price - oi.discount)) as revenue,
        COUNT(DISTINCT o.id) as order_count
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.order_date BETWEEN ? AND ?
      GROUP BY p.category
      ORDER BY revenue DESC
    `, [startDate, endDate]);

    // Get low stock and expiring products
    const [inventoryResult] = await db.promise().execute(`
      SELECT 
        COUNT(*) as total_products,
        SUM(CASE WHEN stock < 10 THEN 1 ELSE 0 END) as low_stock,
        SUM(CASE WHEN expiryDate <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as expiring_soon
      FROM products
    `);

    // Get top products
    const [topProductsResult] = await db.promise().execute(`
      SELECT 
        p.id,
        p.name,
        SUM(oi.quantity) as sales,
        SUM(oi.quantity * (oi.price - oi.discount)) as revenue,
        p.stock
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.order_date BETWEEN ? AND ?
      GROUP BY p.id, p.name, p.stock
      ORDER BY revenue DESC
      LIMIT 5
    `, [startDate, endDate]);

    // Get sales data for chart (last 7 days)
    const [salesChartResult] = await db.promise().execute(`
      SELECT 
        DATE(o.order_date) as date,
        SUM(oi.quantity * (oi.price - oi.discount)) as daily_revenue,
        COUNT(DISTINCT o.id) as order_count
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.order_date BETWEEN DATE_SUB(CURDATE(), INTERVAL 6 DAY) AND CURDATE()
      GROUP BY DATE(o.order_date)
      ORDER BY date
    `);

    const currentRevenue = revenueResult[0]?.current_revenue || 0;
    const previousRevenue = prevRevenueResult[0]?.previous_revenue || 0;
    const growth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    const response = {
      revenue: {
        current: currentRevenue,
        previous: previousRevenue,
        growth: parseFloat(growth.toFixed(1))
      },
      inventory: {
        total: inventoryResult[0]?.total_products || 0,
        lowStock: inventoryResult[0]?.low_stock || 0,
        expiring: inventoryResult[0]?.expiring_soon || 0
      },
      categories: {
        labels: categoryResult.map(row => row.category),
        data: categoryResult.map(row => parseFloat(((row.revenue / currentRevenue) * 100).toFixed(1)))
      },
      topProducts: topProductsResult.map(product => ({
        id: product.id,
        name: product.name,
        sales: product.sales,
        revenue: product.revenue,
        stock: product.stock
      })),
      sales: {
        labels: salesChartResult.map(row => 
          new Date(row.date).toLocaleDateString('en-US', { weekday: 'short' })
        ),
        data: salesChartResult.map(row => parseFloat(row.daily_revenue || 0))
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;