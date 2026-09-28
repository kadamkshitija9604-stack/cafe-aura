const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables from admin/.env.local or fallback
const envPath = path.join(__dirname, '..', 'admin', '.env.local');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  require('dotenv').config();
}

const INITIAL_CATEGORIES = [
  {
    id: 'cat-coffee',
    name: 'Artisan Coffee',
    slug: 'artisan-coffee',
    description: 'Freshly roasted specialty coffee, single-origin brews & espresso classics.',
    displayOrder: 1,
    isActive: true
  },
  {
    id: 'cat-tea',
    name: 'Specialty Teas',
    slug: 'specialty-teas',
    description: 'Organic whole-leaf teas, ceremonial matcha, and calming herbal infusions.',
    displayOrder: 2,
    isActive: true
  },
  {
    id: 'cat-bakery',
    name: 'Bakery & Pastries',
    slug: 'bakery-pastries',
    description: 'Flaky croissants, sourdough toasts, artisanal muffins and brownies.',
    displayOrder: 3,
    isActive: true
  },
  {
    id: 'cat-savory',
    name: 'Savory & Brunch',
    slug: 'savory-brunch',
    description: 'Gourmet sandwiches, truffle toasts, avocado bowls and brunch platters.',
    displayOrder: 4,
    isActive: true
  },
  {
    id: 'cat-desserts',
    name: 'Desserts & Cakes',
    slug: 'desserts-cakes',
    description: 'Handcrafted cheesecakes, tiramisu cups, and warm skillet cookies.',
    displayOrder: 5,
    isActive: true
  }
];

const INITIAL_MENU_ITEMS = [
  {
    id: 'item-1',
    name: 'Aura Signature Caramel Macchiato',
    slug: 'aura-signature-caramel-macchiato',
    description: 'Fresh espresso layered with velvety steamed milk, vanilla bean syrup, and drizzled with housemade salted caramel.',
    categoryId: 'cat-coffee',
    price: 5.75,
    discountPrice: 4.95,
    imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isFeatured: true,
    prepTimeMinutes: 4,
    allergens: ['Dairy'],
    displayOrder: 1
  },
  {
    id: 'item-2',
    name: 'Spanish Latte with Condensed Milk',
    slug: 'spanish-latte-with-condensed-milk',
    description: 'Rich double espresso infused with sweetened condensed milk and silky textured whole milk.',
    categoryId: 'cat-coffee',
    price: 6.25,
    discountPrice: null,
    imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isFeatured: false,
    prepTimeMinutes: 4,
    allergens: ['Dairy'],
    displayOrder: 2
  },
  {
    id: 'item-3',
    name: 'Single Origin Ethiopia Pour-Over',
    slug: 'single-origin-ethiopia-pour-over',
    description: 'Bright and floral light roast with notes of jasmine, bergamot, and sweet stone fruit.',
    categoryId: 'cat-coffee',
    price: 6.50,
    discountPrice: null,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isFeatured: true,
    prepTimeMinutes: 6,
    allergens: [],
    displayOrder: 3
  },
  {
    id: 'item-4',
    name: 'Ceremonial Uji Matcha Latte',
    slug: 'ceremonial-uji-matcha-latte',
    description: 'First-harvest Japanese stone-ground matcha whisked with oat milk and lightly sweetened with agave.',
    categoryId: 'cat-tea',
    price: 6.00,
    discountPrice: null,
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isFeatured: true,
    prepTimeMinutes: 5,
    allergens: [],
    displayOrder: 4
  },
  {
    id: 'item-5',
    name: 'Artisan Butter Croissant',
    slug: 'artisan-butter-croissant',
    description: 'Traditional 36-layer French pastry baked fresh every morning using French cultured butter.',
    categoryId: 'cat-bakery',
    price: 4.25,
    discountPrice: 3.75,
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isFeatured: true,
    prepTimeMinutes: 2,
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    displayOrder: 5
  },
  {
    id: 'item-6',
    name: 'Truffle Mushroom Melt Sandwich',
    slug: 'truffle-mushroom-melt-sandwich',
    description: 'Pan-seared wild mushrooms, aged Gruyère, caramelized onions, and black truffle butter on rustic sourdough.',
    categoryId: 'cat-savory',
    price: 11.50,
    discountPrice: null,
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isFeatured: true,
    prepTimeMinutes: 10,
    allergens: ['Gluten', 'Dairy'],
    displayOrder: 6
  }
];

const INITIAL_STAFF = [
  {
    id: 'staff-1',
    fullName: 'Marco Rossi',
    email: 'marco.rossi@cafeaura.com',
    role: 'Head Barista & Roaster',
    phone: '+1 (555) 234-5678',
    status: 'active',
    joinedDate: '2023-04-15'
  },
  {
    id: 'staff-2',
    fullName: 'Sophia Lin',
    email: 'sophia.lin@cafeaura.com',
    role: 'Floor Manager',
    phone: '+1 (555) 345-6789',
    status: 'active',
    joinedDate: '2023-06-01'
  },
  {
    id: 'staff-3',
    fullName: 'David Gomez',
    email: 'david.gomez@cafeaura.com',
    role: 'Pastry Chef',
    phone: '+1 (555) 456-7890',
    status: 'active',
    joinedDate: '2023-09-10'
  }
];

const INITIAL_USERS = [
  {
    id: 'demo-admin-01',
    email: 'admin@cafeaura.com',
    displayName: 'Elena Rostova (Super Admin)',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    role: 'super_admin',
    status: 'active',
    providerId: 'password'
  }
];

