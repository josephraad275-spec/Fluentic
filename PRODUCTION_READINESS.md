# Production readiness checkpoint — 2026-11-08

This remains a partial hardening PR, not a production-ready release. Do not merge or deploy without owner approval. `vercel.json` disables automatic deployment of `fix/production-readiness-2026-11`.

## Coverage definition

Work-area coverage is the number of the eight requested areas receiving focused inspection or implementation and recorded evidence, divided by eight. Current coverage: **100.00000% (8/8)**. This is NOT completion, code coverage, linguistic accuracy, or release readiness. All eight areas retain open work. No quantitative completion claim is made.

| Area | Work and evidence | Remaining release blockers |
| --- | --- | --- |
| CEFR A1–C2 | Question IDs/options/prompts checked; two independent items required at C1/C2; missing answer keys no longer count as correct; regression/API tests | Expert-calibrated difficulty, listening/writing/speaking evidence, server-owned scoring, legacy assessment pipeline and overconfident result wording |
| Adaptive lessons | Ordered retrieval/construction/feedback/transfer/review; learner level/intent and spaced review metadata validated | Durable learner history, real mastery updates, live provider and full UI integration tests |
| Localization | Eight current dictionaries checked for key parity/nonempty values; regional fallback checked | Only en/nl/es/fr/de/it/ru/ar dictionaries exist; other codes fall back to English; hardcoded UI text and expert translation review remain |
| Native-script accuracy | Latin-language parentheses preserved; Arabic/Japanese cleanup regression tests | Regex cleanup is heuristic, can remove meaningful mixed-script parentheses, and is not proof of native-language correctness; review all supported scripts |
| Backend security | Backend artifacts removed from public dist; core request shape validation; safe upstream failure envelope; WS message/session bounds; exact-origin native CORS; payment stays disabled | Real authentication, durable accounts/entitlements, distributed abuse limits, quotas, complete legacy endpoint validation/error sanitization, origin/session validation for WebSockets |
| Vercel compatibility | Exported HTTP server without port binding; API/SPA routing; public/private build separation; local production HTTP/WS smoke test | Actual Vercel build and authorized deployed smoke tests, runtime duration/cold-start behavior, production secrets, model availability |
| Mobile packaging | Android/iOS Capacitor scaffolds, microphone declarations, HTTPS backend transport, packaging preflight and successful asset sync | Android build blocked by Gradle download network failure; no configured Android SDK found; iOS needs macOS/Xcode; signing, runtime permission/device tests, brand icons, store billing/privacy/account deletion and approved backend |
| Automated testing | 27 regression/API tests plus one production HTTP/WS smoke test; CI runs tests/type-check/build/native sync | Browser E2E and real device/provider tests remain; local Chromium launch blocked by socket permission |

## Verified locally

- `bun install --frozen-lockfile` (through npx Bun): passed. Existing duplicate Vite declaration warning remains.
- `npm test`: 27 passed, zero failed.
- `npm run lint`: passed.
- `npm run build`: passed. JavaScript bundle is approximately 887 kB, with Vite's large-chunk warning.
- `npm run test:smoke`: passed; covers SPA response, API 404, disabled payments, missing provider config, WebSocket handshake/empty result, bad sample rate and oversized message rejection, and non-exposure of backend artifacts.
- `npx cap sync`: passed for Android and iOS. This is NOT a signed native build.
- Source comparison against starting commit `2f8a278`: JSX markup and CSS unchanged across all 30 existing TSX/CSS files.
- Vercel entry imports locally without binding a listener. No cloud deployment tested or requested.

## Failures and unavailable verification

- Android `./gradlew :app:assembleDebug --no-daemon`: failed fetching Gradle 8.14.3 with `java.net.SocketException: Network is unreachable`. No APK/AAB produced.
- Xcode is unavailable in this Linux environment. No iOS archive/IPA produced.
- Playwright bundled browser is absent; download returned an invalid archive. System Chromium launch then failed with `socket() failed: Operation not permitted`. Browser E2E did not pass.
- The tsx CLI hit an IPC socket EPERM restriction; `node --import tsx` successfully imports the Vercel entry and is used for development startup.
- Live Gemini calls were not run: no test credentials provided. Existing model names need actual provider verification.

## Architecture and next steps

`npm run build` writes only public SPA files to `dist/` and the backend bundle/source map to `dist-server/`. `npm start` runs the production backend; `npm run dev` enables Vite middleware. `api/index.ts` exports the same HTTP/WebSocket server for Vercel without listening on a port.

The previous statement that Vercel cannot host WebSockets is outdated: Vercel announced native Function WebSocket support on 2026-06-22 (https://vercel.com/changelog/websocket-support-is-now-in-public-beta). Runtime limits and deployed behavior still require verification after approval. Branch deployment suppression follows https://vercel.com/docs/project-configuration/git-configuration.

Start the next security pass with server-side identity and durable account storage: browser localStorage is not authentication or an authoritative entitlement ledger. Keep checkout disabled until payment/store verification and idempotent entitlement records exist. Audit the legacy routes in server.ts as well as the new AI routes. See MOBILE_RELEASE.md for native setup and release blockers.
