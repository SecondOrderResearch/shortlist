const express = require('express');
const { pool } = require('../db');

const router = express.Router();

// POST /api/sessions — create a new session for user+restaurant
router.post('/', async (req, res) => {
  const { user_id, restaurant_id, viewed_items, allergen_filtered_items, manually_removed_items, shortlisted_items, final_choice, session_timestamp } = req.body || {};
  if (!user_id || !restaurant_id) return res.status(400).json({ error: 'user_id, restaurant_id required' });
  // For MVP, store empty arrays; in prod, use UUIDs.
  const result = await pool.query(
    `INSERT INTO sessions (user_id, restaurant_id, viewed_items, allergen_filtered_items, manually_removed_items, shortlisted_items, final_choice, session_timestamp)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [user_id, restaurant_id, [], [], [], [], undefined, new Date().toISOString()]
  );
  return res.json(result.rows[0]);
});

// PATCH /api/sessions/:sessionId/update — update views, filters, etc.
router.patch('/:sessionId/update', async (req, res) => {
  const { sessionId, viewed_items, allergen_filtered_items, manually_removed_items, shortlisted_items, final_choice } = req.body;
  const result = await pool.query(
    `UPDATE sessions SET viewed_items=$1, allergen_filtered_items=$2, manually_removed_items=$3, shortlisted_items=$4, final_choice=$5 WHERE id=$6 RETURNING *`,
    [
      sessionId,
      JSON.stringify(viewed_items),
      JSON.stringify(allergen_filtered_items),
      JSON.stringify(manually_removed_items),
      JSON.stringify(shortlisted_items),
      final_choice
    ]
  );
  return res.json(result.rows[0]);
});

module.exports = router;