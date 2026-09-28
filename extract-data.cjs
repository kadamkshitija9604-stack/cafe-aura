const fs = require('fs');
const t = fs.readFileSync('src/App.jsx', 'utf8');
const start = t.indexOf('/* ---------------- DATA');
const end = t.indexOf('function Navbar');
console.log(t.substring(start, end).replace(/img:".*?"/g, 'img:"BASE64"').replace(/src=".*?"/g, 'src="BASE64"'));
