-- Create enums for consistent data types
CREATE TYPE category_type AS ENUM ('income', 'expense', 'transfer');
CREATE TYPE budget_period AS ENUM ('monthly', 'yearly');
CREATE TYPE alert_severity AS ENUM ('low', 'medium', 'high');
CREATE TYPE notification_position AS ENUM ('top-start', 'top-end', 'bottom-start', 'bottom-end');
CREATE TYPE backup_frequency AS ENUM ('daily', 'weekly', 'monthly', 'never');
CREATE TYPE export_format AS ENUM ('csv', 'excel', 'pdf', 'json');
CREATE TYPE number_format AS ENUM ('comma', 'dot', 'space');
CREATE TYPE category_sort_order AS ENUM ('alphabetical', 'mostUsed', 'custom');

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tables
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type category_type NOT NULL,
    color VARCHAR(50),
    parent_id INTEGER REFERENCES categories(id),
    path VARCHAR(255),
    level INTEGER,
    description TEXT,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER REFERENCES users(id) NOT NULL
);

CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER REFERENCES users(id) NOT NULL
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    description TEXT,
    amount DECIMAL(15,2) NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    account_id INTEGER REFERENCES accounts(id),
    date TIMESTAMP NOT NULL,
    type category_type NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER REFERENCES users(id) NOT NULL
);

CREATE TABLE budgets (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id),
    amount DECIMAL(15,2) NOT NULL,
    period budget_period NOT NULL,
    start_date DATE NOT NULL,
    rollover BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER REFERENCES users(id) NOT NULL
);

CREATE TABLE user_settings (
    id SERIAL PRIMARY KEY,
    privacy_settings JSONB DEFAULT '{}',
    browser_notifications BOOLEAN DEFAULT true,
    version VARCHAR(20),
    last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    currency VARCHAR(10) DEFAULT 'USD',
    language VARCHAR(10) DEFAULT 'en',
    theme VARCHAR(10) DEFAULT 'light',
    savings_goal DECIMAL(15,2),
    notifications_enabled BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    budget_alert_threshold INTEGER DEFAULT 80,
    date_format VARCHAR(20) DEFAULT 'YYYY-MM-DD',
    time_zone VARCHAR(50) DEFAULT 'UTC',
    week_start_day VARCHAR(10) DEFAULT 'monday',
    number_format number_format DEFAULT 'dot',
    default_transaction_type category_type DEFAULT 'expense',
    dashboard_refresh_rate INTEGER DEFAULT 300,
    export_format export_format DEFAULT 'csv',
    backup_frequency backup_frequency DEFAULT 'daily',
    privacy_mode BOOLEAN DEFAULT false,
    default_account INTEGER REFERENCES accounts(id),
    category_sort_order category_sort_order DEFAULT 'alphabetical',
    expense_reminder_days INTEGER DEFAULT 3,
    auto_dismiss_notifications BOOLEAN DEFAULT true,
    notification_dismiss_delay INTEGER DEFAULT 5000,
    notification_position notification_position DEFAULT 'top-end',
    keyboard_shortcuts_enabled BOOLEAN DEFAULT true,
    user_id INTEGER REFERENCES users(id) UNIQUE NOT NULL
);

-- Insert sample data
INSERT INTO users (email, password_hash, first_name, last_name) VALUES
('demo@example.com', '$2a$10$demohashedpassword', 'Demo', 'User');

INSERT INTO categories (name, type, color, description, icon, user_id) VALUES
('Salary', 'income', '#4CAF50', 'Monthly salary', 'cash', 1),
('Groceries', 'expense', '#FF5722', 'Food and household items', 'shopping-cart', 1),
('Rent', 'expense', '#2196F3', 'Monthly rent payment', 'home', 1),
('Utilities', 'expense', '#FFC107', 'Electricity, water, gas', 'flash', 1),
('Entertainment', 'expense', '#9C27B0', 'Movies, games, etc.', 'movie', 1);

INSERT INTO accounts (name, balance, user_id) VALUES
('Main Checking', 5000.00, 1),
('Savings Account', 10000.00, 1),
('Credit Card', -500.00, 1);

INSERT INTO transactions (description, amount, category_id, account_id, date, type, user_id) VALUES
('Monthly Salary', 5000.00, 1, 1, CURRENT_DATE - INTERVAL '1 day', 'income', 1),
('Grocery Shopping', -200.00, 2, 1, CURRENT_DATE, 'expense', 1),
('Rent Payment', -1500.00, 3, 1, CURRENT_DATE - INTERVAL '2 days', 'expense', 1),
('Electricity Bill', -100.00, 4, 1, CURRENT_DATE - INTERVAL '3 days', 'expense', 1),
('Movie Night', -50.00, 5, 3, CURRENT_DATE - INTERVAL '4 days', 'expense', 1);

INSERT INTO budgets (category_id, amount, period, start_date, rollover, description, user_id) VALUES
(2, 500.00, 'monthly', DATE_TRUNC('month', CURRENT_DATE), false, 'Monthly grocery budget', 1),
(3, 1500.00, 'monthly', DATE_TRUNC('month', CURRENT_DATE), false, 'Monthly rent budget', 1),
(4, 200.00, 'monthly', DATE_TRUNC('month', CURRENT_DATE), false, 'Monthly utilities budget', 1),
(5, 300.00, 'monthly', DATE_TRUNC('month', CURRENT_DATE), false, 'Monthly entertainment budget', 1);

INSERT INTO user_settings (
    currency,
    language,
    theme,
    savings_goal,
    notifications_enabled,
    privacy_mode,
    user_id
) VALUES (
    'USD',
    'en',
    'light',
    20000.00,
    true,
    false,
    1
);

-- Add composite unique constraints
ALTER TABLE categories ADD CONSTRAINT unique_category_name_per_user UNIQUE (user_id, name);
ALTER TABLE accounts ADD CONSTRAINT unique_account_name_per_user UNIQUE (user_id, name);
