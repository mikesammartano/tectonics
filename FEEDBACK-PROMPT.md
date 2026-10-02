# Prompt — add the topo feedback form (identical design and behaviour) to another app

Paste everything below the line into the assistant working on the Stream Table or Sun Path repo. It assumes the app already uses the topo design system (`topo-design.css` tokens: `--panel`, `--ink`, `--input`, `.btn`, `.segment`, `.field`, `.input`, `.overlay`, `rise`) and is deployed as a Cloudflare Worker with static assets. Replace `[App name]` and keep the email address as is.

---

Add a **Feedback** feature to this app that is pixel-for-pixel and behaviour-for-behaviour identical to the one on topo.science. Do not redesign it; reproduce it.

## What it does

A quiet **Feedback** button (chat-bubble icon + "Feedback") in the settings panel's footer, next to "Keyboard shortcuts". Clicking it closes the panel and opens a small centred dialog over a blurred scrim:

- header: a 40 px blue tile with the chat icon, title **Send feedback**, sub-line *Ideas, bugs and questions go straight to Mike.*, a quiet × on the right;
- a full-width segmented control **Idea / Bug / Question** (ink pill on the selected item);
- a **Message** textarea (required, 5–2000 chars, placeholder "What would make [App name] better for your class?");
- **Your email** *optional, for a reply* (validated only if filled);
- a hidden honeypot input named `website`;
- footer: left a quiet note *Please don't include student names.* (which doubles as the status line), right a blue **Send** button.

Esc, the ×, and a click on the scrim close it. On phones (≤ 48 rem) the card fills the screen with safe-area padding. The message box takes focus on open.

Submitting POSTs JSON to `/api/feedback`. The Worker emails it to `sammartano@me.com` from `feedback@<this app's domain>` with **Reply-To** set to the visitor's email when given. Success shows *Sent. Thank you!* and closes after 1.2 s with a toast "Feedback sent". If the route answers 503 (email binding not configured), or the request fails, or the app is running as an embed/preview, fall back to opening the visitor's mail app with `mailto:` prefilled (subject `[App name] <kind>: <first 60 chars>`, body = message + sender + page URL) and show *Opening your mail app instead.* Validation errors show in the note in red.

## 1. Footer button (next to Keyboard shortcuts)

```html
<button class="btn btn--quiet btn--sm" id="openFeedback" type="button" title="Send an idea, a bug or a question"><svg aria-hidden="true" viewBox="0 0 256 256" fill="currentColor"><path d="M216,48H40A16,16,0,0,0,24,64V224a15.84,15.84,0,0,0,9.25,14.5A16.05,16.05,0,0,0,40,240a15.89,15.89,0,0,0,10.25-3.78.69.69,0,0,0,.13-.11L82.5,208H216a16,16,0,0,0,16-16V64A16,16,0,0,0,216,48ZM40,224h0ZM216,192H82.5a16,16,0,0,0-10.3,3.75l-.12.11L40,224V64H216Z"/></svg>Feedback</button>
```

## 2. Dialog markup (place it before the print/other overlays)

