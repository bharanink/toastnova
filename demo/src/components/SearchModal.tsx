import React, { useState, useEffect, useRef } from 'react';

export interface SearchItem {
  id: string;
  title: string;
  category: string;
  description: string;
}

const SEARCH_INDEX: SearchItem[] = [
  {
    id: 'section-overview',
    title: 'Overview & Hero',
    category: 'Getting Started',
    description: 'Introduction to ToastNova, live preview, and key library capabilities.'
  },
  {
    id: 'section-installation',
    title: 'Installation',
    category: 'Getting Started',
    description: 'npm, pnpm, yarn install commands and peer dependency requirements.'
  },
  {
    id: 'section-quickstart',
    title: 'Quick Start',
    category: 'Getting Started',
    description: 'Minimal React setup with <Toaster /> and your first notification.'
  },
  {
    id: 'section-playground',
    title: 'Interactive Playground',
    category: 'Playground',
    description: 'Live configuration studio: types, themes, positions, animations, actions, and code export.'
  },
  {
    id: 'section-themes',
    title: 'Theme Gallery (6 Themes)',
    category: 'Design & Themes',
    description: 'Handcrafted Glass, Neon, Minimal, Gradient, Light, and Dark themes.'
  },
  {
    id: 'section-animations',
    title: 'Animation Showcase (5 Presets)',
    category: 'Kinematics',
    description: 'Physics-inspired slide, fade, bounce, spring, and none animation presets.'
  },
  {
    id: 'section-api',
    title: 'API Reference',
    category: 'Reference',
    description: 'Comprehensive specifications for <Toaster /> props, toast.* methods, and options.'
  },
  {
    id: 'section-accessibility',
    title: 'Accessibility (WCAG 2.1 AA)',
    category: 'Accessibility',
    description: 'Landmarks, selective alert semantics, screen reader text, keyboard keys, and reduced motion.'
  },
  {
    id: 'section-ssr',
    title: 'SSR & Next.js Guide',
    category: 'Server-Side Rendering',
    description: 'Zero browser globals, Next.js App Router client wrapper, and per-request isolation.'
  },
  {
    id: 'section-examples',
    title: 'Advanced Examples',
    category: 'Patterns',
    description: 'Undo actions, upload progress, concurrent promises, custom JSX, and duplicate grouping.'
  },
  {
    id: 'section-troubleshooting',
    title: 'Troubleshooting & FAQ',
    category: 'Support',
    description: 'Solutions for missing CSS, hydration warnings, and function component deduplication.'
  }
];

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredItems = query.trim()
    ? SEARCH_INDEX.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )
    : SEARCH_INDEX;

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        onSelect(filteredItems[selectedIndex].id);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="doc-search-backdrop" onClick={onClose} role="presentation">
      <div
        className="doc-search-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Search documentation"
      >
        <div className="doc-search-input-wrapper">
          <svg className="doc-search-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor">
            <path
              d="M9 15A6 6 0 1 0 9 3a6 6 0 0 0 0 12ZM17 17l-3.5-3.5"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="doc-search-input"
            placeholder="Search documentation, guides, and APIs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <kbd className="doc-search-kbd">ESC</kbd>
        </div>

        <div className="doc-search-results" role="listbox">
          {filteredItems.length === 0 ? (
            <div className="doc-search-empty">No documentation sections match &ldquo;{query}&rdquo;</div>
          ) : (
            filteredItems.map((item, index) => (
              <div
                key={item.id}
                role="option"
                aria-selected={index === selectedIndex}
                className={`doc-search-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => {
                  onSelect(item.id);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="doc-search-item-header">
                  <span className="doc-search-item-title">{item.title}</span>
                  <span className="doc-search-item-category">{item.category}</span>
                </div>
                <div className="doc-search-item-desc">{item.description}</div>
              </div>
            ))
          )}
        </div>

        <div className="doc-search-footer">
          <span>Navigate with <kbd>↑</kbd> <kbd>↓</kbd></span>
          <span>Select with <kbd>↵</kbd></span>
          <span>Close with <kbd>Esc</kbd></span>
        </div>
      </div>
    </div>
  );
};
