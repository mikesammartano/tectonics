# Prompt — the Stripe donation dialog (as built in topo)

Paste everything below the line into the assistant working on another app. The payment backend already exists and is live; this is front end only. Styling comes from the app's own design system (`topo-design.css` tokens, components, icons, motion, light/dark). Replace `[App name]`.

---

Turn this app's donate/support entry points into a custom Stripe donation modal. Match the features and copy below exactly, and take ALL visual styling from the app's own design system (CSS variables, components, fonts, icons, radii, motion, light/dark). Do not import styling from anywhere else.

## First, read the app
- Find every donate/support entry point (toolbar pill, settings-panel footer card, welcome/intro card). Each opens the modal instead of linking out. Remove any third-party donation links, iframes, widgets or config, plus their CSS and JS.
- Reuse the app's dialog pattern (`.overlay` + centred panel), button variants (`.btn--primary`, `.btn--ghost`, `.btn--quiet`, `.btn--icon`), segmented control (`.segment`), text input (`.input`), Phosphor icons, theme tokens, and its theme hook (`onTheme()`).
- Keep any embed or kiosk mode that hides the donate button; never load Stripe there.

## Copy (use exactly)
- Title: "Support my work"
- Note: "I make these tools in my spare time and keep them free for classrooms. If they've helped you, any support goes toward the costs of running them, and it truly means a lot."
- Card toggle: "Pay with card"
- Pay button: "Send $15" (live total)
- Footer line with a lock icon: "Secured by Stripe"
- Amount error: "Enter an amount between $1 and $1,000."
- Thank-you: "Thank you." then "Your support means a lot." with a "Done" button
- Heart icon for every donate entry point and the modal header. No coffee or cup wording or icons.

## Stripe config (use exactly)
- Publishable key: pk_live_51I9DpFHskGcjE8lcLm5AbtQdI42CjbNk9Na2L1p0WfW1tm1Xes4UNjeX2FwJHzZVjwaCKZT3DnVxIv2sXtgsyzaF0000zPlH8Y
- API: POST https://support.sammartano.workers.dev with JSON {"amount": <integer cents>}. Returns {"clientSecret": "..."} or {"error": "..."} with a non-200 status. Valid range 100 to 100000 cents. The Worker allows the site's origin and creates card-only PaymentIntents.
- Load https://js.stripe.com/v3/ lazily the first time the modal opens. Never on page load, never in embed mode. If the script loads but `window.Stripe` is missing, reject and let the user retry.

## Payment flow
- Deferred intent with TWO separate `stripe.elements()` groups sharing `{mode:"payment", currency:"usd", paymentMethodTypes:["card"], amount, appearance}`: one for the Express Checkout Element, one for the Payment Element, so submitting one never validates the other. On every amount change call `.update({amount})` on both.
- Express Checkout Element: `buttonType {applePay:"plain", googlePay:"plain"}`; `paymentMethods {applePay:"auto", googlePay:"auto", link:"never", amazonPay:"never", paypal:"never"}`; `layout {maxColumns:1, overflow:"never"}`; `buttonHeight` = the app's primary button height (44); `buttonTheme` "black" on light, "white" on dark. `ready`: if any `availablePaymentMethods` value is true, show the wallet button plus a "Pay with card" ghost button; otherwise hide the wallet area and show the card fields open. `loaderror` = no wallets. `click`: invalid amount → show the amount error and do not resolve; else `event.resolve()`. `confirm`: `expressEls.submit()`, fetch the client secret, `stripe.confirmPayment({elements: expressEls, clientSecret, redirect:"if_required", confirmParams:{return_url}})`.
- Payment Element: `layout "tabs"`; `wallets {applePay:"never", googlePay:"never", link:"never"}`; `fields {billingDetails:{name:"never", email:"never"}}`. Keep country and ZIP. It lives in a collapsed section (`grid-template-rows: 0fr` → `1fr`, .35s) opened by "Pay with card"; the toggle then hides and the pay button shows.
- Pay button: disabled until the Payment Element reports complete and the amount is valid. Submit: `elements.submit()`, fetch the client secret, `confirmPayment` with `redirect:"if_required"`. Spinner while busy. Errors in one aria-live line under the buttons.
- `return_url` = current page URL + `?support=return`. On load, if `payment_intent_client_secret` is in the URL: load Stripe, `retrievePaymentIntent`, strip the params with `history.replaceState`, open the modal; thank-you if status is succeeded or processing, otherwise "That payment didn't finish. You can try again below."
- On succeeded or processing swap the form for the thank-you state. Done closes and resets: $15, card fields cleared, card section collapsed again if wallets exist.

## Amounts
- Segmented control in the app's style with $5, $15 (default), $25 and Other, built on real radio inputs (`:has(:checked)` for the ink pill, `:has(:focus-visible)` for the ring).
- Other reveals the app's text input with a "$" prefix: decimal keypad, digits plus one dot, at most two decimals, $1 to $1,000.
- The pay button total rolls to the new amount with a short ease-out (skip under reduced motion).

## Modal behaviour
- Small centred card, about 416 px wide, on the app's scrim; `max-height: 100%; overflow: auto`. On phones follow the app's convention (full screen with safe-area padding).
- Order: header (heart tile + title + note), amount control, Other input, wallet button, "Pay with card", collapsible card fields + pay button, error line, "Secured by Stripe".
- Open/close with the app's motion tokens. Icon-only close with aria-label and title. Esc and a scrim click close. Focus moves to the panel on open and returns to the opener on close.
- Reduced motion brings animation to near zero.

## Stripe appearance (from the app's theme)
Build the appearance from `getComputedStyle(document.documentElement)` when Stripe initialises, and again on every theme change (`.update({appearance})` on both groups plus the wallet `buttonTheme`):
- colorPrimary `--input`; colorBackground `--chip` (the input fill); colorText `--ink`; colorTextSecondary `--ink-3`; colorTextPlaceholder `--ink-meta`; colorDanger `#ff3b30` light / `#ff453a` dark; borderRadius 12px; fontFamily `--font`.
- Rules: `.Input` transparent border, no shadow, `--chip` fill; `.Input:focus` `--edge-strong` border + `--control` fill (no coloured focus border); `.Label` `--ink-2` 600 13px; `.Tab` `--chip` fill, `--ink-3`; `.Tab--selected` `--ink` fill, `--on-ink` text (ink pill, like the app's segmented control).

## Hosting
If the site sends a Content-Security-Policy, allow `script-src https://js.stripe.com`, `frame-src https://js.stripe.com https://hooks.stripe.com`, `connect-src https://api.stripe.com https://support.sammartano.workers.dev`.

## Constraints
- Keep the app's file structure (single-file stays single-file). No new libraries.
- No em dashes anywhere, including comments. Avoid: delve, leverage, robust, seamless, navigate, utilize, harness, elevate, unleash, empower, realm, tapestry.

## Before handing back
- Validate: CSS brace balance, a JS syntax check, every `getElementById`/`$('#id')` matches an id in the markup, em dash scan, banned-word scan.
- Reply with a short summary of what changed and which tokens and components were reused.
- Give setup steps as Stripe or Cloudflare dashboard clicks, not CLI. Apple Pay needs the domain added under Stripe → Settings → Payment methods → Apple Pay.