```html
<div class="overlay fb" id="fbOverlay" hidden role="dialog" aria-modal="true" aria-labelledby="fbTitle">
  <form class="fb__panel" id="fbForm" novalidate>
    <div class="fb__head"><span class="fb__icon"><svg aria-hidden="true" viewBox="0 0 256 256" fill="currentColor"><path d="M216,48H40A16,16,0,0,0,24,64V224a15.84,15.84,0,0,0,9.25,14.5A16.05,16.05,0,0,0,40,240a15.89,15.89,0,0,0,10.25-3.78.69.69,0,0,0,.13-.11L82.5,208H216a16,16,0,0,0,16-16V64A16,16,0,0,0,216,48ZM40,224h0ZM216,192H82.5a16,16,0,0,0-10.3,3.75l-.12.11L40,224V64H216Z"/></svg></span><div class="fb__titles"><h2 id="fbTitle">Send feedback</h2><p>Ideas, bugs and questions go straight to Mike.</p></div><button class="btn btn--quiet btn--icon fb__x" id="fbClose" type="button" aria-label="Close" title="Close (Esc)"><svg aria-hidden="true" viewBox="0 0 256 256" fill="currentColor"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/></svg></button></div>
    <div class="segment segment--fill fb__kind" id="fbKind" role="radiogroup" aria-label="Kind of message">
      <button class="segment__item segment__item--on" type="button" data-kind="idea" aria-pressed="true">Idea</button>
      <button class="segment__item" type="button" data-kind="bug" aria-pressed="false">Bug</button>
      <button class="segment__item" type="button" data-kind="question" aria-pressed="false">Question</button>
    </div>
    <label class="field"><span class="field__label">Message</span><textarea class="input fb__msg" id="fbMsg" rows="5" maxlength="2000" required placeholder="What would make topo better for your class?"></textarea></label>
    <label class="field"><span class="field__label">Your email <small class="t-meta">optional, for a reply</small></span><input class="input" id="fbEmail" type="email" autocomplete="email" placeholder="you@school.org"></label>
    <input class="fb__hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
    <div class="fb__foot"><span class="fb__note" id="fbNote">Please don’t include student names.</span><button class="btn btn--primary" id="fbSend" type="submit">Send</button></div>
  </form>
</div>
```

## 3. CSS (append to the stylesheet; uses the shared tokens)

```css
/* feedback dialog: a small centred card */
.fb__panel{width:min(26rem,100%); display:flex; flex-direction:column; gap:.875rem; padding:1.25rem; background:var(--panel); border:1px solid var(--edge); border-radius:var(--r-xl); box-shadow:var(--shadow-overlay); animation:rise var(--med) var(--ease)}
.fb__head{display:flex; align-items:flex-start; gap:.75rem}
.fb__icon{width:2.5rem; height:2.5rem; flex:none; border-radius:.75rem; display:grid; place-items:center; background:var(--input); color:var(--on-accent); box-shadow:0 0 0 .25rem var(--input-wash)} .fb__icon svg{width:1.25rem; height:1.25rem}
.fb__titles{flex:1; min-width:0} .fb__titles h2{margin:.125rem 0 .25rem; font:600 1.125rem/1.15 var(--font); letter-spacing:-.015em; color:var(--ink)} .fb__titles p{margin:0; font:500 .8125rem/1.45 var(--font); color:var(--ink-3)}
.fb__x{min-height:2.25rem; width:2.25rem; margin:-.25rem -.25rem 0 0; color:var(--ink-meta)}
.fb__msg{height:auto; padding:.625rem .875rem; line-height:1.45; resize:vertical; min-height:6.5rem}
.field__label small{margin-left:.375rem; font-weight:500; text-transform:none; letter-spacing:0}
.fb__hp{position:absolute; left:-9999px; width:1px; height:1px; opacity:0}
.fb__foot{display:flex; align-items:center; justify-content:space-between; gap:.75rem; padding-top:.25rem}
.fb__note{font:500 .75rem/1.35 var(--font); color:var(--ink-meta)} .fb__note--err{color:#c6005c} .fb__note--ok{color:var(--input-ink)}
.fb__panel.is-sending .btn--primary{opacity:.6; pointer-events:none}
@media (max-width: 48rem){ .fb{padding:0} .fb__panel{width:100%; height:100%; border-radius:0; border:0; padding:calc(1.25rem + env(safe-area-inset-top,0px)) 1.25rem calc(1.25rem + env(safe-area-inset-bottom,0px)); justify-content:flex-start; overflow:auto} }
```

## 4. Client script

