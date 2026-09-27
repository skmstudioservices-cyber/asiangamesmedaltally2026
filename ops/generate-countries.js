// Generate 45 country medal-tally pages — Asian Games 2026 (Design A)
// Usage: node generate-countries.js <repo_dir> <out_dir>
const fs = require('fs');
const path = require('path');

const repoDir = process.argv[2];
const outDir = process.argv[3];
const BASE = 'https://asiangamesmedaltally2026.pages.dev';
const TODAY = '27 September 2026';
const TODAY_ISO = '2026-09-27';

// current 2026 seed (from data.json, 26 Sep)
const seed26 = {
  'China': [1,103,38,25,166], 'Japan': [2,29,43,46,118], 'South Korea': [3,13,19,35,67],
  'Uzbekistan': [4,8,17,9,34], 'Kazakhstan': [5,8,8,18,34], 'Thailand': [6,7,6,8,21],
  'Iran': [7,6,11,7,24], 'Bahrain': [8,5,2,2,9], 'Hong Kong, China': [9,4,11,11,26],
  'North Korea': [10,4,5,3,12], 'Malaysia': [11,4,1,5,10], 'India': [12,2,11,13,26]
};
// 2022 Hangzhou (rank, g, s, b, tot)
const hz22 = {
  'China':[1,201,111,71,383],'Japan':[2,52,67,69,188],'South Korea':[3,42,59,89,190],
  'India':[4,28,38,40,106],'Uzbekistan':[5,22,18,31,71],'Chinese Taipei':[6,19,20,28,67],
  'Iran':[7,13,21,20,54],'Thailand':[8,12,14,32,58],'Bahrain':[9,12,3,5,20],
  'North Korea':[10,11,18,10,39],'Kazakhstan':[11,10,22,48,80],'Hong Kong, China':[12,8,16,29,53],
  'Indonesia':[13,7,11,18,36],'Malaysia':[14,6,8,18,32],'Qatar':[15,5,6,3,14],
  'United Arab Emirates':[16,5,5,10,20],'Philippines':[17,4,2,12,18],'Kyrgyzstan':[18,4,2,9,15],
  'Saudi Arabia':[19,4,2,4,10],'Singapore':[20,3,6,7,16],'Vietnam':[21,3,5,19,27],
  'Mongolia':[22,3,5,13,21],'Kuwait':[23,3,4,4,11],'Tajikistan':[24,2,1,4,7],
  'Macau, China':[25,1,3,2,6],'Sri Lanka':[26,1,2,2,5],'Myanmar':[27,1,0,2,3],
  'Jordan':[28,0,5,4,9],'Turkmenistan':[29,0,1,6,7],'Afghanistan':[30,0,1,4,5],
  'Pakistan':[31,0,1,2,3],'Brunei':[32,0,1,1,2],'Iraq':[33,0,0,3,3],
  'Bangladesh':[34,0,0,2,2],'Cambodia':[35,0,0,1,1]
};

