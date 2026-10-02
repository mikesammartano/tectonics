# Blueprint — build a new app with topo's structure and visuals

This is the master prompt. It describes how topo.science is built, from repo layout to the last interaction detail, so a new app can be started from a blank folder and come out looking and behaving like a sibling. The companion files give exact code where exactness matters:

| File | Use it for |
|---|---|
| `topo-design.css` | Drop-in tokens and components (verbatim from the live build). |
| `STYLE-PROMPT.md` | The visual language: principles, colour, type, geometry, layout, components, motion, do-nots. |
| `FOOTER-PROMPT.md` | The settings-panel footer (donate card + action row), exact markup and CSS. |
| `FEEDBACK-PROMPT.md` | The feedback dialog and its Worker email route, exact code. |
| `DONATE-PROMPT.md` | The Stripe donation dialog, exact behaviour and config. |
| `DESIGN.md` | The long-form design notes (same content as STYLE-PROMPT, with more reasoning). |

Paste everything below the line into the assistant that will build the new app, attach the companion files, and fill in the `[…]` placeholders at the top.

---

Build **[App name]** ("[one-line purpose]") as a sibling of topo.science: the same project structure, deploy pipeline, app shell, feature set where it applies, and the same visual language. Read the attached `topo-design.css`, `STYLE-PROMPT.md`, `FOOTER-PROMPT.md`, `FEEDBACK-PROMPT.md` and `DONATE-PROMPT.md` before writing code, and reproduce them rather than reinterpreting them.

## 1. Repository and build

```
[app]/
  [app].html            the entire app: markup, CSS and JS in one file; also publishable as a Claude artifact
  topo-design.css       the shared design system (copy as is; the app's own <style> starts from the same tokens)
  logo/                 PNG lockups, mark, og share card, YouTube thumbnail
  README.md             what's here, build, run locally, deploy
  DESIGN.md, *-PROMPT.md  the guidance docs, kept current
  deploy/
    build.py            wraps the single file for production: head metas, JSON-LD, noscript, splits heavy data
                        into a lazy JSON, stamps the service worker with a build id, copies ./static into ./public
    wrangler.jsonc      Cloudflare Worker config: assets from ./public with run_worker_first ["/api/*"],
                        ai binding, a rate limiter, send_email binding (commented until Email Routing is on),
                        custom_domain routes
    src/worker.js       the API: /api/* routes only; everything else is env.ASSETS.fetch
    static/             _headers (security + caching + CSP), 404.html, privacy.html, robots.txt, sitemap.xml,
                        site.webmanifest, sw.js, favicon.svg, favicon-32.png, apple-touch-icon.png, icons/, og.jpg,
                        vendor/ (pinned copies of any CDN library)
    public/             build output (git-ignored)
```

- **Deploy = `git push` to `main`.** Cloudflare builds from the repo (Workers & Pages → Builds). No CLI deploys.
- The single file stays readable; no bundler, no framework, no new libraries. If a library is needed (e.g. three.js), pin it in `static/vendor/` and load it from there.
- `build.py` must: set `<title>`, description, canonical, Open Graph and Twitter metas, `theme-color` for both schemes, `apple-mobile-web-app-*` and `mobile-web-app-capable`, the manifest link, versioned icon links (`?v=N` so browsers drop cached favicons), JSON-LD `WebApplication`; add a `<noscript>` summary; register `/sw.js` only in the built index; strip any inline data-URI favicon in favour of the real files.
- `_headers`: `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` (camera, mic, geolocation off; `payment=()`), a strict CSP (`default-src 'self'`; `script-src 'self' 'unsafe-inline' https://js.stripe.com`; `frame-src` youtube-nocookie + Stripe; `connect-src 'self' https://api.stripe.com https://support.sammartano.workers.dev`; `frame-ancestors *` so embeds work), `max-age=0, must-revalidate` for `/` and `/index.html`, `immutable` for `/vendor/*`, `no-cache` for `/sw.js`.
- `sw.js`: network-first for HTML, cache-first for same-origin assets, `/api/*` passthrough, a versioned cache name stamped by the build, old caches purged on activate.
- PWA: manifest with `display: standalone`, `display_override`, 192/512/maskable icons; an **Install app** button appears in the panel footer only when `beforeinstallprompt` fires.

## 2. App shell (desktop)

One stage card holds everything the user works on; a fixed right panel holds settings; cards below hold derived views.

```
.work (padding 1rem 1.25rem 1.5rem; right padding grows 23rem while the panel is open, .38s)
└ .stagewrap   r-xl card, 1px hairline, faint graph-paper grid drawn once on this element
  ├ .stagebar   toolbar: frosted --bar-glass (desktop only), hairline below
  │   [editing track: tools + undo/redo]  …spacer…  [action track: AI | Learn Print Share Controls | Support]
  └ .compare    the main surfaces side by side (left flexible, right a square sized from viewport height),
                transparent panes so the grid runs unbroken, a hairline between them
.card           derived view(s) below (e.g. a chart), eyebrow + heading + stat chips, × top-right
.rail           fixed right panel 23rem: sticky header with a Controls | Learn segmented tab,
                scrolling groups (eyebrow + controls, hairlines between), sticky footer (FOOTER-PROMPT.md)
```

