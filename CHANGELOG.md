# Changelog

All notable changes to `toastnova` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-10-17

Initial public release candidate of `toastnova`, a modern, customizable React notification library with premium themes, physics-driven animations, accessible queue management, and server-side rendering support.

### Added

- **Core Notification Engine & Reactive Store**:
  - Thread-safe external reactive store utilizing React's `useSyncExternalStore` for concurrent rendering and React 18/19 Strict Mode compatibility.
  - Dedicated toast methods: `toast.success()`, `toast.error()`, `toast.info()`, `toast.warning()`, `toast.loading()`, `toast.custom()`, `toast.update()`, `toast.dismiss()`, `toast.remove()`, and `toast.promise()`.
  - Configurable queue management with `maxVisible` limits, automatic FIFO queue drain, and viewport docking.
  - Viewport positioning across all 6 standard screen locations (`top-right`, `top-left`, `top-center`, `bottom-right`, `bottom-left`, `bottom-center`).

- **Multi-Theme System (6 Built-In Themes)**:
  - `glass` *(default)*: Translucent frosted glass surface, CSS backdrop blur, ambient shadow, and top specular border reflection.
  - `neon`: Pitch-black OLED surface with vibrant luminescent border glows and electric color accents.
  - `minimal`: Disciplined Swiss typography, compact padding, and subtle monochromatic borders.
  - `gradient`: Multi-stop dark gradient textures with tactile colored drop shadows.
  - `light`: Clean white aesthetic with dark slate typography and subtle borders.
  - `dark`: Midnight slate surface with high-contrast status icons and accessible text.

- **Kinematics & Advanced Interactions**:
  - 5 physics-based animation presets: `slide`, `spring`, `bounce`, `fade`, and `none`.
  - Touch and pointer swipe-to-dismiss with velocity flick detection, snap-back physics, and scroll safety.
  - Countdown pause on pointer hover (`pauseOnHover`) and keyboard focus (`pauseOnFocus`).

- **Advanced Notification Features**:
  - Interactive action buttons (e.g., "Undo") and secondary dismiss handlers with keyboard activation and error boundaries.
  - Custom React JSX component rendering (`toast.custom((id) => <YourComponent id={id} />)`) with zero raw HTML injection.
  - Real-time determinate (`progress: 0..100`) and indeterminate progress bars with accessible `role="progressbar"` semantics.
  - Duplicate handling strategies (`allow`, `dedupe`, `group` with count badges `×2`, `×3`), configurable `dedupeWindow`, and custom `dedupeKey`.
  - In-place dynamic updates (`toast.update(id, ...)`) without remounting cards or resetting active timers.
  - Concurrent asynchronous promise tracking (`toast.promise()`) with automatic pending, resolved, and error state transitions.

- **Accessibility (WCAG 2.1 AA Compliant)**:
  - Accessible `<section role="region" aria-label="Notifications">` container.
  - Selective ARIA live regions: `role="alert"` / `aria-live="assertive"` for error notifications; `role="status"` / `aria-live="polite"` for non-critical alerts.
  - Visually hidden type prefixes (`.toastnova-sr-only`) ensuring screen reader users receive explicit notification category announcements.
  - Non-reliance on color alone (distinct SVG icons for each notification type).
  - Respects operating system `prefers-reduced-motion: reduce` with instant 0ms unmounting.

- **Server-Side Rendering (SSR) & Next.js Compatibility**:
  - Hydration-safe server snapshots yielding `{ toasts: [] }` on the server.
  - Zero browser global access (`window`, `document`, `navigator`) at module initialization.
  - Node.js SSR isolation preventing cross-request notification memory leaks.

- **Distribution & Developer Experience**:
  - Dual ESM (`dist/index.js`) and CommonJS (`dist/index.cjs`) distribution.
  - Complete TypeScript declaration bundle (`dist/index.d.ts`).
  - Standalone CSS stylesheet (`dist/styles.css`) containing all themes and keyframe animations.
  - Interactive documentation website and live playground built with Vite and React.
