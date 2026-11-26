-- Fix array columns in sessions table
ALTER TABLE sessions ALTER COLUMN viewed_items TYPE TEXT[] USING viewed_items::TEXT[];
ALTER TABLE sessions ALTER COLUMN allergen_filtered_items TYPE TEXT[] USING allergen_filtered_items::TEXT[];
ALTER TABLE sessions ALTER COLUMN manually_removed_items TYPE TEXT[] USING manually_removed_items::TEXT[];
ALTER TABLE sessions ALTER COLUMN shortlisted_items TYPE TEXT[] USING shortlisted_items::TEXT[];

-- Fix array columns in menu_items table
ALTER TABLE menu_items ALTER COLUMN allergens TYPE TEXT[] USING allergens::TEXT[];
ALTER TABLE menu_items ALTER COLUMN tags TYPE TEXT[] USING tags::TEXT[];

-- Insert seed data with proper array syntax
INSERT INTO menu_items (menu_id, name, description, price, allergens, calories, category, tags)
VALUES (1, 'Grilled Salmon', 'Fresh Scottish salmon with herbs', 18.50, ARRAY['fish']::TEXT[], 420, 'main', ARRAY['gluten-free']::TEXT[]);

INSERT INTO menu_items (menu_id, name, description, price, allergens, calories, category, tags)
VALUES (1, 'Beef Burger', 'Angus beef with cheddar', 14.00, ARRAY['gluten', 'dairy']::TEXT[], 650, 'main', ARRAY[]::TEXT[]);

INSERT INTO menu_items (menu_id, name, description, price, allergens, calories, category, tags)
VALUES (1, 'Caesar Salad', 'Romaine with parmesan', 9.50, ARRAY['dairy', 'egg']::TEXT[], 280, 'starter', ARRAY['vegetarian']::TEXT[]);

-- Insert sessions with proper array syntax
INSERT INTO sessions (user_id, restaurant_id, viewed_items, allergen_filtered_items, manually_removed_items, shortlisted_items, final_choice)
VALUES (1, 1, ARRAY[1,2,3]::TEXT[], ARRAY[1]::TEXT[], ARRAY[]::TEXT[], ARRAY[1,3]::TEXT[], 1);

INSERT INTO sessions (user_id, restaurant_id, viewed_items, allergen_filtered_items, manually_removed_items, shortlisted_items, final_choice)
VALUES (2, 1, ARRAY[1,2,3]::TEXT[], ARRAY[2]::TEXT[], ARRAY[3]::TEXT[], ARRAY[1]::TEXT[], 1);

-- Update menu_items to have restaurant_id column for admin metrics query
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS restaurant_id INTEGER REFERENCES restaurants(id);
UPDATE menu_items SET restaurant_id = 1 WHERE restaurant_id IS NULL;