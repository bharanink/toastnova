import React from 'react';
import { toast } from 'toastnova';
import { CodeBlock } from '../components/CodeBlock';
import { ToastLogViewer } from '../components/ToastLogViewer';

interface HeroSectionProps {
  onGoToPlayground: () => void;
  onGoToDocs: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGoToPlayground, onGoToDocs }) => {
  return (
    <section id="section-overview" className="doc-section doc-hero-section">
      <div className="doc-hero-badge">
        <span className="doc-hero-dot" />
        <span>v0.1.0 • React 18 & 19 Ready • Zero Runtime Dependencies</span>
      </div>

      <h1 className="doc-hero-title">
        Beautiful notifications. <br />
        <span className="doc-hero-gradient">One simple API.</span>
      </h1>

      <p className="doc-hero-desc">
        ToastNova is a customizable React notification library with expressive themes, smooth animations,
        accessible interactions, and a developer-friendly API.
      </p>

      {/* Action CTA Buttons */}
      <div className="doc-hero-actions">
        <button
          type="button"
          className="doc-btn doc-btn-primary"
          onClick={onGoToPlayground}
        >
          Open Interactive Playground
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 3L11 8L6 13" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <button
          type="button"
          className="doc-btn doc-btn-secondary"
          onClick={onGoToDocs}
        >
          Documentation & Guides
        </button>
      </div>

      {/* Quick Interactive Notification Triggers */}
      <div className="doc-hero-triggers-card">
        <div className="doc-triggers-header">
          <span className="doc-triggers-title">Live Preview (Click to Trigger Real Toasts)</span>
        </div>
        <div className="doc-triggers-grid">
          <button
            type="button"
            className="doc-quick-btn success"
            onClick={() =>
              toast.success('Your changes were successfully published.', {
                title: 'Deployment Ready'
              })
            }
          >
            <span className="btn-indicator success" />
            toast.success()
          </button>

          <button
            type="button"
            className="doc-quick-btn error"
            onClick={() =>
              toast.error('Failed to establish database replication lock.', {
                title: 'Connection Error'
              })
            }
          >
            <span className="btn-indicator error" />
            toast.error()
          </button>

          <button
            type="button"
            className="doc-quick-btn info"
            onClick={() =>
              toast.info('New team invite accepted from Sarah.', {
                title: 'Workspace Update'
              })
            }
          >
            <span className="btn-indicator info" />
            toast.info()
          </button>

          <button
            type="button"
            className="doc-quick-btn warning"
            onClick={() =>
              toast.warning('Storage cluster usage is currently at 88%.', {
                title: 'High Capacity Alert'
              })
            }
          >
            <span className="btn-indicator warning" />
            toast.warning()
          </button>

          <button
            type="button"
            className="doc-quick-btn action"
            onClick={() =>
              toast('Invoice #9042 sent to client', {
                title: 'Invoice Dispatched',
                action: {
                  label: 'View PDF',
                  onClick: () => {
                    toast.info('Opening invoice viewer...');
                  }
                }
              })
            }
          >
            <span className="btn-indicator action" />
            toast with Action
          </button>
        </div>

        {/* Real-time View Logs Panel below triggers */}
        <ToastLogViewer title="Hero Quick-Trigger Logs" defaultExpanded={false} />
      </div>

      {/* Feature Pillar Grid */}
      <div className="doc-features-grid">
        <div className="doc-feature-card">
          <div className="doc-feature-icon">🎨</div>
          <h3 className="doc-feature-heading">6 Handcrafted Themes</h3>
          <p className="doc-feature-text">
            Glass, Neon, Minimal, Gradient, Light, and Dark themes built with pure CSS and zero UI framework bloat.
          </p>
        </div>

        <div className="doc-feature-card">
          <div className="doc-feature-icon">⚡</div>
          <h3 className="doc-feature-heading">Spring Kinematics</h3>
          <p className="doc-feature-text">
            5 animation presets with smooth touch and pointer swipe-to-dismiss velocity tracking and snap-back physics.
          </p>
        </div>

        <div className="doc-feature-card">
          <div className="doc-feature-icon">♿</div>
          <h3 className="doc-feature-heading">WCAG 2.1 AA Compliant</h3>
          <p className="doc-feature-text">
            Selective live regions, visible focus rings, full keyboard accessibility, and prefers-reduced-motion detection.
          </p>
        </div>

        <div className="doc-feature-card">
          <div className="doc-feature-icon">🌐</div>
          <h3 className="doc-feature-heading">SSR & Next.js Safe</h3>
          <p className="doc-feature-text">
            Zero browser globals accessed during import or SSR, per-request state isolation, and stable hydration snapshots.
          </p>
        </div>
      </div>

      {/* Verified Minimal Example */}
      <div className="doc-hero-code">
        <h2 className="doc-subsection-title">Minimal Example</h2>
        <CodeBlock
          language="tsx"
          title="App.tsx"
          code={`import { Toaster, toast } from "toastnova";
import "toastnova/styles.css";

export function App() {
  return (
    <>
      <Toaster theme="glass" position="top-right" animation="spring" />

      <button onClick={() => toast.success("Saved successfully!")}>
        Save Changes
      </button>
    </>
  );
}`}
        />
      </div>
    </section>
  );
};
