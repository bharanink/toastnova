import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Toaster } from '../src/components/Toaster';
import { toast } from '../src/core/toast';
import { toastStore } from '../src/core/store';
import { BUILTIN_THEMES } from '../src/core/types';
import type { ToastTheme, ToastType } from '../src/core/types';

describe('Multi-Theme System (Phase 2)', () => {
  beforeEach(() => {
    toastStore.clear();
    toastStore.setMaxVisible(10);
    vi.restoreAllMocks();
  });

  // 1 & 2. Every supported theme name and default glass theme
  it('defaults to "glass" theme when no theme prop is provided', () => {
    const { container } = render(<Toaster />);
    const section = container.querySelector('.toastnova-toaster');
    expect(section).toHaveClass('toastnova-theme-glass');
    expect(section).toHaveAttribute('data-theme', 'glass');
  });

  it.each(BUILTIN_THEMES)('supports built-in theme "%s"', (themeName) => {
    const { container } = render(<Toaster theme={themeName} />);
    const section = container.querySelector('.toastnova-toaster');
    expect(section).toHaveClass(`toastnova-theme-${themeName}`);
    expect(section).toHaveAttribute('data-theme', themeName);
  });

  // 3. Theme switching without remounting the application
  it('switches themes dynamically without losing active toasts or unmounting', () => {
    const { container, rerender } = render(<Toaster theme="glass" />);

    act(() => {
      toast.success('Persistent Toast during theme switch');
    });

    expect(screen.getByText('Persistent Toast during theme switch')).toBeInTheDocument();
    let section = container.querySelector('.toastnova-toaster');
    expect(section).toHaveClass('toastnova-theme-glass');
    expect(section).toHaveAttribute('data-theme', 'glass');

    // Switch to 'neon'
    rerender(<Toaster theme="neon" />);
    section = container.querySelector('.toastnova-toaster');
    expect(section).toHaveClass('toastnova-theme-neon');
    expect(section).toHaveAttribute('data-theme', 'neon');
    expect(screen.getByText('Persistent Toast during theme switch')).toBeInTheDocument();

    // Switch to 'minimal'
    rerender(<Toaster theme="minimal" />);
    section = container.querySelector('.toastnova-toaster');
    expect(section).toHaveClass('toastnova-theme-minimal');
    expect(section).toHaveAttribute('data-theme', 'minimal');
    expect(screen.getByText('Persistent Toast during theme switch')).toBeInTheDocument();

    // Switch to 'gradient'
    rerender(<Toaster theme="gradient" />);
    section = container.querySelector('.toastnova-toaster');
    expect(section).toHaveClass('toastnova-theme-gradient');
    expect(section).toHaveAttribute('data-theme', 'gradient');
    expect(screen.getByText('Persistent Toast during theme switch')).toBeInTheDocument();

    // Switch to 'light'
    rerender(<Toaster theme="light" />);
    section = container.querySelector('.toastnova-toaster');
    expect(section).toHaveClass('toastnova-theme-light');
    expect(section).toHaveAttribute('data-theme', 'light');
    expect(screen.getByText('Persistent Toast during theme switch')).toBeInTheDocument();

    // Switch to 'dark'
    rerender(<Toaster theme="dark" />);
    section = container.querySelector('.toastnova-toaster');
    expect(section).toHaveClass('toastnova-theme-dark');
    expect(section).toHaveAttribute('data-theme', 'dark');
    expect(screen.getByText('Persistent Toast during theme switch')).toBeInTheDocument();
  });

  // 4. Every notification type under every theme
  const NOTIFICATION_TYPES: readonly ToastType[] = [
    'success',
    'error',
    'info',
    'warning',
    'loading',
    'default'
  ];

  BUILTIN_THEMES.forEach((theme) => {
    describe(`Theme "${theme}" with all notification types`, () => {
      NOTIFICATION_TYPES.forEach((type) => {
        it(`renders "${type}" notification under "${theme}" theme`, () => {
          render(<Toaster theme={theme} />);

          act(() => {
            switch (type) {
              case 'success':
                toast.success(`${theme} ${type} message`);
                break;
              case 'error':
                toast.error(`${theme} ${type} message`);
                break;
              case 'info':
                toast.info(`${theme} ${type} message`);
                break;
              case 'warning':
                toast.warning(`${theme} ${type} message`);
                break;
              case 'loading':
                toast.loading(`${theme} ${type} message`);
                break;
              case 'default':
                toast(`${theme} ${type} message`);
                break;
            }
          });

          const messageEl = screen.getByText(`${theme} ${type} message`);
          expect(messageEl).toBeInTheDocument();
          const toastCard = messageEl.closest('.toastnova-toast');
          expect(toastCard).toHaveClass(`toastnova-${type}`);
        });
      });
    });
  });

  // 5. Invalid-theme fallback with development warning
  it('falls back safely to "glass" theme on invalid theme prop and logs a warning', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { container } = render(<Toaster theme={'invalid-future-theme' as unknown as ToastTheme} />);

    const section = container.querySelector('.toastnova-toaster');
    expect(section).toHaveClass('toastnova-theme-glass');
    expect(section).toHaveAttribute('data-theme', 'glass');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[ToastNova] Unknown theme "invalid-future-theme"')
    );
  });

  // 7. Long text message rendering
  it('renders long messages without breaking structure or omitting content', () => {
    render(<Toaster theme="gradient" />);

    const longText =
      'This is an exceptionally long notification message designed to ensure that ToastNova gracefully wraps sentences, prevents horizontal overflow, and keeps close buttons and status icons properly positioned.';

    act(() => {
      toast.info(longText, { title: 'Long Text Header' });
    });

    expect(screen.getByText('Long Text Header')).toBeInTheDocument();
    expect(screen.getByText(longText)).toBeInTheDocument();
  });
});
