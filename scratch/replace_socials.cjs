const fs = require('fs');
const file = 'c:/Users/win11/Downloads/New folder (2)/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

// Fix socials
content = content.replace(/<a href="#">ð • <\/a><a href="#">â—Ž<\/a><a href="#">in<\/a><a href="#">â–¶<\/a>/, '<a href="#">FB</a><a href="#">IG</a><a href="#">IN</a><a href="#">YT</a>');

fs.writeFileSync(file, content);
console.log('done');
