import React, { useState } from 'react';
import { toast } from 'toastnova';
import type { ToastPosition, ToastTheme, ToastAnimationPreset, ToastDuplicateStrategy } from 'toastnova';
import { CodeBlock } from '../components/CodeBlock';

interface PlaygroundSectionProps {
  theme: ToastTheme;
  setTheme: (t: ToastTheme) => void;
  position: ToastPosition;
  setPosition: (p: ToastPosition) => void;
  animation: ToastAnimationPreset;
  setAnimation: (a: ToastAnimationPreset) => void;
  duration: number;
  setDuration: (d: number) => void;
  maxVisible: number;
  setMaxVisible: (m: number) => void;
  swipeToDismiss: boolean;
  setSwipeToDismiss: (s: boolean) => void;
  duplicateStrategy: ToastDuplicateStrategy;
  setDuplicateStrategy: (d: ToastDuplicateStrategy) => void;
  dedupeWindow: number;
  setDedupeWindow: (w: number) => void;
}

export const PlaygroundSection: React.FC<PlaygroundSectionProps> = ({
  theme,
  setTheme,
  position,
  setPosition,
  animation,
  setAnimation,
  duration,
  setDuration,
  maxVisible,
  setMaxVisible,
  swipeToDismiss,
  setSwipeToDismiss,
  duplicateStrategy,
  setDuplicateStrategy,
  dedupeWindow,
  setDedupeWindow
}) => {
  // Playground notification parameters
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info' | 'loading' | 'custom' | 'promise'>('success');
  const [title, setTitle] = useState<string>('Changes Deployed');
  const [message, setMessage] = useState<string>('Production build #1042 was deployed to 12 edge nodes.');
  const [isPersistent, setIsPersistent] = useState<boolean>(false);
  const [hasAction, setHasAction] = useState<boolean>(false);
  const [actionLabel, setActionLabel] = useState<string>('Undo');
  const [hasCancel, setHasCancel] = useState<boolean>(false);
  const [cancelLabel, setCancelLabel] = useState<string>('Dismiss');
  const [progressMode, setProgressMode] = useState<'none' | 'determinate' | 'indeterminate'>('none');
  const [progressVal, setProgressVal] = useState<number>(65);

  // Trigger real notification using the actual ToastNova library API
  const handleTrigger = () => {
    const finalDuration = isPersistent ? Infinity : duration;

    // Progress configuration
    let progressSetting: number | 'indeterminate' | undefined = undefined;
    if (progressMode === 'determinate') {
      progressSetting = progressVal;
    } else if (progressMode === 'indeterminate') {
      progressSetting = 'indeterminate';
    }

    // Action buttons configuration
    const actionConfig = hasAction
      ? {
          label: actionLabel || 'Action',
          onClick: () => {
            toast.info(`Clicked action: "${actionLabel || 'Action'}"`);
          }
        }
      : undefined;

    const cancelConfig = hasCancel
      ? {
          label: cancelLabel || 'Cancel',
          onClick: () => {}
        }
      : undefined;

    const options = {
      title: title.trim() || undefined,
      duration: finalDuration,
      progress: progressSetting,
      action: actionConfig,
      cancel: cancelConfig
    };

    if (toastType === 'promise') {
      // Simulated asynchronous promise operation (labeled clearly as simulated)
      const simulatedPromise = new Promise<{ region: string }>((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.25) {
            resolve({ region: 'us-east-1' });
          } else {
            reject(new Error('Simulated network timeout'));
          }
        }, 2200);
      });

      toast.promise(
        simulatedPromise,
        {
          loading: message || 'Executing asynchronous promise operation...',
          success: (data: { region: string }) => `Completed successfully on ${data.region}!`,
          error: (err: unknown) => `Operation failed: ${(err as Error).message}`
        },
        options
      );
      return;
    }

    if (toastType === 'custom') {
      toast.custom((id) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontWeight: 600 }}>{title || 'Custom JSX Card'}</div>
          <div style={{ fontSize: '13px', opacity: 0.9 }}>{message}</div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button
              type="button"
              className="toastnova-action-btn"
              onClick={() => {
                toast.success('Custom action executed');
                toast.dismiss(id);
              }}
            >
              Confirm
            </button>
            <button
              type="button"
              className="toastnova-action-btn toastnova-cancel-btn"
              onClick={() => toast.dismiss(id)}
            >
              Close
            </button>
          </div>
        </div>
      ), options);
      return;
    }

    // Standard types: success, error, warning, info, loading
    switch (toastType) {
      case 'success':
        toast.success(message, options);
        break;
      case 'error':
        toast.error(message, options);
        break;
      case 'warning':
        toast.warning(message, options);
        break;
      case 'info':
        toast.info(message, options);
        break;
      case 'loading':
        toast.loading(message, options);
        break;
    }
  };

  const handleResetDefaults = () => {
    setTheme('glass');
    setPosition('top-right');
    setAnimation('spring');
    setDuration(4000);
    setMaxVisible(5);
    setSwipeToDismiss(true);
    setDuplicateStrategy('group');
    setDedupeWindow(2000);
    setToastType('success');
    setTitle('Changes Deployed');
    setMessage('Production build #1042 was deployed to 12 edge nodes.');
    setIsPersistent(false);
    setHasAction(false);
    setActionLabel('Undo');
    setHasCancel(false);
    setCancelLabel('Dismiss');
    setProgressMode('none');
    setProgressVal(65);
    toast.info('Playground reset to default configuration');
  };

  // Generate real, syntactically valid code reflection
  const generateCodeSnippet = () => {
    const optionsObj: string[] = [];

    if (title.trim()) {
      optionsObj.push(`  title: ${JSON.stringify(title)}`);
    }
    if (isPersistent) {
      optionsObj.push('  duration: Infinity');
    } else if (duration !== 4000) {
      optionsObj.push(`  duration: ${duration}`);
    }
    if (progressMode === 'determinate') {
      optionsObj.push(`  progress: ${progressVal}`);
    } else if (progressMode === 'indeterminate') {
      optionsObj.push("  progress: 'indeterminate'");
    }
    if (hasAction) {
      optionsObj.push(`  action: {\n    label: ${JSON.stringify(actionLabel || 'Action')},\n    onClick: () => handleAction()\n  }`);
    }
    if (hasCancel) {
      optionsObj.push(`  cancel: {\n    label: ${JSON.stringify(cancelLabel || 'Cancel')},\n    onClick: () => handleCancel()\n  }`);
    }

    const optionsStr = optionsObj.length > 0 ? `, {\n${optionsObj.join(',\n')}\n}` : '';

    let triggerCode = '';
    if (toastType === 'promise') {
      triggerCode = `toast.promise(
  fetchData(),
  {
    loading: ${JSON.stringify(message || 'Loading...')},
    success: (data) => \`Loaded \${data.count} items\`,
    error: (err) => \`Failed: \${err.message}\`
  }${optionsStr}
);`;
    } else if (toastType === 'custom') {
      triggerCode = `toast.custom((id) => (
  <div>
    <h4>${title || 'Custom Title'}</h4>
    <p>${message}</p>
    <button onClick={() => toast.dismiss(id)}>Dismiss</button>
  </div>
)${optionsStr});`;
    } else {
      triggerCode = `toast.${toastType}(${JSON.stringify(message)}${optionsStr});`;
    }

    return `// 1. Mount Toaster with chosen configuration
<Toaster
  theme="${theme}"
  position="${position}"
  animation="${animation}"
  duration={${duration}}
  maxVisible={${maxVisible}}
  duplicateStrategy="${duplicateStrategy}"
  swipeToDismiss={${swipeToDismiss}}
/>

// 2. Dispatch the notification
${triggerCode}`;
  };

  return (
    <section id="section-playground" className="doc-section doc-playground-section">
      <div className="doc-section-header">
        <div className="doc-badge-live">Interactive Studio</div>
        <h2 className="doc-section-title">Live Notification Playground</h2>
        <p className="doc-section-desc">
          Configure real toast notifications, test animations and themes, and generate production-ready code.
        </p>
      </div>

      <div className="doc-playground-grid">
        {/* Left Column: Form Controls */}
        <div className="doc-playground-controls">
          <div className="doc-controls-card">
            <h3 className="doc-controls-heading">1. Notification Content</h3>

            <div className="doc-field">
              <label className="doc-field-label">Type</label>
              <div className="doc-type-pills">
                {(['success', 'error', 'warning', 'info', 'loading', 'promise', 'custom'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`doc-type-pill ${toastType === t ? 'active ' + t : ''}`}
                    onClick={() => setToastType(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="doc-field">
              <label className="doc-field-label" htmlFor="pg-title">Title (Optional)</label>
              <input
                id="pg-title"
                type="text"
                className="doc-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Notification Title..."
              />
            </div>

            <div className="doc-field">
              <label className="doc-field-label" htmlFor="pg-message">Message</label>
              <input
                id="pg-message"
                type="text"
                className="doc-input"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Notification message..."
              />
            </div>

            <div className="doc-field-checkbox">
              <input
                id="pg-persistent"
                type="checkbox"
                checked={isPersistent}
                onChange={(e) => setIsPersistent(e.target.checked)}
              />
              <label htmlFor="pg-persistent">Persistent (duration: Infinity)</label>
            </div>
          </div>

          <div className="doc-controls-card">
            <h3 className="doc-controls-heading">2. Toaster & Kinematics Configuration</h3>

            <div className="doc-form-row">
              <div className="doc-field">
                <label className="doc-field-label" htmlFor="pg-theme">Theme</label>
                <select
                  id="pg-theme"
                  className="doc-select"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as ToastTheme)}
                >
                  <option value="glass">Glass (Frosted Glassmorphism)</option>
                  <option value="neon">Neon (Cyberpunk Glow)</option>
                  <option value="minimal">Minimal (Swiss Monochrome)</option>
                  <option value="gradient">Gradient (Sunset Glow)</option>
                  <option value="light">Light (Clean Daylight)</option>
                  <option value="dark">Dark (Midnight Slate)</option>
                </select>
              </div>

              <div className="doc-field">
                <label className="doc-field-label" htmlFor="pg-position">Position</label>
                <select
                  id="pg-position"
                  className="doc-select"
                  value={position}
                  onChange={(e) => setPosition(e.target.value as ToastPosition)}
                >
                  <option value="top-right">top-right</option>
                  <option value="top-left">top-left</option>
                  <option value="top-center">top-center</option>
                  <option value="bottom-right">bottom-right</option>
                  <option value="bottom-left">bottom-left</option>
                  <option value="bottom-center">bottom-center</option>
                </select>
              </div>
            </div>

            <div className="doc-form-row">
              <div className="doc-field">
                <label className="doc-field-label" htmlFor="pg-animation">Animation Preset</label>
                <select
                  id="pg-animation"
                  className="doc-select"
                  value={animation}
                  onChange={(e) => setAnimation(e.target.value as ToastAnimationPreset)}
                >
                  <option value="spring">spring (Physics Damped)</option>
                  <option value="slide">slide (Edge Translate)</option>
                  <option value="fade">fade (Opacity Dissolve)</option>
                  <option value="bounce">bounce (Playful Overshoot)</option>
                  <option value="none">none (Instant 0ms)</option>
                </select>
              </div>

              <div className="doc-field">
                <label className="doc-field-label" htmlFor="pg-duplicate">Duplicate Strategy</label>
                <select
                  id="pg-duplicate"
                  className="doc-select"
                  value={duplicateStrategy}
                  onChange={(e) => setDuplicateStrategy(e.target.value as ToastDuplicateStrategy)}
                >
                  <option value="group">group (Increment ×Count)</option>
                  <option value="dedupe">dedupe (Ignore duplicates)</option>
                  <option value="allow">allow (Render duplicates)</option>
                </select>
              </div>
            </div>

            {duplicateStrategy !== 'allow' && (
              <div className="doc-field">
                <div className="doc-slider-label">
                  <span>Deduplication Window</span>
                  <span>{dedupeWindow} ms</span>
                </div>
                <input
                  type="range"
                  className="doc-range"
                  min={500}
                  max={6000}
                  step={250}
                  value={dedupeWindow}
                  onChange={(e) => setDedupeWindow(Number(e.target.value))}
                />
              </div>
            )}

            <div className="doc-field">
              <div className="doc-slider-label">
                <span>Auto-Dismiss Duration</span>
                <span>{isPersistent ? 'Disabled' : `${duration} ms`}</span>
              </div>
              <input
                type="range"
                className="doc-range"
                min={1000}
                max={10000}
                step={500}
                disabled={isPersistent}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>

            <div className="doc-field">
              <div className="doc-slider-label">
                <span>Max Visible Limit</span>
                <span>{maxVisible} toasts</span>
              </div>
              <input
                type="range"
                className="doc-range"
                min={1}
                max={10}
                step={1}
                value={maxVisible}
                onChange={(e) => setMaxVisible(Number(e.target.value))}
              />
            </div>

            <div className="doc-field-checkbox">
              <input
                id="pg-swipe"
                type="checkbox"
                checked={swipeToDismiss}
                onChange={(e) => setSwipeToDismiss(e.target.checked)}
              />
              <label htmlFor="pg-swipe">Enable Touch & Pointer Swipe-to-Dismiss</label>
            </div>
          </div>

          <div className="doc-controls-card">
            <h3 className="doc-controls-heading">3. Advanced Features (Progress & Actions)</h3>

            <div className="doc-field">
              <label className="doc-field-label">Progress Bar</label>
              <div className="doc-type-pills">
                {(['none', 'determinate', 'indeterminate'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`doc-type-pill ${progressMode === m ? 'active' : ''}`}
                    onClick={() => setProgressMode(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {progressMode === 'determinate' && (
              <div className="doc-field">
                <div className="doc-slider-label">
                  <span>Progress Value</span>
                  <span>{progressVal}%</span>
                </div>
                <input
                  type="range"
                  className="doc-range"
                  min={0}
                  max={100}
                  step={5}
                  value={progressVal}
                  onChange={(e) => setProgressVal(Number(e.target.value))}
                />
              </div>
            )}

            <div className="doc-field-checkbox">
              <input
                id="pg-hasaction"
                type="checkbox"
                checked={hasAction}
                onChange={(e) => setHasAction(e.target.checked)}
              />
              <label htmlFor="pg-hasaction">Include Primary Action Button</label>
            </div>

            {hasAction && (
              <div className="doc-field" style={{ marginTop: '8px' }}>
                <input
                  type="text"
                  className="doc-input"
                  value={actionLabel}
                  onChange={(e) => setActionLabel(e.target.value)}
                  placeholder="Action button label..."
                />
              </div>
            )}

            <div className="doc-field-checkbox" style={{ marginTop: '8px' }}>
              <input
                id="pg-hascancel"
                type="checkbox"
                checked={hasCancel}
                onChange={(e) => setHasCancel(e.target.checked)}
              />
              <label htmlFor="pg-hascancel">Include Secondary Cancel Button</label>
            </div>

            {hasCancel && (
              <div className="doc-field" style={{ marginTop: '8px' }}>
                <input
                  type="text"
                  className="doc-input"
                  value={cancelLabel}
                  onChange={(e) => setCancelLabel(e.target.value)}
                  placeholder="Cancel button label..."
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Code Reflection & Trigger Action */}
        <div className="doc-playground-preview">
          <div className="doc-preview-sticky">
            <div className="doc-trigger-panel">
              <button
                type="button"
                id="playground-trigger-btn"
                className="doc-btn doc-btn-trigger"
                onClick={handleTrigger}
              >
                <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 10l5 5L16 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Trigger Notification
              </button>

              <div className="doc-trigger-secondary-row">
                <button
                  type="button"
                  className="doc-btn doc-btn-secondary"
                  onClick={() => toast.dismiss()}
                >
                  Dismiss All
                </button>
                <button
                  type="button"
                  className="doc-btn doc-btn-reset"
                  onClick={handleResetDefaults}
                >
                  Reset Defaults
                </button>
              </div>
            </div>

            <div className="doc-code-preview-wrap">
              <div className="doc-code-preview-label">Live Generated Code Snippet</div>
              <CodeBlock language="tsx" code={generateCodeSnippet()} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
