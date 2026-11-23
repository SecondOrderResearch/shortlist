const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'change-me',
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, password required' });
  }
  if (!['customer', 'restaurant_admin'].includes(role)) {
    return res.status(400).json({ error: 'invalid role' });
  }
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rowCount) {
    return res.status(409).json({ error: 'email already registered' });
  }
  const hash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id, name, email, role',
    [name, email, hash, role]
  );
  const user = result.rows[0];
  const token = signToken(user);
  return res.status(201).json({ token, user });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'email, password required' });
  }
  const result = await pool.query(
    'SELECT id, name, email, role, password_hash FROM users WHERE email = $1',
    [email]
  );
  const user = result.rows[0];
  if (!user) {
    return res.status(401).json({ error: 'invalid credentials' });
  }
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ error: 'invalid credentials' });
  }
  const token = signToken(user);
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// POST /api/auth/recover — MVP: generate reset token, store in DB, return token
router.post('/recover', async (req, res) => {
  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ error: 'email required' });
  }
  const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  const user = userResult.rows[0];
  if (!user) {
    return res.json({ message: 'If account exists, reset token generated' });
  }
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
  await pool.query(
    'INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1,$2,$3)',
    [user.id, token, expiresAt]
  );
  return res.json({ message: 'Reset token generated', token, userId: user.id });
});

// POST /api/auth/reset — verify token and set new password
router.post('/reset', async (req, res) => {
  const { token, newPassword } = req.body || {};
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'token, newPassword required' });
  }
  const resetResult = await pool.query(
    'SELECT user_id, used, expires_at FROM password_resets WHERE token = $1',
    [token]
  );
  const reset = resetResult.rows[0];
  if (!reset || reset.used) {
    return res.status(400).json({ error: 'invalid or used token' });
  }
  if (new Date(reset.expires_at) < new Date()) {
    return res.status(400).json({ error: 'expired token' });
  }
  const hash = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, reset.user_id]);
  await pool.query('UPDATE password_resets SET used = TRUE WHERE id = $1', [reset.id]);
  return res.json({ message: 'Password reset successful' });
});

module.exports = router;
