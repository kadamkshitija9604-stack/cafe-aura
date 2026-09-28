const fs = require('fs');
let css = fs.readFileSync('src/App.css', 'utf8');

// Fine tune hero badges and art
css = css.replace('.hero-badge.top{top:6%; right:-4%;}', '.hero-badge.top{top:8%; right:-12px;}');
css = css.replace('.hero-badge.bottom{bottom:8%; left:-8%;}', '.hero-badge.bottom{bottom:8%; left:-12px;}');

fs.writeFileSync('src/App.css', css);
console.log('Hero badges adjusted successfully!');