```js
// ---------------- feedback: a short form that lands in Mike's inbox ----------------
const FB_TO = 'sammartano@me.com';
let fbKind = 'idea';
function setFeedback(open) {
  const ov = $('#fbOverlay'); ov.hidden = !open; $('#openFeedback').setAttribute('aria-expanded', open);
  if (open) { fbNote(''); setTimeout(() => $('#fbMsg').focus(), 40); }
}
function fbNote(t, kind) { const n = $('#fbNote'); n.textContent = t || 'Please don’t include student names.'; n.className = 'fb__note' + (kind ? ' fb__note--' + kind : ''); }
$('#openFeedback').addEventListener('click', () => { setControls(false); setFeedback(true); });
$('#fbClose').addEventListener('click', () => { setFeedback(false); $('#openFeedback').focus(); });
$('#fbOverlay').addEventListener('click', e => { if (e.target.id === 'fbOverlay') setFeedback(false); });
$('#fbOverlay').addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); setFeedback(false); } });
$('#fbKind').addEventListener('click', e => { const b = e.target.closest('[data-kind]'); if (!b) return; fbKind = b.dataset.kind; $$('#fbKind [data-kind]').forEach(x => { const on = x === b; x.classList.toggle('segment__item--on', on); x.setAttribute('aria-pressed', on); }); });
// fallback when the mail route isn't available (artifact preview, offline, or the Worker lacks its email binding): open the mail app
function fbMailto(kind, msg, email) {
  const subject = `topo ${kind}: ${msg.slice(0, 60).replace(/\s+/g, ' ')}`;
  const body = `${msg}\n\n—\nFrom: ${email || '(no email given)'}\nPage: ${location.href.split('#')[0]}`;
  location.href = `mailto:${FB_TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
$('#fbForm').addEventListener('submit', async e => {
  e.preventDefault();
  const msg = $('#fbMsg').value.trim(), email = $('#fbEmail').value.trim(), hp = $('.fb__hp').value;
  if (msg.length < 5) { fbNote('Write a little more first.', 'err'); $('#fbMsg').focus(); return; }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { fbNote('That email doesn’t look right.', 'err'); $('#fbEmail').focus(); return; }
  if (IN_CLAUDE || EMBED) { fbMailto(fbKind, msg, email); return; }
  const form = $('#fbForm'); form.classList.add('is-sending'); fbNote('Sending…');
  try {
    const r = await fetch('/api/feedback', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ kind: fbKind, message: msg, email, page: location.href.split('#')[0], lang: LANG, hp }) });
    const d = await r.json().catch(() => ({}));
    if (r.ok) { fbNote('Sent. Thank you!', 'ok'); $('#fbMsg').value = ''; setTimeout(() => setFeedback(false), 1200); toast('Feedback sent'); }
    else if (r.status === 503) { fbMailto(fbKind, msg, email); fbNote('Opening your mail app instead.'); }
    else fbNote(d.error || 'Couldn’t send just now. Try again in a minute.', 'err');
  } catch (err) { fbMailto(fbKind, msg, email); fbNote('Opening your mail app instead.'); }
  form.classList.remove('is-sending');
});
```

Also give the dialog first claim on Esc in the global keydown handler, before any other overlay:

```js
  if (!$('#fbOverlay').hidden) { if (e.key === 'Escape') setFeedback(false); return; }
