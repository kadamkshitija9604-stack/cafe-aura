const fs = require('fs');
const path = 'c:/Users/win11/Downloads/New folder (2)/src/App.jsx';
let content = fs.readFileSync(path, 'utf8');
content = content.replace('{icon:"âš™ï¸ ", title:"Grinding", desc:"Ground fresh, per order, to the perfect coarseness."}', '{icon:"⚙️", title:"Grinding", desc:"Ground fresh, per order, to the perfect coarseness."}');
fs.writeFileSync(path, content, 'utf8');
console.log("Replaced successfully!");
