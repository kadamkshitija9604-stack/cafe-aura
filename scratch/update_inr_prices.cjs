const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', 'admin', '.env.local');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  require('dotenv').config();
}

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:shivarth@localhost:5432/%20cafe%20aura%20'
});

const inrPriceMap = {
  'Aura Signature Caramel Macchiato': { price: 280, discount: 240 },
  'Spanish Latte with Condensed Milk': { price: 260, discount: null },
  'Single Origin Ethiopia Pour-Over': { price: 290, discount: null },
  'Ceremonial Uji Matcha Latte': { price: 310, discount: null },
  'Artisan Butter Croissant': { price: 180, discount: 150 },
  'Artisanal Butter Croissant': { price: 180, discount: 150 },
  'Truffle Mushroom Melt Sandwich': { price: 360, discount: null },
  'Truffle Mushroom Sourdough Melt': { price: 360, discount: null },
  'Cappuccino': { price: 220, discount: 190 },
  'Café Latte': { price: 240, discount: null },
  'Caramel Macchiato': { price: 260, discount: null },
  'Matcha Latte': { price: 280, discount: null },
  'Classic Tiramisu': { price: 320, discount: null },
  'Almond Croissant': { price: 210, discount: null },
  'Avocado Toast': { price: 340, discount: null },
  'Iced Americano': { price: 190, discount: null },
  'Cold Brew': { price: 230, discount: null },
  'Vanilla Bean Affogato': { price: 270, discount: null },
};

async function updatePrices() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL database.');

    const res = await client.query('SELECT id, name, price, discount_price FROM menu_items');
    console.log(`Found ${res.rows.length} menu items in database:`);

    for (const row of res.rows) {
      let newPrice = 250;
      let newDiscount = null;

      if (inrPriceMap[row.name]) {
        newPrice = inrPriceMap[row.name].price;
        newDiscount = inrPriceMap[row.name].discount;
      } else if (row.price < 20) {
        // If price was in USD like 5.75, convert to INR ~ ₹250
        newPrice = Math.round(parseFloat(row.price) * 45);
        if (row.discount_price) {
          newDiscount = Math.round(parseFloat(row.discount_price) * 45);
        }
      } else {
        newPrice = parseFloat(row.price);
        newDiscount = row.discount_price ? parseFloat(row.discount_price) : null;
      }

      await client.query(
        'UPDATE menu_items SET price = $1, discount_price = $2 WHERE id = $3',
        [newPrice, newDiscount, row.id]
      );
      console.log(`  Updated "${row.name}" (${row.id}): ₹${newPrice} (was ${row.price})`);
    }

    console.log('\n✅ All database menu items updated to Indian Rupees (INR ₹) successfully!');
    await client.end();
  } catch (err) {
    console.error('Error updating prices in database:', err);
    try { await client.end(); } catch (e) {}
  }
}

updatePrices();