// 45 OCA nations: slug, display, flag, accent, wiki label, matchers, note
const COUNTRIES = [
  ['china','China','🇨🇳','#b91c1c','China',['China'],'Topped every Asian Games medal table since 1982 and led from the first week in Aichi-Nagoya.'],
  ['japan','Japan','🇯🇵','#9f1239','Japan',['Japan'],'Host nation of the 2026 Asian Games — events are spread across venues in Aichi and Nagoya.'],
  ['south-korea','South Korea','🇰🇷','#be123c','South Korea',['South Korea','Korea Republic'],'A traditional top-3 Asian Games nation with particular depth in archery, taekwondo and combat sports.'],
  ['india','India','🇮🇳','#c2410c','India',['India'],'Best-ever Asian Games finish at Hangzhou 2022 (106 medals). Women\u2019s cricket team won gold at 2026 on 22 September.'],
  ['uzbekistan','Uzbekistan','🇺🇿','#0369a1','Uzbekistan',['Uzbekistan'],'Rising power in wrestling, boxing and judo — already ahead of its Hangzhou pace.'],
  ['kazakhstan','Kazakhstan','🇰🇿','#0e7490','Kazakhstan',['Kazakhstan'],'Consistent top-6 nation, strongest in boxing, wrestling and cycling.'],
  ['chinese-taipei','Chinese Taipei','🇹🇼','#4338ca','Chinese Taipei',['Chinese Taipei','Taipei'],'Strong in weightlifting, taekwondo and baseball.'],
  ['iran','Iran','🇮🇷','#15803d','Iran',['Iran'],'Asian heavyweight in wrestling, taekwondo, weightlifting and kabaddi.'],
  ['thailand','Thailand','🇹🇭','#5b21b6','Thailand',['Thailand'],'Regular top-10 finisher — strong in boxing, badminton and sepak takraw.'],
  ['bahrain','Bahrain','🇧🇭','#b91c1c','Bahrain',['Bahrain'],'Distance-running medals via its renowned athletics programme.'],
  ['north-korea','North Korea','🇰🇵','#1d4ed8','North Korea',['North Korea','DPR Korea'],'Returned to the Asian Games in strength in Hangzhou with 39 medals.'],
  ['hong-kong','Hong Kong, China','🇭🇰','#9f1239','Hong Kong, China',['Hong Kong'],'Won 53 medals at Hangzhou 2022 — best in table tennis, fencing and swimming.'],
  ['indonesia','Indonesia','🇮🇩','#b91c1c','Indonesia',['Indonesia'],'Badminton powerhouse — hosts of the 2018 Asian Games.'],
  ['malaysia','Malaysia','🇲🇾','#1e3a8a','Malaysia',['Malaysia'],'Squash and badminton are Malaysia\u2019s strongest medal sources.'],
  ['qatar','Qatar','🇶🇦','#7e22ce','Qatar',['Qatar'],'Athletics and football medals at recent Asian Games.'],
  ['uae','United Arab Emirates','🇦🇪','#166534','United Arab Emirates',['United Arab Emirates','UAE'],'Judo, shooting and athletics medals at recent Games.'],
  ['philippines','Philippines','🇵🇭','#1d4ed8','Philippines',['Philippines'],'Won 4 golds at Hangzhou including two in weightlifting via Hidilyn Diaz-era strength.'],
  ['kyrgyzstan','Kyrgyzstan','🇰🇬','#b91c1c','Kyrgyzstan',['Kyrgyzstan'],'Wrestling and judo carry most of its medals.'],
  ['saudi-arabia','Saudi Arabia','🇸🇦','#166534','Saudi Arabia',['Saudi Arabia'],'Football and athletics focused delegation.'],
  ['singapore','Singapore','🇸🇬','#be123c','Singapore',['Singapore'],'Swimming has historically delivered Singapore\u2019s golds.'],
  ['vietnam','Vietnam','🇻🇳','#b91c1c','Vietnam',['Vietnam'],'Best Asian Games as host in 2022-era Southeast Asian strength in martial arts.'],
  ['mongolia','Mongolia','🇲🇳','#b45309','Mongolia',['Mongolia'],'Judo, wrestling and boxing are its medal sources.'],
  ['kuwait','Kuwait','🇰🇼','#166534','Kuwait',['Kuwait'],'Shooting and karate bring its medals.'],
  ['tajikistan','Tajikistan','🇹🇯','#b91c1c','Tajikistan',['Tajikistan'],'Wrestling-focused delegation.'],
  ['macau','Macau, China','🇲🇴','#0f766e','Macau, China',['Macau'],'Won 6 medals at Hangzhou 2022.'],
  ['sri-lanka','Sri Lanka','🇱🇰','#7e22ce','Sri Lanka',['Sri Lanka'],'Cricket bronze at Hangzhou 2022 was a highlight; women\u2019s cricket silver medalists at 2026.'],
  ['myanmar','Myanmar','🇲🇲','#a16207','Myanmar',['Myanmar'],'Traditional strength in sepak takraw and wushu-style events.'],
  ['jordan','Jordan','🇯🇴','#b91c1c','Jordan',['Jordan'],'Taekwondo and karate medals at recent Games.'],
  ['turkmenistan','Turkmenistan','🇹🇲','#0e7490','Turkmenistan',['Turkmenistan'],'Wrestling and athletics medals.'],
  ['afghanistan','Afghanistan','🇦🇫','#166534','Afghanistan',['Afghanistan'],'Cricket and taekwondo are its best chances.'],
  ['pakistan','Pakistan','🇵🇰','#166534','Pakistan',['Pakistan'],'Hockey history; men\u2019s cricket squad competing at 2026.'],
  ['iraq','Iraq','🇮🇶','#166534','Iraq',['Iraq'],'Football and weightlifting focused.'],
  ['bangladesh','Bangladesh','🇧🇩','#0f766e','Bangladesh',['Bangladesh'],'Women\u2019s cricket team beat Sri Lanka in the 2026 group stage — its biggest Asian Games cricket moment.'],
  ['brunei','Brunei','🇧🇳','#92400e','Brunei',['Brunei'],'Small delegation with shooting and athletics entries.'],
  ['cambodia','Cambodia','🇰🇭','#1d4ed8','Cambodia',['Cambodia'],'SEA Games 2023 host building its programme.'],
  ['oman','Oman','🇴🇲','#b91c1c','Oman',['Oman'],'Athletics and football entries.'],
  ['lebanon','Lebanon','🇱🇧','#be123c','Lebanon',['Lebanon'],'Weightlifting and athletics entries.'],
  ['syria','Syria','🇸🇾','#166534','Syria',['Syria'],'Wrestling-focused delegation.'],
  ['yemen','Yemen','🇾🇪','#b91c1c','Yemen',['Yemen'],'Small delegation across individual sports.'],
  ['palestine','Palestine','🇵🇸','#0f766e','Palestine',['Palestine'],'Football and individual entries.'],
  ['laos','Laos','🇱🇦','#b91c1c','Laos',['Laos'],'Small delegation in individual sports.'],
  ['nepal','Nepal','🇳🇵','#be123c','Nepal',['Nepal'],'Cricket, taekwondo and athletics entries.'],
  ['maldives','Maldives','🇲🇻','#166534','Maldives',['Maldives'],'Small island delegation.'],
  ['bhutan','Bhutan','🇧🇹','#c2410c','Bhutan',['Bhutan'],'Archery — its national sport — and athletics entries.'],
  ['timor-leste','Timor-Leste','🇹🇱','#b45309','Timor-Leste',['Timor-Leste','East Timor'],'Newest OCA member, competing in athletics and martial arts.']
];

