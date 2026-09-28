import fs from 'fs';
let c = fs.readFileSync('src/App.jsx', 'utf8');
const dup = `  '/Charming Floral Coffee Shop.jpg',\r\n  '/Dinner date.jpg',\r\n  '/Inspirational Quotes and Productivity Tips for a Success Mindset.jpg',\r\n  '/Sunflower Summer Mood 🌻 Cozy Coffee, Books & Warm Late Summer Vibes.jpg',\r\n`;
c = c.replace(dup + dup, dup);
fs.writeFileSync('src/App.jsx', c);
