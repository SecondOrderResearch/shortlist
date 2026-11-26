-- ShortList seed data for Oracle Cloud VM (drawing-game pattern)
-- Seeded 2026-11-25

CREATE TABLE IF NOT EXISTS restaurants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    owner_id TEXT
);

CREATE TABLE IF NOT EXISTS menus (
    id TEXT PRIMARY KEY,
    restaurant_id TEXT NOT NULL,
    upload_type TEXT,
    raw_menu_text TEXT
);

CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY,
    restaurant_id TEXT NOT NULL,
    item_id TEXT,
    name TEXT,
    description TEXT,
    price NUMERIC(10,2),
    allergens TEXT,
    category TEXT,
    tags TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    totalViews INTEGER DEFAULT 0,
    shortlisted INTEGER DEFAULT 0,
    removed INTEGER DEFAULT 0,
    filtered INTEGER DEFAULT 0,
    finalChoice INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    restaurant_id TEXT,
    viewed_items TEXT[],
    shortlisted_items TEXT[],
    manually_removed_items TEXT[],
    allergen_filtered_items TEXT[],
    final_choice TEXT
);

INSERT INTO restaurants (id, name, location, owner_id) VALUES ('5d2dd757-9e80-416e-867e-ee0ca24d3851', 'The Menu Lab', 'Edinburgh, UK', '214d640f-16ff-4fef-962e-1e7ca85f1926');

INSERT INTO menus (id, restaurant_id, upload_type, raw_menu_text) VALUES
  ('91aedf04-c30b-4e84-bc8a-2c4204c70478', '5d2dd757-9e80-416e-867e-ee0ca24d3851', 'text',
   'STARTERS\nSoup of the Day - Roast tomato and basil, served with sourdough bread. £6.50\nGarlic Prawns - Pan-fried prawns in garlic butter with chilli. £8.90\nHalloumi Fries - Crispy halloumi with honey drizzle. £7.20\n\nMAINS\nFish and Chips - Beer-battered haddock, triple-cooked chips, tartare sauce. £15.50\nMargherita Pizza - San Marzano tomato, mozzarella, fresh basil. £12.00\nChicken Katsu Curry - Panko chicken, jasmine rice, katsu sauce. £14.50\nMushroom Risotto - Arborio rice, porcini, parmesan, truffle oil. £13.80\nBeef Burger - 6oz patty, cheddar, brioche bun, fries. £14.90\n\nDESSERTS\nChocolate Brownie - Warm brownie, vanilla ice cream'),
  ('91aedf04-c30b-4e84-bc8a-2c4204c70478', '5d2dd757-9e80-416e-867e-ee0ca24d3851', 'text', ''),
  ('91aedf04-c30b-4e84-bc8a-2c4204c70478', '5d2dd757-9e80-416e-867e-ee0ca24d3851', 'text', ''),
  ('91aedf04-c30b-4e84-bc8a-2c4204c70478', '5d2dd757-9e80-416e-867e-ee0ca24d3851', 'text', ''),
  ('91aedf04-c30b-4e84-bc8a-2c4204c70478', '5d2dd757-9e80-416e-867e-ee0ca24d3851', 'text', ''),
  ('91aedf04-c30b-4e84-bc8a-2c4204c70478', '5d2dd757-9e80-416e-867e-ee0ca24d3851', 'text', '');

