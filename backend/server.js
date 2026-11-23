const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/ping', (req, res) => res.json({ message: 'pong', ts: Date.now() }));

// Auth routes
app.use('/api/auth', require('./routes/auth'));

// Menu routes
app.use('/api/menus', require('./routes/menus'));

// Sessions routes
app.use('/api/sessions', require('./routes/sessions'));

// Upload routes
app.use('/api/upload', require('./routes/upload'));

const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

// One-time migration endpoint (remove after use)
app.post('/api/__init', async (req, res) => {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schema);
    res.json({ ok: true, message: 'Schema applied' });
  } catch (err) {
    console.error('Migration failed:', err.code, err.message, err.detail, err.hint);
    res.status(500).json({ ok: false, error: err.message || err.code || String(err), detail: err.detail || null, hint: err.hint || null });
  }
});

app.listen(PORT, () => console.log(`ShortList API listening on port ${PORT}`));
