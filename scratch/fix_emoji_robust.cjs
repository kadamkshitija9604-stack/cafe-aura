const fs = require('fs');
const path = 'c:/Users/win11/Downloads/New folder (2)/src/App.jsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('title:"Grinding"')) {
    // Replace whatever is in the icon:"" part with ⚙️
    lines[i] = lines[i].replace(/icon:"[^"]+"/, 'icon:"⚙️"');
  }
}

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log("Replaced using regex successfully!");
