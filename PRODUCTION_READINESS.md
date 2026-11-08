# Production deployment status

This repository is **not yet production-ready**. Do not accept a successful Vite bundle as proof of payment, mobile, or serverless readiness.

## Current architecture

- `npm run build` builds the Vite SPA and bundles a persistent Express server to `dist/server.cjs`.
- `npm start` runs the Node server, including a stateful WebSocket voice endpoint at `/api/ws/voice-stream`.
- Vercel's static hosting cannot execute `dist/server.cjs` as a persistent server, and its serverless functions do not provide this persistent WebSocket architecture. The application requires an API/serverless adapter and a separate real-time voice service, or a persistent Node host for the existing backend.
- The checkout endpoint intentionally returns HTTP 503 until a real provider integration verifies payment and records idempotent entitlements. **Never grant gems or subscriptions from client-provided purchase data.**
- The existing app has no Capacitor or native iOS/Android projects. Store packaging, permissions, billing, privacy disclosures, signing, and device tests are outstanding.

## Required verification before release

1. Run `bun install --frozen-lockfile`, `bun run lint`, and `bun run build` in CI. Also verify `npm run build` with a supported Node version.
2. Provide `GEMINI_API_KEY` as a server-only secret. Never expose it as `VITE_*` or commit an `.env` file.
3. Audit every AI endpoint for schema validation, request limits, authentication, abuse protection, structured failures, and supported model identifiers. Confirm actual API calls with a test key.
4. Audit UI translations for each supported native language; current `getI18n` falls back to English for unsupported codes. Inspect dynamic strings in components and server responses.
5. Remove nonstandard A3/B3/C3 tiers from the remaining legacy placement pipeline, validate question difficulty, and test advanced C1/C2 questions with language experts.
6. Implement verified payment webhooks, durable idempotent transaction records, authentication, and server-authoritative account balances before re-enabling checkout.
7. Add integration and end-to-end tests covering onboarding, assessment, lessons, translation, speech, error states, subscriptions, and mobile devices.
8. Select a hosting architecture that supports the required APIs and streaming; complete a production smoke test before switching traffic.

## UI preservation

This preparation branch does not modify CSS, Tailwind classes, layout, or visual components.
