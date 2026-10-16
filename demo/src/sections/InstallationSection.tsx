import React, { useState } from 'react';
import { CodeBlock } from '../components/CodeBlock';

export const InstallationSection: React.FC = () => {
  const [activePkgManager, setActivePkgManager] = useState<'npm' | 'pnpm' | 'yarn'>('npm');

  const installCommands = {
    npm: 'npm install toastnova',
    pnpm: 'pnpm add toastnova',
    yarn: 'yarn add toastnova'
  };

  return (
    <section id="section-installation" className="doc-section">
      <div className="doc-section-header">
        <h2 className="doc-section-title">Installation & Setup</h2>
        <p className="doc-section-desc">
          Install ToastNova using your preferred package manager and import the stylesheet.
        </p>
      </div>

      {/* Package Manager Selector */}
      <div className="doc-pkg-tabs">
        <button
          type="button"
          className={`doc-pkg-tab ${activePkgManager === 'npm' ? 'active' : ''}`}
          onClick={() => setActivePkgManager('npm')}
        >
          npm
        </button>
        <button
          type="button"
          className={`doc-pkg-tab ${activePkgManager === 'pnpm' ? 'active' : ''}`}
          onClick={() => setActivePkgManager('pnpm')}
        >
          pnpm
        </button>
        <button
          type="button"
          className={`doc-pkg-tab ${activePkgManager === 'yarn' ? 'active' : ''}`}
          onClick={() => setActivePkgManager('yarn')}
        >
          yarn
        </button>
      </div>

      <CodeBlock language="bash" code={installCommands[activePkgManager]} />

      <div className="doc-callout info">
        <div className="doc-callout-icon">💡</div>
        <div>
          <strong>Peer Dependencies:</strong> ToastNova requires <code>react</code> and <code>react-dom</code> (version <code>&gt;=18.0.0</code> or <code>19.x</code>). It includes zero third-party runtime dependencies.
        </div>
      </div>

      {/* Quick Start Walkthrough */}
      <div id="section-quickstart" className="doc-subsection">
        <h3 className="doc-subsection-title">Quick Start Guide</h3>
        <p className="doc-section-desc">
          Follow these three steps to integrate ToastNova into any React application:
        </p>

        <div className="doc-steps">
          <div className="doc-step-item">
            <div className="doc-step-num">1</div>
            <div className="doc-step-body">
              <h4>Mount the &lt;Toaster /&gt; container</h4>
              <p>Place the <code>&lt;Toaster /&gt;</code> in your root application component (or layout file). Make sure to import <code>toastnova/styles.css</code> once.</p>
              <CodeBlock
                language="tsx"
                title="src/App.tsx"
                code={`import { Toaster } from 'toastnova';
import 'toastnova/styles.css';

export default function App() {
  return (
    <div className="app-container">
      {/* Configure default position, theme, and animations */}
      <Toaster theme="glass" position="top-right" animation="spring" />
      <MainContent />
    </div>
  );
}`}
              />
            </div>
          </div>

          <div className="doc-step-item">
            <div className="doc-step-num">2</div>
            <div className="doc-step-body">
              <h4>Dispatch notifications anywhere</h4>
              <p>Import the <code>toast</code> imperative function in any component, event handler, or asynchronous workflow:</p>
              <CodeBlock
                language="tsx"
                title="src/components/SaveButton.tsx"
                code={`import { toast } from 'toastnova';

export function SaveButton() {
  const handleSave = async () => {
    try {
      await saveData();
      toast.success('Document updated successfully!', {
        title: 'Saved',
        duration: 3500
      });
    } catch (err) {
      toast.error('Could not connect to the cloud replica.', {
        title: 'Save Failed'
      });
    }
  };

  return <button onClick={handleSave}>Save</button>;
}`}
              />
            </div>
          </div>

          <div className="doc-step-item">
            <div className="doc-step-num">3</div>
            <div className="doc-step-body">
              <h4>Customize options per notification</h4>
              <p>Each notification can override theme, duration, action buttons, custom React components, or progress tracking:</p>
              <CodeBlock
                language="tsx"
                code={`// Notification with interactive undo action button
toast('Project archived', {
  action: {
    label: 'Undo',
    onClick: () => restoreProject()
  }
});

// Async promise with automatic pending, success, and error states
toast.promise(uploadFile(file), {
  loading: 'Uploading file...',
  success: (data) => \`Uploaded \${data.filename} successfully!\`,
  error: 'Upload failed'
});`}
              />
            </div>
          </div>
        </div>

        {/* Common Setup Pitfalls */}
        <div className="doc-callout warning">
          <div className="doc-callout-icon">⚠️</div>
          <div>
            <strong>Common Setup Mistakes:</strong>
            <ul style={{ marginTop: '6px', paddingLeft: '18px' }}>
              <li><strong>Missing CSS Import:</strong> Forgetting <code>import &apos;toastnova/styles.css&apos;</code> causes unstyled notifications.</li>
              <li><strong>Next.js App Router:</strong> When using React Server Components, wrap <code>&lt;Toaster /&gt;</code> inside a component with the <code>&apos;use client&apos;</code> directive.</li>
              <li><strong>Multiple Toasters:</strong> Only mount one <code>&lt;Toaster /&gt;</code> per viewport position to prevent overlapping containers.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
