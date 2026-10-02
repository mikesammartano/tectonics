# Prompt — reproduce the topo settings-panel footer exactly (donate card + action row)

Paste everything below the line into the assistant working on another app that uses the topo design system (`topo-design.css`). Replace `[App name]`. The donate card opens the Stripe donation dialog described in DONATE-PROMPT.md; wire `openSupport` to that.

---

Make the bottom of this app's settings panel **identical** to topo.science's. Reproduce the markup, CSS values and behaviour below exactly; adapt only the words in square brackets.

## What it looks like

A footer stuck to the bottom of the panel (`position: sticky; bottom: 0`), panel-coloured, hairline on top, `.75rem` padding plus the safe-area inset. Inside, stacked with a `.5rem` gap:

1. **The donate card**: the only tinted element in the panel. Full width, blue wash fill (`--input-wash`), 1 px blue 45 % border (`--input-edge`), 16 px radius. Left: a 40 px solid-blue tile (12 px radius, 4 px blue halo) with a white Phosphor **heart**. Middle: **Support my work** (600, 15 px) over *Keeps [App name] free for every classroom* (500, 13 px, `--ink-3`). Right: a blue Phosphor arrow-right (18 px) that slides 3 px on hover. The whole card is one `<button>`: hover = solid blue border + 4 px halo; press = scale(.99); focus = 2 px blue outline. Click opens the Stripe donation dialog (no outbound link, no modal from a third party).

2. **The action row**: equal columns (`grid-auto-flow: column; grid-auto-columns: 1fr; gap: .25rem`) of quiet buttons that all look alike: full column width, 36 px tall, 12 px / 600 type in `--ink-3`, a 16 px Phosphor icon, hover = `--ink` on `--hover`. In order: **Shortcuts** (keyboard icon, `title="Keyboard shortcuts (?)"`), **Feedback** (chat icon, opens the feedback dialog from FEEDBACK-PROMPT.md), **Install app** (hidden unless the browser offers install), **Privacy** (shield-check icon, link in a new tab). Nothing wraps; no `<kbd>` chips.

## Markup

```html
<div class="rail__foot" id="railFoot"><button class="welcome__support support-card" id="panelSupport" type="button" title="Support my work"><span class="welcome__cup"><svg class="heart" aria-hidden="true" viewBox="0 0 256 256" fill="currentColor"><path d="M178,32c-20.65,0-38.73,8.88-50,23.89C116.73,40.88,98.65,32,78,32A62.07,62.07,0,0,0,16,94c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,220.66,240,164,240,94A62.07,62.07,0,0,0,178,32ZM128,206.8C109.74,196.16,32,147.69,32,94A46.06,46.06,0,0,1,78,48c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46C224,147.61,146.24,196.15,128,206.8Z"/></svg></span><span class="welcome__support-text"><b>Support my work</b><small>Keeps [App name] free for every classroom</small></span><svg class="welcome__support-arrow" aria-hidden="true" viewBox="0 0 256 256" fill="currentColor"><path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/></svg></button><div class="rail__links"><button class="btn btn--quiet btn--sm" id="openKeys" title="Keyboard shortcuts (?)" aria-expanded="false" aria-controls="keys"><svg aria-hidden="true" viewBox="0 0 256 256" fill="currentColor"><path d="M224,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48Zm0,144H32V64H224V192Zm-16-64a8,8,0,0,1-8,8H56a8,8,0,0,1,0-16H200A8,8,0,0,1,208,128Zm0-32a8,8,0,0,1-8,8H56a8,8,0,0,1,0-16H200A8,8,0,0,1,208,96ZM72,160a8,8,0,0,1-8,8H56a8,8,0,0,1,0-16h8A8,8,0,0,1,72,160Zm96,0a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,160Zm40,0a8,8,0,0,1-8,8h-8a8,8,0,0,1,0-16h8A8,8,0,0,1,208,160Z"/></svg>Shortcuts</button><button class="btn btn--quiet btn--sm" id="openFeedback" type="button" title="Send an idea, a bug or a question"><svg aria-hidden="true" viewBox="0 0 256 256" fill="currentColor"><path d="M216,48H40A16,16,0,0,0,24,64V224a15.84,15.84,0,0,0,9.25,14.5A16.05,16.05,0,0,0,40,240a15.89,15.89,0,0,0,10.25-3.78.69.69,0,0,0,.13-.11L82.5,208H216a16,16,0,0,0,16-16V64A16,16,0,0,0,216,48ZM40,224h0ZM216,192H82.5a16,16,0,0,0-10.3,3.75l-.12.11L40,224V64H216Z"/></svg>Feedback</button><button class="btn btn--quiet btn--sm" id="installApp" hidden title="Add topo to your home screen or dock"><svg aria-hidden="true" viewBox="0 0 256 256" fill="currentColor"><path d="M240,136v64a16,16,0,0,1-16,16H32a16,16,0,0,1-16-16V136a16,16,0,0,1,16-16H80a8,8,0,0,1,0,16H32v64H224V136H176a8,8,0,0,1,0-16h48A16,16,0,0,1,240,136ZM85.66,77.66,120,43.31V128a8,8,0,0,0,16,0V43.31l34.34,34.35a8,8,0,0,0,11.32-11.32l-48-48a8,8,0,0,0-11.32,0l-48,48A8,8,0,0,0,85.66,77.66ZM200,168a12,12,0,1,0-12,12A12,12,0,0,0,200,168Z"/></svg>Install app</button><a class="btn btn--quiet btn--sm" href="https://topo.science/privacy" target="_blank" rel="noopener" title="Privacy"><svg aria-hidden="true" viewBox="0 0 256 256" fill="currentColor"><path d="M208,40H48A16,16,0,0,0,32,56v56c0,52.72,25.52,84.67,46.93,102.19,23.06,18.86,46,25.27,47,25.53a8,8,0,0,0,4.14,0c1-.26,23.91-6.67,47-25.53C198.48,196.67,224,164.72,224,112V56A16,16,0,0,0,208,40Zm0,72c0,37.07-13.66,67.16-40.6,89.42A129.3,129.3,0,0,1,128,223.62a128.25,128.25,0,0,1-38.92-21.81C61.82,179.51,48,149.3,48,112V56H208ZM82.34,141.66a8,8,0,0,1,11.32-11.32L112,148.68l50.34-50.34a8,8,0,0,1,11.32,11.32l-56,56a8,8,0,0,1-11.32,0Z"/></svg>Privacy</a></div></div>
```

