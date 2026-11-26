-- users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- password_resets
CREATE TABLE IF NOT EXISTS password_resets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- restaurants
CREATE TABLE IF NOT EXISTS restaurants (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  owner_id INTEGER NOT NULL REFERENCES users(id)
);

-- menus
CREATE TABLE IF NOT EXISTS menus (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
  upload_type TEXT NOT NULL DEFAULT 'text',
  raw_menu_text TEXT
);

-- menu_items
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  menu_id INTEGER NOT NULL REFERENCES menus(id),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  allergens TEXT[] DEFAULT ARRAY[''],
  calories INTEGER,
  category TEXT,
  tags TEXT[] DEFAULT ARRAY[''],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- sessions
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
  viewed_items TEXT[] DEFAULT ARRAY[''],
  allergen_filtered_items TEXT[] DEFAULT ARRAY[''],
  manually_removed_items TEXT[] DEFAULT ARRAY[''],
  shortlisted_items TEXT[] DEFAULT ARRAY[''],
  final_choice TEXT,
  session_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert admin user
INSERT INTO users (name, email, password_hash, role) VALUES ('Admin', 'admin@shortlist.test', '$2a$10$8CWtTruRDaYtvSkSGpZ/3ughQsB5zqq1SZVoDG8VAaxOzB4z0W0P6', 'restaurant_admin');

-- Insert customer user
INSERT INTO users (name, email, password_hash, role) VALUES ('Customer', 'customer@shortlist.test', '$2a$10$8CWtTruRDaYtvSkSGpZ/3ughQsB5zqq1SZVoDG8VAaxOzB4z0W0P6', 'customer');

-- Seed restaurant
INSERT INTO restaurants (id, name, location, owner_id) VALUES (1, 'The Menu Lab', 'London', 1);

-- Insert menu (menu id 1 = The Menu Lab)
INSERT INTO menus (id, restaurant_id, upload_type, raw_menu_text) VALUES (1, 1, 'text', 'The Menu Lab');

-- Insert menu item
INSERT INTO menu_items (id, menu_id, name, description, price, allergens, calories, category, tags, created_at) VALUES (1, 1, 'Item 1', 'desc', 0, [], 0, 'main', [], '2026-11-26');

-- Insert session for admin viewing item
INSERT INTO sessions (user_id, restaurant_id, viewed_items, allergen_filtered_items, manually_removed_items, shortlisted_items, final_choice, session_timestamp) VALUES (1, 1, ['item1'], [], [], [], undefined, '2026-11-26T00:00:00Z');

-- Insert session for customer viewing item
INSERT INTO sessions (user_id, restaurant_id, viewed_items, allergen_filtered_items, manually_removed_items, shortlisted_items, final_choice, session_timestamp) VALUES (2, 1, ['item1'], [], [], [], undefined, '2026-11-26T00:00:00Z');

-- Insert menu item for item1
INSERT INTO menu_items (menu_id, name, description, price, allergens, calories, category, tags, created_at) VALUES (1, 'Item 1', 'desc', 0, [], 0, 'main', [], '2026-11-26');
