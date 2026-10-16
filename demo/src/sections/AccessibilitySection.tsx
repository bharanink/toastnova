import React from 'react';
import { toast } from 'toastnova';
import { CodeBlock } from '../components/CodeBlock';

export const AccessibilitySection: React.FC = () => {
  return (
    <section id="section-accessibility" className="doc-section">
      <div className="doc-section-header">
        <div className="doc-badge-live">WCAG 2.1 AA Compliant</div>
        <h2 className="doc-section-title">Accessibility (a11y) Architecture</h2>
        <p className="doc-section-desc">
          ToastNova is engineered from the ground up for full screen-reader intelligibility, non-disruptive
          focus management, and operating system motion preferences.
        </p>
      </div>

      <div className="doc-a11y-grid">
        {/* Live Region Semantics */}
        <div className="doc-card">
          <h3 className="doc-card-title">1. Selective Live Regions</h3>
          <p className="doc-card-text">
            To prevent overwhelming screen-reader users, routine notifications (<code>success</code>, <code>info</code>, <code>warning</code>, <code>loading</code>)
            use <code>role=&quot;status&quot;</code> and <code>aria-live=&quot;polite&quot;</code>. Only critical errors use <code>role=&quot;alert&quot;</code> with <code>aria-live=&quot;assertive&quot;</code>.
          </p>

          <div className="doc-test-row">
            <button
              type="button"
              className="doc-mini-btn error"
              onClick={() =>
                toast.error('Payment transaction gateway was declined by the issuer.', {
                  title: 'Billing Alert'
                })
              }
            >
              Trigger role=&quot;alert&quot;
            </button>
            <button
              type="button"
              className="doc-mini-btn info"
              onClick={() =>
                toast.info('Preferences saved to cloud profile.', {
                  title: 'Status Update'
                })
              }
            >
              Trigger role=&quot;status&quot;
            </button>
          </div>
        </div>

        {/* Visually Hidden Screen Reader Labels */}
        <div className="doc-card">
          <h3 className="doc-card-title">2. Screen-Reader Type Prefix</h3>
          <p className="doc-card-text">
            Every notification card includes a visually hidden <code>.toastnova-sr-only</code> element prepending the category (e.g. <code>Error: </code> or <code>Success: </code>).
            This guarantees assistive technology users understand the alert type immediately without relying on visual colors or SVG graphics.
          </p>
          <CodeBlock
            language="html"
            code={`<div role="alert" aria-live="assertive" aria-atomic="true">
  <span class="toastnova-sr-only">Error: </span>
  <div class="toastnova-title">Payment Declined</div>
  <div class="toastnova-message">...</div>
</div>`}
          />
        </div>

        {/* Keyboard Navigation */}
        <div className="doc-card">
          <h3 className="doc-card-title">3. Keyboard Focus &amp; Controls</h3>
          <p className="doc-card-text">
            ToastNova never steals focus upon rendering. Outer cards omit <code>tabIndex=&quot;0&quot;</code> to prevent polluting the tab order.
            Child controls (actions and close buttons) are fully navigable and activate with native keyboard keys:
          </p>
          <div className="doc-table-container">
            <table className="doc-table">
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><kbd>Tab</kbd> / <kbd>Shift+Tab</kbd></td>
                  <td>Navigate through action buttons, cancel buttons, and close buttons.</td>
                </tr>
                <tr>
                  <td><kbd>Enter</kbd> / <kbd>Space</kbd></td>
                  <td>Activate focused button control.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Focus Blur Cleanup */}
        <div className="doc-card">
          <h3 className="doc-card-title">4. Focus Cleanup on Dismissal</h3>
          <p className="doc-card-text">
            If a notification disappears while a user is focusing a button inside it, ToastNova safely calls <code>blur()</code> before unmounting,
            preventing keyboard focus from becoming trapped on a detached ghost DOM node.
          </p>
        </div>

        {/* Reduced Motion */}
        <div className="doc-card" style={{ gridColumn: '1 / -1' }}>
          <h3 className="doc-card-title">5. Reduced Motion Detection</h3>
          <p className="doc-card-text">
            ToastNova evaluates <code>prefers-reduced-motion: reduce</code> in both CSS and JavaScript.
            When active, all entrance, exit, and shimmer animations are automatically disabled, and toasts unmount immediately with 0ms delay.
          </p>
          <CodeBlock
            language="css"
            code={`@media (prefers-reduced-motion: reduce) {
  .toastnova-toast,
  .toastnova-toast-enter,
  .toastnova-toast-exit,
  .toastnova-spinner {
    animation: none !important;
    transition: none !important;
  }
}`}
          />
        </div>
      </div>
    </section>
  );
};
