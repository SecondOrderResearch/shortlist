const express = require('express');
const { pool } = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'change-me',
    { expiresIn: '7d' }
  );
}

// GET /api/admin/restaurants
router.get('/restaurants', async (req, res) => {
  const result = await pool.query('SELECT id, name, location, owner_id FROM restaurants ORDER BY name ASC', []);
  if (!result.rowCount) return res.status(404).json({ error: 'No restaurants found' });
  res.json(result.rows);
});

// GET /api/admin/restaurants/:restaurantId/menus
router.get('/restaurants/:restaurantId/menus', async (req, res) => {
  const restaurantId = req.params.restaurantId;
  const result = await pool.query('SELECT * FROM menus WHERE restaurant_id = $1', [restaurantId]);
  if (!result.rowCount) return res.status(404).json({ error: 'Menu not found for this restaurant' });
  res.json(result.rows);
});

// GET /api/admin/menus/:menuId/items
router.get('/menus/:menuId/items', async (req, res) => {
  const menuId = req.params.menuId;
  const result = await pool.query('SELECT * FROM menu_items WHERE menu_id = $1', [menuId]);
  if (!result.rowCount) return res.status(404).json({ error: 'Item not found in menu' });
  res.json(result.rows);
});

module.exports = router;
