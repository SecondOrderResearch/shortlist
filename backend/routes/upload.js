const express = require('express');
const { pool } = require('../db');

const router = express.Router();

const ALLERGEN_KEYWORDS = {
  gluten: ['wheat', 'bread', 'pasta', 'flour', 'breadcrumbs', 'panko', 'batter', 'beer', 'soy sauce', 'couscous', 'barley', 'rye'],
  dairy: ['milk', 'cheese', 'cream', 'butter', 'yoghurt', 'yogurt', 'mozzarella', 'parmesan', 'mascarpone', 'ricotta', 'cheddar'],
  nuts: ['almond', 'cashew', 'walnut', 'pecan', 'pistachio', 'hazelnut', 'nut'],
  peanuts: ['peanut'],
  shellfish: ['shrimp', 'prawn', 'crab', 'lobster', 'mussel', 'clam', 'oyster', 'scallop'],
  fish: ['fish', 'salmon', 'tuna', 'cod', 'haddock', 'anchovy', 'sardine', 'bass', 'trout'],
  eggs: ['egg', 'mayonnaise', 'aioli', 'mayo'],
  soy: ['soy', 'tofu', 'edamame', 'miso'],
  sesame: ['sesame', 'tahini'],
  mustard: ['mustard'],
  celery: ['celery', 'celeriac'],
  sulphites: ['wine', 'sulphite', 'sulfite']
};

function detectAllergens(text) {
  const lower = text.toLowerCase();
  const found = [];
  for (const [allergen, keywords] of Object.entries(ALLERGEN_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) found.push(allergen);
  }
  return found;
}

function parsePrice(line) {
  const match = line.match(/[£$€]?\s?(\d+(?:[.,]\d{1,2})?)/);
  return match ? parseFloat(match[1].replace(',', '.')) : null;
}

function parseMenuText(raw) {
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const items = [];
  let currentCategory = 'Mains';

  for (const line of lines) {
    // Category headers: all-caps or ending with ':'
    if (/^[A-Z][A-Z\s&]+$/.test(line) && line.length < 40) {
      currentCategory = line;
      continue;
    }
    if (line.endsWith(':') && line.length < 40) {
      currentCategory = line.slice(0, -1).trim();
      continue;
    }

    const price = parsePrice(line);
    if (!price) continue;

    // Name is text before the price (strip price & trailing dots)
    let name = line.replace(/[£$€]?\s?\d+(?:[.,]\d{1,2})?/, '').replace(/[.\-–—]+$/, '').trim();
    if (!name) continue;

    // Description is optional text after a dash, if present
    const dashSplit = name.split(/\s[-–—]\s/);
    let description = null;
    if (dashSplit.length > 1) {
      name = dashSplit[0].trim();
      description = dashSplit.slice(1).join(' ').trim();
    }

    const allergens = detectAllergens(`${name} ${description || ''}`);

    items.push({
      name,
      description,
      price,
      allergens,
      calories: null,
      category: currentCategory,
      tags: allergens
    });
  }
  return items;
}

// POST /api/upload — ingest a menu (text/PDF text/image OCR text)
router.post('/', async (req, res) => {
  const { restaurantId, uploadType, rawText } = req.body || {};
  if (!rawText || !restaurantId) {
    return res.status(400).json({ error: 'restaurantId and rawText required' });
  }

  const menuResult = await pool.query(
    'INSERT INTO menus (restaurant_id, upload_type, raw_menu_text) VALUES ($1,$2,$3) RETURNING id',
    [restaurantId, uploadType || 'text', rawText]
  );
  const menuId = menuResult.rows[0].id;

  const items = parseMenuText(rawText);
  for (const item of items) {
    await pool.query(
      `INSERT INTO menu_items (menu_id, name, description, price, allergens, calories, category, tags)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [menuId, item.name, item.description, item.price, item.allergens, item.calories, item.category, item.tags]
    );
  }

  const stored = await pool.query('SELECT * FROM menu_items WHERE menu_id = $1 ORDER BY name', [menuId]);
  return res.status(201).json({ menuId, items: stored.rows });
});

// POST /api/upload/sample — seed a demo restaurant + menu
router.post('/sample', async (req, res) => {
  try {
    // Find or create a sample restaurant owned by the first admin (or null)
    let restaurant = await pool.query('SELECT id FROM restaurants WHERE name = $1', ['The Menu Lab']);
    let restaurantId;
    if (restaurant.rowCount) {
      restaurantId = restaurant.rows[0].id;
    } else {
      const admin = await pool.query("SELECT id FROM users WHERE role = 'restaurant_admin' LIMIT 1");
      const ownerId = admin.rows[0]?.id || null;
      const inserted = await pool.query(
        'INSERT INTO restaurants (name, location, owner_id) VALUES ($1,$2,$3) RETURNING id',
        ['The Menu Lab', 'Edinburgh, UK', ownerId]
      );
      restaurantId = inserted.rows[0].id;
    }

    const sampleText = `STARTERS
Soup of the Day - Roast tomato and basil, served with sourdough bread. £6.50
Garlic Prawns - Pan-fried prawns in garlic butter with chilli. £8.90
Halloumi Fries - Crispy halloumi with honey drizzle. £7.20

MAINS
Fish and Chips - Beer-battered haddock, triple-cooked chips, tartare sauce. £15.50
Margherita Pizza - San Marzano tomato, mozzarella, fresh basil. £12.00
Chicken Katsu Curry - Panko chicken, jasmine rice, katsu sauce. £14.50
Mushroom Risotto - Arborio rice, porcini, parmesan, truffle oil. £13.80
Beef Burger - 6oz patty, cheddar, brioche bun, fries. £14.90

DESSERTS
Chocolate Brownie - Warm brownie, vanilla ice cream. £6.50
Lemon Tart - Shortcrust pastry, lemon curd, creme fraiche. £6.80
`;

    const menuResult = await pool.query(
      'INSERT INTO menus (restaurant_id, upload_type, raw_menu_text) VALUES ($1,$2,$3) RETURNING id',
      [restaurantId, 'text', sampleText]
    );
    const menuId = menuResult.rows[0].id;

    const items = parseMenuText(sampleText);
    for (const item of items) {
      await pool.query(
        `INSERT INTO menu_items (menu_id, name, description, price, allergens, calories, category, tags)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [menuId, item.name, item.description, item.price, item.allergens, item.calories, item.category, item.tags]
      );
    }

    return res.status(201).json({ restaurantId, menuId, itemCount: items.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;