INSERT INTO menu_items (id, restaurant_id, item_id, name, description, price, allergens, category, tags, created_at, totalViews, shortlisted, removed, filtered, finalChoice) VALUES ('m1', '5d2dd757-9e80-416e-867e-ee0ca24d3851', '91aedf04-c30b-4e84-bc8a-2c4204c70478', 'Soup of the Day', 'Roast tomato and basil, sourdough bread', 6.50, 'none','main','starter');
INSERT INTO menu_items (id, restaurant_id, item_id, name, description, price, allergens, category, tags, created_at, totalViews, shortlisted, removed, filtered, finalChoice) VALUES ('m2', '5d2dd757-9e80-416e-867e-ee0ca24d3851', '91aedf04-c30b-4e84-bc8a-2c4204c70478', 'Garlic Prawns', 'Pan-fried prawns in garlic butter with chilli', 8.90, 'none','main','starter');
INSERT INTO menu_items (id, restaurant_id, item_id, name, description, price, allergens, category, tags, created_at, totalViews, shortlisted, removed, filtered, finalChoice) VALUES ('m3', '5d2dd757-9e80-416e-867e-ee0ca24d3851', '91aedf04-c30b-4e84-bc8a-2c4204c70478', 'Halloumi Fries', 'Crispy halloumi with honey drizzle', 7.20, 'none','main','starter');
INSERT INTO menu_items (id, restaurant_id, item_id, name, description, price, allergens, category, tags, created_at, totalViews, shortlisted, removed, filtered, finalChoice) VALUES ('m4', '5d2dd757-9e80-416e-867e-ee0ca24d3851', '91aedf04-c30b-4e84-bc8a-2c4204c70478', 'Fish and Chips', 'Beer-battered haddock, triple-cooked chips, tartare sauce', 15.50, 'none','main','starter');
INSERT INTO menu_items (id, restaurant_id, item_id, name, description, price, allergens, category, tags, created_at, totalViews, shortlisted, removed, filtered, finalChoice) VALUES ('m5', '5d2dd757-9e80-416e-867e-ee0ca24d3851', '91aedf04-c30b-4e84-bc8a-2c4204c70478', 'Margherita Pizza', 'San Marzano tomato, mozzarella, fresh basil', 12.00, 'none','main','starter');
INSERT INTO menu_items (id, restaurant_id, item_id, name, description, price, allergens, category, tags, created_at, totalViews, shortlisted, removed, filtered, finalChoice) VALUES ('m6', '5d2dd757-9e80-416e-867e-ee0ca24d3851', '91aedf04-c30b-4e84-bc8a-2c4204c70478', 'Chicken Katsu Curry', 'Panko chicken, jasmine rice, katsu sauce', 14.50, 'none','main','starter');
INSERT INTO menu_items (id, restaurant_id, item_id, name, description, price, allergens, category, tags, created_at, totalViews, shortlisted, removed, filtered, finalChoice) VALUES ('m7', '5d2dd757-9e80-416e-867e-ee0ca24d3851', '91aedf04-c30b-4e84-bc8a-2c4204c70478', 'Mushroom Risotto', 'Arborio rice, porcini, parmesan, truffle oil', 13.80, 'none','main','starter');
INSERT INTO menu_items (id, restaurant_id, item_id, name, description, price, allergens, category, tags, created_at, totalViews, shortlisted, removed, filtered, finalChoice) VALUES ('m8', '5d2dd757-9e80-416e-867e-ee0ca24d3851', '91aedf04-c30b-4e84-bc8a-2c4204c70478', 'Beef Burger', '6oz patty, cheddar, brioche bun, fries', 14.90, 'none','main','starter');
INSERT INTO menu_items (id, restaurant_id, item_id, name, description, price, allergens, category, tags, created_at, totalViews, shortlisted, removed, filtered, finalChoice) VALUES ('m9', '5d2dd757-9e80-416e-867e-ee0ca24d3851', '91aedf04-c30b-4e84-bc8a-2c4204c70478', 'Chocolate Brownie', 'Warm brownie, vanilla ice cream', 5.00, 'none','dessert','starter');

INSERT INTO sessions (id, restaurant_id, viewed_items, shortlisted_items, manually_removed_items, allergen_filtered_items, final_choice) VALUES ('s1', '5d2dd757-9e80-416e-867e-ee0ca24d3851', ARRAY['m1']::text[], ARRAY['m1']::text[], ARRAY[]::text[], ARRAY[]::text[], 'm1');
INSERT INTO sessions (id, restaurant_id, viewed_items, shortlisted_items, manually_removed_items, allergen_filtered_items, final_choice) VALUES ('s2', '5d2dd757-9e80-416e-867e-ee0ca24d3851', ARRAY['m1','m2','m3','m4','m5','m6']::text[], ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], NULL);
