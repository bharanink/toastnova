import React, { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'tsx', title }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(code);
      } else {
        // Fallback for environments where navigator.clipboard might be restricted
        const textarea = document.createElement('textarea');
        textarea.value = code;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Failed to copy to clipboard', err);
    }
  };

  return (
    <div className="doc-code-block">
      <div className="doc-code-header">
        <div className="doc-code-meta">
          <span className="doc-code-lang">{language.toUpperCase()}</span>
          {title && <span className="doc-code-title">{title}</span>}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={`doc-code-copy-btn ${copied ? 'copied' : ''}`}
          aria-label={copied ? 'Code copied to clipboard' : 'Copy code to clipboard'}
        >
          {copied ? (
            <>
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 8.5L6.5 12L13 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="5" y="5" width="8" height="8" rx="1.5" />
                <path d="M3 11V3.5A1.5 1.5 0 0 1 4.5 2H11" strokeLinecap="round" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="doc-code-pre">
        <code>{code.trim()}</code>
      </pre>
    </div>
  );
};
