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

// GET /api/admin/metrics/:restaurantId — Full funnel metrics per dish
router.get('/metrics/:restaurantId', async (req, res) => {
  const restaurantId = req.params.restaurantId;

  // 1. Get menus for restaurant
  const menusRes = await pool.query('SELECT * FROM menus WHERE restaurant_id = $1', [restaurantId]);
  if (!menusRes.rowCount) return res.status(404).json({ error: 'Menu not found for this restaurant' });
  const menus = menusRes.rows;

  // 2. Get all menu items for this restaurant
  const itemsRes = await pool.query('SELECT * FROM menu_items WHERE restaurant_id = $1', [restaurantId]);
  const items = itemsRes.rows;

  // Build item map keyed by id
  const itemMap = {};
  items.forEach(item => { itemMap[item.id] = item; });

  // Initialize counters for each item
  const metrics = {};
  items.forEach(item => {
    metrics[item.id] = {
      ...item,
      totalViews: 0,
      shortlisted: 0,
      removed: 0,
      filtered: 0,
      finalChoice: 0
    };
  });

  // 3. Get sessions for restaurant
  const sessionsRes = await pool.query('SELECT * FROM sessions WHERE restaurant_id = $1', [restaurantId]);
  const sessions = sessionsRes.rows;

  // 4. Iterate sessions and update counters
  for (const session of sessions) {
    // totalViews: every occurrence in viewed_items
    if (session.viewed_items && session.viewed_items.length > 0) {
      session.viewed_items.forEach(id => {
        const item = itemMap[id];
        if (item) metrics[item.id].totalViews++;
      });
    }
    // shortlisted
    if (session.shortlisted_items && session.shortlisted_items.length > 0) {
      session.shortlisted_items.forEach(id => {
        const item = itemMap[id];
        if (item) metrics[item.id].shortlisted++;
      });
    }
    // removed
    if (session.manually_removed_items && session.manually_removed_items.length > 0) {
      session.manually_removed_items.forEach(id => {
        const item = itemMap[id];
        if (item) metrics[item.id].removed++;
      });
    }
    // filtered
    if (session.allergen_filtered_items && session.allergen_filtered_items.length > 0) {
      session.allergen_filtered_items.forEach(id => {
        const item = itemMap[id];
        if (item) metrics[item.id].filtered++;
      });
    }
    // final_choice
    if (session.final_choice) {
      const item = items.find(i => i.id === session.final_choice);
      if (item) metrics[item.id].finalChoice++;
    }
  }

  // 5. Return items with merged counts
  const result = items.map(item => {
    const m = metrics[item.id];
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      allergens: item.allergens,
      category: item.category,
      tags: item.tags,
      created_at: item.created_at,
      totalViews: m.totalViews,
      shortlisted: m.shortlisted,
      removed: m.removed,
      filtered: m.filtered,
      finalChoice: m.finalChoice
    };
  }).sort((a, b) => {
    const aName = String(a.name || '').toLowerCase();
    const bName = String(b.name || '').toLowerCase();
    return aName < bName ? -1 : aName > bName ? 1 : 0;
  });

  res.json(result);
});

module.exports = router;
