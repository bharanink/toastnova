import React from 'react';
import { CodeBlock } from '../components/CodeBlock';

export const SsrSection: React.FC = () => {
  return (
    <section id="section-ssr" className="doc-section">
      <div className="doc-section-header">
        <h2 className="doc-section-title">Server-Side Rendering (SSR) &amp; Next.js</h2>
        <p className="doc-section-desc">
          ToastNova is built to be completely safe for modern full-stack React frameworks (Next.js App Router, Pages Router, Remix, Vite SSR).
        </p>
      </div>

      <div className="doc-ssr-grid">
        <div className="doc-card">
          <h3 className="doc-card-title">1. Zero Browser Globals at Import</h3>
          <p className="doc-card-text">
            Importing <code>toastnova</code> or <code>toast</code> never touches <code>window</code>, <code>document</code>, or <code>navigator</code> at module initialization time.
            The library executes safely in Node.js server environments without crashing server builds.
          </p>
        </div>

        <div className="doc-card">
          <h3 className="doc-card-title">2. Per-Request State Isolation</h3>
          <p className="doc-card-text">
            When <code>typeof window === &apos;undefined&apos;</code>, store mutations return valid generated IDs but do not retain state in Node.js singleton memory.
            This prevents notification state from leaking across distinct user requests on your server.
          </p>
        </div>

        <div className="doc-card" style={{ gridColumn: '1 / -1' }}>
          <h3 className="doc-card-title">3. Next.js App Router Setup</h3>
          <p className="doc-card-text">
            Because React Server Components (RSC) cannot use React hooks like <code>useSyncExternalStore</code>, place the <code>&lt;Toaster /&gt;</code> inside a small client wrapper:
          </p>

          <CodeBlock
            language="tsx"
            title="components/ClientToaster.tsx"
            code={`'use client';

import { Toaster } from 'toastnova';
import 'toastnova/styles.css';

export function ClientToaster() {
  return <Toaster position="top-right" theme="glass" animation="spring" />;
}`}
          />

          <p className="doc-card-text" style={{ marginTop: '16px' }}>
            Then import this wrapper inside your root layout:
          </p>

          <CodeBlock
            language="tsx"
            title="app/layout.tsx"
            code={`import { ClientToaster } from '@/components/ClientToaster';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <ClientToaster />
      </body>
    </html>
  );
}`}
          />
        </div>

        <div className="doc-card" style={{ gridColumn: '1 / -1' }}>
          <h3 className="doc-card-title">4. Next.js Pages Router Setup</h3>
          <p className="doc-card-text">
            For Next.js Pages Router projects, import the styles and component in <code>pages/_app.tsx</code>:
          </p>

          <CodeBlock
            language="tsx"
            title="pages/_app.tsx"
            code={`import type { AppProps } from 'next/app';
import { Toaster } from 'toastnova';
import 'toastnova/styles.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <Toaster position="top-right" theme="glass" />
    </>
  );
}`}
          />
        </div>
      </div>
    </section>
  );
};