```

`setControls(false)` is this app's "close the settings panel"; `toast()` its toast; `IN_CLAUDE`/`EMBED` the flags for the artifact preview and embed mode (use whatever this app has; if none, treat both as false). `LANG` is the current UI language code.

## 5. Worker route (`src/worker.js`)

```js
// Feedback form → email. Needs the send_email binding FEEDBACK (wrangler.jsonc) with Email Routing enabled on the
// zone and the destination verified; without it the route answers 503 and the page opens the visitor's mail app.
async function feedback(request, env) {
  if (request.method !== 'POST') return json({ error: 'Use POST.' }, 405);
  let b; try { b = await request.json(); } catch { return json({ error: 'Send JSON.' }, 400); }
  const kind = ['idea', 'bug', 'question'].includes(b.kind) ? b.kind : 'message';
  const message = String(b.message || '').trim().slice(0, 2000), email = String(b.email || '').trim().slice(0, 200), page = String(b.page || '').slice(0, 300);
  if (b.hp) return json({ ok: true }); // honeypot filled: a bot; pretend it worked
  if (message.length < 5) return json({ error: 'Write a little more first.' }, 400);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'That email doesn’t look right.' }, 400);
  if (env.RATE_LIMITER) { const { success } = await env.RATE_LIMITER.limit({ key: 'fb:' + (request.headers.get('cf-connecting-ip') || 'anon') }); if (!success) return json({ error: 'Too many messages. Try again in a minute.' }, 429); }
  if (!env.FEEDBACK) return json({ error: 'Email isn’t set up yet.', code: 'unavailable' }, 503);
  const to = 'sammartano@me.com', from = 'feedback@topo.science';
  const subject = `topo ${kind}: ${message.slice(0, 60).replace(/\s+/g, ' ')}`;
  const country = request.headers.get('cf-ipcountry') || '?';
  const text = `${message}\n\n—\nFrom: ${email || '(no email given)'}\nKind: ${kind}\nPage: ${page}\nCountry: ${country}\nLanguage: ${String(b.lang || 'en').slice(0, 5)}\nSent: ${new Date().toISOString()}`;
  const enc = s => `=?utf-8?B?${btoa(unescape(encodeURIComponent(s)))}?=`;
  const raw = [`From: topo feedback <${from}>`, `To: <${to}>`, email ? `Reply-To: <${email}>` : null, `Subject: ${enc(subject)}`, 'MIME-Version: 1.0', 'Content-Type: text/plain; charset=utf-8', 'Content-Transfer-Encoding: 8bit', '', text].filter(l => l !== null).join('\r\n');
  try {
    const { EmailMessage } = await import('cloudflare:email');
    await env.FEEDBACK.send(new EmailMessage(from, to, raw));
    return json({ ok: true });
  } catch (err) { return json({ error: 'Couldn’t send just now. Try again in a minute.' }, 502); }
}
```

Wire it in the fetch handler: `if (url.pathname === '/api/feedback') return feedback(request, env);`. `json()` is the usual `new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })`. `RATE_LIMITER` is an optional Workers rate-limit binding; keep the `fb:` key prefix so feedback and other routes don't share a bucket. Change `from` to `feedback@<this app's domain>` — the sending address must be on the zone that has Email Routing.

## 6. Cloudflare config (`wrangler.jsonc`)

```jsonc
"send_email": [{ "name": "FEEDBACK", "destination_address": "sammartano@me.com" }],
```

**Order matters:** enable **Email Routing** on the app's zone in the Cloudflare dashboard (Email → Email Routing → Get started, accept the DNS records) and make sure `sammartano@me.com` is a **verified destination** *before* deploying with this binding — a deploy with the binding on a zone without Email Routing is rejected and takes the site down. Until that is done, leave the binding commented out: the route then answers 503 and the form falls back to the mail app, so nothing breaks.

## 7. Privacy page

Add under "What gets sent, and where":

> **Feedback.** The Feedback form sends your message, and your email address if you give one, to Mike by email so he can reply. [App name] doesn't store it. Please don't include student names.

## 8. Verify

1. Open the panel → Feedback: dialog opens centred, message box focused, Esc closes it.
2. Submit an empty message → red note "Write a little more first."; a bad email → "That email doesn't look right."
3. With the binding commented out: submit → mail app opens prefilled, note says "Opening your mail app instead."
4. With the binding live: `curl -X POST https://<domain>/api/feedback -H 'content-type: application/json' -d '{"kind":"question","message":"Test from the deploy.","email":"you@example.org","page":"https://<domain>/","hp":""}'` → `{"ok":true}` and an email arrives with Reply-To set.
5. Phone width: the card fills the screen; the Send button sits above the home indicator.