async function initializeDatabase(password) {
  const pwd = password || process.env.PGPASSWORD || 'shivarth';
  const user = process.env.PGUSER || 'postgres';
  const host = process.env.PGHOST || 'localhost';
  const port = parseInt(process.env.PGPORT || '5432', 10);

  // 1. Connect to postgres database first to check / create cafe_aura or " cafe aura "
  const adminClient = new Client({ user, host, database: 'postgres', password: pwd, port });
  let targetDb = process.env.PGDATABASE || 'cafe aura';

  try {
    await adminClient.connect();
    const dbsRes = await adminClient.query('SELECT datname FROM pg_database WHERE datistemplate = false');
    const existingDbs = dbsRes.rows.map(r => r.datname);
    console.log('Detected PostgreSQL databases:', existingDbs);

    // If 'cafe_aura' doesn't exist but ' cafe aura ' exists, we can use ' cafe aura ' or create 'cafe_aura'
    if (existingDbs.includes(' cafe aura ')) {
      targetDb = ' cafe aura ';
    } else if (existingDbs.includes('cafe_aura')) {
      targetDb = 'cafe_aura';
    } else if (existingDbs.includes('cafe aura')) {
      targetDb = 'cafe aura';
    } else {
      console.log('Creating database "cafe_aura"...');
      await adminClient.query('CREATE DATABASE cafe_aura');
      targetDb = 'cafe_aura';
    }
    await adminClient.end();
  } catch (err) {
    console.warn('Notice while checking databases:', err.message);
    try { await adminClient.end(); } catch (e) {}
  }

  console.log(`Connecting to target database: "${targetDb}"`);
  const client = new Client({
    user,
    host,
    database: targetDb,
    password: pwd,
    port
  });

  try {
    await client.connect();
    console.log(`Connected successfully to PostgreSQL database "${targetDb}"!`);

    // 1. Read and run schema DDL
    const schemaPath = path.join(__dirname, '..', 'admin', 'src', 'lib', 'db', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schemaSql);
    console.log('Database tables verified/created successfully.');

    // 2. Seed Categories
    for (const cat of INITIAL_CATEGORIES) {
      await client.query(
        `INSERT INTO categories (id, name, slug, description, display_order, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           slug = EXCLUDED.slug,
           description = EXCLUDED.description,
           display_order = EXCLUDED.display_order,
           is_active = EXCLUDED.is_active,
           updated_at = NOW()`,
        [cat.id, cat.name, cat.slug, cat.description, cat.displayOrder, cat.isActive]
      );
    }
    console.log(`Seeded ${INITIAL_CATEGORIES.length} categories.`);

    // 3. Seed Menu Items
    for (const item of INITIAL_MENU_ITEMS) {
      await client.query(
        `INSERT INTO menu_items (id, name, slug, description, price, discount_price, category_id, is_available, is_featured, prep_time_minutes, allergens, image_url, display_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           slug = EXCLUDED.slug,
           description = EXCLUDED.description,
           price = EXCLUDED.price,
           discount_price = EXCLUDED.discount_price,
           category_id = EXCLUDED.category_id,
           is_available = EXCLUDED.is_available,
           is_featured = EXCLUDED.is_featured,
           prep_time_minutes = EXCLUDED.prep_time_minutes,
           allergens = EXCLUDED.allergens,
           image_url = EXCLUDED.image_url,
           display_order = EXCLUDED.display_order,
           updated_at = NOW()`,
        [
          item.id, item.name, item.slug, item.description, item.price,
          item.discountPrice, item.categoryId, item.isAvailable, item.isFeatured,
          item.prepTimeMinutes, item.allergens, item.imageUrl, item.displayOrder
        ]
      );
    }
    console.log(`Seeded ${INITIAL_MENU_ITEMS.length} menu items.`);

    // 4. Seed Staff
    for (const s of INITIAL_STAFF) {
      await client.query(
        `INSERT INTO staff (id, full_name, email, role, phone, status, joined_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET
           full_name = EXCLUDED.full_name,
           email = EXCLUDED.email,
           role = EXCLUDED.role,
           phone = EXCLUDED.phone,
           status = EXCLUDED.status,
           updated_at = NOW()`,
        [s.id, s.fullName, s.email, s.role, s.phone, s.status, s.joinedDate]
      );
    }
    console.log(`Seeded ${INITIAL_STAFF.length} staff members.`);

    // 5. Seed Users
    for (const u of INITIAL_USERS) {
      await client.query(
        `INSERT INTO users (id, email, display_name, photo_url, role, status, provider_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET
           email = EXCLUDED.email,
           display_name = EXCLUDED.display_name,
           photo_url = EXCLUDED.photo_url,
           role = EXCLUDED.role,
           status = EXCLUDED.status`,
        [u.id, u.email, u.displayName, u.photoUrl, u.role, u.status, u.providerId]
      );
    }
    console.log(`Seeded ${INITIAL_USERS.length} admin users.`);

    // 6. Seed initial audit log
    await client.query(
      `INSERT INTO audit_logs (id, user_id, user_name, user_email, user_role, action, resource_type, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [
        `log-${Date.now()}`,
        'demo-admin-01',
        'Elena Rostova',
        'admin@cafeaura.com',
        'super_admin',
        'SYSTEM_INITIALIZE',
        'database',
        'PostgreSQL database connected and schema initialized successfully.'
      ]
    );

    console.log('PostgreSQL migration & initialization COMPLETE!');
    await client.end();
    return true;
  } catch (err) {
    console.error('Migration failed:', err.message);
    try { await client.end(); } catch (e) {}
    return false;
  }
}

if (require.main === module) {
  const pwd = process.argv[2] || process.env.PGPASSWORD;
  initializeDatabase(pwd);
}

module.exports = { initializeDatabase };
