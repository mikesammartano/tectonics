// Build dist/ for Cloudflare from the single-file app (index.html).
// Run: npm run build   (deploy: npm run deploy)
// Artwork (icons, og.png) is drawn on a Mac with `npm run art` into static/ and committed,
// so the build itself needs no system fonts and runs on Cloudflare's Linux builders.
//
// - serves three.js and jsPDF from /vendor instead of the CDN
// - adds icon files, the web manifest, link-preview tags, headers and a stamped service worker
// - absolute URLs (canonical, og:url, og:image, sitemap) come from SITE_URL or "homepage" in package.json
import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync, cpSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { transformSync } from 'esbuild';

const ART = process.argv.includes('--art');
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const SITE = (process.env.SITE_URL || pkg.homepage || '').replace(/\/$/, '');
const abs = p => (SITE ? SITE + p : p);
const V = 'v=1';

if (!ART) { rmSync('dist', { recursive: true, force: true }); mkdirSync('dist/vendor', { recursive: true }); }

/* ---------- artwork ---------- */
const FONTS = ['/System/Library/Fonts/HelveticaNeue.ttc'];
const png = async (svg, width) => new (await import('@resvg/resvg-js')).Resvg(svg, { fitTo: { mode: 'width', value: width }, font: { loadSystemFonts: false, fontFiles: FONTS, defaultFontFamily: 'Helvetica Neue' } }).render().asPng();

