# Fluentic

React web application with a Node/Express backend. Supports desktop and mobile browsers; includes a home-screen web manifest and an offline notice. This repository does **not** contain native iOS/Android binaries or App Store/Play Store submissions.

## Run

Use Node 22 or newer.

```sh
npm ci
cp .env.example .env
# Set GEMINI_API_KEY in .env or your host's secret settings.
npm run dev
```

For production:

```sh
npm run lint
npm test
npm run build
NODE_ENV=production npm start
```

The server uses `PORT` (default 3000), serves the built frontend, and handles AI requests. Deploy both together; a static-only host cannot run these AI endpoints. Serve through HTTPS to enable microphone permission on phones. Never expose the API key in browser code or `VITE_` variables.

## AI and student needs

Documented defaults: Gemini 3.8 Flash for teaching, Gemini 3.5 Transcribe through Interactions for specialist transcription, and Gemini 3.8 Flash TTS for generated voice. Override model IDs through the variables in `.env.example` according to account access. Model availability, billing and quotas require a live account check.

The main learning path requests lessons using the learner's language pair, CEFR tier, learning intent, daily minutes, recycled errors and concept progress. Malformed exercises are rejected; the existing path remains available if AI is unavailable. Structured tutor lessons require retrieval, construction, feedback, transfer and review stages.

Voice practice captures a full clip, displays local energy-based voice activity, and sends the actual device sample rate. It supports up to 60 seconds per clip. Transcription runs after recording stops; this is **not** continuous streaming recognition. Specialist ASR falls back to multimodal recognition if unavailable. Silence/noise detection is heuristic and needs real microphone checks. Text-only feedback does not constitute acoustic pronunciation assessment.

Placement is a short, provisional estimate from tier-by-tier evidence, not an official CEFR certification. Wrong answers at a lower tier prevent total-score promotion to advanced levels. The offline question bank is capped at B2; C1/C2 require follow-up assessment. Generated questions receive structural checks, but their linguistic quality still requires human validation. A ten-question recognition test cannot establish speaking/writing proficiency.

## Release validation

`npm test` covers AI model failover, credentials errors, Interactions transcription requests, malformed assessment options, missing keys, level evidence, personalization inputs, and complete PCM uploads at 48 kHz. Provider calls are mocked: passing tests do not prove access or educational accuracy for every language.

Before production sign-off, use the deployed HTTPS URL and a configured, billed Gemini key to verify generated lessons, ASR and TTS. Test microphone permission, recording, interruption, playback and reconnection on physical iPhone/Safari and Android/Chrome. Browser viewport checks do not replace physical-device tests.

Purchases deliberately return `PAYMENTS_NOT_CONFIGURED`: the previous checkout simulated successful charges. Connect and verify a payment provider before enabling purchases. Profile, progress and language-specific levels persist in browser storage; sign-out clears Fluentic local data. Account data remains browser-local; real multi-device account sync requires a backend identity/database service. The in-process AI limiter is a basic safeguard; public multi-instance hosting needs shared rate limits and authenticated quotas.
