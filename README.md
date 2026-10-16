# ToastNova 🍞✨

> Modern, customizable React toast notification library featuring an external reactive store, deterministic queue management, 6 original handcrafted themes, physics-driven animations with touch/pointer swipe-to-dismiss, and advanced notification capabilities (action buttons, custom React JSX, real-time progress bars, duplicate grouping, in-place updates, and concurrent promise workflows).

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)](tsconfig.json)

---

## Features

- ⚡ **Actionable Notifications**: Native action buttons (e.g., "Undo") and secondary cancel actions with keyboard support, visible focus rings, and configurable auto-dismissal.
- ⚛️ **Custom React Content**: First-class support for rendering custom React components (`toast.custom((id) => ...)`) with stable notification IDs and complete lifecycle cleanup.
- 📊 **Real-Time Progress Indicators**: Determinate (`progress: 0..100`) and indeterminate progress bars with accessible `role="progressbar"` semantics across all themes.
- 🔁 **Configurable Duplicate Strategies**: Prevent alert fatigue with 3 strategies (`allow`, `dedupe`, `group` with repetition badges `×3`), timing windows (`dedupeWindow`), and custom `dedupeKey`s.
- 🔄 **In-Place Dynamic Updates**: Update active notifications by ID (`toast.update(id, ...)`) without remounting, resetting animations, or leaking timers.
- 🤝 **Bulletproof Promise Tracking**: `toast.promise()` handles pending, resolved, and rejected states cleanly while supporting independent concurrent promises without swallowing errors.
- 🎨 **6 Original Built-in Themes**: Handcrafted visual styles (`glass`, `neon`, `minimal`, `gradient`, `light`, `dark`) with zero CSS framework dependencies.
- 🎬 **5 Animation Presets**: Physics-inspired entrance and exit kinematics (`slide`, `fade`, `bounce`, `spring`, `none`).
- 👆 **Touch & Pointer Swipe-to-Dismiss**: Smooth horizontal drag gestures with velocity-based flicks, snap-back physics, and scroll safety.
- ♿ **Strict Accessibility**: Compliant ARIA live regions (`role="alert"` for errors, `role="status"` for others), full keyboard navigation (`Enter` / `Space` activation), and automated `prefers-reduced-motion` detection.
- 📦 **Zero Runtime Dependencies**: Pure React 18/19 and TypeScript, powered by `useSyncExternalStore` for React Strict Mode and concurrent rendering safety.

---

## Installation

### From npm (upon release)

```bash
npm install toastnova
# or
pnpm add toastnova
# or
yarn add toastnova
```

### Local Development / Tarball Testing

```bash
# To test a packaged release candidate locally:
npm install /path/to/toastnova-0.1.0.tgz
```

### Peer Dependencies

ToastNova requires React 18 or 19:

```json
"peerDependencies": {
  "react": ">=18.0.0",
  "react-dom": ">=18.0.0"
}
```

### Required CSS Import

ToastNova styles are distributed as a single compiled CSS file containing all 6 themes and 5 animation presets. Import it once in your root application file (`App.tsx`, `index.tsx`, or `layout.tsx`):

```tsx
import "toastnova/styles.css";
```

---

## Quick Start

### Minimal Setup

```tsx
import { Toaster, toast } from "toastnova";
import "toastnova/styles.css";

export function App() {
  return (
    <>
      <Toaster theme="glass" position="top-right" />
      <button onClick={() => toast.success("Saved successfully!")}>
        Save
      </button>
    </>
  );
}
```

### Full Configuration Example

```tsx
import { Toaster, toast } from "toastnova";
import "toastnova/styles.css";

export default function App() {
  return (
    <>
      <Toaster
        theme="glass"
        position="top-right"
        animation="spring"
        duplicateStrategy="group"
        dedupeWindow={2000}
        swipeToDismiss
        duration={4000}
        maxVisible={5}
      />

      <button onClick={() => toast.success("File deleted", {
        action: {
          label: "Undo",
          onClick: () => restoreFile()
        }
      })}>
        Delete File
      </button>
    </>
  );
}
```

---

## Notification Types

ToastNova provides dedicated methods for each standard notification intent:

