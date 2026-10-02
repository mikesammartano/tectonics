// Tectonics Worker: serves the static site from ./dist and one small API, POST /api/feedback.

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

// Feedback form -> email. Needs the send_email binding FEEDBACK (wrangler.jsonc) with Email Routing enabled on the
// zone and the destination verified; without it the route answers 503 and the page opens the visitor's mail app.
// FEEDBACK_FROM must be an address on that zone, so set it when Tectonics gets a domain with Email Routing.
const FEEDBACK_TO = 'sammartano@me.com', FEEDBACK_FROM = 'feedback@topo.science';
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
  const subject = `Tectonics ${kind}: ${message.slice(0, 60).replace(/\s+/g, ' ')}`;
  const country = request.headers.get('cf-ipcountry') || '?';
  const text = `${message}\n\n--\nFrom: ${email || '(no email given)'}\nKind: ${kind}\nPage: ${page}\nCountry: ${country}\nLanguage: ${String(b.lang || 'en').slice(0, 5)}\nSent: ${new Date().toISOString()}`;
  const enc = s => `=?utf-8?B?${btoa(unescape(encodeURIComponent(s)))}?=`;
  const raw = [`From: Tectonics feedback <${FEEDBACK_FROM}>`, `To: <${FEEDBACK_TO}>`, email ? `Reply-To: <${email}>` : null, `Subject: ${enc(subject)}`, 'MIME-Version: 1.0', 'Content-Type: text/plain; charset=utf-8', 'Content-Transfer-Encoding: 8bit', '', text].filter(l => l !== null).join('\r\n');
  try {
    const { EmailMessage } = await import('cloudflare:email');
    await env.FEEDBACK.send(new EmailMessage(FEEDBACK_FROM, FEEDBACK_TO, raw));
    return json({ ok: true });
  } catch (err) { return json({ error: 'Couldn’t send just now. Try again in a minute.' }, 502); }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/feedback') return feedback(request, env);
    return env.ASSETS.fetch(request);
  }
};
