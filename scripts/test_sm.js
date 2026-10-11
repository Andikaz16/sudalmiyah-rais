const fs = require('fs');
const html = fs.readFileSync('scratch_sm_page.html', 'utf8');

const regex = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
let match;
const articles = [];
while ((match = regex.exec(html)) !== null) {
  const href = match[1];
  const text = match[2].replace(/<[^>]+>/g, '').trim();
  if (text.length > 25 && !href.includes('/category') && !href.includes('/tag') && !href.includes('login')) {
    articles.push({ href, text });
  }
}

console.log('Found articles in SM:', articles.slice(0, 10));
