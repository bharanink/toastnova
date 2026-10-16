import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Toaster } from '../src/components/Toaster';
import { toast } from '../src/core/toast';
import { toastStore } from '../src/core/store';
import { BUILTIN_ANIMATIONS, BUILTIN_THEMES } from '../src/core/types';
import type { ToastAnimationPreset } from '../src/core/types';

describe('Advanced Animations and Interactions (Phase 3)', () => {
  beforeEach(() => {
    toastStore.clear();
    toastStore.setMaxVisible(5);
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // 1. Every animation preset
  it.each(BUILTIN_ANIMATIONS)('supports animation preset "%s"', (preset) => {
    const { container } = render(<Toaster animation={preset} />);
    const section = container.querySelector('.toastnova-toaster');
    expect(section).toHaveClass(`toastnova-anim-${preset}`);
    expect(section).toHaveAttribute('data-animation', preset);
  });

  // 2. The none preset and 0ms immediate removal
  it('instantly removes toast without animation delay when animation="none"', () => {
    vi.useFakeTimers();
    render(<Toaster animation="none" duration={2000} />);

    act(() => {
      toast.info('Instant removal toast');
    });

    expect(screen.getByText('Instant removal toast')).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /close notification/i });
    act(() => {
      fireEvent.click(closeBtn);
    });

    // In 'none' preset, element unmounts immediately (0ms delay)
    expect(screen.queryByText('Instant removal toast')).not.toBeInTheDocument();
  });

  // 3 & 4. Entrance and exit lifecycle with automatic timeout
  it('handles full lifecycle: enters with preset class, waits duration, then exits and unmounts', () => {
    vi.useFakeTimers();
    const animDuration = 250;
    render(<Toaster animation="spring" animationDuration={animDuration} duration={3000} />);

    act(() => {
      toast.success('Spring lifecycle toast');
    });

    const toastElement = screen.getByText('Spring lifecycle toast').closest('.toastnova-toast')!;
    expect(toastElement).toHaveClass('toastnova-toast-enter');
    expect(toastElement).toHaveAttribute('data-animation', 'spring');

    // Advance 3000ms: timeout expires, triggers dismissal
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Toast is now in exiting state
    expect(toastElement).toHaveClass('toastnova-toast-exit');
    expect(toastElement).toHaveAttribute('data-dismissing', 'true');
    expect(screen.getByText('Spring lifecycle toast')).toBeInTheDocument();

    // Advance animationDuration (250ms): element is removed from DOM
    act(() => {
      vi.advanceTimersByTime(animDuration + 10);
    });

    expect(screen.queryByText('Spring lifecycle toast')).not.toBeInTheDocument();
  });

  // 5. Manual dismissal followed by exit animation
  it('runs exit animation when manually dismissed via toast.dismiss(id)', () => {
    vi.useFakeTimers();
    render(<Toaster animation="bounce" animationDuration={200} duration={10000} />);

    let id = '';
    act(() => {
      id = toast.warning('Manual dismiss bounce');
    });

    const toastElement = screen.getByText('Manual dismiss bounce').closest('.toastnova-toast')!;
    expect(toastElement).toHaveClass('toastnova-toast-enter');

    act(() => {
      toast.dismiss(id);
    });

    expect(toastElement).toHaveClass('toastnova-toast-exit');
    expect(screen.getByText('Manual dismiss bounce')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(210);
    });

    expect(screen.queryByText('Manual dismiss bounce')).not.toBeInTheDocument();
  });

  // 6. Dismissing all notifications with exit animation
  it('applies exit animation to all visible toasts when toast.dismiss() is invoked', () => {
    vi.useFakeTimers();
    render(<Toaster animation="slide" animationDuration={220} duration={8000} />);

    act(() => {
      toast.info('Toast A');
      toast.info('Toast B');
      toast.info('Toast C');
    });

    expect(screen.getAllByText(/Toast [A-C]/)).toHaveLength(3);

    act(() => {
      toast.dismiss();
    });

    const toasts = screen.getAllByText(/Toast [A-C]/).map((el) => el.closest('.toastnova-toast')!);
    toasts.forEach((t) => {
      expect(t).toHaveClass('toastnova-toast-exit');
      expect(t).toHaveAttribute('data-dismissing', 'true');
    });

    act(() => {
      vi.advanceTimersByTime(230);
    });

    expect(screen.queryByText('Toast A')).not.toBeInTheDocument();
    expect(screen.queryByText('Toast B')).not.toBeInTheDocument();
    expect(screen.queryByText('Toast C')).not.toBeInTheDocument();
  });

  // 7. Rapid repeated dismissal requests safely handled without crash
  it('handles rapid repeated dismiss calls without throwing or desyncing', () => {
    render(<Toaster animation="fade" />);

    let id = '';
    act(() => {
      id = toast.info('Rapid dismiss test');
    });

    // Call dismiss multiple times rapidly
    act(() => {
      toast.dismiss(id);
      toast.dismiss(id);
      toast.dismiss(id);
      toast.dismiss();
    });

    expect(toastStore.getSnapshot().toasts.every((t) => t.dismissing)).toBe(true);
  });

  // 8. Stacked spacing configuration
  it('applies configurable stack gap and animation duration CSS custom properties', () => {
    const { container } = render(
      <Toaster stackGap={18} animationDuration={320} animation="slide" />
    );
    const section = container.querySelector('.toastnova-toaster') as HTMLElement;
    expect(section.style.getPropertyValue('--toastnova-stack-gap')).toBe('18px');
    expect(section.style.getPropertyValue('--toastnova-anim-duration')).toBe('320ms');
  });

  // 9. Top and bottom position behavior
  it('renders top positions with standard stack order and bottom with column-reverse list', () => {
    const { container: topContainer } = render(<Toaster position="top-right" />);
    expect(topContainer.querySelector('.toastnova-list-top')).toBeInTheDocument();

    const { container: bottomContainer } = render(<Toaster position="bottom-right" />);
    expect(bottomContainer.querySelector('.toastnova-list-bottom')).toBeInTheDocument();
  });

  // 10. Swipe-to-dismiss: successful qualifying swipe
  it('dismisses toast on qualifying horizontal swipe gesture', () => {
    vi.useFakeTimers();
    render(<Toaster swipeToDismiss={true} animationDuration={200} />);

    act(() => {
      toast.success('Swipeable toast');
    });

    const toastElement = screen.getByText('Swipeable toast').closest('.toastnova-toast') as HTMLElement;
    expect(toastElement).toHaveClass('toastnova-swipeable');

    toastElement.setPointerCapture = vi.fn();
    toastElement.releasePointerCapture = vi.fn();

    // Start gesture
    act(() => {
      fireEvent.pointerDown(toastElement, { clientX: 100, clientY: 100, pointerId: 1 });
    });

    // Drag past 75px threshold
    act(() => {
      fireEvent.pointerMove(toastElement, { clientX: 210, clientY: 100, pointerId: 1 });
    });

    expect(toastElement).toHaveClass('toastnova-swiping');

    // End gesture (qualifies for dismissal)
    act(() => {
      fireEvent.pointerUp(toastElement, { clientX: 210, clientY: 100, pointerId: 1 });
    });

    expect(toastElement).toHaveClass('toastnova-swipe-dismiss');

    // Advance fly-out trigger
    act(() => {
      vi.advanceTimersByTime(150);
    });

    // Advance removal transition timer
    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(screen.queryByText('Swipeable toast')).not.toBeInTheDocument();
  });

  // 10b. Swipe-to-dismiss: unsuccessful swipe snaps back
  it('snaps toast back to origin when swipe gesture does not meet threshold', () => {
    vi.useFakeTimers();
    render(<Toaster swipeToDismiss={true} />);

    act(() => {
      toast.info('Non-qualifying swipe');
    });

    const toastElement = screen.getByText('Non-qualifying swipe').closest('.toastnova-toast') as HTMLElement;
    toastElement.setPointerCapture = vi.fn();
    toastElement.releasePointerCapture = vi.fn();

    // Start gesture
    act(() => {
      fireEvent.pointerDown(toastElement, { clientX: 100, clientY: 100, pointerId: 1 });
    });

    // Drag small distance (20px < 75px)
    act(() => {
      fireEvent.pointerMove(toastElement, { clientX: 120, clientY: 100, pointerId: 1 });
    });

    // Release gesture
    act(() => {
      fireEvent.pointerUp(toastElement, { clientX: 120, clientY: 100, pointerId: 1 });
    });

    expect(toastElement).toHaveClass('toastnova-swipe-cancel');

    // Toast remains in document
    expect(screen.getByText('Non-qualifying swipe')).toBeInTheDocument();
  });

  // 11. Pointer cancellation resets swipe
  it('resets swipe gesture gracefully upon pointercancel', () => {
    render(<Toaster swipeToDismiss={true} />);

    act(() => {
      toast.info('Cancelable swipe toast');
    });

    const toastElement = screen.getByText('Cancelable swipe toast').closest('.toastnova-toast') as HTMLElement;
    toastElement.setPointerCapture = vi.fn();
    toastElement.releasePointerCapture = vi.fn();

    act(() => {
      fireEvent.pointerDown(toastElement, { clientX: 100, clientY: 100, pointerId: 1 });
      fireEvent.pointerMove(toastElement, { clientX: 150, clientY: 100, pointerId: 1 });
      fireEvent.pointerCancel(toastElement, { pointerId: 1 });
    });

    expect(screen.getByText('Cancelable swipe toast')).toBeInTheDocument();
  });

  // 12. Interaction with buttons inside toast does not trigger swipe
  it('allows clicking close button without initiating a swipe gesture', () => {
    render(<Toaster swipeToDismiss={true} disableAnimations={true} />);

    act(() => {
      toast.error('Button click test');
    });

    const closeBtn = screen.getByRole('button', { name: /close notification/i });

    act(() => {
      fireEvent.pointerDown(closeBtn, { clientX: 100, clientY: 100 });
      fireEvent.click(closeBtn);
    });

    expect(screen.queryByText('Button click test')).not.toBeInTheDocument();
  });

  // 16. Compatibility of all animations across all 6 themes
  it('pairs every animation preset cleanly with every theme', () => {
    BUILTIN_THEMES.forEach((theme) => {
      BUILTIN_ANIMATIONS.forEach((anim) => {
        const { container } = render(<Toaster theme={theme} animation={anim} />);
        const section = container.querySelector('.toastnova-toaster');
        expect(section).toHaveClass(`toastnova-theme-${theme}`);
        expect(section).toHaveClass(`toastnova-anim-${anim}`);
      });
    });
  });

  // Invalid animation preset fallback
  it('falls back safely to "slide" preset on invalid animation prop with dev warning', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { container } = render(
      <Toaster animation={'elastic-magic' as unknown as ToastAnimationPreset} />
    );

    const section = container.querySelector('.toastnova-toaster');
    expect(section).toHaveClass('toastnova-anim-slide');
    expect(section).toHaveAttribute('data-animation', 'slide');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[ToastNova] Unknown animation "elastic-magic"')
    );
  });
});
