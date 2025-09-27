-- Insert default roles
INSERT INTO roles (name, description, created_at, updated_at) VALUES 
('Admin', 'Full system access including user management', NOW(), NOW()),
('Manager', 'Can manage inventory and send reports', NOW(), NOW()),
('Viewer', 'Can only view inventory items', NOW(), NOW());

-- Insert default admin user (password: admin123)
-- Note: You'll need to generate the actual bcrypt hash
INSERT INTO users (
  username, 
  email, 
  password_hash, 
  role_id, 
  is_active, 
  created_at, 
  updated_at
) VALUES (
  'admin@empite.com', 
  'admin@empite.com', 
  '$2b$12$placeholder_hash_will_be_generated_in_code', 
  1, 
  true, 
  NOW(), 
  NOW()
);

-- Insert sample inventory items (optional)
INSERT INTO inventory_items (
  name, 
  description, 
  quantity, 
  unit_price, 
  sku, 
  created_by_id, 
  updated_by_id, 
  created_at, 
  updated_at
) VALUES 
('Laptop Dell XPS 13', 'High-performance ultrabook', 25, 1299.99, 'DELL-XPS13-001', 1, 1, NOW(), NOW()),
('Wireless Mouse', 'Ergonomic wireless mouse', 150, 29.99, 'MOUSE-WL-001', 1, 1, NOW(), NOW()),
('Office Chair', 'Ergonomic office chair with lumbar support', 12, 299.99, 'CHAIR-ERG-001', 1, 1, NOW(), NOW()),
('Monitor 24"', '24-inch Full HD monitor', 35, 199.99, 'MON-24-FHD-001', 1, 1, NOW(), NOW()),
('Keyboard Mechanical', 'RGB mechanical gaming keyboard', 78, 89.99, 'KB-MECH-RGB-001', 1, 1, NOW(), NOW());

-- Insert sample merchants
INSERT INTO merchants (name, email, is_active, created_at, updated_at) VALUES 
('ABC Electronics', 'orders@abcelectronics.com', true, NOW(), NOW()),
('Tech Solutions Ltd', 'purchasing@techsolutions.com', true, NOW(), NOW()),
('Office Supplies Co', 'sales@officesupplies.com', true, NOW(), NOW()),
('Digital World', 'procurement@digitalworld.com', true, NOW(), NOW()),
('Business Equipment Inc', 'orders@businessequip.com', true, NOW(), NOW());