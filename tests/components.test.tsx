import { StrictMode } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Toaster } from '../src/components/Toaster';
import { toast } from '../src/core/toast';
import { toastStore } from '../src/core/store';

describe('Toaster and ToastItem UI Components', () => {
  beforeEach(() => {
    toastStore.clear();
    toastStore.setMaxVisible(5);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // 1 & 8. Accessible attributes and rendering
  it('renders notifications with correct ARIA roles and dismiss button', () => {
    render(<Toaster position="top-right" theme="glass" />);

    act(() => {
      toast.error('Something failed', { title: 'Error Alert' });
      toast.success('Saved successfully', { title: 'Success!' });
    });

    const errorAlert = screen.getByRole('alert');
    expect(errorAlert).toBeInTheDocument();
    expect(errorAlert).toHaveTextContent('Error Alert');
    expect(errorAlert).toHaveTextContent('Something failed');
    expect(errorAlert).toHaveAttribute('aria-live', 'assertive');

    const successStatus = screen.getByRole('status');
    expect(successStatus).toBeInTheDocument();
    expect(successStatus).toHaveTextContent('Success!');
    expect(successStatus).toHaveTextContent('Saved successfully');
    expect(successStatus).toHaveAttribute('aria-live', 'polite');

    const closeButtons = screen.getAllByRole('button', { name: /close notification/i });
    expect(closeButtons).toHaveLength(2);
  });

  // 3. Dismissing one notification via UI click
  it('dismisses notification when close button is clicked', async () => {
    render(<Toaster disableAnimations={true} />);

    act(() => {
      toast.info('Dismiss me');
    });

    expect(screen.getByText('Dismiss me')).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /close notification/i });
    act(() => {
      fireEvent.click(closeBtn);
    });

    expect(screen.queryByText('Dismiss me')).not.toBeInTheDocument();
  });

  // 5. Automatic dismissal with fake timers
  it('automatically dismisses notification when duration expires using fake timers', () => {
    vi.useFakeTimers();

    render(<Toaster duration={3000} disableAnimations={true} />);

    act(() => {
      toast.success('Expiring toast');
    });

    expect(screen.getByText('Expiring toast')).toBeInTheDocument();

    // Advance right before expiration
    act(() => {
      vi.advanceTimersByTime(2990);
    });
    expect(screen.getByText('Expiring toast')).toBeInTheDocument();

    // Advance past expiration
    act(() => {
      vi.advanceTimersByTime(20);
    });

    expect(screen.queryByText('Expiring toast')).not.toBeInTheDocument();
  });

  // 11. Hover and keyboard-focus timer pausing
  it('pauses auto-dismiss timer on pointer hover and resumes after leave', () => {
    vi.useFakeTimers();

    render(<Toaster duration={3000} disableAnimations={true} pauseOnHover={true} />);

    act(() => {
      toast.info('Hover pause test');
    });

    const toastElement = screen.getByText('Hover pause test').closest('.toastnova-toast')!;
    expect(toastElement).toBeInTheDocument();

    // Advance 1500ms (1500ms remaining)
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    // Hover toast
    act(() => {
      fireEvent.pointerEnter(toastElement);
    });

    // Advance past original 3000ms duration while hovered
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    // Toast must still be visible because hover paused the timer
    expect(screen.getByText('Hover pause test')).toBeInTheDocument();

    // Unhover toast
    act(() => {
      fireEvent.pointerLeave(toastElement);
    });

    // Advance 1400ms (still within remaining 1500ms)
    act(() => {
      vi.advanceTimersByTime(1400);
    });
    expect(screen.getByText('Hover pause test')).toBeInTheDocument();

    // Advance remaining 100ms
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.queryByText('Hover pause test')).not.toBeInTheDocument();
  });

  it('pauses auto-dismiss timer on keyboard focus and resumes on blur', () => {
    vi.useFakeTimers();

    render(<Toaster duration={3000} disableAnimations={true} pauseOnFocus={true} />);

    act(() => {
      toast.info('Focus pause test');
    });

    const toastElement = screen.getByText('Focus pause test').closest('.toastnova-toast')!;

    // Advance 1500ms
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    // Focus toast
    act(() => {
      fireEvent.focus(toastElement);
    });

    // Advance 4000ms while focused
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(screen.getByText('Focus pause test')).toBeInTheDocument();

    // Blur toast
    act(() => {
      fireEvent.blur(toastElement);
    });

    // Advance remaining 1500ms
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.queryByText('Focus pause test')).not.toBeInTheDocument();
  });

  // 13. React Strict Mode behavior
  it('behaves correctly under React Strict Mode without duplicating toasts or subscriptions', () => {
    render(
      <StrictMode>
        <Toaster position="top-right" />
      </StrictMode>
    );

    act(() => {
      toast.success('Strict mode toast');
    });

    const matchingToasts = screen.getAllByText('Strict mode toast');
    expect(matchingToasts).toHaveLength(1);
  });

  // Exit animation class and delayed removal when animations are enabled
  it('applies exit animation class and removes element after animation delay when animations are enabled', () => {
    vi.useFakeTimers();

    render(<Toaster duration={5000} disableAnimations={false} />);

    act(() => {
      toast.info('Animated toast');
    });

    const toastElement = screen.getByText('Animated toast').closest('.toastnova-toast')!;
    expect(toastElement).toHaveClass('toastnova-toast-enter');

    // Dismiss manually
    const closeBtn = screen.getByRole('button', { name: /close notification/i });
    act(() => {
      fireEvent.click(closeBtn);
    });

    // Immediately after dismissal, should have exit class and dismissing data attribute
    expect(toastElement).toHaveClass('toastnova-toast-exit');
    expect(toastElement).toHaveAttribute('data-dismissing', 'true');
    expect(screen.getByText('Animated toast')).toBeInTheDocument();

    // Advance 220ms removal timer
    act(() => {
      vi.advanceTimersByTime(230);
    });

    expect(screen.queryByText('Animated toast')).not.toBeInTheDocument();
  });

  // Per-toast duration override UI test with fake timers
  it('respects per-toast duration override in UI with fake timers', () => {
    vi.useFakeTimers();

    render(<Toaster duration={10000} disableAnimations={true} />);

    act(() => {
      toast.warning('Short lived warning', { duration: 1500 });
      toast.info('Default duration info');
    });

    // Advance 1550ms: warning should dismiss, info remains
    act(() => {
      vi.advanceTimersByTime(1550);
    });

    expect(screen.queryByText('Short lived warning')).not.toBeInTheDocument();
    expect(screen.getByText('Default duration info')).toBeInTheDocument();

    // Advance another 8500ms: info dismisses at 10000ms
    act(() => {
      vi.advanceTimersByTime(8500);
    });
    expect(screen.queryByText('Default duration info')).not.toBeInTheDocument();
  });

  // Loading toast does not auto-dismiss until settled or dismissed manually
  it('does not auto-dismiss loading toast and allows manual dismissal', () => {
    vi.useFakeTimers();

    render(<Toaster duration={2000} disableAnimations={true} />);

    let loadingId = '';
    act(() => {
      loadingId = toast.loading('Uploading assets...');
    });

    expect(screen.getByText('Uploading assets...')).toBeInTheDocument();

    // Advance way past standard duration
    act(() => {
      vi.advanceTimersByTime(20000);
    });
    expect(screen.getByText('Uploading assets...')).toBeInTheDocument();

    // Manually dismiss loading toast
    act(() => {
      toast.dismiss(loadingId);
    });

    expect(screen.queryByText('Uploading assets...')).not.toBeInTheDocument();
  });

  // 6 Positions support
  it.each([
    'top-right',
    'top-left',
    'top-center',
    'bottom-right',
    'bottom-left',
    'bottom-center'
  ] as const)('applies correct position class for position %s', (pos) => {
    const { container } = render(<Toaster position={pos} />);
    const toasterElement = container.querySelector(`.toastnova-position-${pos}`);
    expect(toasterElement).toBeInTheDocument();
  });
});
