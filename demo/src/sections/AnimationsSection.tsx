import React from 'react';
import { toast } from 'toastnova';
import type { ToastAnimationPreset } from 'toastnova';
import { CodeBlock } from '../components/CodeBlock';

interface AnimationsSectionProps {
  currentAnimation: ToastAnimationPreset;
  onSelectAnimation: (a: ToastAnimationPreset) => void;
}

interface AnimationMeta {
  id: ToastAnimationPreset;
  name: string;
  badge: string;
  timing: string;
  desc: string;
}

const ANIMATION_DATA: AnimationMeta[] = [
  {
    id: 'slide',
    name: 'Directional Slide',
    badge: 'Default',
    timing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    desc: 'Translates in smoothly from the nearest screen boundary (top or bottom) with fluid opacity deceleration.'
  },
  {
    id: 'spring',
    name: 'Physics Spring',
    badge: 'Elastic Kinematics',
    timing: 'cubic-bezier(0.175, 0.885, 0.32, 1.2)',
    desc: 'Brisk physics-damped entrance with micro-overshoot and natural settling, delivering a responsive tactile feel.'
  },
  {
    id: 'bounce',
    name: 'Playful Bounce',
    badge: 'Elastic Curve',
    timing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    desc: 'Restrained overshoot curve that draws user attention without causing visual instability or layout jitter.'
  },
  {
    id: 'fade',
    name: 'Opacity Fade',
    badge: 'Subtle',
    timing: 'ease-out',
    desc: 'Pure cross-dissolve opacity transition with subtle micro-scale anchoring, ideal for clean professional dashboards.'
  },
  {
    id: 'none',
    name: 'Instant (No Motion)',
    badge: 'Zero Latency',
    timing: '0ms instant',
    desc: 'Instant 0ms appearance and unmount. Automatically selected under prefers-reduced-motion: reduce.'
  }
];

export const AnimationsSection: React.FC<AnimationsSectionProps> = ({
  currentAnimation,
  onSelectAnimation
}) => {
  const triggerAnimationSample = (preset: ToastAnimationPreset) => {
    onSelectAnimation(preset);
    toast.info(`Demonstrating the "${preset}" animation entrance and exit kinematics.`, {
      title: `Animation • ${preset.toUpperCase()}`,
      duration: 3000
    });
  };

  return (
    <section id="section-animations" className="doc-section">
      <div className="doc-section-header">
        <h2 className="doc-section-title">Animation Presets (5 Built-In Presets)</h2>
        <p className="doc-section-desc">
          ToastNova features physics-inspired entrance and exit kinematics. Select an animation preset
          on the <code>&lt;Toaster animation=&quot;...&quot; /&gt;</code> component.
        </p>
      </div>

      <div className="doc-animations-grid">
        {ANIMATION_DATA.map((a) => {
          const isSelected = currentAnimation === a.id;
          return (
            <div key={a.id} className={`doc-anim-card ${isSelected ? 'active' : ''}`}>
              <div className="doc-anim-header">
                <div>
                  <h3 className="doc-anim-name">{a.name}</h3>
                  <code className="doc-anim-code">animation=&quot;{a.id}&quot;</code>
                </div>
                <span className="doc-anim-badge">{a.badge}</span>
              </div>

              <p className="doc-anim-desc">{a.desc}</p>
              <div className="doc-anim-timing">
                <span>Curve:</span> <code>{a.timing}</code>
              </div>

              <div className="doc-anim-actions">
                <button
                  type="button"
                  className="doc-btn doc-btn-secondary"
                  onClick={() => triggerAnimationSample(a.id)}
                >
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                    <path d="M4 3.5v9l8-4.5-8-4.5z" />
                  </svg>
                  Preview {a.name}
                </button>
              </div>

              <div className="doc-anim-code-wrap">
                <CodeBlock
                  language="tsx"
                  code={`<Toaster animation="${a.id}" animationDuration={240} />`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
