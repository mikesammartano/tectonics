# Tectonics

Plate boundaries and hot spots as 3D block diagrams you can play, scrub and slice open: **subduction**, **collision**, **divergent**, **transform** and **hot spot** (a plate drifting over a fixed mantle plume, building an island chain). A free classroom tool, built as a sibling of [topo.science](https://topo.science) with the same design system.

- **Play millions of years.** A timeline with stages, speed, loop, and a rate slider in cm per year. Earthquakes, magma, volcanoes, plate arrows and mantle flow all follow the clock.
- **Slice it.** Move the cross-section through the block, stretch the relief, hover any rock for its name, density and thickness.
- **Learn.** Mike Sammartano's plate tectonics videos in the panel, each with a "Try" button that sets the model up (YouTube, privacy-enhanced mode, nothing loads until you press play).
- **Where on Earth.** A satellite and shaded-relief map (Esri tiles) with Bird's PB2002 plate boundaries, a pin and a section line for every real example, and a photo from each place's Wikipedia article.
- **Zoom.** Zoom buttons, a zoom slider, keys `+`, `-` and `0`, and "Zoom to" shortcuts (trench, arc, ridge axis, fault, plume and more).
- **Worksheets.** Seeded generator (English or Español): model snapshots, label the diagram, vocabulary, multiple choice, rate/time/distance problems, explain and predict, and answer-key pages. PDF at 300 dpi or print.
- **Files.** Binary STL (one watertight solid, or one per layer in a .zip) and USDZ for AR, exactly as you see the block, plus a PNG.
- **Everything else from the family:** Light / dark / auto, English / Español, share links and `?embed`, present mode, keyboard shortcuts, installable PWA, feedback form, Stripe donation card, privacy page.

## How it works

`index.html` is the whole app: markup, CSS (the topo design system) and JS in one file, readable with no bundler and no framework. three.js r128 is the only library (jsPDF loads lazily, only for PDFs).

Each boundary is one function `col(x, z, F, o)` that returns the top of every rock layer for the column at `(x, z)` at one moment. The ground mesh, the cut faces, the outlines, the quake dots, the profile chart, the STL and the USDZ all read those same columns, so they always agree. Horizontal scale is 1 unit = 100 km; rock layers are true to scale vertically (1 unit = 80 km) and only the surface relief is stretched.

## Build and deploy

```
npm install
npm run dev      # builds dist/ and serves it on http://localhost:8787
npm run build    # builds dist/ for Cloudflare
npm run art      # redraws icons, og.png and logo/ (Mac only; commit static/)
```

Deploy is a `git push` to `main`: Cloudflare builds from the repo (Workers & Pages → Builds, build command `npm run build`, deploy command `npx wrangler deploy`). Live at https://tectonics.sammartano.workers.dev once connected.

### One-time dashboard steps

1. **Feedback email.** Cloudflare → the sending zone → Email → Email Routing → Get started, and make sure `sammartano@me.com` is a verified destination. Then uncomment `send_email` in `wrangler.jsonc` and set `FEEDBACK_FROM` in `src/worker.js` to an address on that zone. Until then the form opens the visitor's mail app.
2. **Apple Pay on the donation card.** Stripe → Settings → Payment methods → Apple Pay → add this site's domain.

## Files

| File | What it is |
|---|---|
| `index.html` | The app |
| `build.mjs` | Builds `dist/`: vendors three.js and jsPDF, adds metas, headers, manifest, service worker; `--art` draws the icons |
| `src/worker.js` | `POST /api/feedback`; everything else is static assets |
| `static/` | Privacy page, 404, icons, og image, service worker, vendored jsPDF |
| `*-PROMPT.md`, `DESIGN.md`, `BLUEPRINT.md`, `topo-design.css` | The guidance this app was built from |