```tsx
import { toast } from "toastnova";

// Success notification (role="status", aria-live="polite")
toast.success("Profile updated successfully!");

// Error notification (role="alert", aria-live="assertive")
toast.error("Failed to connect to server.", { title: "Network Error" });

// Informational notification (role="status", aria-live="polite")
toast.info("A new software version is available.");

// Warning notification (role="status", aria-live="polite")
toast.warning("Storage is approaching 90% capacity.");

// Loading notification (persistent until settled or dismissed)
const id = toast.loading("Processing payment...");

// Custom React JSX content
toast.custom((id) => (
  <div>
    <span>Custom alert content</span>
    <button onClick={() => toast.dismiss(id)}>Dismiss</button>
  </div>
));

// Promise lifecycle notifications
await toast.promise(fetchData(), {
  loading: "Fetching records...",
  success: "Records retrieved successfully!",
  error: (err) => `Failed to fetch: ${err.message}`
});
```

---

## Advanced Features (Phase 4)

### 1. Action Buttons & Undo Handlers

Support interactive notifications with primary and secondary action buttons:

```tsx
import { toast } from "toastnova";

toast.success("Message archived", {
  title: "Inbox Updated",
  action: {
    label: "Undo",
    onClick: async () => {
      await restoreMessage();
      toast.info("Message restored to Inbox");
    },
    // Optional: set to false to prevent auto-dismissal after clicking
    dismissOnClick: true
  },
  cancel: {
    label: "Dismiss",
    onClick: () => {}
  }
});
```

- **Keyboard Accessible**: Action buttons are standard HTML buttons with visible focus rings (`:focus-visible`). Pressing `Enter` or `Space` triggers the action.
- **Error Resilient**: Any synchronous or asynchronous error thrown inside `onClick` is safely caught without crashing the notification system.
- **Configurable Auto-Dismiss**: By default, clicking the action automatically dismisses the toast. Set `dismissOnClick: false` to keep the toast open.

---

### 2. Custom React Content

Render real React JSX elements inside the notification card:

```tsx
toast.custom((id) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
    <strong>Export Completed</strong>
    <p>Your weekly metrics report is ready for download.</p>
    <div style={{ display: "flex", gap: "8px" }}>
      <button
        type="button"
        onClick={() => {
          downloadReport();
          toast.dismiss(id);
        }}
      >
        Download CSV
      </button>
      <button type="button" onClick={() => toast.dismiss(id)}>
        Close
      </button>
    </div>
  </div>
));
```

- **Stable ID**: The custom renderer receives the notification's unique `id`, allowing callers to dismiss the toast programmatically via `toast.dismiss(id)`.
- **Theme & Kinematics**: Custom notifications inherit the active theme container, entrance/exit animations, swipe-to-dismiss, and stack positioning.
- **Component Lifecycle**: Child components mounted within custom toasts are cleaned up properly when the toast dismisses or unmounts.
- **Zero HTML Injection**: ToastNova renders real React elements directly into the virtual DOM without using `dangerouslySetInnerHTML`.

> [!NOTE]
> When providing custom content, ensure that interactive elements (buttons, links) are keyboard accessible and have descriptive labels for screen readers.

---

### 3. Progress Indicators

Track long-running tasks such as file uploads, data exports, or background synchronization:

```tsx
// 1. Create a loading toast with initial progress
const id = toast.loading("Uploading presentation.pdf", {
  title: "Cloud Backup",
  progress: 0
});

// 2. Update progress in response to real task events
api.onUploadProgress((percent) => {
  toast.update(id, {
    message: `Uploading presentation.pdf (${percent}%)...`,
    progress: percent
  });
});

// 3. Mark completed upon settlement
api.onComplete(() => {
  toast.update(id, {
    title: "Upload Completed",
    message: "presentation.pdf is now available in your cloud drive.",
    type: "success",
    progress: 100,
    duration: 3500 // Automatically dismiss after 3.5 seconds
  });
});
```

#### Indeterminate Progress

For tasks with an unknown duration:

```tsx
toast.loading("Analyzing dependencies...", {
  progress: "indeterminate"
});
```

- **Range Validation**: Numeric progress values are clamped between `0` and `100`. Invalid values (e.g., `NaN`) are safely normalized.
- **Accessibility**: Progress bars include `role="progressbar"`, `aria-valuenow`, `aria-valuemin="0"`, and `aria-valuemax="100"`.
- **All Themes Supported**: Styled consistently across all 6 visual themes.

