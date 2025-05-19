-- Create products table
CREATE TABLE IF NOT EXISTS products (
id TEXT PRIMARY KEY,
name TEXT NOT NULL,
category TEXT NOT NULL,
price DECIMAL(10, 2) NOT NULL,
stock INTEGER NOT NULL,
initial_stock INTEGER NOT NULL,
image TEXT NOT NULL,
is_limited BOOLEAN DEFAULT FALSE,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bake_sale_periods table
CREATE TABLE IF NOT EXISTS bake_sale_periods (
id TEXT PRIMARY KEY,
name TEXT NOT NULL,
start_date TIMESTAMP WITH TIME ZONE NOT NULL,
end_date TIMESTAMP WITH TIME ZONE NOT NULL,
is_active BOOLEAN DEFAULT FALSE,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
id TEXT PRIMARY KEY,
customer_name TEXT NOT NULL,
contact_number TEXT NOT NULL,
is_pickup BOOLEAN NOT NULL,
delivery_address TEXT,
delivery_time TEXT,
total_items INTEGER NOT NULL,
subtotal DECIMAL(10, 2) NOT NULL,
discount DECIMAL(10, 2) NOT NULL,
total DECIMAL(10, 2) NOT NULL,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
status TEXT NOT NULL,
is_paid BOOLEAN DEFAULT FALSE,
payment_method TEXT,
reference_number TEXT,
bake_sale_period_id TEXT,
source_image TEXT,
FOREIGN KEY (bake_sale_period_id) REFERENCES bake_sale_periods(id)
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
id SERIAL PRIMARY KEY,
order_id TEXT NOT NULL,
product_id TEXT NOT NULL,
quantity INTEGER NOT NULL,
price DECIMAL(10, 2) NOT NULL,
total DECIMAL(10, 2) NOT NULL,
FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_bake_sale_period ON orders(bake_sale_period_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
