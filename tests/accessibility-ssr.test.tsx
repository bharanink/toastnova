import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React, { act } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { Toaster, toast, toastStore } from '../src';

describe('Phase 5: Accessibility, SSR & Cross-Platform Reliability', () => {
  beforeEach(() => {
    toastStore.clear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    act(() => {
      toastStore.clear();
    });
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('1. Accessibility Semantics and ARIA Attributes', () => {
    it('renders landmark section with role="region" and aria-label="Notifications"', () => {
      render(<Toaster />);
      const region = screen.getByRole('region', { name: /notifications/i });
      expect(region).toBeInTheDocument();
      expect(region.tagName.toLowerCase()).toBe('section');
    });

    it('assigns role="alert" and aria-live="assertive" exclusively to error toasts', () => {
      render(<Toaster disableAnimations={true} />);

      act(() => {
        toast.error('Payment gateway unavailable', { title: 'Transaction Failed' });
      });

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveAttribute('aria-live', 'assertive');
      expect(alert).toHaveAttribute('aria-atomic', 'true');
    });

    it('assigns role="status" and aria-live="polite" to success, info, warning, and loading toasts', () => {
      render(<Toaster disableAnimations={true} />);

      act(() => {
        toast.success('Profile updated');
        toast.info('New message received');
        toast.warning('Storage nearly full');
        toast.loading('Uploading files...');
      });

      const statuses = screen.getAllByRole('status');
      expect(statuses).toHaveLength(4);

      statuses.forEach((status) => {
        expect(status).toHaveAttribute('aria-live', 'polite');
        expect(status).toHaveAttribute('aria-atomic', 'true');
      });
    });

    it('includes visually hidden type prefix for screen readers (.toastnova-sr-only)', () => {
      render(<Toaster disableAnimations={true} />);

      act(() => {
        toast.error('Syntax error on line 42', { title: 'Compilation' });
      });

      const srLabel = document.querySelector('.toastnova-sr-only');
      expect(srLabel).toBeInTheDocument();
      expect(srLabel).toHaveTextContent('Error:');
    });

    it('provides contextual accessible names for dismissal buttons', () => {
      render(<Toaster disableAnimations={true} />);

      act(() => {
        toast.success('Document saved', { title: 'Save File' });
        toast.info('Plain notice without title');
      });

      const titledCloseBtn = screen.getByRole('button', { name: 'Close notification: Save File' });
      const plainCloseBtn = screen.getByRole('button', { name: 'Close notification' });

      expect(titledCloseBtn).toBeInTheDocument();
      expect(plainCloseBtn).toBeInTheDocument();
    });

    it('provides accessible role and attributes for progress bar', () => {
      render(<Toaster disableAnimations={true} />);

      act(() => {
        toast('Downloading asset', {
          title: 'Asset Download',
          progress: 65
        });
      });

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
      expect(progressbar).toHaveAttribute('aria-valuenow', '65');
      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
      expect(progressbar).toHaveAttribute('aria-valuemax', '100');
      expect(progressbar).toHaveAttribute('aria-label', 'Asset Download progress');
    });

    it('provides accessible label on duplicate count badge', () => {
      render(<Toaster duplicateStrategy="group" dedupeWindow={5000} disableAnimations={true} />);

      act(() => {
        toast.info('Network ping');
        toast.info('Network ping');
        toast.info('Network ping');
      });

      const badge = screen.getByLabelText('3 occurrences');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('×3');
    });
  });

  describe('2. Keyboard Navigation and Focus Management', () => {
    it('allows tabbing through interactive controls in DOM order', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<Toaster disableAnimations={true} />);

      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      act(() => {
        toast('Confirm deletion?', {
          title: 'Delete Item',
          action: { label: 'Confirm', onClick: onConfirm },
          cancel: { label: 'Cancel', onClick: onCancel }
        });
      });

      const confirmBtn = screen.getByRole('button', { name: 'Confirm' });
      const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
      const closeBtn = screen.getByRole('button', { name: 'Close notification: Delete Item' });

      // Tab through action -> cancel -> close
      await user.tab();
      expect(document.activeElement).toBe(confirmBtn);

      await user.tab();
      expect(document.activeElement).toBe(cancelBtn);

      await user.tab();
      expect(document.activeElement).toBe(closeBtn);
    });

    it('activates buttons via keyboard navigation and Enter key', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<Toaster disableAnimations={true} />);

      const onAction = vi.fn();
      act(() => {
        toast('Action required', {
          action: { label: 'Accept', onClick: onAction, dismissOnClick: false }
        });
      });

      const actionBtn = screen.getByRole('button', { name: 'Accept' });
      actionBtn.focus();
      expect(document.activeElement).toBe(actionBtn);

      await user.keyboard('{Enter}');
      expect(onAction).toHaveBeenCalledTimes(1);

      // Verify close button activation via keyboard
      const closeBtn = screen.getByRole('button', { name: /close notification/i });
      closeBtn.focus();
      expect(document.activeElement).toBe(closeBtn);

      await user.keyboard('{Enter}');
      expect(screen.queryByText('Action required')).not.toBeInTheDocument();
    });

    it('blurs active element if toast is dismissed while containing focus', async () => {
      render(<Toaster disableAnimations={true} />);

      let toastId: string = '';
      act(() => {
        toastId = toast('Pending task', {
          action: { label: 'Review', onClick: vi.fn() }
        });
      });

      const actionBtn = screen.getByRole('button', { name: 'Review' });
      actionBtn.focus();
      expect(document.activeElement).toBe(actionBtn);

      act(() => {
        toast.dismiss(toastId);
      });

      // Focus should be cleared from the detached element
      expect(document.activeElement).not.toBe(actionBtn);
    });

    it('ensures the toast container card itself does not steal focus or add unnecessary tab stops', () => {
      render(<Toaster disableAnimations={true} />);

      act(() => {
        toast.info('Passive information');
      });

      const toastCard = document.querySelector('.toastnova-toast');
      expect(toastCard).toBeInTheDocument();
      // Outer card should not have tabIndex=0
      expect(toastCard).not.toHaveAttribute('tabindex');
    });
  });

  describe('3. Reduced Motion Support', () => {
    it('dismisses toast immediately with 0ms delay when prefers-reduced-motion is active', async () => {
      const matchMediaOriginal = window.matchMedia;
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('prefers-reduced-motion'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }));

      try {
        render(<Toaster animation="fade" animationDuration={400} />);

        let id = '';
        act(() => {
          id = toast.info('Reduced motion test', { duration: 0 });
        });

        expect(screen.getByText('Reduced motion test')).toBeInTheDocument();

        // Dismiss the toast
        act(() => {
          toast.dismiss(id);
        });

        // Under reduced motion, removal should happen without waiting for the 400ms duration
        expect(screen.queryByText('Reduced motion test')).not.toBeInTheDocument();
      } finally {
        window.matchMedia = matchMediaOriginal;
      }
    });
  });

  describe('4. Server-Side Rendering (SSR) & Hydration', () => {
    it('renders cleanly via renderToString without throwing or accessing window globals', () => {
      const html = renderToString(
        <Toaster
          theme="glass"
          position="top-right"
          animation="slide"
        />
      );

      expect(html).toContain('role="region"');
      expect(html).toContain('aria-label="Notifications"');
      expect(html).toContain('toastnova-toaster');
      expect(html).toContain('toastnova-theme-glass');
    });

    it('maintains a stable server snapshot that is always empty', () => {
      const serverSnapshot1 = toastStore.getServerSnapshot();
      const serverSnapshot2 = toastStore.getServerSnapshot();

      expect(serverSnapshot1.toasts).toEqual([]);
      expect(serverSnapshot1.queue).toEqual([]);
      expect(serverSnapshot1).toBe(serverSnapshot2);
    });

    it('enforces per-request isolation during SSR when window is undefined', () => {
      // Simulate SSR environment by temporarily hiding window
      const originalWindow = global.window;
      try {
        // @ts-expect-error simulating Node environment
        delete global.window;

        const id = toastStore.addToast({
          type: 'info',
          message: 'Server-side request toast'
        });

        expect(id).toBeDefined();
        // Server store should remain isolated and empty
        expect(toastStore.getSnapshot().toasts).toHaveLength(0);
      } finally {
        global.window = originalWindow;
      }
    });

    it('hydrates server-rendered markup on client without mismatch errors', async () => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      try {
        const initialHtml = renderToString(<Toaster theme="neon" position="bottom-left" />);
        container.innerHTML = initialHtml;

        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        let root: ReturnType<typeof hydrateRoot> | null = null;
        act(() => {
          root = hydrateRoot(container, <Toaster theme="neon" position="bottom-left" />);
        });

        // Ensure no hydration mismatch warnings
        const hydrationErrors = consoleErrorSpy.mock.calls.filter((call) =>
          call.some((arg) => typeof arg === 'string' && arg.toLowerCase().includes('hydration'))
        );
        expect(hydrationErrors).toHaveLength(0);

        consoleErrorSpy.mockRestore();
        if (root) {
          act(() => {
            (root as unknown as { unmount: () => void }).unmount();
          });
        }
      } finally {
        document.body.removeChild(container);
      }
    });
  });

  describe('5. React Strict Mode & Mounting Lifecycle', () => {
    it('handles React Strict Mode double-mounting without leaking or duplicating toasts', () => {
      const { unmount } = render(
        <React.StrictMode>
          <Toaster disableAnimations={true} />
        </React.StrictMode>
      );

      act(() => {
        toast.success('Strict mode verified');
      });

      expect(screen.getAllByText('Strict mode verified')).toHaveLength(1);

      unmount();
      expect(screen.queryByText('Strict mode verified')).not.toBeInTheDocument();
    });

    it('handles rapid mounting, unmounting, and remounting without errors', () => {
      const { unmount: unmount1 } = render(<Toaster />);
      unmount1();

      const { unmount: unmount2 } = render(<Toaster />);
      act(() => {
        toast.info('Remount successful');
      });
      expect(screen.getByText('Remount successful')).toBeInTheDocument();
      unmount2();

      const { unmount: unmount3 } = render(<Toaster />);
      unmount3();
    });
  });

  describe('6. Gesture and Pointer Cancellation', () => {
    it('resets swipe offset cleanly when onPointerCancel occurs during drag', () => {
      render(<Toaster swipeToDismiss={true} disableAnimations={true} />);

      act(() => {
        toast.info('Swipe cancellation test', { duration: 0 });
      });

      const toastElement = screen.getByText('Swipe cancellation test').closest('.toastnova-toast') as HTMLElement;
      expect(toastElement).toBeInTheDocument();

      // Start drag
      fireEvent.pointerDown(toastElement, { clientX: 100, clientY: 100, pointerId: 1 });
      fireEvent.pointerMove(toastElement, { clientX: 160, clientY: 100, pointerId: 1 });

      // Gesture is cancelled by browser (e.g. scroll takeover or system gesture)
      fireEvent.pointerCancel(toastElement, { pointerId: 1 });

      // The toast should not be dismissed and should have transform reset
      expect(screen.getByText('Swipe cancellation test')).toBeInTheDocument();
      expect(toastElement.style.transform).toBe('translate3d(0, 0, 0)');
    });
  });

  describe('7. Non-reliance on Color & Custom Content Accessibility', () => {
    it('renders distinct semantic icons for each notification type so information does not rely on color alone', () => {
      render(<Toaster disableAnimations={true} />);

      act(() => {
        toast.success('Done');
        toast.error('Failed');
        toast.warning('Warning');
        toast.info('Info');
        toast.loading('Loading');
      });

      const icons = document.querySelectorAll('.toastnova-icon-wrapper svg');
      expect(icons).toHaveLength(5);
      icons.forEach((icon) => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('preserves full keyboard accessibility and interactive semantics inside custom React content', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<Toaster disableAnimations={true} />);

      const onSubmit = vi.fn((e) => e.preventDefault());

      act(() => {
        toast.custom(() => (
          <form onSubmit={onSubmit} aria-label="Quick feedback">
            <input type="text" placeholder="Your reply..." aria-label="Reply input" />
            <button type="submit">Submit Feedback</button>
          </form>
        ));
      });

      const input = screen.getByRole('textbox', { name: 'Reply input' });
      const submitBtn = screen.getByRole('button', { name: 'Submit Feedback' });

      await user.click(input);
      await user.type(input, 'Antigravity is great');
      expect(input).toHaveValue('Antigravity is great');

      await user.click(submitBtn);
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });
});
