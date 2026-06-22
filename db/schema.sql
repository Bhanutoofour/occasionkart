CREATE TABLE products (
  id TEXT PRIMARY KEY,
  sort_order INTEGER NOT NULL DEFAULT 0,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  flavor TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  serves TEXT NOT NULL,
  lead_time TEXT NOT NULL,
  image TEXT NOT NULL,
  accent TEXT NOT NULL,
  highlights TEXT[] NOT NULL DEFAULT '{}',
  categories TEXT[] NOT NULL DEFAULT '{}',
  weight_options JSONB NOT NULL DEFAULT '[]'::jsonb,
  flavor_options JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  user_id TEXT,
  status TEXT NOT NULL CHECK (
    status IN (
      'pending',
      'confirmed',
      'preparing',
      'out_for_delivery',
      'delivered',
      'cancelled'
    )
  ),
  payment_status TEXT NOT NULL CHECK (
    payment_status IN ('pending', 'paid', 'failed', 'refunded')
  ),
  source TEXT NOT NULL CHECK (source IN ('web', 'whatsapp', 'phone', 'walk_in')),
  customer_full_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  delivery_date TEXT NOT NULL,
  delivery_slot TEXT,
  delivery_address TEXT NOT NULL,
  delivery_city TEXT NOT NULL DEFAULT 'Hyderabad',
  cake_message TEXT,
  notes TEXT,
  subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
  delivery_fee INTEGER NOT NULL CHECK (delivery_fee >= 0),
  total INTEGER NOT NULL CHECK (total >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  image TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  variant_key TEXT,
  selected_weight_id TEXT,
  selected_weight_label TEXT,
  selected_weight_kilograms NUMERIC(10,2),
  selected_flavor_id TEXT,
  selected_flavor_label TEXT,
  flavor_price_per_kg INTEGER,
  unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
  line_total INTEGER NOT NULL CHECK (line_total >= 0),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE product_images (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  source TEXT NOT NULL DEFAULT 'wordpress-import',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE UNIQUE INDEX idx_product_images_unique ON product_images(product_id, image_url);
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
