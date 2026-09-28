const fs = require('fs');
const path = 'c:/Users/win11/Downloads/New folder (2)/src/App.jsx';
let content = fs.readFileSync(path, 'utf8');
content = content.replace('{"â˜…".repeat(n)}{"â˜†".repeat(5-n)}', '{"★".repeat(n)}{"☆".repeat(5-n)}');
fs.writeFileSync(path, content, 'utf8');
console.log("Replaced stars successfully!");
