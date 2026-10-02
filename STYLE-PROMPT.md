# Design prompt — reproduce the topo.science look in another app

Paste everything below the line into the assistant that will build or restyle the other app. It is written to be complete on its own; `topo-design.css` can be attached for exact values but is not required.

---

You are styling a web app. Reproduce the following design system exactly — the same palette, type, geometry, components, states and motion — while keeping the app's own content and features. Where the app has an element this spec doesn't name, design it from these rules rather than inventing a new pattern.

## 1. Principles (apply these before any specific rule)

1. **Colour belongs to the content.** The interface is white, grey and near-black plus exactly one blue. Anything colourful on screen must be the user's content (images, maps, charts, data), never the chrome.
2. **The one blue means "interactive or measured".** Selected state, toggles, sliders, primary buttons, focus rings, cursor marks and measured values all use the same blue. Nothing else is blue; there is no second accent.
3. **Hairlines lift surfaces, not colour.** White cards on a `#f5f5f7` page with a 1 px edge at 10 % black. Shadows appear only on things that float (popovers, floating cards, dialogs, the mobile bars' tracks).
4. **Hide the secondary.** Keys, readouts, legends and hints live behind a small circled "i" button and spring out on demand; they are never on screen by default.
5. **Everything is a pill or a rounded card.** Buttons and tags are fully round; cards are 20 px; controls are 12 px; items inside a track are 9 px.
6. **Motion is short and springy.** 130 ms for colour, 220 ms for state, one spring curve for anything that appears. Nothing bounces for decoration.
7. **Total consistency.** Two elements that do the same job look and behave identically, including hover, press, on, focus and disabled states.

## 2. Colour tokens

Define these as CSS custom properties on `:root`, dark by default, with a light block under `@media (prefers-color-scheme: light)` and forced blocks for `[data-mode="light"]` / `[data-mode="dark"]`. Set `color-scheme` in each so native controls match.

**Light**

| token | value | use |
|---|---|---|
| `--page` | `#f5f5f7` | page background |
| `--stage`, `--panel`, `--card` | `#ffffff` | every surface |
| `--raised` | `#f5f5f7` | chips at rest, hover of rows |
| `--chip` | `#e8e8ed` | segmented-control track |
| `--control` | `#d2d2d7` | pressed control, focused input bg |
| `--raised-hover` | `#c7c7cc` | |
| `--ink` | `#1d1d1f` | headings, primary text, selected-pill fill |
| `--ink-1` | `#333336` | body text, icon glyphs at rest |
| `--ink-2` | `#424245` | labels |
| `--ink-3` | `#6e6e73` | quiet text |
| `--ink-meta` | `#86868b` | eyebrows, captions, disabled |
| `--edge` / `--edge-strong` / `--edge-soft` | black @ 10 % / 20 % / 6 % | borders, hairlines |
| `--hover` / `--hover-strong` | black @ 5 % / 9 % | hover washes |
| `--input` | `#0071e3` | THE blue |
| `--input-ink` | `#0066cc` | blue as text, hover of blue fills |
| `--input-wash` | blue @ 8 % | halos, selected tints |
| `--input-edge` | blue @ 45 % | tinted card borders |
| `--on-accent`, `--on-ink` | `#ffffff` | text on blue / on ink |
| `--bar-glass` | white @ 72 % | frosted toolbar |
| `--card-glass` | stage colour @ 64 % | pills over imagery |
| `--stage-edge` | black @ 12 % | edges of glass pills |
| `--scrim` | `rgba(20,24,30,.4)` | behind dialogs |

**Dark**: page and stage `#000000`; panel and card `#1d1d1f`; raised `#2c2c2e`; chip `#333336`; control `#424245`; raised-hover `#515154`; ink `#f5f5f7` → ink-1 `#e8e8ed` → ink-2 `#d2d2d7` → ink-3 `#a1a1a6` → meta `#86868b`; edges white @ 12 / 22 / 7 %; hovers white @ 5 / 10 %; blue `#2997ff` (as text `#6bb6ff`); on-ink `#1d1d1f`; bar-glass graphite @ 72 %; scrim `rgba(3,7,18,.72)`.

Measured values (numbers the user reads off the content) use the same blue as controls. Do not introduce a "measured" or "reference" colour.

## 3. Type

- **System stack**, no web fonts: `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI Variable", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`. Mono for code only: `ui-monospace, "SF Mono", Menlo, Consolas, monospace`.
- Body 400 at 1 rem. Labels and buttons 500–600. Headings 600.
- Scale (rem): eyebrow .6875 · meta .75 · control .8125 · body 1 · card head 1.125 · dialog head 1.375 · hero `clamp(2rem, 6vw, 2.75rem)`.
- Eyebrow: 600, uppercase, `.1em` tracking, `--ink-meta`; used above every group and card.
- Large headings: letter-spacing −.02 to −.025em. Body: none.
- `font-variant-numeric: tabular-nums` on `body` so numbers never jitter.
- `-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility`.
- Big numbers (readouts): 700, 1.125 rem, −.02em, with the unit as a small 600 suffix in the same colour.

## 4. Geometry

- Base unit 4 px. Spacing steps: .25 / .375 / .5 / .625 / .75 / 1 / 1.25 rem.
- Hit size `--hit: 2.75rem` (44 px) for every button and control; 3.5 rem on touch displays in presentation mode.
- Radii: `--r-sm .5rem`, `--r-md .75rem`, `--r-lg 1rem`, `--r-xl 1.25rem`, `--r-pill 999px`. Items inside a track use `.5625rem` (9 px).
- Card padding `1rem 1.125rem`; panel section padding `1rem 1.25rem`.
- Shadows: `--shadow-lift 0 1px 2px black@10%` for chips; `--shadow-panel 0 16px 40px black@13%, 0 2px 6px black@8%` for panels and floating tracks; `--shadow-overlay 0 28px 70px black@20%` for dialogs and floating cards. Cards resting on the page have **no** shadow, only a hairline.
- Toolbar gap between every group and button: 6 px, everywhere.

## 5. Layout

**Desktop**

```
.work  (padding 1rem 1.25rem 1.5rem; right padding grows by 23rem when the side panel is open, over .38s)
└ .stagewrap  card: r-xl, 1px --edge, overflow hidden, faint graph-paper grid drawn ONCE on this element
  ├ .stagebar  toolbar: .625rem padding, hairline below, frosted --bar-glass with blur(18px) (desktop only)
  │    [tool track][undo redo]  ……spacer……  [AI | Learn Print Share Controls | Support]
  └ .compare   two panes side by side, 1px hairline between; right pane is a square sized from the
               viewport height (min(50%, 100vh − 7.25rem)); panes are transparent so the grid runs unbroken
.card  below: eyebrow / heading / stat chips / content; a plain × in its top-right corner
.rail  fixed right panel, 23rem, hairline left edge, slides in with transform over .38s cubic-bezier(.32,.72,0,1);
       sticky header with a segmented tab control, sticky footer with quiet links; content groups stagger in by 30ms
```

- The stage card is the only large rectangle. Everything else sits inside it or floats.
- Overlays on panes are glass pills 16 px from the corner, hidden until their "i" is pressed. The "i" (32 px glass circle) turns blue while open.
- Keep the page background flat; never add gradients, patterns or imagery to chrome.

**Phone (≤ 48 rem)**

- One edge-to-edge column: content panes as full-width squares, then cards, separated by hairlines; no side gutters or card corners.
- Action buttons spread evenly across a **sticky top bar**, the editing tools + undo/redo sit in a **bar fixed to the bottom** with safe-area padding. Both bars are **transparent**: only the glass tracks float, with `--shadow-panel` and a 14 px blur. The bottom bar slides away while a panel is open; page bottom padding keeps content clear of it.
- Every modal, popover and player fills the screen with safe-area padding.
- Never put a `backdrop-filter` on an element that contains `position: fixed` children (it becomes their containing block).

## 6. Components

**Toolbar tracks** (the tool palette and the action group are built identically)
- Track: 44 px tall pill, r-md, `--card-glass` fill, 1 px `--stage-edge`, 3 px inset, 3 px gaps. No blur on the track itself when it sits on a frosted bar.
- Items: 36 px × 44 px, r 9 px, icon-only at narrow widths, 600 / .875 rem when labelled.
- Dividers between logical groups: 1 px × 24 px, `--stage-edge`, 6 px margin each side.
- **States, identical for every item in every track:** rest = `--ink-1` on transparent; hover = `--ink` on `--hover-strong` with the glyph lifted 1.5 px (spring .28s); press = `scale(.96)`; on = `--input` fill, white glyph, halo `0 0 0 .25rem --input-wash, 0 4px 14px blue@18%`; focus-visible = 2 px blue inset ring; disabled = 40 % opacity, no hover. One emphasised item (a call to action such as Support) is an ink pill with the same radius and halo, and is the last item on the right.
- A selected tool is indicated by a blue thumb that slides between items (transform + width, .32s spring).

**Buttons `.btn`** — 44 px pill, 600 / .875 rem, `text-decoration: none` even on links. Variants: primary (blue fill, white text, blue halo on hover), ghost (hairline), quiet (text only), icon (square), sm (36 px, r-sm), block (full width). Press `scale(.96)`.

**Segmented control** — `--chip` track, 3 px inset; selected item is an **ink** pill (not blue) unless it selects a *mode*, in which case blue.

**Choice grid** — 40 px `--raised` chips in 3/4/5 columns; selected = ink fill; optional small sub-label at 75 % opacity.

**Toggle** — 42 × 24 pill, 18 px knob, blue when on. **Slider** — 8 px track, 24 px white handle with a 5 px blue ring, halo grows on hover/press, value shown top-right in blue.

**Readouts** — glass strip of `label / big number` cells divided by hairlines. Label .625 rem uppercase .09em; value 1.125 rem 700.

**Stat chip** — `--chip` pill with `label value`; values in blue.

**Info button** — 32 px glass circle with an "info" glyph; toggles a panel with `.is-open`: from `opacity 0, translate(±.75rem) scale(.92)` to rest over .45s spring; blue while open; remember the state.

**Card** — white, 1 px `--edge`, r-xl, no shadow; enters with `rise` (.75 rem up + fade, .22s). Close is a plain × (32 px quiet circle) absolute top-right.

**Input** — 40 px, `--raised` fill, hairline; focus = `--edge-strong` + `--control` bg. Never a blue border on focus; focus rings are the `:focus-visible` outline only.

**Popover** — `--panel`, r-xl, `--shadow-overlay`, anchored under its button with the right edges aligned, 8 px gap; header row of a 36 px blue icon tile, a 600 title and a quiet ×.

**Dialog** — centred card, r-xl, overlay shadow, `rise` in, over a blurred `--scrim`. Header with a 44 px blue tile, hairline before the body, one full-width primary action, an optional centred quiet tip beneath. Focus the panel on open, not a button, so no ring shows.

**Donate card** (welcome dialog and settings-panel footer): the one blue-tinted element: `--input-wash` fill, `--input-edge` border, a 40 px blue tile with a heart on the left, "Support my work" + one quiet line, an arrow on the right; the whole card is the button and opens the Stripe donation dialog (see DONATE-PROMPT.md). Never a third-party widget or an outbound link.

**Feedback dialog** (see FEEDBACK-PROMPT.md): same dialog chrome; Idea / Bug / Question segmented control, message, optional email, a quiet note that doubles as the status line, one primary Send.

**Toast** — glass pill, bottom centre, 1.6 s. **Tooltip** — 600 / .75 rem glass pill 14 px below the cursor; suppressed when the same value is already visible on screen.

**Icons** — one family only (Phosphor Regular, 256 grid, filled paths, `currentColor`), 18 px in buttons, with `stroke: currentColor; stroke-width: 5` added so they sit with 600 text. Brand marks and map symbols are the only exceptions. No stroked 24-grid icons mixed in.

## 7. Motion

- `--fast .13s` colour/background · `--med .22s` state · `--ease cubic-bezier(.2,.8,.2,1)` · `--spring cubic-bezier(.3,1.35,.5,1)`.
- Appear: `rise` for cards and dialogs, `cardIn` (scale .96 + fade) for floating cards, `barIn` (slide up, spring) for bars, `dockIn` for a presentation dock.
- Panel slide: `.38s cubic-bezier(.32,.72,0,1)`; children stagger 30 ms.
- Theme change: a circular view-transition reveal from the toggle.
- `prefers-reduced-motion: reduce` sets all durations to ~0.

## 8. Interaction conventions

- Single-letter keyboard shortcuts for tools; `C` panel, `D` theme, `?` shortcut sheet, `Esc` closes the topmost thing. Show shortcuts as `<kbd>` chips (grey, 1.5 rem tall).
- Every icon button has a `title`; icon-only ones also an `aria-label`.
- Persist UI choices (panel open, info panels, theme, language) in `localStorage` under a short app prefix; persist documents separately.
- Hover echo: pointing at content in one view marks the corresponding spot in the other with a small blue target; suppress it while the view is animating.

## 9. Do not

- Add a second accent colour, gradients, coloured icon tiles in lists, or drop shadows on resting cards.
- Underline links styled as buttons.
- Use web fonts.
- Give any element a hover, press or focus treatment that differs from its siblings.
- Let secondary information sit on screen by default when an "i" toggle would do.