- Both toolbar tracks are built identically (44 px glass pill, 3 px inset, 36 px items, 9 px radius, hairline dividers between logical groups) and share one state table: rest `--ink-1`; hover `--ink` on `--hover-strong` with the glyph lifted 1.5 px; press scale .96; on = blue fill + white glyph + halo; focus = 2 px blue inset ring; disabled 40 %. One emphasised item (Support) is an ink pill with the same radius and halo, last on the right.
- Overlays on the surfaces (readouts, keys, legends) are glass pills 16 px from a corner and **hidden until a circled "i" button is pressed**; the "i" turns blue while open; the choice is remembered.
- Popovers (AI, Share, shortcuts) anchor under their button with right edges aligned, `--panel`, r-xl, overlay shadow.
- Dialogs (welcome, donate, feedback, print) are centred cards on a blurred scrim with `rise`; focus moves to the panel on open and back to the opener on close; Esc and a scrim click close.

## 3. App shell (phone, ≤ 48 rem)

- One edge-to-edge column: the main surfaces as full-width squares, then the cards, hairlines between, no gutters or corners.
- The action track floats in a **sticky top bar**, the editing track in a **bar fixed to the bottom** with safe-area padding; both bars are transparent, only the glass tracks show (shadow + 14 px blur). The bottom bar slides away while the panel is open.
- Never put `backdrop-filter` on an element that contains `position: fixed` children.
- Every modal, popover and player fills the screen. With a non-editing tool active, a vertical swipe over a reading surface scrolls the page (`touch-action: pan-y`).

## 4. Presentation mode (classroom display)

- A **Present** button goes full screen: chrome disappears except a floating dock (the same two tracks) and one circled "i" top-right that drops a single card holding the readouts and the key.
- Dock extras: card toggles (show/hide the secondary surface and the derived card as draggable, resizable floats), **Swap** (which surface is the stage), and a **left · centre · right** stage-position control (the stage slides 22 vw aside so floats fit beside it; the 3D view shifts its camera view offset so nothing is clipped). `M` swaps, ⇧←/⇧→ slide, Esc exits.
- Touch boards get 3.5 rem hits. Everything chosen here is remembered.

## 5. Features that every sibling should carry

- **Welcome dialog** on first visit: brand mark + title + one-line lede, hairline, 3–5 feature rows with quiet grey glyph tiles, the donate card (the only blue element), one full-width primary "Start exploring", a centred tip. Remembered in `localStorage`.
- **Undo/redo** (30 steps), **Reset**, **presets**, and where it applies **real-world data** loaded on demand from a lazy JSON.
- **Build with AI** (Workers AI through `/api/…`, prompt guard + word list, 10/min rate limit) with an "ideas" chip row.
- **Share**: the document encoded in the URL hash (deflate + base64url, presets by name), `?embed` mode with a minimal toolbar, copy-link and copy-embed-code rows.
- **Print**: a dialog with a live preview (paper size, orientation, colour scheme, PDF/PNG at 300 dpi) and, where it applies, worksheets with answer keys. Printed scales must be exact (snap the drawing size so the stated ratio is true).
- **Export**: binary STL (watertight) and USDZ (vertex colours, validated with `usdchecker --arkit`) where there is a 3D model.
- **Learn**: a video list with no thumbnails (numbered rows, duration, a "Try" chip), privacy-enhanced YouTube in a floating player, and a card-style link to the playlist.
- **Keyboard shortcuts** sheet (`?`), single-letter tool keys, `C` panel, `D` theme, Esc closes the topmost thing.
- **Light / dark / auto** with a circular view-transition reveal; **English / Español** through a runtime `tr()` dictionary that covers every string, tooltip and canvas label.
- **Feedback** (FEEDBACK-PROMPT.md) and **Support** (DONATE-PROMPT.md) from the panel footer, the toolbar and the welcome dialog.
- **Privacy page**: what stays on the device, what is sent where (AI, data, video, share links, feedback, Stripe), hosting logs, students and schools, contact.

## 6. Conventions

- Persist UI choices under a short app prefix in `localStorage` (`[app].ui`, `[app].theme`, `[app].lang`, `[app].welcome`, panel/info states); persist the document separately with a version field.
- Every icon button has `title` and, when icon-only, `aria-label`; dialogs use `role="dialog" aria-modal aria-labelledby`; segmented choices use real radios or `aria-pressed`.
- Icons: Phosphor Regular (256 grid, filled, `currentColor`, stroked 5 units heavier) only; the brand mark and map symbols are the exceptions.
- Fonts: the system stack; `tabular-nums` on `body`; no web fonts.
- Hover echoes: pointing at content in one view marks the matching spot in the other; suppress while the view animates; make it a toggle.
- Performance: render only when something changed (`needsRender`), idle out ambient animation after 6 s without input, one frosted surface per bar (no nested backdrop filters), cap the WebGL buffer around 2.6 MP, throttle raycasts to one per frame.
- Before every deploy: CSS brace balance, id references vs markup, phone-width check of any toolbar change, light and dark screenshots.

## 7. Copy voice

Short, concrete, teacher-facing. Verb-first labels ("Raise", "Make it rain", "Send feedback"). Tooltips explain the result, not the control. No exclamation marks except "Thank you." states. Plain Spanish in the dictionary for every string.
