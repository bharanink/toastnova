import React from 'react';
import { CodeBlock } from '../components/CodeBlock';

interface FaqItem {
  question: string;
  answer: string;
  code?: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'Why are my notifications unstyled or displaying without borders and glass blur?',
    answer: 'You must import the CSS bundle once in your root layout. ToastNova uses pure CSS with zero CSS-in-JS overhead.',
    code: "import 'toastnova/styles.css';"
  },
  {
    question: 'Why does Next.js throw "useSyncExternalStore is only supported in Client Components"?',
    answer: 'In the Next.js App Router (app/layout.tsx), React Server Components cannot directly mount stateful client components. Wrap the Toaster in a dedicated component file marked with "use client".',
    code: `'use client';
import { Toaster } from 'toastnova';
import 'toastnova/styles.css';

export function ClientToaster() {
  return <Toaster position="top-right" />;
}`
  },
  {
    question: 'Why are custom React content toasts not deduplicated automatically?',
    answer: 'Function components and JSX trees have unique reference identities on every render. To deduplicate custom toasts, provide an explicit dedupeKey in options.',
    code: `toast.custom((id) => <MyBanner />, {
  dedupeKey: 'unique_user_banner'
});`
  },
  {
    question: 'Why do notifications disappear too quickly for users to read?',
    answer: 'The default countdown duration is 4000ms. You can increase it globally on <Toaster duration={6000} /> or per-toast via toast.info("...", { duration: 8000 }). Set duration: Infinity to require manual dismissal.',
    code: `toast.info('Critical instruction', { duration: Infinity });`
  },
  {
    question: 'Why do touch swipe gestures not dismiss on mobile?',
    answer: 'Ensure swipeToDismiss is enabled on <Toaster swipeToDismiss={true} /> (enabled by default). Also verify that your touch target is not inside an inner clickable control like an <input> or <button>, which purposely preserves touch events for clicks.'
  }
];

export const TroubleshootingSection: React.FC = () => {
  return (
    <section id="section-troubleshooting" className="doc-section">
      <div className="doc-section-header">
        <h2 className="doc-section-title">Troubleshooting &amp; FAQ</h2>
        <p className="doc-section-desc">
          Common integration questions, setup checklists, and verified solutions.
        </p>
      </div>

      <div className="doc-faq-list">
        {FAQS.map((faq, idx) => (
          <div key={idx} className="doc-faq-card">
            <h3 className="doc-faq-question">{faq.question}</h3>
            <p className="doc-faq-answer">{faq.answer}</p>
            {faq.code && (
              <div className="doc-faq-code">
                <CodeBlock language="tsx" code={faq.code} />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
