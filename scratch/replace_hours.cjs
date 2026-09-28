const fs = require('fs');
const file = 'c:/Users/win11/Downloads/New folder (2)/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace hours
content = content.replace('<li><p>Mon â€“ Fri: 7:30 AM â€“ 9:00 PM</p></li>', '<li><p>Mon to Fri: 7:30 AM to 9:00 PM</p></li>');
content = content.replace('<li><p>Sat â€“ Sun: 8:00 AM â€“ 10:00 PM</p></li>', '<li><p>Sat to Sun: 8:00 AM to 10:00 PM</p></li>');

// Fix footer bottom
content = content.replace('<p>Â© 2026 Brocelé Café. All rights reserved.</p>', '<p>&copy; 2026 Cafe Aura. All rights reserved.</p>');
content = content.replace('<a href="#">ð • </a><a href="#">â—Ž</a><a href="#">in</a><a href="#">â–¶</a>', '<a href="#">FB</a><a href="#">IG</a><a href="#">IN</a><a href="#">YT</a>');

fs.writeFileSync(file, content);
console.log('done');