Omit any row button whose feature this app lacks rather than leaving a dead one. The link href is this app's privacy page.

## CSS (append; relies on the shared tokens)

```css
.rail__foot{position:sticky; bottom:0; margin-top:auto; display:flex; flex-direction:column; gap:.5rem; padding:.75rem .75rem calc(.625rem + env(safe-area-inset-bottom,0px)); background:var(--panel); border-top:1px solid var(--edge-soft)}
/* one even row of quiet actions under the donate card: icon over nothing fancy, equal columns, same height */
.rail__links{display:grid; grid-auto-flow:column; grid-auto-columns:1fr; gap:.25rem}
.rail__links .btn{width:100%; min-width:0; padding:0 .5rem; gap:.375rem; font-size:.75rem; color:var(--ink-3); text-decoration:none; white-space:nowrap}
.rail__links .btn svg{width:1rem; height:1rem; flex:none} .rail__links .btn:hover{color:var(--ink); background:var(--hover)}

/* the one thing in blue: the donation card is itself the button */
.welcome__support{display:flex; gap:.875rem; align-items:center; width:100%; text-align:left; padding:.75rem .875rem .75rem .875rem; border-radius:var(--r-lg); background:var(--input-wash); border:1px solid var(--input-edge); color:var(--ink); transition:background var(--fast) var(--ease),border-color var(--fast) var(--ease),box-shadow var(--fast) var(--ease),transform var(--fast) var(--ease)}
.welcome__support:hover{border-color:var(--input); box-shadow:0 0 0 .25rem var(--input-wash)} .welcome__support:active{transform:scale(.99)}
.welcome__support:focus-visible{outline:2px solid var(--input); outline-offset:2px}
.welcome__support-text{display:flex; flex-direction:column; gap:.1875rem; flex:1; min-width:0}
.welcome__support-text b{font:600 .9375rem/1.2 var(--font); color:var(--ink)} .welcome__support-text small{font:500 .8125rem/1.3 var(--font); color:var(--ink-3)}
.welcome__support-arrow{width:1.125rem; height:1.125rem; flex:none; color:var(--input); transition:transform var(--fast) var(--ease)} .welcome__support:hover .welcome__support-arrow{transform:translateX(3px)}
.welcome__cup{width:2.5rem; height:2.5rem; flex:none; border-radius:.75rem; display:grid; place-items:center; background:var(--input); color:var(--on-accent); box-shadow:0 0 0 .25rem var(--input-wash)}
.welcome__cup svg{width:1.25rem; height:1.25rem}
```

The card rules are named `.welcome__support` because topo shares them with the welcome dialog's donate card; keep the name so the two stay identical.

## Script

```js
$('#panelSupport').addEventListener('click', e => setSupport(true, e.currentTarget)); // the Stripe donation dialog
```

## Verify

- Footer stays pinned while the panel scrolls; nothing overlaps the home indicator on a phone.
- Card: arrow nudges on hover; click opens the donation dialog, focus returns to the card on close.
- Row: three (or four, with Install) equal columns on one line at the panel's narrowest width; identical hover on each.
- Light and dark both correct.
