const fs=require('fs'); 
let t=fs.readFileSync('src/App.jsx','utf8'); 
t = t.replace(/src="data:image[^"]+"/g, 'src="BASE64"'); 
const start = t.indexOf('function Hero'); 
const end = t.indexOf('function Featured'); 
console.log(t.substring(start, end));
