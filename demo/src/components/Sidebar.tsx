import React from 'react';

interface SidebarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavGroup {
  label: string;
  items: { id: string; label: string; badge?: string }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Getting Started',
    items: [
      { id: 'section-overview', label: 'Overview' },
      { id: 'section-installation', label: 'Installation' },
      { id: 'section-quickstart', label: 'Quick Start' }
    ]
  },
  {
    label: 'Interactive Studio',
    items: [
      { id: 'section-playground', label: 'Playground', badge: 'Live' },
      { id: 'section-themes', label: 'Theme Gallery', badge: '6' },
      { id: 'section-animations', label: 'Animation Presets', badge: '5' }
    ]
  },
  {
    label: 'Engineering & Architecture',
    items: [
      { id: 'section-api', label: 'API Reference' },
      { id: 'section-accessibility', label: 'Accessibility (a11y)', badge: 'AA' },
      { id: 'section-ssr', label: 'SSR & Next.js' }
    ]
  },
  {
    label: 'Guides & Patterns',
    items: [
      { id: 'section-examples', label: 'Advanced Examples' },
      { id: 'section-troubleshooting', label: 'Troubleshooting & FAQ' }
    ]
  }
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onNavigate,
  mobileOpen,
  onCloseMobile
}) => {
  return (
    <>
      {mobileOpen && (
        <div className="doc-sidebar-backdrop" onClick={onCloseMobile} role="presentation" />
      )}
      <aside className={`doc-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="doc-sidebar-content">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="doc-sidebar-group">
              <div className="doc-sidebar-heading">{group.label}</div>
              <ul className="doc-sidebar-list">
                {group.items.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <li key={item.id} className="doc-sidebar-item">
                      <button
                        type="button"
                        className={`doc-sidebar-link ${isActive ? 'active' : ''}`}
                        onClick={() => {
                          onNavigate(item.id);
                          onCloseMobile();
                        }}
                      >
                        <span className="doc-sidebar-text">{item.label}</span>
                        {item.badge && (
                          <span className={`doc-sidebar-badge ${item.badge === 'Live' ? 'live' : ''}`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
};
