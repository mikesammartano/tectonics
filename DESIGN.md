# topo design system — how to rebuild the look in another app

Everything below is measured from topo.science as of 26 Sep 2026. Pair it with
`topo-design.css` (tokens + components, extracted verbatim) and you can reproduce
the layout and feel closely. Where a value is in the CSS I don't repeat the
number here; where it is a rule of thumb I say so.

## 1. Principles

1. **Colour belongs to the content.** The chrome is white/grey/black plus one
   blue. Anything colourful on screen should be the thing the user is looking
   at (in topo, the model and map), never the UI.
2. **One blue means "interactive or measured".** Selected state, toggles,
   sliders, primary buttons, focus rings, cursor marks and measured values all
   share `--input`. Nothing else is blue.
3. **Hairlines lift surfaces, not colour.** White cards on `#f5f5f7` with a
   1 px edge at 10 % black. Shadows only on things that float.
4. **Hide the secondary.** Keys, readouts and hints tuck behind a small circled
   "i" and spring out on demand.
5. **Everything is a pill or a rounded card.** Buttons and tags are fully round
   (`--r-pill`); cards are 20 px (`--r-xl`); controls are 12 px (`--r-md`).
6. **Motion is short and springy.** 130 ms for hover, 220 ms for state, one
   spring (`--spring`) for anything that appears.

## 2. Colour tokens

Neutrals follow apple.com. Light mode:

