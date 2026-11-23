const express = require('express');
const { pool } = require('../db');

const router = express.Router();

// POST /api/menus — create a menu record (upload handled separately)
router.post('/', async (req, res) => {
  const { restaurant_id, upload_type, raw_menu_text } = req.body || {};
  if (!restaurant_id) return res.status(400).json({ error: 'restaurant_id required' });
  const result = await pool.query(
    'INSERT INTO menus (restaurant_id, upload_type, raw_menu_text) VALUES ($1,$2,$3) RETURNING *',
    [restaurant_id, upload_type || 'text', raw_menu_text || null]
  );
  return res.status(201).json(result.rows[0]);
});

// GET /api/menus/:menuId/items
router.get('/:menuId/items', async (req, res) => {
  const { menuId } = req.params;
  const result = await pool.query(
    'SELECT * FROM menu_items WHERE menu_id = $1 ORDER BY name',
    [menuId]
  );
  return res.json(result.rows);
});

// POST /api/menus/:menuId/items — add a structured menu item (OCR result)
router.post('/:menuId/items', async (req, res) => {
  const { menuId } = req.params;
  const { name, description, price, allergens, calories, category, tags } = req.body || {};
  const result = await pool.query(
    `INSERT INTO menu_items
       (menu_id, name, description, price, allergens, calories, category, tags)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [menuId, name, description, price, allergens || [], calories || null, category || null, tags || []]
  );
  return res.status(201).json(result.rows[0]);
});

// GET /api/menus/:menuId
router.get('/:menuId', async (req, res) => {
  const result = await pool.query('SELECT * FROM menus WHERE id = $1', [req.params.menuId]);
  if (!result.rowCount) return res.status(404).json({ error: 'menu not found' });
  return res.json(result.rows[0]);
});

module.exports = router;