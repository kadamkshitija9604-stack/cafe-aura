const fs = require('fs');
const file = 'c:/Users/win11/Downloads/New folder (2)/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace('Brocelé<small>Café &amp; Roastery</small>', 'Cafe Aura<small>Café &amp; Roastery</small>');
fs.writeFileSync(file, content);
console.log('done');