| token | value | use |
|---|---|---|
| `--page` | `#f5f5f7` | page background |
| `--stage` / `--panel` / `--card` | `#ffffff` | any surface |
| `--raised` | `#f5f5f7` | chip resting state, hover of cards |
| `--chip` | `#e8e8ed` | segmented-control track |
| `--control` | `#d2d2d7` | pressed/active control, input focus bg |
| `--ink` | `#1d1d1f` | headings, primary text, selected pill fill |
| `--ink-1` | `#333336` | body text |
| `--ink-2` | `#424245` | labels |
| `--ink-3` | `#6e6e73` | quiet text |
| `--ink-meta` | `#86868b` | eyebrows, captions, disabled |
| `--edge` / `--edge-strong` / `--edge-soft` | black @ 10 / 20 / 6 % | borders |
| `--input` | `#0071e3` | THE blue (Apple's) |
| `--input-ink` | `#0066cc` | blue as text / hover |
| `--input-wash` | blue @ 8 % | focus halo, selected tint |
| `--measured`, `--reference` | = `--input` | kept as separate tokens so a data colour can be split out later |

Dark mode: page and stage `#000000`, panels/cards `#1d1d1f`, raised `#2c2c2e`,
chip `#333336`, control `#424245`, ink `#f5f5f7` → meta `#86868b`, edges white
@ 12 / 22 / 7 %, blue `#2997ff` (text `#6bb6ff`).

Theme switching: `<html data-mode="light|dark">` forces; nothing set follows the
device. `color-scheme` is set on each so native controls match.

Glass (pills that sit on imagery): `--card-glass` = stage colour at 64 % with
`backdrop-filter: blur(14px) saturate(1.3)` and a 1 px `--stage-edge` border.

## 3. Type

- Family: the **system stack** (`-apple-system, BlinkMacSystemFont, "SF Pro
  Text", "Segoe UI Variable", "Segoe UI", Roboto, "Helvetica Neue", Arial`),
  so the app reads as native on every platform and ships no font files. Body
  is 400; labels and buttons 500–600; `tabular-nums` everywhere so numbers
  don't jitter. Uppercase eyebrows use .1em tracking, large heads −.025em.
- Scale (rem): eyebrow .6875 · meta .75 · control .8125 · body 1 · card head
  1.125 · dialog head 1.25 · hero 2–2.75 (`clamp(2rem,6vw,2.75rem)`).
- Eyebrow: 600, uppercase, `.14em` tracking, `--ink-meta`. Used above every
  group and card.
- Numbers that matter (readouts): 700, `-.02em` tracking, unit as a small 600
  suffix.
- Line-height: 1 on controls, 1.2 on heads, 1.45–1.6 on prose.

## 4. Spacing and shape

- Base unit 4 px; the grid is .25 / .375 / .5 / .625 / .75 / 1 / 1.25 rem.
- Hit size `--hit: 2.75rem` (44 px) for every button/segment item; 3.5 rem in
  present (touch board) mode.
- Toolbar gap between every group and button: **6 px** (one gap everywhere).
- Card padding 1 rem × 1.125 rem; panel section padding 1 rem 1.25 rem.
- Radii: sm .5 · md .75 · lg 1 · xl 1.25 rem · pill 999 px.
- Shadows: `--shadow-lift` 1 px for chips; `--shadow-panel` for the side
  panel; `--shadow-overlay` for floating cards/dialogs. Cards on the page have
  no shadow, only a hairline.

## 5. Layout (desktop)

```
┌ .work (padding 1rem 1.25rem 1.5rem; padding-right grows by 23rem when the panel is open)
│ ┌ .stagewrap  (card: r-xl, 1px edge, overflow hidden, faint graph-paper bg)
│ │ ┌ .stagebar  (.625rem padding, hairline below)
│ │ │  [tool segment][undo redo]  ……spacer……  [AI][Learn][Print][Share][Controls][Support]
│ │ ├ .compare  (grid: minmax(0,1fr) | square right pane, 1px gap = hairline)
│ │ │  ┌ pane A (3D)                      ┐ ┌ pane B (map, square)        ┐
│ │ │  │  place card top-left (optional)  │ │                              │
│ │ │  │  (i) bottom-left → readouts      │ │   key ← (i) bottom-right     │
│ │ └  └─────────────────────────────────┘ └──────────────────────────────┘
│ ┌ .card.xsec  (appears below when there is a cross-section; × top-right)
│ │  EYEBROW / Heading / stat chips / chart
└ .rail (fixed right, 23rem, slides in with --panel-t .38s; tabs Controls | Learn)
```

Rules that make it feel right:
- The stage card is the only big rectangle; everything else is inside it or is
  a floating card.
- The right pane is a **square** sized from height (`min(50%, 100vh − 7.25rem)`)
  so it never overflows the viewport; the left pane takes the rest.
- Toolbar left group = *editing* (tools + history); right group = *actions*.
  Support is the last item and the only filled blue button in the bar.
- Overlays on panes are glass pills 16 px from the corner, and are hidden
  until their "i" is pressed; pressed "i" turns blue.
- The side panel is `position:fixed`, full-height, hairline left edge, sticky
  header with a segmented tab control, sticky footer with quiet links.
- Panel groups: eyebrow label + content; hairline `--edge-soft` between
  groups; a "Reset" quiet button on the right of the group head.

## 6. Layout (phone, ≤ 48 rem)

- The page is one edge-to-edge column: model (full-width square), map (same),
  then the cross-section card, separated by hairlines; no side gutters or
  card corners.
- The action buttons spread evenly across a **sticky top bar** (icon only)
  and the tool segment + undo/redo sit in a **bar fixed to the bottom**
  (`.editbar`, safe-area inset). Both bars are transparent: only the glass
  tracks float, with `--shadow-panel` and a 14 px blur. The bottom bar
  slides away while the panel is open; page bottom padding keeps content
  clear of it.
- With the hand tool the map lets a vertical swipe scroll the page
  (`touch-action: pan-y`). Modals, popovers and the video player fill the
  screen with safe-area padding.
- Toasts and coach cards sit 5.75 rem up, above the bar.
- Present mode is disabled on phones (it's for projectors and boards).
- **Present mode** hides all chrome except a floating dock (the same two
  glass tracks) and one circled "i" top-right. That "i" drops a single
  frosted card (`.pinfo`): the readouts on top, a hairline, then the map
  key, arriving a beat apart on a spring; it folds back into the button.
  Floating cards (map or model, cross-section) start below it.
- **Stage position.** A three-item segmented control in the dock (left ·
  centre · right, or ⇧← / ⇧→) slides the stage 22 vw aside so floating
  cards can sit beside it on a classroom display. The map moves with a
  CSS spring on `--stage-shift`; the 3D view shifts its camera view offset
  (`camera.setViewOffset`) eased in the frame loop, so nothing is clipped
  or distorted. Below ~1200 px the dock goes icon-only.

## 7. Components (all in `topo-design.css`)

- **Button `.btn`** 44 px pill, 600 / .875 rem. Variants: `--primary` (blue
  fill, white text, blue halo on hover), `--ghost` (hairline), `--quiet`
  (text only), `--icon` (square), `--sm` (36 px, r-sm), `--block`.
- **Toolbar groups.** Both the tool palette and the action buttons sit in
  identical glass tracks (`.segment--tools`, `.stagebar__actions`): 44 px
  pill, 3 px inset, 3 px gaps, 36 px items with 9 px corners, 1 px hairline
  dividers (`.segment__sep`) between logical groups. Items are quiet ink
  glyphs, full ink on hover, and the *active* item is a blue pill with a
  4 px blue halo. One emphasised item (Support) is an ink pill with the
  same radius and halo. The toolbar itself floats on `--bar-glass` (white
  at 72 %, blur 18 px) over the stage grid.
- **Segmented control `.segment`** chip-coloured track, .1875rem inset;
  selected item is an ink pill (`.segment--tools` uses blue instead because it
  is a *mode*). A sliding thumb (`.seg-thumb`) animates between items.
- **Choice grid `.choice__set--3/4/5`** for presets: 40 px raised chips,
  selected = ink fill, optional `small` sub-label.
- **Toggle** 42×24 pill, knob 18 px, blue when on.
- **Slider** 8 px track, 24 px white handle with a 5 px blue ring; halo grows
  on hover/press; value shown top-right in blue.
- **Readouts** a glass strip of `label / big number` cells divided by
  hairlines. Label .625rem uppercase .12em; value 1.125rem 700.
- **Stat chip `.stat`** raised pill with `label value`; measured values in blue.
- **Info button `.map-info`** 32 px glass circle with a Phosphor "info" glyph;
  reveals a panel with `.is-open` (opacity + `translateX(±.75rem) scale(.92)`
  → none, spring .45s). Remember the state in localStorage.
- **Close `×` `.xsec__x`** 32 px quiet circle, absolute top-right of a card.
- **Card `.card`** white, hairline, r-xl; `.xsec` adds `rise` animation.
- **Input `.input`** 40 px, raised bg, hairline, focus = stronger edge +
  control bg. Never a blue border on focus; the focus ring is the `:focus-
  visible` outline.
- **Toast** glass pill bottom-centre, 1.6 s.
- **Dialog / welcome** centred card, r-xl, overlay shadow, `rise` in; header
  with a 32 px blue icon tile, hairline before the body, primary + ghost
  buttons right-aligned, a one-line tip in meta.
- **Icons** Phosphor Regular (viewBox 256) at 1.05–1.125 rem, stroked 5 units
  heavier so they sit with 600 text.

## 8. Motion

- `--fast .13s` colour/background; `--med .22s` state; `--ease
  cubic-bezier(.2,.8,.2,1)`; `--spring cubic-bezier(.3,1.35,.5,1)`.
- Appear: `rise` (translateY .75rem + fade) for cards, `cardIn` (scale .96 +
  fade) for floats, `barIn` (slide up, spring) for the phone bar.
- Press: `transform:scale(.96)` on `:active`; .92 for round icon buttons.
- Panel slide: `transform` with `--panel-t .38s` and `--panel-ease
  cubic-bezier(.32,.72,0,1)`; content groups stagger in by 30 ms.
- Theme change: a circular `view-transition` reveal from the toggle.
- `prefers-reduced-motion`: all animations and transitions to ~0.

## 9. Interaction conventions

- Keyboard: single-letter tool shortcuts, `C` panel, `D` theme, `?` shortcut
  sheet, `Esc` closes the topmost thing; in present mode `M` swaps the stage
  and ⇧←/⇧→ slide it. Show them as `<kbd>` chips.
- Tooltips: 600 / .75rem glass pill, 14 px below the cursor.
- Hover marks on canvases are drawn in the blue; the cursor is hidden while a
  custom mark is shown.
- Every icon button has a `title` and, if icon-only, an `aria-label`.
- Persist UI choices (panel open, "i" panels, theme, language) in
  localStorage with a `topo.` prefix; persist documents separately.

## 10. Checklist for the new app

1. Copy `topo-design.css`, add the fonts (or swap to Inter), set
   `data-mode` handling.
2. Build the page as: one big stage card with a top bar, panes inside, cards
   below, fixed right panel.
3. Use only `--ink` fills and `--input` blue for state. Resist a second colour.
4. Put secondary info behind an `(i)`.
5. 44 px hits, 6 px gaps, hairlines everywhere, shadows only when floating.
6. Phone: one full-width column; action track floating at the top, tool
   track at the bottom, both bars transparent; modals go full screen.
