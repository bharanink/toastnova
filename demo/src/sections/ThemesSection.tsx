import React from 'react';
import { toast } from 'toastnova';
import type { ToastTheme } from 'toastnova';
import { CodeBlock } from '../components/CodeBlock';

interface ThemesSectionProps {
  currentTheme: ToastTheme;
  onSelectTheme: (t: ToastTheme) => void;
}

interface ThemeMeta {
  id: ToastTheme;
  name: string;
  badge: string;
  desc: string;
  palette: string[];
}

const THEME_DATA: ThemeMeta[] = [
  {
    id: 'glass',
    name: 'Glassmorphism',
    badge: 'Default Theme',
    desc: 'Translucent frosted glass with 16px backdrop blur, subtle specular top border, and ambient depth shadow.',
    palette: ['rgba(255, 255, 255, 0.14)', 'rgba(255, 255, 255, 0.25)', '#3b82f6', '#10b981']
  },
  {
    id: 'neon',
    name: 'Cyberpunk Neon',
    badge: 'High Contrast',
    desc: 'Deep pitch-black surface accented with luminous neon cyan/magenta borders and radiant laser ambient glows.',
    palette: ['#0d0e15', '#00f0ff', '#ff0077', '#39ff14']
  },
  {
    id: 'minimal',
    name: 'Swiss Minimal',
    badge: 'Clean Typography',
    desc: 'Ultra-clean layout with disciplined typography, hairline monochromatic borders, and zero distractions.',
    palette: ['#121316', '#22252a', '#e4e7eb', '#717682']
  },
  {
    id: 'gradient',
    name: 'Sunset Gradient',
    badge: 'Vibrant Accent',
    desc: 'Rich multi-stop dark surface gradients with crisp white typography and tactile colored drop shadows.',
    palette: ['#1e1435', '#6366f1', '#ec4899', '#f59e0b']
  },
  {
    id: 'light',
    name: 'Clean Daylight',
    badge: 'Bright Surface',
    desc: 'Bright white opaque surface with crisp dark slate typography and high-contrast status borders.',
    palette: ['#ffffff', '#f1f5f9', '#0f172a', '#2563eb']
  },
  {
    id: 'dark',
    name: 'Midnight Slate',
    badge: 'Dark Theme',
    desc: 'Deep slate background with clear colored status indicators, gentle elevation, and comfortable contrast.',
    palette: ['#0f172a', '#1e293b', '#f8fafc', '#38bdf8']
  }
];

export const ThemesSection: React.FC<ThemesSectionProps> = ({ currentTheme, onSelectTheme }) => {
  const triggerThemeSample = (themeId: ToastTheme, type: 'success' | 'error' | 'info' | 'warning' | 'loading') => {
    // Switch the active toaster theme and trigger notification
    onSelectTheme(themeId);

    const messages = {
      success: 'Deployment completed in 1.4 seconds.',
      error: 'Authentication session expired. Please re-login.',
      info: 'Cache re-indexing scheduled for midnight UTC.',
      warning: 'API quota is currently at 85% capacity.',
      loading: 'Compiling production assets...'
    };

    switch (type) {
      case 'success':
        toast.success(messages.success, { title: `${themeId.toUpperCase()} • Success` });
        break;
      case 'error':
        toast.error(messages.error, { title: `${themeId.toUpperCase()} • Error` });
        break;
      case 'info':
        toast.info(messages.info, { title: `${themeId.toUpperCase()} • Information` });
        break;
      case 'warning':
        toast.warning(messages.warning, { title: `${themeId.toUpperCase()} • Warning` });
        break;
      case 'loading':
        toast.loading(messages.loading, { title: `${themeId.toUpperCase()} • Loading` });
        break;
    }
  };

  return (
    <section id="section-themes" className="doc-section">
      <div className="doc-section-header">
        <h2 className="doc-section-title">Theme Gallery (6 Built-In Themes)</h2>
        <p className="doc-section-desc">
          ToastNova includes 6 handcrafted visual themes. Each theme styles base cards, icons, action buttons,
          progress tracks, and duplicate count badges consistently.
        </p>
      </div>

      <div className="doc-themes-grid">
        {THEME_DATA.map((t) => {
          const isSelected = currentTheme === t.id;
          return (
            <div key={t.id} className={`doc-theme-card ${isSelected ? 'active' : ''}`}>
              <div className="doc-theme-header">
                <div>
                  <h3 className="doc-theme-name">{t.name}</h3>
                  <span className="doc-theme-code">theme=&quot;{t.id}&quot;</span>
                </div>
                <span className="doc-theme-badge">{t.badge}</span>
              </div>

              <p className="doc-theme-desc">{t.desc}</p>

              {/* Color swatch preview */}
              <div className="doc-theme-swatches">
                {t.palette.map((color, idx) => (
                  <span
                    key={idx}
                    className="doc-swatch"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>

              {/* Quick interactive trigger buttons */}
              <div className="doc-theme-actions">
                <span className="doc-theme-action-label">Preview Theme Notifications:</span>
                <div className="doc-theme-buttons">
                  <button
                    type="button"
                    className="doc-mini-btn success"
                    onClick={() => triggerThemeSample(t.id, 'success')}
                  >
                    Success
                  </button>
                  <button
                    type="button"
                    className="doc-mini-btn error"
                    onClick={() => triggerThemeSample(t.id, 'error')}
                  >
                    Error
                  </button>
                  <button
                    type="button"
                    className="doc-mini-btn info"
                    onClick={() => triggerThemeSample(t.id, 'info')}
                  >
                    Info
                  </button>
                  <button
                    type="button"
                    className="doc-mini-btn warning"
                    onClick={() => triggerThemeSample(t.id, 'warning')}
                  >
                    Warning
                  </button>
                </div>
              </div>

              <div className="doc-theme-code-wrap">
                <CodeBlock
                  language="tsx"
                  code={`<Toaster theme="${t.id}" />`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
