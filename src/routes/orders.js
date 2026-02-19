const express  = require('express');
const router   = express.Router();
const pool     = require('../db');
const { requireApiKey } = require('../middleware/auth');

/**
 * POST /orders
 *
 * Place a new food order. Calls the place_order() stored function
 * already defined in restaurant_db.
 *
 * Request body:
 * {
 *   "table_id":    3,
 *   "customer_id": 1,        // optional — null for walk-ins
 *   "waiter_id":   4,
 *   "items": [
 *     { "menu_item_id": 11, "quantity": 1, "notes": "no lemon" },
 *     { "menu_item_id": 30, "quantity": 2 }
 *   ]
 * }
 *
 * Response 201:
 * {
 *   "order_id": 9,
 *   "message": "Order placed successfully",
 *   "items_count": 2
 * }
 */
router.post('/', requireApiKey, async (req, res) => {
  const { table_id, customer_id = null, waiter_id, items } = req.body;

  // ── Validate required fields ───────────────────────────────
  if (!table_id) {
    return res.status(400).json({ error: 'table_id is required' });
  }
  if (!waiter_id) {
    return res.status(400).json({ error: 'waiter_id is required' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items must be a non-empty array' });
  }

  // ── Validate each item ─────────────────────────────────────
  for (const item of items) {
    if (!item.menu_item_id || !item.quantity) {
      return res.status(400).json({
        error: 'Each item must have menu_item_id and quantity',
        received: item
      });
    }
    if (item.quantity < 1) {
      return res.status(400).json({
        error: `Invalid quantity ${item.quantity} for menu_item_id ${item.menu_item_id}`
      });
    }
  }

  try {
    // ── Call the stored function from 03_queries_views_procedures.sql ──
    const result = await pool.query(
      `SELECT place_order($1, $2, $3, $4::jsonb) AS order_id`,
      [table_id, customer_id, waiter_id, JSON.stringify(items)]
    );

    const order_id = result.rows[0].order_id;

    return res.status(201).json({
      order_id,
      message: 'Order placed successfully',
      items_count: items.length
    });

  } catch (err) {
    // Catch errors raised inside the stored function (e.g. item not available)
    if (err.message.includes('not available') || err.message.includes('not found')) {
      return res.status(422).json({ error: err.message });
    }
    console.error('POST /orders error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