---

### 4. Duplicate Handling Strategies

Control how repeated notifications are managed across rapid events or spam triggers:

```tsx
<Toaster
  duplicateStrategy="group" // 'allow' | 'dedupe' | 'group'
  dedupeWindow={2000}       // 2-second time window (0 = active lifespan)
/>
```

| Strategy | Behavior |
| :--- | :--- |
| **`allow`** *(default)* | Shows every notification normally, preserving full backward compatibility. |
| **`dedupe`** | Suppresses repeated active notifications with matching text and type. Returns the existing toast ID. |
| **`group`** | Combines repeated notifications into a single active card, displaying an incrementing count badge (e.g., `×2`, `×3`) and resetting the dismissal countdown. |

#### Explicit Deduplication Keys

Use `dedupeKey` to group or deduplicate notifications whose message strings vary:

```tsx
toast.warning("Network ping: 140ms", { dedupeKey: "network-latency" });
toast.warning("Network ping: 180ms", { dedupeKey: "network-latency" });
// In 'group' mode, combines into a single toast with badge ×2
```

- **Type Differentiation**: Notifications with different types (e.g., `success` vs `error`) are never grouped together, even if their messages match.
- **Custom Content Safety**: Custom React content is never grouped unless an explicit `dedupeKey` is provided.
- **Dismissal Safety**: Notifications that have already begun their exit animation or have been dismissed are never grouped.

---

### 5. Notification IDs & In-Place Updates

Update active notifications dynamically by ID:

```tsx
const id = toast.loading("Saving changes...", {
  title: "Workspace"
});

try {
  await saveWorkspace();
  toast.update(id, {
    title: "Changes Saved",
    message: "Workspace settings updated successfully.",
    type: "success",
    duration: 3500
  });
} catch (err) {
  toast.update(id, {
    title: "Save Failed",
    message: err instanceof Error ? err.message : "Unable to reach server",
    type: "error",
    duration: 5000
  });
}
```

- **Safe Nonexistent IDs**: Calling `toast.update()` or `toast.dismiss()` with an unknown or already-dismissed ID is a safe no-op.
- **Timer Reset**: Updating the `type` or specifying a new `duration` resets the auto-dismiss countdown timer so users have sufficient time to read the updated status. Updating progress alone preserves the active countdown timer.

---

### 6. Promise Notifications (`toast.promise`)

Track asynchronous operations with automatic loading, success, and error states:

```tsx
const data = await toast.promise(
  fetchData(),
  {
    loading: "Fetching user records...",
    success: (result) => `Retrieved ${result.count} records.`,
    error: (err) => `Failed: ${err.message}`
  },
  {
    duration: 4000
  }
);
```

- **Original Value Preserved**: Returns the resolved promise data on success.
- **Errors Rethrown**: Rejections are rethrown to the caller rather than swallowed silently.
- **Concurrent Independent Promises**: Multiple asynchronous tasks run independently on separate toast cards.

---

## Built-In Themes

ToastNova includes 6 original handcrafted themes:

| Theme | Class Name | Visual Characteristics |
| :--- | :--- | :--- |
| `glass` *(default)* | `.toastnova-theme-glass` | Translucent frosted glass surface, backdrop blur, specular top reflection, and ambient shadow. |
| `neon` | `.toastnova-theme-neon` | Deep pitch-black surface with vibrant luminescent borders and radiant laser glows. |
| `minimal` | `.toastnova-theme-minimal` | Clean compact layout, subtle monochromatic borders, and disciplined Swiss typography. |
| `gradient` | `.toastnova-theme-gradient` | Rich multi-stop dark gradients with crystal white typography and tactile colored drop shadows. |
| `light` | `.toastnova-theme-light` | Bright white surface with crisp dark slate typography and clean borders. |
| `dark` | `.toastnova-theme-dark` | Deep midnight slate background with clear colored status indicators and high contrast. |

```tsx
<Toaster theme="neon" />
<Toaster theme="minimal" />
<Toaster theme="gradient" />
<Toaster theme="light" />
<Toaster theme="dark" />
```

---

## Animation Presets

