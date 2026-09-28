# GLM integration check

2026-09-29: One live request to the official BigModel chat-completions endpoint succeeded using `glm-4.6v-flash`.

Input: a synthetic 128×128 blue tile and the application's attribute schema. No personal photos, quotes or notes were sent.

The model correctly described the image as a solid blue color with no subjects. Normalization produced the application's 79-field schema; unavailable attributes remain not visible. This confirms connectivity and parsing, not portrait-analysis accuracy.

Reported usage: 2,324 input tokens, 273 output tokens, 2,597 total. Monetary cost was not verified from the account's billing records.

The key remains in an external local file. Its path is referenced by a Git-ignored local configuration. No credential is included in source backups or commits. A clean checkout requires its own credential configuration.

Type checking, production build and provider unit tests pass. HTTP failures are sanitized and requests are not automatically retried. The live check is opt-in, separate from normal automated tests.