const DEFS = `<linearGradient id="bg" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stop-color="#3b95ff"/><stop offset=".55" stop-color="#0071e3"/><stop offset="1" stop-color="#0058c4"/></linearGradient>
  <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
// the mark in its own 24-unit space: three strata bend down together like contour lines, with a quake focus between them
const STRATA = ['M3.5 5.5H9.2C12.3 5.5 13.8 7.5 15.4 10.2L19 16.4', 'M3.5 10.1H7.2C9.9 10.1 11.1 11.7 12.4 14L14.6 17.9', 'M3.5 14.7H5.2C6.9 14.7 7.8 15.9 8.7 17.5L10.2 20.2'];
const glyph = (sw = 2) => `<g fill="none" stroke="#fff" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path d="${STRATA[0]}"/><path d="${STRATA[1]}" stroke-opacity=".7"/><path d="${STRATA[2]}" stroke-opacity=".42"/></g><circle cx="10.7" cy="8.7" r="1" fill="#fff"/>`;
const GC = [11.25, 12.85]; // centre of the glyph
function icon({ size = 512, fill = 0.74, rx = 0.22, sw = 2, flat = false } = {}) {
  const k = (size * fill) / 17, tx = size / 2 - GC[0] * k, ty = size / 2 - GC[1] * k;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"><defs>${DEFS}</defs>
  <rect width="${size}" height="${size}" rx="${size * rx}" fill="${flat ? '#0071e3' : 'url(#bg)'}"/>${flat ? '' : `<rect width="${size}" height="${size}" rx="${size * rx}" fill="url(#sheen)"/>`}
  <g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${k.toFixed(4)})">${glyph(sw)}</g></svg>`;
}
// wordmark lockups, like topo's: the tile, then the name in the same heavy, tightly tracked system type
function lockup(ink, dark) {
  const tile = icon({ size: 560, fill: 0.72, rx: 0.24, flat: true });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="3000" height="900" viewBox="0 0 3000 900"><g transform="translate(120 170)">${tile.replace(/<svg[^>]*>/, '<g>').replace('</svg>', '</g>')}</g>
  <text x="800" y="590" font-family="Helvetica Neue" font-weight="700" font-size="380" letter-spacing="-17" fill="${ink}">tectonics</text></svg>`;
}
// link-preview card: a flat block diagram of a subduction zone, in the colours of the app
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><defs>${DEFS}
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dfe9f6"/><stop offset=".7" stop-color="#f1f5fb"/><stop offset="1" stop-color="#f5f5f7"/></linearGradient>
  <linearGradient id="asth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#db6a36"/><stop offset="1" stop-color="#f3a047"/></linearGradient>
  <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fb0ee" stop-opacity=".78"/><stop offset="1" stop-color="#2a79c9" stop-opacity=".88"/></linearGradient>
  <linearGradient id="land" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8fb05c"/><stop offset=".6" stop-color="#a9a463"/><stop offset="1" stop-color="#b09f6e"/></linearGradient>
  <radialGradient id="glow"><stop offset="0" stop-color="#ffd27a" stop-opacity=".95"/><stop offset="1" stop-color="#ff7a2e" stop-opacity="0"/></radialGradient>
  <filter id="sh" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="22" stdDeviation="22" flood-color="#1d2a44" flood-opacity=".22"/></filter>
</defs>
<rect width="1200" height="630" fill="url(#sky)"/>
<g transform="translate(650 232) scale(.78) translate(-520 -190)"><g filter="url(#sh)">
  <!-- right face -->
  <path d="M1130 232 L1196 190 L1196 428 L1130 470Z" fill="#a8613a"/>
  <path d="M1130 232 L1196 190 L1196 250 L1130 292Z" fill="#c98f74"/><path d="M1130 292 L1196 250 L1196 292 L1130 334Z" fill="#8f6a58"/><path d="M1130 334 L1196 292 L1196 372 L1130 414Z" fill="#5f7c55"/><path d="M1130 414 L1196 372 L1196 428 L1130 470Z" fill="#e07f3a"/>
  <!-- top face -->
  <path d="M520 232 L586 190 L1196 190 L1130 232Z" fill="url(#land)"/>
  <path d="M520 232 L586 190 L800 190 L760 232Z" fill="url(#sea)"/>
  <!-- front face -->
  <path d="M520 232 H1130 V470 H520Z" fill="url(#asth)"/>
  <path d="M760 232 H1130 V292 H800 C790 292 780 288 770 280Z" fill="#c98f74"/>
  <path d="M800 292 H1130 V334 H845 C830 320 815 298 800 292Z" fill="#8f6a58"/>
  <path d="M846 334 H1130 V414 H900 C880 380 862 348 846 334Z" fill="#5f7c55"/>
  <path d="M520 232 H760 L800 262 V232Z" fill="none"/>
  <path d="M520 270 C650 270 740 276 800 318 L1010 470 H1048 L842 318 C780 262 650 248 520 248Z" fill="#323b48"/>
  <path d="M520 248 C650 248 780 262 842 318 L1048 470 H1082 L862 318 C790 246 650 226 520 226Z" fill="#52606f"/>
  <path d="M520 270 C650 270 740 276 800 318 L1010 470 H980 L780 330 C720 296 650 296 520 296Z" fill="#5f7c55"/>
  <path d="M520 232 H760 C700 226 600 226 520 226Z" fill="url(#sea)"/>
  <circle cx="838" cy="338" r="62" fill="url(#glow)"/>
  <path d="M868 232 L898 196 L928 232Z" fill="#7a6a68"/><path d="M944 232 L970 204 L996 232Z" fill="#7a6a68"/>
  <rect x="520" y="232" width="610" height="238" fill="none" stroke="#0b0e13" stroke-opacity=".12"/>
</g>
<g fill="#ffb020" stroke="#fff" stroke-width="2"><circle cx="870" cy="380" r="6"/><circle cx="900" cy="402" r="5"/><circle cx="930" cy="424" r="7"/><circle cx="822" cy="344" r="5"/><circle cx="960" cy="446" r="5"/></g></g>
<g transform="translate(80 92)"><rect width="104" height="104" rx="24" fill="url(#bg)"/><rect width="104" height="104" rx="24" fill="url(#sheen)"/>
  <g transform="translate(${52 - GC[0] * 4.6} ${52 - GC[1] * 4.6}) scale(4.6)">${glyph(2)}</g></g>
<text x="76" y="316" font-family="Helvetica Neue" font-weight="700" font-size="94" letter-spacing="-1" fill="#1d1d1f">Tectonics</text>
<text x="80" y="376" font-family="Helvetica Neue" font-size="32" fill="#424245">Plate boundaries and hot spots in 3D.</text>
<text x="80" y="418" font-family="Helvetica Neue" font-size="32" fill="#424245">Play them, slice them, print them.</text>
<text x="80" y="520" font-family="Helvetica Neue" font-size="24" fill="#6e6e73">Free for classrooms · videos, worksheets, STL and AR</text>
</svg>`;

if (ART) {
  mkdirSync('static/icons', { recursive: true });
  const favicon = icon({ size: 64, fill: 0.8, rx: 0.23, sw: 2.3 });
  writeFileSync('static/favicon.svg', favicon);
  writeFileSync('static/favicon-32.png', await png(favicon, 32));
  writeFileSync('static/apple-touch-icon.png', await png(icon({ size: 180, fill: 0.7, rx: 0 }), 180));
  writeFileSync('static/icons/icon-192.png', await png(icon({ size: 192 }), 192));
  writeFileSync('static/icons/icon-512.png', await png(icon({ size: 512 }), 512));
  writeFileSync('static/icons/icon-512-maskable.png', await png(icon({ size: 512, fill: 0.56, rx: 0 }), 512));
  writeFileSync('static/og.png', await png(og, 1200));
  mkdirSync('logo', { recursive: true });
  writeFileSync('logo/tectonics-mark.png', await png(icon({ size: 1024 }), 1024));
  writeFileSync('logo/tectonics-logo-blue.png', await png(lockup('#0071e3'), 2873));
  writeFileSync('logo/tectonics-logo-dark.png', await png(lockup('#f5f5f7'), 2873));
  writeFileSync('logo/tectonics-logo-light.png', await png(lockup('#1d1d1f'), 2873));
  writeFileSync('logo/tectonics-og.png', await png(og, 1200));
  console.log('drew static/ artwork and logo/');
  process.exit(0);
}
if (!existsSync('static/og.png')) throw new Error('static/ artwork missing: run `npm run art` on a Mac and commit static/');
cpSync('static', 'dist', { recursive: true });

/* ---------- page ---------- */
let html = readFileSync('index.html', 'utf8');
const THREE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
const JSPDF_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
if (!html.includes(THREE_CDN) || !html.includes(JSPDF_CDN)) throw new Error('library URLs changed; update build.mjs');
html = html.replace(THREE_CDN, '/vendor/three-r128.min.js').replace(JSPDF_CDN, '/vendor/jspdf-2.5.1.umd.min.js');
copyFileSync('node_modules/three/build/three.min.js', 'dist/vendor/three-r128.min.js');
copyFileSync('static/vendor/jspdf-2.5.1.umd.min.js', 'dist/vendor/jspdf-2.5.1.umd.min.js');
html = html.replace(/<link rel="icon" href="data:[^"]*">\n?/, '');
const tags = [
  SITE && `<link rel="canonical" href="${SITE}/">`,
  SITE && `<meta property="og:url" content="${SITE}/">`,
  `<meta property="og:type" content="website">`,
  `<meta property="og:site_name" content="Tectonics">`,
  `<meta property="og:locale" content="en_US">`,
  `<meta name="robots" content="index, follow, max-image-preview:large">`,
  `<meta name="author" content="Mike Sammartano">`,
  `<link rel="icon" href="/favicon.svg?${V}" type="image/svg+xml">`,
  `<link rel="icon" href="/favicon-32.png?${V}" type="image/png" sizes="32x32">`,
  `<link rel="apple-touch-icon" href="/apple-touch-icon.png?${V}">`,
  `<link rel="manifest" href="/site.webmanifest">`,
  `<link rel="preload" href="/vendor/three-r128.min.js" as="script">`,
  `<meta property="og:image" content="${abs('/og.png')}">`,
  `<meta property="og:image:type" content="image/png">`,
  `<meta property="og:image:width" content="1200">`,
  `<meta property="og:image:height" content="630">`,
  `<meta property="og:image:alt" content="Tectonics: a 3D block diagram of a subduction zone, with the slab sinking and volcanoes above it">`,
  `<meta name="twitter:card" content="summary_large_image">`,
  `<meta name="twitter:title" content="Tectonics: plate boundaries in 3D">`,
  `<meta name="twitter:description" content="Play, scrub and slice 3D block diagrams of subduction, collision, divergent and transform boundaries. A free classroom tool.">`,
  `<meta name="twitter:image" content="${abs('/og.png')}">`
].filter(Boolean).join('\n');
html = html.replace('<script type="application/ld+json">', tags + '\n<script type="application/ld+json">');
html = html.replace('<title>Tectonics</title>', '<title>Tectonics: Interactive 3D Plate Boundaries for Classrooms</title>');
if (SITE) html = html.replace('"@type": "WebApplication",', `"@type": "WebApplication",\n  "url": "${SITE}/",\n  "image": "${SITE}/og.png",`);
const NOSCRIPT = `<noscript><div style="max-width:40rem;margin:0 auto;padding:2rem 1.25rem;font:16px/1.6 system-ui,sans-serif">
<h2>Tectonics: plate boundaries in 3D</h2>
<p>Tectonics is a free classroom tool with 3D block diagrams you can play, scrub and slice open: subduction, collision, divergent boundaries, transform faults and hot spots.</p>
<ul><li>Watch millions of years of plate motion, with earthquakes, volcanoes and magma</li><li>Slice the block open to see the crust, mantle and slab</li><li>Make worksheets with answer keys</li><li>Download STL files for 3D printing and USDZ files for AR</li></ul>
<p>Tectonics needs JavaScript and WebGL to draw the 3D models. <a href="/privacy">Privacy</a></p></div></noscript>`;
html = html.replace('<body>\n', '<body>\n' + NOSCRIPT + '\n');
html = html.replace('</body>', '<script>if("serviceWorker" in navigator)addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}));</script>\n</body>');
// minify the page's own CSS and script (the file in the repo stays readable)
const before = html.length;
html = html.replace(/<style>([\s\S]*?)<\/style>/, (m, css) => `<style>${transformSync(css, { loader: 'css', minify: true }).code.trim()}</style>`);
html = html.replace(/<script>\n"use strict";([\s\S]*?)\n<\/script>/, (m, js) => `<script>${transformSync('"use strict";' + js, { minify: true, target: 'es2020', legalComments: 'none' }).code.trim()}</script>`);
console.log(`minified page: ${(before / 1024).toFixed(0)} KB to ${(html.length / 1024).toFixed(0)} KB`);
writeFileSync('dist/index.html', html);
const build = createHash('sha1').update(html).digest('hex').slice(0, 8) + '-' + new Date().toISOString().slice(0, 10).replace(/-/g, '');
writeFileSync('dist/sw.js', readFileSync('dist/sw.js', 'utf8').replace('__BUILD__', build));

/* ---------- site files ---------- */
writeFileSync('dist/site.webmanifest', JSON.stringify({
  name: 'Tectonics: plate boundaries in 3D', short_name: 'Tectonics',
  description: 'Four 3D block diagrams of plate boundaries you can play, scrub and slice. A free Earth Science classroom tool.',
  id: '/', start_url: '/', scope: '/', display: 'standalone', display_override: ['standalone', 'minimal-ui'],
  orientation: 'any', background_color: '#000000', theme_color: '#000000', lang: 'en', categories: ['education', 'science'],
  icons: [
    { src: `/icons/icon-192.png?${V}`, sizes: '192x192', type: 'image/png' },
    { src: `/icons/icon-512.png?${V}`, sizes: '512x512', type: 'image/png' },
    { src: `/icons/icon-512-maskable.png?${V}`, sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ]
}, null, 2));
writeFileSync('dist/robots.txt', 'User-agent: *\nAllow: /\nDisallow: /api/\n' + (SITE ? `\nSitemap: ${SITE}/sitemap.xml\n` : ''));
if (SITE) writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${SITE}/</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod><changefreq>monthly</changefreq><priority>1.0</priority></url>\n  <url><loc>${SITE}/privacy</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>\n</urlset>\n`);
writeFileSync('dist/_headers', `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; worker-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://server.arcgisonline.com https://upload.wikimedia.org https://thumb.wikimedia.org; font-src 'self'; connect-src 'self' https://api.stripe.com https://support.sammartano.workers.dev https://en.wikipedia.org https://es.wikipedia.org; frame-src https://www.youtube-nocookie.com https://js.stripe.com https://hooks.stripe.com; base-uri 'self'; form-action 'self'; frame-ancestors *; object-src 'none'

/
  Cache-Control: public, max-age=0, must-revalidate

/index.html
  Cache-Control: public, max-age=0, must-revalidate

/vendor/*
  Cache-Control: public, max-age=31536000, immutable

/sw.js
  Cache-Control: no-cache

/icons/*
  Cache-Control: public, max-age=604800

/og.png
  Cache-Control: public, max-age=86400
`);
console.log('built dist/' + (SITE ? ' for ' + SITE : ' (no SITE_URL: canonical, og:url and sitemap left out)'));