function seedRow(name) {
  if (seed26[name]) return seed26[name];
  return [null, 0, 0, 0, 0];
}

function esc(s) { return String(s).replace(/&/g,'&').replace(/</g,'<').replace(/>/g,'>').replace(/"/g,'"'); }

function buildPage(c) {
  const [slug, name, flag, accent, wiki, matchers, noteRaw] = c;
  const note = typeof noteRaw === 'string' ? noteRaw : c[6];
  const s26 = seedRow(wiki);
  const hz = hz22[wiki] || null;
  const rankHtml = s26[0] ? s26[0] : '&mdash;';
  const matchJs = JSON.stringify(matchers);
  const title = esc(name) + ' Medal Tally Asian Games 2026 — Live Rank, Gold, Silver, Bronze';
  const desc = 'Live ' + esc(name) + ' medal tally at Asian Games 2026: rank, gold, silver, bronze and total medals, updated automatically from the official table.';
  const winnersLink = slug === 'india'
    ? '\n<a class="btn" href="/india-medal-winners/">India\u2019s full medallist list</a>'
    : '';
  const hzCard = hz ? (
'\n<div class="card">\n<h2>Compared to 2022 Hangzhou</h2>\n<table>\n<thead><tr><th>Games</th><th>Gold</th><th>Silver</th><th>Bronze</th><th>Total</th></tr></thead>\n<tbody>\n<tr><td class="n">2022 Hangzhou (final)</td><td>' + hz[1] + '</td><td>' + hz[2] + '</td><td>' + hz[3] + '</td><td><b>' + hz[4] + '</b></td></tr>\n<tr class="in"><td class="n">2026 so far (live)</td><td id="cmpG">' + s26[1] + '</td><td id="cmpS">' + s26[2] + '</td><td id="cmpB">' + s26[3] + '</td><td><b id="cmpT">' + s26[4] + '</b></td></tr>\n</tbody>\n</table>\n<p class="note">The second row updates itself every few minutes during the Games.</p>\n</div>'
  ) : (
'\n<div class="card">\n<h2>Compared to 2022 Hangzhou</h2>\n<p>' + esc(name) + ' did not win a medal at Hangzhou 2022 \u2014 any medal at Aichi-Nagoya 2026 would be a breakthrough. The live tally above updates automatically.</p>\n</div>'
  );

  const strip = COUNTRIES.map(x => {
    const sl = x[0], nm = x[1];
    const cls = sl === slug ? ' class="self"' : '';
    return '<a href="/' + sl + '-medal-tally/"' + cls + '>' + nm + '</a>';
  }).join('\n');

  const faqQ1 = 'How many medals has ' + esc(name) + ' won at Asian Games 2026?';
  const faqA1 = s26[4] > 0
    ? 'As of 27 September 2026, ' + esc(name) + ' has ' + s26[1] + ' gold, ' + s26[2] + ' silver and ' + s26[3] + ' bronze medals \u2014 ' + s26[4] + ' in total. This page updates automatically.'
    : 'As of 27 September 2026, ' + esc(name) + ' is yet to win a medal at these Games. This page updates automatically.';

  return '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<meta name="google-site-verification" content="GlkDu5ZL-CyyKjwPSj9d9X3Y2qsHUj_qAwRwxiLr7nI">\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-2B2GJVCH3N"><\/script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag(\'js\', new Date());\n  gtag(\'config\', \'G-2B2GJVCH3N\');\n<\/script>\n<meta name="robots" content="index,follow">\n<title>' + title + '</title>\n<meta name="description" content="' + desc + '">\n<link rel="canonical" href="' + BASE + '/' + slug + '-medal-tally/">\n<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n<link rel="apple-touch-icon" href="/favicon.svg">\n<meta property="og:title" content="' + title + '">\n<meta property="og:description" content="' + desc + '">\n<meta property="og:type" content="website">\n<style>\n*{margin:0;padding:0;box-sizing:border-box}\nbody{font-family:system-ui,-apple-system,\'Segoe UI\',Roboto,sans-serif;background:#f8fafc;color:#1e293b;line-height:1.55}\n.wrap{max-width:860px;margin:0 auto;padding:16px}\n.topbar{background:#fff;border-bottom:1px solid #e2e8f0;padding:12px 16px;display:flex;align-items:center;gap:10px}\n.topbar .mark{width:34px;height:34px}\n.topbar b{font-size:1.02rem;color:#0f172a}\n.topbar .chip{margin-left:auto;font-size:.72rem;font-weight:700;color:#047857;background:#d1fae5;border:1px solid #a7f3d0;padding:4px 10px;border-radius:99px}\n.hero{background:#fff;border:1px solid #e2e8f0;border-top:4px solid ' + accent + ';border-radius:12px;padding:20px;margin:16px 0;text-align:center}\n.hero h2{font-size:.85rem;letter-spacing:2px;color:' + accent + '}\n.nation-rank{font-size:2.8rem;font-weight:800;color:#0f172a}\n.nation-rank small{display:block;font-size:.9rem;color:#64748b;font-weight:500}\n.medals{display:flex;gap:10px;justify-content:center;margin-top:14px;flex-wrap:wrap}\n.mc{border-radius:12px;padding:10px 20px;min-width:90px;border:1px solid #e2e8f0;border-top:4px solid #cbd5e1;background:#f8fafc}\n.mc b{display:block;font-size:1.7rem}\n.mc span{font-size:.72rem;color:#64748b}\n.mc.g{border-top-color:#eab308}.mc.g b{color:#a16207}\n.mc.s{border-top-color:#94a3b8}.mc.s b{color:#475569}\n.mc.b{border-top-color:#d97706}.mc.b b{color:#b45309}\n.mc.t{border-top-color:' + accent + '}.mc.t b{color:' + accent + '}\n.updated{font-size:.75rem;color:#64748b;margin-top:10px}\nh3{margin:24px 0 10px;font-size:1rem;color:#1d4ed8}\ntable{width:100%;border-collapse:collapse;font-size:.9rem;background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden}\nth{background:#eff6ff;color:#1e40af;padding:10px 6px;text-align:center;font-size:.75rem;letter-spacing:.5px}\ntd{padding:9px 6px;text-align:center;border-top:1px solid #f1f5f9}\ntd.n{text-align:left;font-weight:600}\ntr.in{background:#fff7ed}\ntr.in td.n{color:' + accent + '}\n.btn{display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:10px 18px;border-radius:10px;font-weight:600;font-size:.9rem;margin:6px 6px 0 0}\n.btn.ghost{background:#fff;color:#1d4ed8;border:1px solid #bfdbfe}\n.card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:14px;margin:12px 0}\n.card h2{font-size:.98rem;color:#0f172a;margin-bottom:8px}\np{font-size:.93rem;color:#334155}\n.note{font-size:.75rem;color:#64748b;margin-top:6px}\n.grid45{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:8px}\n@media(max-width:560px){.grid45{grid-template-columns:repeat(2,1fr)}}\n.grid45 a{padding:5px 8px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;color:#334155;text-decoration:none;font-size:.78rem;text-align:center}\n.grid45 a:hover{border-color:#93c5fd;color:#1d4ed8}\n.grid45 a.self{background:#fff7ed;color:' + accent + ';border-color:#fdba74;font-weight:700}\ndetails{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:12px 14px;margin-top:8px}\nsummary{cursor:pointer;font-weight:600;color:#0f172a}\ndetails p{margin-top:8px;font-size:.9rem;color:#475569}\nfooter{margin-top:28px;padding:16px;border-top:1px solid #e2e8f0;font-size:.75rem;color:#64748b}\nfooter a,.link{color:#1d4ed8}\n.foot-nav{display:flex;gap:14px;flex-wrap:wrap;margin-top:8px;font-size:.8rem}\n.foot-nav a{color:#475569}\n</style>\n</head>\n<body>\n<div class="topbar">\n  <img class="mark" src="/logo.svg" alt="Asian Games 2026 Medal Tally logo">\n  <b>Asian Games 2026 Medal Tally</b>\n  <span class="chip">\u25cf LIVE</span>\n</div>\n<div class="wrap">\n\n<div class="hero">\n<h2>' + flag + ' ' + esc(name).toUpperCase() + ' \u2014 MEDALS AT ASIAN GAMES 2026</h2>\n<div class="nation-rank" id="nationRank">' + rankHtml + '<small>rank in medal table</small></div>\n<div class="medals">\n<div class="mc g"><b id="mG">' + s26[1] + '</b><span>Gold</span></div>\n<div class="mc s"><b id="mS">' + s26[2] + '</b><span>Silver</span></div>\n<div class="mc b"><b id="mB">' + s26[3] + '</b><span>Bronze</span></div>\n<div class="mc t"><b id="mT">' + s26[4] + '</b><span>Total</span></div>\n</div>\n<div class="updated" id="updatedStamp">Data as of 27 September 2026 (auto-updating)</div>\n</div>\n\n<div class="card">\n<h2>About ' + esc(name) + ' at the 2026 Asian Games</h2>\n<p>' + esc(note) + ' The Games run from 19 September to 4 October 2026 in Aichi-Nagoya, Japan, with 45 nations competing.</p>' + winnersLink + '\n</div>\n' + hzCard + '\n\n<h3>Every country\u2019s medal tally</h3>\n<div class="grid45">\n' + strip + '\n</div>\n\n<h3>Quick FAQs</h3>\n<details open><summary>' + esc(faqQ1) + '</summary><p>' + esc(faqA1) + '</p></details>\n<details><summary>Where are the Asian Games 2026 held?</summary><p>Aichi-Nagoya, Japan \u2014 19 September to 4 October 2026.</p></details>\n<details><summary>How many countries are in the Asian Games 2026?</summary><p>45 nations of the Olympic Council of Asia are competing.</p></details>\n\n<footer>\n<div class="foot-nav"><a href="/">Medal Tally</a> \u00b7 <a href="/india-medal-winners/">India Winners</a> \u00b7 <a href="/asian-games-cricket/">Cricket</a> \u00b7 <a href="/about/">About</a> \u00b7 <a href="/privacy/">Privacy</a> \u00b7 <a href="/terms/">Terms</a> \u00b7 <a href="/contact/">Contact</a></div>\n<p style="margin-top:10px">Unofficial tracker. Data: Wikipedia (auto-refreshed). Last content update: <span class="lastmod">' + TODAY + '</span>.</p>\n</footer>\n</div>\n\n<script type="application/ld+json">\n{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":' + JSON.stringify(faqQ1) + ',"acceptedAnswer":{"@type":"Answer","text":' + JSON.stringify(faqA1) + '}},{"@type":"Question","name":"Where are the Asian Games 2026 held?","acceptedAnswer":{"@type":"Answer","text":"Aichi-Nagoya, Japan \\u2014 19 September to 4 October 2026."}},{"@type":"Question","name":"How many countries are in the Asian Games 2026?","acceptedAnswer":{"@type":"Answer","text":"45 nations of the Olympic Council of Asia are competing."}}]}\n<\/script>\n<script>\nvar NATION = ' + JSON.stringify(wiki) + ';\nvar MATCHERS = ' + matchJs + ';\nfunction cleanCell(c){ return c.textContent.replace(/\\u00a0/g,\' \').trim(); }\nfunction isMine(nation){\n  for (var i=0;i<MATCHERS.length;i++){\n    if (nation === MATCHERS[i]) return true;\n    if (nation.indexOf(MATCHERS[i]) > -1) return true;\n    if (MATCHERS[i].indexOf(nation) > -1 && nation.length > 3) return true;\n  }\n  return false;\n}\nfunction applyRow(row, stamp){\n  document.getElementById(\'nationRank\').innerHTML = row[0] + \'<small>rank in medal table</small>\';\n  document.getElementById(\'mG\').textContent = row[2];\n  document.getElementById(\'mS\').textContent = row[3];\n  document.getElementById(\'mB\').textContent = row[4];\n  document.getElementById(\'mT\').textContent = row[5];\n  var c = document.getElementById(\'cmpG\');\n  if (c){ c.textContent = row[2]; document.getElementById(\'cmpS\').textContent = row[3]; document.getElementById(\'cmpB\').textContent = row[4]; document.getElementById(\'cmpT\').textContent = row[5]; }\n  document.getElementById(\'updatedStamp\').textContent = \'Data as of \' + stamp;\n}\nfunction fetchLive(){\n  fetch(\'https://en.wikipedia.org/w/api.php?action=parse&page=2026_Asian_Games_medal_table&prop=text&format=json&origin=*\')\n    .then(function(r){return r.json();})\n    .then(function(d){\n      if (!d.parse) return;\n      var doc = new DOMParser().parseFromString(d.parse.text[\'*\'],\'text/html\');\n      var table = doc.querySelector(\'table.wikitable\'); if(!table) return;\n      var rows = table.querySelectorAll(\'tr\');\n      for (var i=0;i<rows.length;i++){\n        var cells = rows[i].querySelectorAll(\'th,td\');\n        if (cells.length < 6) continue;\n        var rank = parseInt(cleanCell(cells[0]),10);\n        var g = parseInt(cleanCell(cells[2]),10);\n        if (isNaN(rank) || isNaN(g)) continue;\n        var nation = cleanCell(cells[1]).replace(/\\[.*?\\]/g,\'\').replace(/\\(.*?\\)/g,\'\').trim();\n        if (!isMine(nation)) continue;\n        var s = parseInt(cleanCell(cells[3]),10), b = parseInt(cleanCell(cells[4]),10);\n        var tot = parseInt(cleanCell(cells[5]),10) || (g+s+b);\n        applyRow([rank,nation,g,s,b,tot], \'just now (Wikipedia live)\');\n        return;\n      }\n    }).catch(function(){});\n}\nfetchLive();\nsetInterval(fetchLive, 300000);\n<\/script>\n</body>\n</html>\n';
}

// main
fs.mkdirSync(outDir, { recursive: true });
const manifest = [];
for (const c of COUNTRIES) {
  const slug = c[0];
  const dir = path.join(outDir, slug + '-medal-tally');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), buildPage(c));
  manifest.push(slug);
}
console.log('generated', COUNTRIES.length, 'pages:', manifest.join(', '));
