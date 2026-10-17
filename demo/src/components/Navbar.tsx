import React from 'react';

interface NavbarProps {
  onOpenSearch: () => void;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  docsTheme?: 'dark' | 'light';
  onToggleDocsTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  activeSection,
  onNavigate,
  mobileMenuOpen,
  onToggleMobileMenu,
  docsTheme = 'dark',
  onToggleDocsTheme
}) => {
  return (
    <header className="doc-navbar">
      <div className="doc-navbar-inner">
        {/* Logo and Brand */}
        <div className="doc-brand" onClick={() => onNavigate('section-overview')}>
          <div className="doc-brand-logo">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor">
              <rect x="3" y="4" width="18" height="16" rx="4" strokeWidth="2" stroke="currentColor" fill="rgba(99, 102, 241, 0.2)" />
              <path d="M8 9h8M8 12h5M8 15h7" strokeWidth="2" strokeLinecap="round" stroke="#818cf8" />
            </svg>
          </div>
          <span className="doc-brand-name">ToastNova</span>
          <span className="doc-brand-badge">v0.1.0</span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="doc-nav-links" aria-label="Main Navigation">
          <button
            type="button"
            className={`doc-nav-link ${activeSection === 'section-overview' ? 'active' : ''}`}
            onClick={() => onNavigate('section-overview')}
          >
            Overview
          </button>
          <button
            type="button"
            className={`doc-nav-link ${activeSection === 'section-installation' ? 'active' : ''}`}
            onClick={() => onNavigate('section-installation')}
          >
            Install
          </button>
          <button
            type="button"
            className={`doc-nav-link ${activeSection === 'section-playground' ? 'active' : ''}`}
            onClick={() => onNavigate('section-playground')}
          >
            Playground
          </button>
          <button
            type="button"
            className={`doc-nav-link ${activeSection === 'section-themes' ? 'active' : ''}`}
            onClick={() => onNavigate('section-themes')}
          >
            Themes
          </button>
          <button
            type="button"
            className={`doc-nav-link ${activeSection === 'section-animations' ? 'active' : ''}`}
            onClick={() => onNavigate('section-animations')}
          >
            Animations
          </button>
          <button
            type="button"
            className={`doc-nav-link ${activeSection === 'section-api' ? 'active' : ''}`}
            onClick={() => onNavigate('section-api')}
          >
            API
          </button>
          <button
            type="button"
            className={`doc-nav-link ${activeSection === 'section-accessibility' ? 'active' : ''}`}
            onClick={() => onNavigate('section-accessibility')}
          >
            Accessibility
          </button>
        </nav>

        {/* Right Action Bar */}
        <div className="doc-navbar-actions">
          {/* In-page Search Trigger Button */}
          <button
            type="button"
            className="doc-search-trigger"
            onClick={onOpenSearch}
            aria-label="Search documentation"
          >
            <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor">
              <path
                d="M9 15A6 6 0 1 0 9 3a6 6 0 0 0 0 12ZM17 17l-3.5-3.5"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="doc-search-placeholder">Search docs...</span>
            <kbd className="doc-search-shortcut">Ctrl+K</kbd>
          </button>

          {/* Dark / Light Theme Toggle Button */}
          {onToggleDocsTheme && (
            <button
              type="button"
              className="doc-theme-toggle"
              onClick={onToggleDocsTheme}
              aria-label={docsTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              title={docsTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {docsTheme === 'dark' ? (
                <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="10" cy="10" r="4" />
                  <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.34 4.34l1.42 1.42M14.24 14.24l1.42 1.42M4.34 15.66l1.42-1.42M14.24 5.76l1.42-1.42" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          )}

          {/* Buy Me a Coffee Link */}
          <a
            href="https://buymeacoffee.com/bharanink"
            target="_blank"
            rel="noopener noreferrer"
            className="doc-coffee-btn"
            aria-label="Buy a coffee for the developer"
            title="Buy a coffee for the developer"
          >
            <span className="doc-coffee-icon">☕</span>
            <span className="doc-coffee-label">Buy a coffee</span>
          </a>

          {/* GitHub Repository Link */}
          <a
            href="https://github.com/bharanink/toastnova"
            target="_blank"
            rel="noopener noreferrer"
            className="doc-github-link"
            aria-label="GitHub Repository"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"
              />
            </svg>
          </a>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="doc-mobile-toggle"
            onClick={onToggleMobileMenu}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
