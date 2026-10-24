-- ==========================================================
-- ANNAPOORNA CATERING DATABASE MIGRATION SCRIPT
-- PostgreSQL / Supabase Schema Definition
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  mobile VARCHAR(20) NOT NULL UNIQUE,
  alternative_mobile VARCHAR(20),
  email VARCHAR(255),
  birthday DATE,
  anniversary_date DATE,
  preferred_language VARCHAR(10) DEFAULT 'ta',
  marketing_consent BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_mobile ON customers(mobile);
CREATE INDEX IF NOT EXISTS idx_customers_consent ON customers(marketing_consent);

-- 2. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(32) PRIMARY KEY,
  customer_id VARCHAR(32) REFERENCES customers(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  alternative_mobile VARCHAR(20),
  order_source VARCHAR(50) DEFAULT 'Website',
  event_address TEXT NOT NULL,
  event_type VARCHAR(100),
  order_date DATE NOT NULL,
  delivery_time VARCHAR(50),
  guest_count INTEGER,
  total_amount NUMERIC(12, 2) DEFAULT 0,
  advance_amount NUMERIC(12, 2) DEFAULT 0,
  balance_paid NUMERIC(12, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Pending',
  notes TEXT,
  admin_notes TEXT,
  invoice_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_source ON orders(order_source);

-- 3. ORDER ITEMS TABLE (With measurement units & snapshots)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id VARCHAR(32) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  dish_id VARCHAR(50) NOT NULL,
  dish_name VARCHAR(255) NOT NULL,
  category_id VARCHAR(100) NOT NULL,
  quantity NUMERIC(10, 2),
  unit VARCHAR(50),
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- 4. ORDER PAYMENTS TABLE (Split payments & installments)
CREATE TABLE IF NOT EXISTS order_payments (
  id VARCHAR(64) PRIMARY KEY,
  order_id VARCHAR(32) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  date DATE NOT NULL,
  method VARCHAR(50) NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_payments_order_id ON order_payments(order_id);

-- 5. DISHES TABLE (Admin added dishes & custom unit overrides)
CREATE TABLE IF NOT EXISTS dishes (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category_id VARCHAR(100) NOT NULL,
  image TEXT,
  is_admin_added BOOLEAN DEFAULT FALSE,
  default_unit VARCHAR(50),
  supported_units TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CAMPAIGNS & GREETINGS TABLE
CREATE TABLE IF NOT EXISTS campaigns (
  id VARCHAR(32) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  language VARCHAR(10) NOT NULL,
  message_template TEXT NOT NULL,
  recipient_filter VARCHAR(50) NOT NULL,
  recipient_ids TEXT[],
  recipient_count INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'Ready',
  channel VARCHAR(50) DEFAULT 'whatsapp_direct',
  notes TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. RENTAL CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS rental_categories (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  name_ta VARCHAR(255) NOT NULL,
  description TEXT
);

-- 9. RENTAL ITEMS INVENTORY TABLE
CREATE TABLE IF NOT EXISTS rental_items (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name_en VARCHAR(255) NOT NULL,
  name_ta VARCHAR(255) NOT NULL,
  category_id VARCHAR(64) REFERENCES rental_categories(id),
  total_quantity INTEGER NOT NULL DEFAULT 0,
  rental_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  pricing_unit VARCHAR(50) NOT NULL DEFAULT 'Per Day',
  security_deposit NUMERIC(10, 2) DEFAULT 0,
  description TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- 10. RENTAL DOCUMENTS / TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS rental_documents (
  id VARCHAR(64) PRIMARY KEY,
  rental_number VARCHAR(50) NOT NULL UNIQUE,
  customer_name VARCHAR(255) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  address TEXT,
  function_name VARCHAR(255),
  document_date DATE NOT NULL,
  function_date DATE NOT NULL,
  rental_start_date DATE NOT NULL,
  expected_return_date DATE NOT NULL,
  actual_return_date DATE,
  delivery_details TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
  additional_charges NUMERIC(10, 2) DEFAULT 0,
  discount NUMERIC(10, 2) DEFAULT 0,
  security_deposit NUMERIC(10, 2) DEFAULT 0,
  grand_total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  advance_paid NUMERIC(10, 2) DEFAULT 0,
  balance_due NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'Confirmed',
  notes TEXT,
  terms TEXT,
  preferred_language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- 11. RENTAL RLS POLICIES
ALTER TABLE rental_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin all rental_categories" ON rental_categories FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin all rental_items" ON rental_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin all rental_documents" ON rental_documents FOR ALL TO authenticated USING (true);

