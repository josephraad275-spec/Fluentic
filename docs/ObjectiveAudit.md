# Fluentic — objective-driven code audit (2026-11-13)

Scope: the repository's 71 tracked/non-generated files at commit `390fcd1`, including approximately 28,000 lines in `src/` and `server.ts`. This is a source and automated-build audit, **not** a certification of all language pairs, real AI outputs, payment providers, speech quality, or every runtime branch. Existing CSS, layout markup, Tailwind classes, and design assets were left unchanged.

## Objective 1 — AI backend

- **Fixed in this change:** `src/ai/server/fluenticAIRoutes.ts` previously used `temperature: 0.25`, parsed JSON embedded in markdown/prose, lacked retry logic, and only checked a few response fields. Its centralized JSON generator now uses `0.15`, strict object parsing, up to three bounded attempts, and action-specific runtime response contracts.
- **Remaining:** `server.ts` contains many independent Gemini routes at temperatures `0.2`–`0.8`, rather than delegating consistently to the centralized service. These have separate response shapes and error paths; migrating them requires endpoint-by-endpoint compatibility and integration testing. Audio synthesis/streaming does not share the JSON generator. Model availability and correct voice API contracts require live-provider validation.
- **Remaining:** master engine and browser client contracts are not yet unified with all legacy server routes. A single module alone cannot validate unstructured free-text and streaming output.

## Objective 2 — CEFR diagnostic rigor

- **Present:** `src/ai/pedagogy.ts` differentiates A1–C2 and explicitly bans introductory tasks at C1/C2. It has a conservative level-estimation helper.
- **Fixed in this change:** generated question sets must contain unique IDs, exactly four distinct option keys, one listed correct key, and at least one item in each tier. C1/C2 metadata is checked for advanced evidence and known beginner indicators; tests cover rejection.
- **Remaining:** one generated static set is not a truly adaptive multi-stage diagnostic. A lexical heuristic cannot prove pedagogic difficulty, and advanced prose must be evaluated by educators and multilingual gold-standard tests. Reading/MCQs alone cannot certify the full CEFR skill profile; speaking and writing need independently scored samples.

## Objective 3 — structured pathways

- **Present:** `src/ai/pedagogy.ts` defines intent pathways and requires active recall, changed-context transfer, and scheduled error recycling. `src/services/fsrsEngine.ts` provides a spaced-repetition mechanism.
- **Fixed in this change:** generated personal lessons are rejected unless they contain retrieval, construction, feedback, transfer, mastery criteria, and positive spaced-review intervals.
- **Remaining:** generated lessons and legacy curriculum data are not demonstrably persisted as a single dependency-aware learning tree with enforced unlock prerequisites and cross-session error scheduling for every learning intent. The UI includes XP, streak, gems, and reward terminology, which conflicts with the requested non-gamified product direction; these were not modified because visuals must remain unchanged.

## Objective 4 — native localization

- **Present:** `src/services/localization.ts` contains English, Dutch, Spanish, French, German, Italian, Russian, and Arabic dictionaries; `src/App.tsx` switches root direction for Arabic.
- **Remaining (critical):** `src/data/languages.ts` advertises approximately 62 languages, but `getI18n()` has only 8 UI dictionaries and silently falls back to English for the others. Multiple TSX files include English literals, including `PaymentModal.tsx`, `AuthModal.tsx`, `CommandSpotlight.tsx`, `AITutorModal.tsx`, and `CustomTranslatorView.tsx`. RTL handling varies between views, and language-dependent copy has not been validated by native-speaking reviewers. An honest 100% translation claim is impossible until every supported native language has complete coverage and every string is extracted.

## Objective 5 — target script purity

- **Present:** `src/services/FluenticMasterEngine.ts` has script screening for several major scripts; `src/services/languageTypography.ts` strips some transliteration patterns.
- **Fixed in this change:** the central translation, placement, lesson, and speech response checks reject invalid fields and verify target script in designated target-language text where a supported script constraint is defined. Language names are resolved to codes before validation.
- **Remaining:** script screening does not yet cover every one of the advertised languages, and target versus explanatory text is ambiguous in some legacy payload shapes. Removing transliteration after generation can hide contamination instead of treating it as an error. Proper script segmentation and language-aware token exceptions require further tests for each writing system.

## Additional release blocker — payment integrity

- **Fixed for safety:** `server.ts` returned success and granted benefits from a simulated checkout without a real processor or verified webhook. `/api/payment/checkout` now returns `503 PAYMENT_GATEWAY_NOT_CONFIGURED` and does not invent transactions. A real provider, server-side purchase verification, durable entitlements, refunds, and reconciliation must be added before enabling paid checkout.
- **Remaining:** `src/services/accountDatabase.ts` persists account state in browser `localStorage` and cannot be considered an authenticated multi-device backend. Authorization, durable server storage, access controls, and security review are still necessary for production.

## Verification and release status

Run:

```bash
npm run lint
node --import tsx --test src/ai/server/responseContracts.test.ts
npm run build
```

The tests verify structural acceptance/rejection, not actual live Gemini content. A successful build proves compilation and bundling, not operational perfection. The existing large-client-chunk warning is a performance follow-up. **This repository is not yet verified as App Store/Play Store flagship-release-ready or fully deployable with live paid functionality.**
