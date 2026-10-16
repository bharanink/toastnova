import React from 'react';
import { CodeBlock } from '../components/CodeBlock';

export const ApiSection: React.FC = () => {
  return (
    <section id="section-api" className="doc-section">
      <div className="doc-section-header">
        <h2 className="doc-section-title">API Reference</h2>
        <p className="doc-section-desc">
          Complete, verified specifications for <code>&lt;Toaster /&gt;</code> props, <code>toast.*</code> imperative methods,
          and TypeScript interfaces extracted directly from the source code.
        </p>
      </div>

      {/* 1. Toaster Props Table */}
      <div className="doc-api-block">
        <h3 className="doc-subsection-title">&lt;Toaster /&gt; Component Props</h3>
        <p className="doc-section-desc">
          Mount this component once in your React tree. It automatically connects to the reactive notification store.
        </p>

        <div className="doc-table-container">
          <table className="doc-table">
            <thead>
              <tr>
                <th>Prop</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>theme</code></td>
                <td><code>&apos;glass&apos; | &apos;neon&apos; | &apos;minimal&apos; | &apos;gradient&apos; | &apos;light&apos; | &apos;dark&apos;</code></td>
                <td><code>&apos;glass&apos;</code></td>
                <td>Visual theme styling applied to notifications.</td>
              </tr>
              <tr>
                <td><code>position</code></td>
                <td><code>ToastPosition</code></td>
                <td><code>&apos;top-right&apos;</code></td>
                <td>Viewport location: <code>&apos;top-right&apos;</code>, <code>&apos;top-left&apos;</code>, <code>&apos;top-center&apos;</code>, <code>&apos;bottom-right&apos;</code>, <code>&apos;bottom-left&apos;</code>, <code>&apos;bottom-center&apos;</code>.</td>
              </tr>
              <tr>
                <td><code>animation</code></td>
                <td><code>ToastAnimationPreset</code></td>
                <td><code>&apos;slide&apos;</code></td>
                <td>Kinematic entrance/exit preset: <code>&apos;slide&apos;</code>, <code>&apos;fade&apos;</code>, <code>&apos;bounce&apos;</code>, <code>&apos;spring&apos;</code>, <code>&apos;none&apos;</code>.</td>
              </tr>
              <tr>
                <td><code>animationDuration</code></td>
                <td><code>number</code></td>
                <td><code>220</code></td>
                <td>Transition duration in milliseconds.</td>
              </tr>
              <tr>
                <td><code>duration</code></td>
                <td><code>number</code></td>
                <td><code>4000</code></td>
                <td>Default auto-dismiss countdown in milliseconds (<code>Infinity</code> for persistent).</td>
              </tr>
              <tr>
                <td><code>maxVisible</code></td>
                <td><code>number</code></td>
                <td><code>5</code></td>
                <td>Maximum simultaneous visible toasts. Excess alerts are held in FIFO queue.</td>
              </tr>
              <tr>
                <td><code>duplicateStrategy</code></td>
                <td><code>&apos;allow&apos; | &apos;dedupe&apos; | &apos;group&apos;</code></td>
                <td><code>&apos;allow&apos;</code></td>
                <td>Handling duplicate alerts. <code>&apos;group&apos;</code> increments an occurrences badge counter.</td>
              </tr>
              <tr>
                <td><code>dedupeWindow</code></td>
                <td><code>number</code></td>
                <td><code>0</code></td>
                <td>Sliding window in milliseconds for deduplication (<code>0</code> = active lifespan).</td>
              </tr>
              <tr>
                <td><code>swipeToDismiss</code></td>
                <td><code>boolean</code></td>
                <td><code>true</code></td>
                <td>Enables horizontal touch and pointer drag-to-dismiss gesture.</td>
              </tr>
              <tr>
                <td><code>pauseOnHover</code></td>
                <td><code>boolean</code></td>
                <td><code>true</code></td>
                <td>Freezes countdown timer while cursor is hovered over the toast.</td>
              </tr>
              <tr>
                <td><code>pauseOnFocus</code></td>
                <td><code>boolean</code></td>
                <td><code>true</code></td>
                <td>Freezes countdown timer while keyboard focus is inside the toast.</td>
              </tr>
              <tr>
                <td><code>disableAnimations</code></td>
                <td><code>boolean</code></td>
                <td><code>false</code></td>
                <td>Instantly renders and removes toasts without animation delay.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Toast Imperative Methods */}
      <div className="doc-api-block">
        <h3 className="doc-subsection-title">Imperative <code>toast</code> Methods</h3>

        <div className="doc-method-card">
          <div className="doc-method-header">
            <h4><code>toast(message, options?)</code></h4>
            <span className="doc-return-badge">returns string (id)</span>
          </div>
          <p>Dispatches a neutral, default-styled notification card.</p>
          <CodeBlock
            language="tsx"
            code={`const id = toast('A new update is available', {
  title: 'System Notice',
  duration: 5000
});`}
          />
        </div>

        <div className="doc-method-card">
          <div className="doc-method-header">
            <h4><code>toast.success(message, options?)</code></h4>
            <span className="doc-return-badge">returns string (id)</span>
          </div>
          <p>Dispatches a positive status notification with CheckCircle icon and polite ARIA status announcement.</p>
          <CodeBlock
            language="tsx"
            code={`toast.success('Your file was exported successfully.', {
  title: 'Export Complete'
});`}
          />
        </div>

        <div className="doc-method-card">
          <div className="doc-method-header">
            <h4><code>toast.error(message, options?)</code></h4>
            <span className="doc-return-badge">returns string (id)</span>
          </div>
          <p>Dispatches an urgent alert notification with AlertCircle icon, red styling, and assertive screen-reader announcement (<code>role=&quot;alert&quot;</code>).</p>
          <CodeBlock
            language="tsx"
            code={`toast.error('Unable to synchronize database records.', {
  title: 'Sync Failed'
});`}
          />
        </div>

        <div className="doc-method-card">
          <div className="doc-method-header">
            <h4><code>toast.promise(promise, messages, options?)</code></h4>
            <span className="doc-return-badge">returns Promise&lt;T&gt;</span>
          </div>
          <p>Tracks an asynchronous promise through its full lifecycle: pending loading state, resolution, or rejection, without swallowing rejections.</p>
          <CodeBlock
            language="tsx"
            code={`const data = await toast.promise(
  fetchUserData(userId),
  {
    loading: 'Fetching user profile...',
    success: (user) => \`Welcome back, \${user.name}!\`,
    error: (err) => \`Failed to load user: \${err.message}\`
  }
);`}
          />
        </div>

        <div className="doc-method-card">
          <div className="doc-method-header">
            <h4><code>toast.custom(renderer, options?)</code></h4>
            <span className="doc-return-badge">returns string (id)</span>
          </div>
          <p>Renders custom React components with stable ID callbacks and lifecycle cleanup.</p>
          <CodeBlock
            language="tsx"
            code={`toast.custom((id) => (
  <div className="custom-banner">
    <p>Rate your experience today</p>
    <button onClick={() => toast.dismiss(id)}>Close</button>
  </div>
));`}
          />
        </div>

        <div className="doc-method-card">
          <div className="doc-method-header">
            <h4><code>toast.update(id, updates)</code></h4>
            <span className="doc-return-badge">returns void</span>
          </div>
          <p>Mutates an active or queued notification in place without resetting animations or unmounting components.</p>
          <CodeBlock
            language="tsx"
            code={`// Update progress during background upload
toast.update(toastId, {
  progress: 85,
  message: 'Uploading file (85%)...'
});`}
          />
        </div>

        <div className="doc-method-card">
          <div className="doc-method-header">
            <h4><code>toast.dismiss(id?)</code></h4>
            <span className="doc-return-badge">returns void</span>
          </div>
          <p>Initiates the exit animation for a specific notification, or for all active and queued notifications if no ID is passed.</p>
          <CodeBlock
            language="tsx"
            code={`// Dismiss a single toast
toast.dismiss(toastId);

// Dismiss all active and queued toasts
toast.dismiss();`}
          />
        </div>
      </div>

      {/* 3. ToastOptions Interface */}
      <div className="doc-api-block">
        <h3 className="doc-subsection-title">ToastOptions TypeScript Interface</h3>
        <CodeBlock
          language="tsx"
          code={`export interface ToastOptions {
  id?: string;
  title?: ReactNode;
  duration?: number; // Milliseconds, or Infinity for persistent
  dismissible?: boolean; // Show close button (defaults to true)
  progress?: number | 'indeterminate'; // Determinate 0..100 or 'indeterminate'
  action?: {
    label: ReactNode;
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
    dismissOnClick?: boolean; // Defaults to true
    className?: string;
    style?: CSSProperties;
    ariaLabel?: string;
  };
  cancel?: {
    label: ReactNode;
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
    dismissOnClick?: boolean; // Defaults to true
    className?: string;
    style?: CSSProperties;
    ariaLabel?: string;
  };
  dedupeKey?: string; // Explicit key for grouping or deduplicating
  icon?: ReactNode; // Custom icon component
  className?: string;
  style?: CSSProperties;
  onDismiss?: (id: string) => void;
}`}
        />
      </div>
    </section>
  );
};
