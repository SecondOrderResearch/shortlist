const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/ping', (req, res) => res.json({ message: 'pong', ts: Date.now() }));

// TODO: mount route modules when implemented
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/menus', require('./routes/menus'));
// app.use('/api/sessions', require('./routes/sessions'));
// app.use('/api/admin', require('./routes/admin'));

app.listen(PORT, () => console.log(`ShortList API listening on port ${PORT}`));
