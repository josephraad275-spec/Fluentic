# Fluentic Master Engine

Headless orchestration module `src/services/FluenticMasterEngine.ts` integrates the repository's existing localization, placement bank, curriculum, AI tutoring, and voice services without modifying UI layout or styles.

## Usage

```ts
import { FluenticMasterEngine, toMasterProfile } from './services/FluenticMasterEngine';
const engine = new FluenticMasterEngine(toMasterProfile(existingUser));
engine.onboard({nativeLanguage:'ar',targetLanguage:'fr',intent:'travel'});
const session = engine.beginPlacement('French');
let question = engine.nextPlacementQuestion(session.id);
// Render one item at a time, call engine.answerPlacement(session.id,{questionId,selectedKey}), repeat.
const placement = engine.finishPlacement(session.id); // Only after all questions answered.
const path = engine.getLearningPath();
// engine.completeLesson(nodeId, conceptResults); await engine.chat(userMessage);
// await engine.synthesizeTutorAudio();
```

## Production boundaries

- **Current UI is not wired to this new service.** Existing React views remain unchanged; the application will continue using its preexisting flow until a separate integration change connects them.
- CEFR placement here is a formative estimate, **not a certified CEFR assessment**. The adaptive selector only works within the existing curated bank.
- Existing localization dictionaries support a finite set of native languages, otherwise falling back to English. Add dictionaries for full language coverage.
- Target-script checks are writing-system checks, not proof of linguistic correctness; same-script language purity needs server-side language detection/validation.
- Verified tutor conversations use existing `/api/engine`. Audio uses `/api/fluentic-ai` and `/api/fluentic-ai/voice-stream`; both require configured server-side providers.
- The new progress store is in-memory only. Production account sync requires authorized backend persistence and reconciliation.
- Only the new service, its tests, and this documentation were added; **no CSS, Tailwind classes, layout, or existing UI files were changed**.

Run tests in an installed repository checkout: `node --import tsx --test src/services/FluenticMasterEngine.test.ts`. Run `npm run lint` or `bun run lint` for the full project TypeScript check.