| Preset | Description |
| :--- | :--- |
| **`slide`** *(default)* | Directional entrance based on toaster position with fluid deceleration. Exits off the nearest edge. |
| **`spring`** | Elastic, physics-damped spring curve (`cubic-bezier(0.175, 0.885, 0.32, 1.2)`) with responsive velocity. |
| **`bounce`** | Restrained overshoot curve (`cubic-bezier(0.34, 1.56, 0.64, 1)`) that settles naturally without visual instability. |
| **`fade`** | Pure cross-dissolve opacity transition with micro-scale anchoring to prevent layout shifts. |
| **`none`** | Zero animation transitions for instant appearance and 0ms removal. |

---

## `<Toaster />` Props Reference

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `theme` | `'glass' \| 'neon' \| 'minimal' \| 'gradient' \| 'light' \| 'dark'` | `'glass'` | Built-in visual theme. |
| `position` | `ToastPosition` | `'top-right'` | Screen position: `'top-right'`, `'top-left'`, `'top-center'`, `'bottom-right'`, `'bottom-left'`, `'bottom-center'`. |
| `animation` | `'slide' \| 'fade' \| 'bounce' \| 'spring' \| 'none'` | `'slide'` | Animation preset for entrance and exit. |
| `animationDuration` | `number` | `220` | Duration of entrance and exit animations in milliseconds. |
| `stackGap` | `number` | `10` | Spacing between stacked notifications in pixels. |
| `duplicateStrategy`| `'allow' \| 'dedupe' \| 'group'` | `'allow'` | Handling strategy for repeated notifications. |
| `dedupeWindow` | `number` | `0` | Deduplication time window in milliseconds (`0` = active lifespan). |
| `swipeToDismiss` | `boolean` | `true` | Enable touch and pointer drag-to-dismiss gesture. |
| `duration` | `number` | `4000` | Default auto-dismiss timeout in milliseconds (`0` or `Infinity` to disable). |
| `maxVisible` | `number` | `5` | Maximum toasts displayed simultaneously. Remaining are queued. |
| `pauseOnHover` | `boolean` | `true` | Freeze countdown timer while mouse cursor is over the toast. |
| `pauseOnFocus` | `boolean` | `true` | Freeze countdown timer while keyboard focus is inside the toast. |
| `disableAnimations`| `boolean` | `false` | Disable all motion (equivalent to `animation="none"`). |
| `className` | `string` | `""` | Additional class name on the toaster container. |
| `style` | `CSSProperties` | `undefined` | Inline styles on the toaster container. |

---

## TypeScript Definitions

```tsx
import type {
  Toast,
  ToastType,
  ToastPosition,
  ToastTheme,
  ToastAnimationPreset,
  ToastAction,
  ToastDuplicateStrategy,
  ToastOptions,
  ToastUpdateOptions,
  CustomToastRenderer,
  PromiseMessages,
  ToasterProps
} from "toastnova";
```

---

## Accessibility Architecture (Phase 5)

ToastNova is engineered to satisfy WCAG 2.1 AA requirements and provide an accessible notification experience across all screen readers, keyboard devices, and motion preferences:

### 1. Semantic Markup & Selective Live Regions
- **Landmark Container**: The toaster container is declared as a `<section role="region" aria-label="Notifications">` so assistive technologies can navigate to it.
- **Selective Alert Semantics**: Urgent error notifications use `role="alert"` and `aria-live="assertive"`. Routine notifications (`success`, `info`, `warning`, `loading`) use `role="status"` and `aria-live="polite"`.
- **Visually Hidden Type Announcements**: Every notification includes a `.toastnova-sr-only` element prepending its category (e.g., `"Error: "`, `"Success: "`, `"Warning: "`, `"Information: "`, `"Loading: "`) so screen reader users immediately know the notification intent without relying on visual icons or colors.
- **Non-Reliance on Color Alone**: In addition to distinct color palettes, every notification type features a unique SVG icon (`CheckCircle`, `AlertCircle`, `AlertTriangle`, `Info`, `Spinner`) and screen-reader label.

