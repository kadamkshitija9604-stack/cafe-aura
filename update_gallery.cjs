const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');
const newImages = `const GALLERY = [
  '/Charming Floral Coffee Shop.jpg',
  '/Dinner date.jpg',
  '/Inspirational Quotes and Productivity Tips for a Success Mindset.jpg',
  '/Sunflower Summer Mood 🌻 Cozy Coffee, Books & Warm Late Summer Vibes.jpg',
  `;
content = content.replace('const GALLERY = [\r\n  ', newImages).replace('const GALLERY = [\n  ', newImages);
fs.writeFileSync('src/App.jsx', content);
