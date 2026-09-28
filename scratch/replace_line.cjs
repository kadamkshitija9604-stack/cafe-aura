const fs = require('fs');
const file = 'c:/Users/win11/Downloads/New folder (2)/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');
let lines = content.split(/\r?\n/);
lines[460] = '            <a href="#">FB</a><a href="#">IG</a><a href="#">IN</a><a href="#">YT</a>';
fs.writeFileSync(file, lines.join('\r\n'));
console.log('done');
