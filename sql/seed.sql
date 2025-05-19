-- Insert initial products
INSERT INTO products (id, name, category, price, stock, initial_stock, image, is_limited)
VALUES 
('og-walnut', 'OG Walnut', 'nut', 50, 40, 40, '/placeholder.svg?height=100&width=100', false),
('pecan-pie', 'Pecan Pie', 'nut', 60, 40, 40, '/placeholder.svg?height=100&width=100', false),
('coco-chia', 'Coco Chia', 'oat', 45, 40, 40, '/placeholder.svg?height=100&width=100', false),
('pb-choco', 'PB Choco', 'oat', 50, 40, 40, '/placeholder.svg?height=100&width=100', false),
('miso-cc', 'Miso CC', 'new', 45, 40, 40, '/placeholder.svg?height=100&width=100', false),
('rye-cc', 'Rye CC', 'new', 40, 10, 10, '/placeholder.svg?height=100&width=100', true)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  stock = EXCLUDED.stock,
  initial_stock = EXCLUDED.initial_stock,
  image = EXCLUDED.image,
  is_limited = EXCLUDED.is_limited;

-- Insert default bake sale period
INSERT INTO bake_sale_periods (id, name, start_date, end_date, is_active)
VALUES 
('default', 'Default Period', '2023-01-01', '2025-12-31', true)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  is_active = EXCLUDED.is_active;
