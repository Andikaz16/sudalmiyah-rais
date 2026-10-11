const https = require('https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }, timeout: 8000 }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch(e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }, timeout: 8000 }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function timeAgo(dateString) {
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    if (hours < 1) return 'Baru saja';
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    return `${days} hari lalu`;
  } catch (e) {
    return 'Baru saja';
  }
}

async function testAll() {
  console.log('--- 1. Testing UMS ---');
  try {
    const ums = await fetchJson('https://news.ums.ac.id/id/wp-json/wp/v2/posts?_embed&per_page=3');
    const parsedUms = ums.map(p => ({
      id: `ums-${p.id}`,
      source: 'UMS',
      badge: 'UMS NEWS',
      badgeClass: 'bg-[#003B73] text-white',
      title: p.title.rendered.replace(/&#8211;/g, '–').replace(/&#8217;/g, "'").replace(/&quot;/g, '"'),
      excerpt: p.excerpt.rendered.replace(/<[^>]+>/g, '').replace(/\[&#8230;\]/g, '...').trim(),
      sourceUrl: p.link,
      imageUrl: p._embedded && p._embedded['wp:featuredmedia'] ? p._embedded['wp:featuredmedia'][0].source_url : '/images/news/news-ums-1.jpg',
      timeAgo: timeAgo(p.date),
      sourceDomain: 'news.ums.ac.id'
    }));
    console.log('Parsed UMS:', parsedUms[0]);
  } catch (e) {
    console.log('UMS Err:', e.message);
  }

  console.log('--- 2. Testing Lensamu (Muhammadiyah) ---');
  try {
    const mu = await fetchJson('https://muhammadiyah.or.id/wp-json/wp/v2/posts?_embed&per_page=3');
    const parsedMu = mu.map(p => ({
      id: `lensamu-${p.id}`,
      source: 'LENSAMU',
      badge: 'LENSAMU',
      badgeClass: 'bg-[#005A36] text-white',
      title: p.title.rendered.replace(/&#8211;/g, '–').replace(/&#8217;/g, "'").replace(/&quot;/g, '"'),
      excerpt: p.excerpt.rendered.replace(/<[^>]+>/g, '').replace(/\[&#8230;\]/g, '...').trim(),
      sourceUrl: p.link,
      imageUrl: p._embedded && p._embedded['wp:featuredmedia'] ? p._embedded['wp:featuredmedia'][0].source_url : '/images/news/news-lensamu-1.jpg',
      timeAgo: timeAgo(p.date),
      sourceDomain: 'lensamu.id'
    }));
    console.log('Parsed Lensamu:', parsedMu[0]);
  } catch (e) {
    console.log('Lensamu Err:', e.message);
  }

  console.log('--- 3. Testing Suara Muhammadiyah ---');
  try {
    const html = await fetchHtml('https://suaramuhammadiyah.id');
    // Extract articles with regex
    const cardRegex = /<img[^>]+src="([^"]+)"[^>]*class="[^"]*w-100[^"]*"[\s\S]*?<a[^>]+href="(\/read\/[^"]+)"[^>]*>[\s\S]*?<h5>([\s\S]*?)<\/h5>/g;
    const items = [];
    let m;
    while ((m = cardRegex.exec(html)) !== null && items.length < 3) {
      items.push({
        id: `sm-${items.length + 1}`,
        source: 'SUARA_MUHAMMADIYAH',
        badge: 'SUARA MUHAMMADIYAH',
        badgeClass: 'bg-[#800000] text-white',
        title: m[3].replace(/<[^>]+>/g, '').trim(),
        excerpt: `suaramuhammadiyah.id, YOGYAKARTA — ${m[3].replace(/<[^>]+>/g, '').trim()}`,
        sourceUrl: `https://suaramuhammadiyah.id${m[2]}`,
        imageUrl: m[1],
        timeAgo: 'Baru saja',
        sourceDomain: 'suaramuhammadiyah.id'
      });
    }
    console.log('Parsed SM count:', items.length, items[0]);
  } catch (e) {
    console.log('SM Err:', e.message);
  }
}

testAll();
