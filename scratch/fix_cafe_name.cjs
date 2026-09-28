const fs = require('fs');
const path = 'c:/Users/win11/Downloads/New folder (2)/src/App.jsx';
let content = fs.readFileSync(path, 'utf8');
content = content.replace('<div>Cafe Aura.com<small>Café &amp; Roastery</small></div>', '<div>Cafe Aura<small>Café &amp; Roastery</small></div>');
fs.writeFileSync(path, content, 'utf8');
console.log("Replaced Cafe name successfully!");
