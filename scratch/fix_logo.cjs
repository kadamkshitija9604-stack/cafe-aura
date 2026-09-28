const fs = require('fs');
const path = 'c:/Users/win11/Downloads/New folder (2)/src/App.jsx';
let content = fs.readFileSync(path, 'utf8');
content = content.replace('<div className="logo-mark">☕</div>', '<img src="/logo.png" className="logo-mark" style={{objectFit: \'cover\', background: \'none\'}} alt="logo" />');
fs.writeFileSync(path, content, 'utf8');
console.log("Replaced logo icon with image successfully!");
