# Research workflow verification

Checked locally on 2026-09-28. Only synthetic color-tile images were used; no personal archive content is included.

- TypeScript: passes.
- Production Vite client/server build: passes. Third-party bundler directive warnings remain non-fatal.
- Script unit tests: 195 pass. Branding tests now use an isolated empty directory rather than accidentally reading the real project's site title/card.
- Application/auth/research tests: 65 pass, including positive-only evidence, scoped overrides, exclusions surviving re-analysis, cluster deduplication, and serialization.
- Browser workflow: passes in headless Edge at 3840×2160 and 390×844. All five views render; no page errors or Vite overlays.
- Actual UI operations tested: image import, manual analysis, scoped quote, cluster, conditional route, pair tie, library export, IndexedDB refresh persistence, duplicate import and comparison-ID remapping.
- 4K root text size: 26px. Mobile document has no horizontal overflow; navigation remains horizontally scrollable.
- Development/build authentication configuration agrees (sign-in disabled in the supplied project configuration).
- Live xAI vision analysis was not invoked: no personal images or paid API calls were used.
- External font/platform-extension requests are blocked in the test sandbox; the UI renders with fallback fonts.

Reproduce: run the project dev server on port 8087, then `node scripts/research-smoke.mjs`. Set `QA_URL` to test another local port. This test requires a locally installed Microsoft Edge and the project's Playwright dependency. It creates an isolated browser context, not the user's library.

The screenshots show synthetic QA data, not an aesthetic conclusion.
