const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', 'admin', '.env.local');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  require('dotenv').config();
}

const INITIAL_INVENTORY = [
  {
    id: 'inv-1',
    itemName: 'Signature Espresso Beans (Ethiopia Yirgacheffe)',
    sku: 'BEANS-ETH-01',
    category: 'ingredient',
    unit: 'kg',
    currentStock: 45.5,
    minThreshold: 10.0,
    costPerUnit: 28.50
  },
  {
    id: 'inv-2',
    itemName: 'Organic Whole Milk',
    sku: 'DAIRY-MILK-01',
    category: 'ingredient',
    unit: 'litres',
    currentStock: 60.0,
    minThreshold: 15.0,
    costPerUnit: 3.20
  },
  {
    id: 'inv-3',
    itemName: 'Oat Barista Milk',
    sku: 'DAIRY-OAT-01',
    category: 'ingredient',
    unit: 'litres',
    currentStock: 35.0,
    minThreshold: 10.0,
    costPerUnit: 4.50
  },
  {
    id: 'inv-4',
    itemName: 'Ceremonial Uji Matcha Powder',
    sku: 'TEA-MATCHA-01',
    category: 'ingredient',
    unit: 'kg',
    currentStock: 4.2,
    minThreshold: 2.0,
    costPerUnit: 95.00
  },
  {
    id: 'inv-5',
    itemName: 'Vanilla Bean Artisan Syrup',
    sku: 'SYRUP-VAN-01',
    category: 'ingredient',
    unit: 'litres',
    currentStock: 8.0,
    minThreshold: 5.0,
    costPerUnit: 14.00
  },
  {
    id: 'inv-6',
    itemName: 'French Butter Croissant Dough',
    sku: 'BAKE-CRS-01',
    category: 'ingredient',
    unit: 'units',
    currentStock: 80,
    minThreshold: 20,
    costPerUnit: 1.80
  },
  {
    id: 'inv-7',
    itemName: 'Eco Craft Takeaway Cups 12oz',
    sku: 'PACK-CUP-12',
    category: 'packaging',
    unit: 'units',
    currentStock: 8.0, // Trigger low stock (< 10)
    minThreshold: 15.0,
    costPerUnit: 0.18
  }
];

const INITIAL_SETTINGS = {
  general: {
    cafeName: 'Cafe Aura',
    tagline: 'Artisanal Coffee & Gourmet Bistro',
    email: 'contact@cafeaura.com',
    phone: '+1 (555) 987-6543',
    address: '428 Artisan Boulevard, Coffee District, Metropolis',
    currency: '₹',
    currencyCode: 'INR',
    taxPercentage: 5.0,
    deliveryFee: 40.0,
    minOrderAmount: 150.0
  },
  hours: [
    { day: 'Monday', open: '07:00 AM', close: '09:00 PM', isClosed: false },
    { day: 'Tuesday', open: '07:00 AM', close: '09:00 PM', isClosed: false },
    { day: 'Wednesday', open: '07:00 AM', close: '09:00 PM', isClosed: false },
    { day: 'Thursday', open: '07:00 AM', close: '09:00 PM', isClosed: false },
    { day: 'Friday', open: '07:00 AM', close: '10:30 PM', isClosed: false },
    { day: 'Saturday', open: '08:00 AM', close: '10:30 PM', isClosed: false },
    { day: 'Sunday', open: '08:00 AM', close: '09:00 PM', isClosed: false }
  ],
  announcement: {
    enabled: true,
    text: '✨ Autumn Specialty: Try our new Spanish Latte with spiced whipped foam! Free shipping on orders over ₹499.',
    badge: 'Special Offer'
  }
};

async function migrateDatabase() {
  const connectionString = process.env.DATABASE_URL;
  const client = connectionString
    ? new Client({ connectionString })
    : new Client({
        user: process.env.PGUSER || 'postgres',
        host: process.env.PGHOST || 'localhost',
        database: process.env.PGDATABASE || 'cafe aura',
        password: process.env.PGPASSWORD || 'shivarth',
        port: parseInt(process.env.PGPORT || '5432', 10),
      });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL for migration...');

    // 1. Execute full schema DDL
    const schemaPath = path.join(__dirname, '..', 'admin', 'src', 'lib', 'db', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schemaSql);
    console.log('Database tables & indexes applied successfully.');

    // 2. Seed / Upsert Inventory
    for (const item of INITIAL_INVENTORY) {
      await client.query(
        `INSERT INTO inventory (id, item_name, sku, category, unit, current_stock, min_threshold, cost_per_unit)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (sku) DO UPDATE SET
           item_name = EXCLUDED.item_name,
           category = EXCLUDED.category,
           unit = EXCLUDED.unit,
           min_threshold = EXCLUDED.min_threshold,
           cost_per_unit = EXCLUDED.cost_per_unit,
           updated_at = NOW()`,
        [item.id, item.itemName, item.sku, item.category, item.unit, item.currentStock, item.minThreshold, item.costPerUnit]
      );
    }
    console.log('Inventory catalog seeded.');

    // 3. Seed / Upsert Cafe Settings
    for (const [key, value] of Object.entries(INITIAL_SETTINGS)) {
      await client.query(
        `INSERT INTO cafe_settings (key, value, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET
           value = EXCLUDED.value,
           updated_at = NOW()`,
        [key, JSON.stringify(value)]
      );
    }
    console.log('Cafe settings seeded.');

    // 4. Seed a sample production order if orders table is empty
    const orderCountRes = await client.query('SELECT COUNT(*)::int as count FROM orders');
    if (orderCountRes.rows[0].count === 0) {
      const orderId = 'ord-seed-01';
      const orderNum = 'AUR-2026-001';
      await client.query(
        `INSERT INTO orders (
           id, order_number, customer_name, customer_email, customer_phone,
           order_type, delivery_address, total_amount, discount_amount, tax_amount,
           final_amount, payment_status, payment_method, order_status, notes
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          orderId, orderNum, 'Alexander Vance', 'alexander.vance@example.com', '+1 (555) 019-2834',
          'dine_in', 'Table 04', 460.00, 0.00, 23.00, 483.00, 'paid', 'upi', 'confirmed',
          'Extra hot with oat milk please.'
        ]
      );

      await client.query(
        `INSERT INTO order_items (id, order_id, menu_item_id, item_name, unit_price, quantity, subtotal)
         VALUES 
           ('item-ord-1', $1, 'item-1', 'Aura Signature Caramel Macchiato', 220.00, 1, 220.00),
           ('item-ord-2', $1, 'item-2', 'Café Latte', 240.00, 1, 240.00)`,
        [orderId]
      );

      // Seed initial notification
      await client.query(
        `INSERT INTO notifications (id, event_type, title, message, recipient_role, is_read, deep_link, metadata)
         VALUES 
           ('notif-1', 'order_created', 'New Order Received #AUR-2026-001', 'Alexander Vance placed a Dine-in order for ₹483.00.', 'all', false, '/orders', $1),
           ('notif-2', 'low_stock', 'Low Stock Warning: Eco Craft Takeaway Cups 12oz', 'Current stock (8 units) is below minimum threshold (15 units).', 'manager', false, '/inventory', $2)`,
        [
          JSON.stringify({ orderId, orderNumber: orderNum, amount: 483.00 }),
          JSON.stringify({ sku: 'PACK-CUP-12', currentStock: 8, threshold: 15 })
        ]
      );
      console.log('Sample order and notification records seeded.');
    }

    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrateDatabase();
