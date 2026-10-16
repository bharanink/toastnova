# ToastNova — NPM Release Checklist

This checklist tracks the release readiness of `toastnova` for its initial release (`v0.1.0`).

- [x] **Package identity verified**: Package name is configured as `toastnova` with version `0.1.0` in `package.json`.
- [x] **Package name and ownership status checked**: Verified on the public npm registry (`npm view toastnova` returned `404 Not Found`). Name is currently unclaimed and available.
- [x] **Version and release notes reviewed**: Semantic versioning confirmed (`v0.1.0` for initial public API release), documented in `CHANGELOG.md`.
- [x] **License decision confirmed**: MIT License confirmed in both `LICENSE` file and `package.json`. All 15 development dependencies audited and confirmed compatible (MIT or Apache-2.0).
- [x] **README verified**: Professional README with verified installation instructions, minimal React setup, required CSS imports, notification types, theme/position configurations, accessibility/SSR guides, and contribution guidelines.
- [x] **Public exports validated**: Public ESM, CommonJS, and TypeScript declaration entry points confirmed matching `package.json` exports mapping.
- [x] **TypeScript declarations validated**: Strict TypeScript build (`tsc --noEmit`) passes with 0 errors. `.d.ts` types independently validated in consumer TypeScript project.
- [x] **CSS distribution validated**: All 6 themes and 5 animation presets compiled into standalone `dist/styles.css` (28.46 kB raw / 4.47 kB gzip).
- [x] **Tests and type checks passed**: 158 automated tests passing across 9 test suites with 0 failures (`npm test`).
- [x] **Production builds passed**: Dual build succeeded (package library into `dist/` and documentation website into `dist-docs/`).
- [x] **Security audit results reviewed**: Library has zero runtime dependencies (`dependencies: {}`). Development dependencies audited via `npm audit` and documented.
- [x] **Packed file list reviewed**: Tarball contains exactly 9 files (compiled JS, type declarations, CSS, README, LICENSE, package.json). Zero extraneous or test files packaged.
- [x] **Clean consumer installation tested**: Packaged `.tgz` installed into clean external test project. TypeScript compilation, real component rendering, and SSR string rendering verified.
- [x] **Documentation website verified**: Interactive playground and documentation site built and verified in browser session and automated component tests.
- [x] **Git working tree reviewed**: Working tree clean of unexpected artifacts or uncommitted temporary files.
- [ ] **npm account and publishing permissions checked by the user**: Maintainer must be logged in to their npm account (`npm whoami`).
- [ ] **Publication explicitly approved by the user**: Final human confirmation required before executing irreversible publish commands.

---

## Publishing Instructions for Maintainer

When ready to publish to the npm public registry:

1. **Verify your npm authentication**:
   ```bash
   npm whoami
   ```
   If not logged in:
   ```bash
   npm login
   ```

2. **Run final validation check**:
   ```bash
   npm run validate
   ```

3. **Publish the package**:
   ```bash
   # For standard public package:
   npm publish --access public
   ```

> [!NOTE]
> Do not publish if any pending items on this checklist remain unconfirmed.
