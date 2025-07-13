-- Initialize the database with products table
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop books table if it exists
DROP TABLE IF EXISTS books;

-- Create products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    premium DECIMAL(10, 2) NOT NULL,
    term INTEGER NOT NULL,
    coverage_amount DECIMAL(15, 2) NOT NULL,
    product_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_type ON products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_premium ON products(premium);

-- Insert sample insurance products
INSERT INTO products (name, description, premium, term, coverage_amount, product_type) VALUES
('Basic Life Insurance', 'Affordable life insurance with essential coverage for young professionals', 25.99, 20, 100000.00, 'life'),
('Premium Life Insurance', 'Comprehensive life insurance with enhanced benefits and higher coverage', 89.99, 30, 500000.00, 'life'),
('Term Life 10', '10-year term life insurance perfect for temporary coverage needs', 15.99, 10, 250000.00, 'life'),
('Health Plus', 'Complete health insurance coverage with preventive care benefits', 150.00, 1, 50000.00, 'health'),
('Critical Illness Cover', 'Specialized coverage for critical illness with lump sum benefits', 45.00, 5, 75000.00, 'health'),
('Auto Essential', 'Basic auto insurance coverage meeting legal requirements', 75.50, 1, 25000.00, 'auto'),
('Auto Comprehensive', 'Full auto insurance with collision and comprehensive coverage', 125.00, 1, 50000.00, 'auto'),
('Home Protection Basic', 'Essential home insurance for property protection', 120.00, 1, 300000.00, 'home'),
('Home Premium', 'Comprehensive home insurance with personal property coverage', 200.00, 1, 500000.00, 'home');
