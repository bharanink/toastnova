import React from 'react';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="doc-footer">
      <div className="doc-footer-inner">
        <div className="doc-footer-brand">
          <div className="doc-brand" onClick={() => onNavigate('section-overview')}>
            <div className="doc-brand-logo">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor">
                <rect x="3" y="4" width="18" height="16" rx="4" strokeWidth="2" stroke="currentColor" fill="rgba(99, 102, 241, 0.2)" />
                <path d="M8 9h8M8 12h5M8 15h7" strokeWidth="2" strokeLinecap="round" stroke="#818cf8" />
              </svg>
            </div>
            <span className="doc-brand-name">ToastNova</span>
          </div>
          <p className="doc-footer-desc">
            A modern, customizable React notification library with expressive themes, smooth animations,
            accessible interactions, and a developer-friendly API.
          </p>
        </div>

        <div className="doc-footer-links-group">
          <div className="doc-footer-heading">Documentation</div>
          <button type="button" className="doc-footer-link" onClick={() => onNavigate('section-overview')}>Overview</button>
          <button type="button" className="doc-footer-link" onClick={() => onNavigate('section-installation')}>Installation</button>
          <button type="button" className="doc-footer-link" onClick={() => onNavigate('section-quickstart')}>Quick Start</button>
          <button type="button" className="doc-footer-link" onClick={() => onNavigate('section-api')}>API Reference</button>
        </div>

        <div className="doc-footer-links-group">
          <div className="doc-footer-heading">Features</div>
          <button type="button" className="doc-footer-link" onClick={() => onNavigate('section-playground')}>Playground</button>
          <button type="button" className="doc-footer-link" onClick={() => onNavigate('section-themes')}>Theme Gallery</button>
          <button type="button" className="doc-footer-link" onClick={() => onNavigate('section-animations')}>Animation Presets</button>
          <button type="button" className="doc-footer-link" onClick={() => onNavigate('section-accessibility')}>Accessibility</button>
        </div>

        <div className="doc-footer-links-group">
          <div className="doc-footer-heading">Community</div>
          <a
            href="https://github.com/bharanink/toastnova"
            target="_blank"
            rel="noopener noreferrer"
            className="doc-footer-link"
          >
            GitHub Repository
          </a>
          <a
            href="https://github.com/bharanink/toastnova/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="doc-footer-link"
          >
            Issue Tracker
          </a>
          <span className="doc-footer-meta">License: MIT</span>
        </div>
      </div>

      <div className="doc-footer-bottom">
        <div>© 2026 ToastNova Contributors. Released under the MIT License.</div>
        <div className="doc-footer-badges">
          <span>React 18 &amp; 19</span>
          <span>•</span>
          <span>TypeScript Strict</span>
          <span>•</span>
          <span>0 Dependencies</span>
        </div>
      </div>
    </footer>
  );
};
