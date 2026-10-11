const fs = require('fs');
const html = fs.readFileSync('scratch_sm_page.html', 'utf8');

// Find a card enclosing /read/
const idx = html.indexOf('/read/seluruh-amal-usaha');
console.log('Context around /read/:');
console.log(html.substring(Math.max(0, idx - 400), idx + 500));
