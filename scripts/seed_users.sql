-- Seed users and password resets for auth
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS password_resets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert admin user (admin@shortlist.test, role restaurant_admin)
INSERT INTO users (name, email, password_hash, role) VALUES (
    'Admin', 'admin@shortlist.test', '$2a$10$OOdm0nTOMX.ZjDy81UME4eaqxNAh1KsUJTaj6ceYTStAdIWZ67mB6', 'restaurant_admin'
);

-- Insert customer user (customer@shortlist.test, role customer)
INSERT INTO users (name, email, password_hash, role) VALUES (
    'Customer', 'customer@shortlist.test', '$2a$10$7cjmoFmYvH/9hy8vswIxvOOYagvoNX4oHAdhIWZ2vuc78qEM43UTO', 'customer'
);

-- Insert a password reset token for admin (valid for 1 hour)
INSERT INTO password_resets (user_id, token, expires_at) VALUES (
    (SELECT id FROM users WHERE email = 'admin@shortlist.test'),
    'reset_token_1234567890abcdef',
    NOW() + INTERVAL '1 hour'
);