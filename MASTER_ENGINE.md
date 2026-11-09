# Fluentic master engine

The core app uses one server-side `FluenticMasterEngine` through `POST /api/engine`. `/api/gemini/engine` and `/api/omni-engine` are compatibility aliases. Requests contain `mode` and an object `payload`. Successful replies include `success: true`, the requested mode, and validated mode-specific fields. Failures have a stable error code and safe message; provider errors and secrets are not forwarded.

## Integration

- `onboarding`: validates language codes, normalizes intent, supplies a complete dictionary and generates a learning trajectory.
- `placement_test`: generates validated A1–C2 questions or deterministically evaluates answer evidence. C1/C2 items require an advanced skill designation and substantive source text. AI feedback cannot overwrite the assessed level. Missing answer keys and duplicate IDs are rejected.
- `active_chat`: validates bounded history and typed tutor feedback; returns authentic-script target content plus cleaned `audio_text`. Corrections, idioms and register notes retain the existing component contract.
- `personal_lesson`: validates the retrieval, construction, feedback, transfer and spaced-review sequence against the requested level and intent. The adapter maps the sequence into the existing exercise components, preserving node coordinates and styles. New lessons award zero XP/gems. Failed retrievals enter an in-memory scheduled review queue.
- `localization`: returns dictionaries and a catalog of 346 extracted static UI strings. Client caching and selection revisions prevent late translations from overwriting a newer language selection. Incomplete packs fail without switching the active interface language.

The existing Omni service and placement/lesson client functions are compatibility facades. Legacy translator, realtime voice and other feature routes remain; several share the provider retry/JSON runtime but have not all been migrated to the master class. This is a central core implementation, not a claim that every legacy endpoint is consolidated.

## Runtime boundaries

`runtime.ts` strictly parses JSON objects, sanitizes speech text and bounds provider attempts to three with a 20-second timeout per attempt. Client calls have cancellation, a 60-second per-attempt timeout and bounded transient retries. Localization uses batches of 40 strings and at most three simultaneous catalog calls. Long first-time locale generation can exceed a hosting request window; successful packs are cached in process/browser memory, not a distributed store.

`script.ts` enforces native-script presence and rejects Latin transliteration in the supported non-Latin script mappings. It does not certify grammar, semantic correctness or all world writing systems. Advanced content guards are structural safeguards, not psychometric calibration.

## Validation and remaining work

The tests cover deterministic placement, malformed JSON, bounded retries, invalid scripts, advanced-item rejection, tutor schemas, endpoint aliases, localization race conditions and UI lesson adaptation. No live model credentials were available for linguistic or latency validation. Dynamic strings embedded in expressions/data objects still need localization; static catalog extraction is not proof of complete localization. Authenticated server-owned assessment sessions, durable account/history storage, distributed quotas and complete legacy route security review remain release requirements. See `PRODUCTION_READINESS.md` and `MOBILE_RELEASE.md`.
