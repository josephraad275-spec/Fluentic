# Native packaging status

Android and iOS Capacitor projects preserve the existing React UI. They are scaffolds, not signed store releases. The provisional application ID is `com.josephraad.fluentic`; confirm ownership/availability before first store submission.

Use Node 24 and install locked dependencies with `bun install --frozen-lockfile`. Set `VITE_API_BASE_URL` to the approved HTTPS backend origin and run `npm run mobile:sync`. This builds the UI and syncs native assets; it does not deploy the backend. Configure `NATIVE_ALLOWED_ORIGINS=capacitor://localhost,https://localhost` on that backend. CORS is not authentication. No API secret belongs in the mobile bundle.

Open Android Studio with `npm run mobile:android`, or Xcode on macOS with `npm run mobile:ios`. Complete native SDK installation, signing, provisioning and physical-device tests. Validate microphone consent/denial, audio playback, WebSocket reconnects, offline states, safe areas, keyboard behavior and RTL scripts. Native permission declarations are included; runtime behavior still requires device validation.

Before store submission: replace generated native icons/splash assets with approved brand assets; verify application ID; implement real server authentication/account deletion and store-compliant billing; complete privacy disclosures, retention policy, store metadata and screenshots. Existing checkout remains disabled. Generated web assets are ignored by Git and must be rebuilt before a native build.