### 2. Keyboard Navigation & Focus Management
- **No Focus Stealing**: Newly rendered toasts never steal keyboard focus or interrupt current user typing.
- **Predictable Tab Sequence**: Static toast cards omit `tabIndex={0}` to prevent polluting the tab sequence. Only interactive child controls (action buttons, cancel buttons, and dismissal buttons) receive keyboard focus.
- **Native Activation**: All interactive controls are native `<button type="button">` elements that activate on both `Enter` and `Space`.
- **Focus Cleanup on Dismissal**: If a notification is dismissed while an element inside it has active focus, ToastNova cleanly blurs the element to prevent focus from becoming stranded on an unmounted DOM node.
- **Contextual Dismissal Labels**: Close buttons provide dynamic accessible names matching the notification title (e.g., `aria-label="Close notification: Save File"`).

### 3. Reduced Motion Support
ToastNova automatically listens to the user's operating system preferences via both CSS and JS:
```css
@media (prefers-reduced-motion: reduce) {
  /* All entrance, exit, and shimmer animations are disabled */
}
```
When `prefers-reduced-motion: reduce` is detected or when `disableAnimations` / `animation="none"` is active, exiting toasts are unmounted immediately with 0ms transition delay.

---

## Server-Side Rendering (SSR) & Next.js Compatibility

ToastNova is fully safe for modern SSR frameworks (Next.js App Router, Pages Router, Remix, Vite SSR, Astro):

### 1. Zero Browser Globals at Import
Importing `toastnova` or `toast` never touches `window`, `document`, or `navigator` at module initialization time.

### 2. Per-Request State Isolation
In a Node.js / SSR environment (`typeof window === 'undefined'`), mutating store operations return valid generated IDs but do not populate server memory. This ensures notifications triggered during server execution never leak across requests.

### 3. Stable Server Snapshot
ToastNova satisfies the strict React `useSyncExternalStore` contract with a cached, immutable `getServerSnapshot` reference that always yields `{ toasts: [] }`, guaranteeing zero hydration mismatch warnings.

### 4. Next.js App Router Integration Example
When using React Server Components, place `<Toaster />` inside a client-side wrapper:

```tsx
// components/ClientToaster.tsx
'use client';

import { Toaster } from 'toastnova';
import 'toastnova/styles.css';

export function ClientToaster() {
  return <Toaster position="top-right" theme="glass" animation="spring" />;
}
```

```tsx
// app/layout.tsx
import { ClientToaster } from '@/components/ClientToaster';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <ClientToaster />
      </body>
    </html>
  );
}
```

---

## Mobile & Cross-Platform Reliability

- **Safe-Area Insets**: Toaster containers automatically respect device safe areas using `env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`, `env(safe-area-inset-left)`, and `env(safe-area-inset-right)`.
- **Comfortable Touch Targets**: On mobile screens (`max-width: 600px`), dismissal buttons and action buttons expand to a minimum touch target size of 36×36px.
- **Unbroken URL & String Wrapping**: Content containers use `overflow-wrap: anywhere; word-break: break-word;` to prevent long unbroken hashes or URLs from causing horizontal page blowout.
- **Pointer Cancellation**: Interrupted swipe gestures (`pointercancel`) smoothly snap the notification back to `(0, 0, 0)` without corrupting swipe state.

---

## Browser Support Matrix

| Environment | Supported Versions | Notes |
| :--- | :--- | :--- |
| **Chromium** (Chrome, Edge, Brave, Opera) | Latest 2 versions | Full glassmorphism, animations, swipe-to-dismiss, and accessibility. |
| **Mozilla Firefox** | Latest 2 versions | Full theme support, CSS backdrop-filter, reduced-motion. |
| **Apple Safari** (macOS) | 15.4+ | WebKit backdrop-filter, touch gestures, pointer events. |
| **Mobile Safari** (iOS) | iOS 15.4+ | Safe-area insets, swipe-to-dismiss, touch targets. |
| **Chrome for Android** | Latest | Full touch drag, swipe velocity flicks, safe areas. |
| **Node.js / SSR** | Node 18+ | Zero browser globals, hydration-safe, per-request isolation. |
| **React** | 18.0.0+ / 19.0.0+ | Strict Mode verified, concurrent safe, `useSyncExternalStore`. |

---

## Known Limitations

