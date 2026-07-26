# Vanilla baseline

This directory is an immutable reference captured before the React migration.

## Source metrics

- Main HTML: 102,845 bytes
- CSS: 17 files, 300,787 bytes
- Runtime JavaScript: 19 files, 1,939,464 bytes
- Initial local links: 16 stylesheets and 19 scripts
- Runtime extras: the beginner-mode stylesheet, JSZip, Font Awesome, and Google Fonts

## Automated checks

- Unit tests: 126/126 passed.
- Browser acceptance flows were run in isolated Edge profiles.
- The current Vanilla baseline has two pre-existing acceptance-harness failures:
  - `interaction-hub.acceptance.js` does not reach its post-reload readiness predicate.
  - `selection-toolbar-responsive.acceptance.js` cannot find an expected toolbar control.
- The remaining acceptance flows pass when each browser run has its own CDP port and profile.
- The migration must not count these two baseline results as React regressions, but the
  React suite should replace them with deterministic Playwright coverage.

## Captures

- `screens/`: six full workflow captures plus DOM observations.
- `ux/`: desktop, tablet, and mobile responsive captures and verification.
- `interaction-demo/`: desktop/mobile flow and condition captures.
