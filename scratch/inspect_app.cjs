const fs = require('fs');
const content = fs.readFileSync('src/App.jsx', 'utf8');
const lines = content.split('\n');
console.log('Total lines:', lines.length);
lines.forEach((line, idx) => {
  const trimmed = line.trim();
  if (trimmed.startsWith('<') || trimmed.startsWith('const ') || trimmed.startsWith('function ') || trimmed.startsWith('return (')) {
    if (!trimmed.startsWith('<path') && !trimmed.startsWith('<svg') && !trimmed.startsWith('<span') && !trimmed.startsWith('<p') && !trimmed.startsWith('<h') && !trimmed.startsWith('<img') && !trimmed.startsWith('<button') && !trimmed.startsWith('<a ')) {
      console.log(`${idx + 1}: ${trimmed.substring(0, 100)}`);
    }
  }
});