- **Progress Measurement**: ToastNova provides the visual rendering and ARIA progress semantics for progress bars (`role="progressbar"`), but does not poll async task progress automatically. Applications must pass real numerical values (`0..100`) via `toast.update(id, { progress })`.
- **Custom Content Deduplication**: Because arbitrary React function components vary in reference identity, `toast.custom()` renders are not deduplicated automatically unless an explicit `dedupeKey` is passed in options.
- **CSS Backdrop Filter on Outdated Browsers**: Extremely old browser engines lacking `backdrop-filter` support fall back to semi-translucent solid backgrounds without blurring underlying elements.

---

## Performance Benchmarks & Bundle Metrics (Phase 6)

### 1. Production Bundle Size & Budgets

ToastNova is engineered with zero runtime dependencies (`dependencies: {}`) and declared `sideEffects: ["*.css", "./dist/styles.css"]` to maximize bundler tree-shaking:

| Artifact | Format | Raw Size | Gzip Compressed | Budget Target | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `dist/index.js` | ESM | **25.59 kB** | **6.35 kB** | < 30 kB raw / < 10 kB gzip | ✅ Passed |
| `dist/index.cjs` | CommonJS | **17.95 kB** | **5.41 kB** | < 25 kB raw / < 8 kB gzip | ✅ Passed |
| `dist/index.d.ts` | TypeScript Types | **7.70 kB** | **2.02 kB** | < 12 kB raw | ✅ Passed |
| `dist/styles.css` | All 6 Themes & Animations | **28.46 kB** | **4.47 kB** | < 35 kB raw / < 6 kB gzip | ✅ Passed |

*Measurements taken via Vite 6 production build and `gzip` compression.*

### 2. Runtime Workload Performance

Measured on Node.js v22 (x64) via `npm run benchmark`:

| Workload Benchmark | Throughput | Average Latency | Description |
| :--- | :--- | :--- | :--- |
| **In-Place Dynamic Updates** | **1,669,393 ops/sec** | **0.60 µs / op** | Updating active notifications by ID (`toast.update`) |
| **Duplicate Deduplication** | **607,172 ops/sec** | **1.65 µs / op** | Deduplicating repeated notifications within window |
| **Duplicate Grouping** | **585,501 ops/sec** | **1.71 µs / op** | Aggregating repeated alerts with count badge increment |
| **Direct Queue Flood (Allow)**| **73,444 ops/sec** | **13.62 µs / op** | Creating and queuing 5,000 distinct notifications |
| **10 Active Store Subscribers**| **26,264 ops/sec** | **38.07 µs / op** | Broadcasting queue updates to 10 concurrent listeners |

---

## Continuous Integration (CI)

A lightweight GitHub Actions CI pipeline is located at `.github/workflows/ci.yml`. It runs automatically on pull requests and pushes to `main`:

1. **Matrix Testing**: Validates against Node.js `18.x`, `20.x`, and `22.x`.
2. **Reproducible Install**: Runs `npm ci` using `package-lock.json`.
3. **Type Checking**: Runs `npm run typecheck` (`tsc --noEmit`).
4. **Unit & Integration Tests**: Runs `npm test` across all 9 test suites (158 automated tests).
5. **Production Build**: Executes `npm run build` compiling ESM, CJS, DTS, and CSS.
6. **Benchmark Validation**: Runs `npm run benchmark` ensuring runtime throughput stability.
7. **Package Verification**: Runs `npm pack --dry-run` to ensure only intended distributables are packaged.

---

## Development, Testing & Validation

```bash
# Install dependencies reproducibly
npm install

# Start local interactive documentation & playground
npm run dev

# Run full test suite (158 tests across 9 test suites)
npm test

# Run TypeScript type check
npm run typecheck

# Build library production bundle (ESM, CJS, DTS, CSS)
npm run build

# Build standalone documentation website
npm run build:docs

# Run runtime workload benchmarks
npm run benchmark

# Run complete end-to-end validation pipeline
npm run validate
```

---

## Contributing

Contributions, bug reports, and suggestions are welcome:

1. **Fork or Clone**: Ensure you have Node.js 18+ installed.
2. **Install Dependencies**: Run `npm install`.
3. **Run Tests**: Ensure all existing tests pass with `npm test`.
4. **Code Quality**: Run `npm run typecheck` to verify TypeScript types with zero errors.
5. **Validation Pipeline**: Run `npm run validate` prior to opening a pull request.

---

## License

[MIT](LICENSE) © 2026 ToastNova Contributors

