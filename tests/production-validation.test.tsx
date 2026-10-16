import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toaster, toast, toastStore } from '../src';

describe('Phase 6: Production Validation & Engine Edge Cases', () => {
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

  describe('1. Promise Error Handling Resilience', () => {
    it('handles promise rejection gracefully when messages.error formatter throws', async () => {
      render(<Toaster disableAnimations={true} />);

      const failingPromise = Promise.reject(new Error('Internal DB failure'));

      await act(async () => {
        try {
          await toast.promise(failingPromise, {
            loading: 'Connecting...',
            success: 'Connected',
            error: () => {
              throw new Error('Buggy user formatter exploded');
            }
          });
        } catch (_) {
          // Expected rejection
        }
      });

      // Should fall back to safe error message rather than crashing or staying stuck in loading
      expect(screen.queryByText('Connecting...')).not.toBeInTheDocument();
      expect(screen.getByText('An error occurred')).toBeInTheDocument();
    });

    it('handles promise resolution gracefully when messages.success formatter throws', async () => {
      render(<Toaster disableAnimations={true} />);

      const succeedingPromise = Promise.resolve({ user: 'Alice' });

      await act(async () => {
        try {
          await toast.promise(succeedingPromise, {
            loading: 'Fetching user...',
            success: () => {
              throw new Error('Buggy success formatter');
            },
            error: 'Failed'
          });
        } catch (_) {
          // Expected throw from formatter
        }
      });

      expect(screen.queryByText('Fetching user...')).not.toBeInTheDocument();
      expect(screen.getByText('Operation succeeded')).toBeInTheDocument();
    });
  });

  describe('2. Progress Clamping & Type Transitions', () => {
    it('clamps negative progress to 0 and excessive progress to 100', () => {
      render(<Toaster disableAnimations={true} />);

      act(() => {
        toast('Clamped progress lower', { progress: -25 });
        toast('Clamped progress upper', { progress: 150 });
        toast('NaN progress', { progress: NaN });
      });

      const bars = screen.getAllByRole('progressbar');
      expect(bars[0]).toHaveAttribute('aria-valuenow', '0');
      expect(bars[1]).toHaveAttribute('aria-valuenow', '100');
      expect(bars[2]).toHaveAttribute('aria-valuenow', '0');
    });

    it('transitions progress between indeterminate and determinate via toast.update', () => {
      render(<Toaster disableAnimations={true} />);

      let toastId = '';
      act(() => {
        toastId = toast('Download progress', { progress: 'indeterminate' });
      });

      let track = document.querySelector('.toastnova-progress-track');
      expect(track).toHaveClass('toastnova-progress-indeterminate');

      act(() => {
        toast.update(toastId, { progress: 75 });
      });

      track = document.querySelector('.toastnova-progress-track');
      expect(track).not.toHaveClass('toastnova-progress-indeterminate');
      expect(track).toHaveAttribute('aria-valuenow', '75');
    });
  });

  describe('3. Queue Limiting & Dynamic maxVisible Resizing', () => {
    it('promotes queued items in FIFO order when maxVisible limit is expanded', () => {
      toastStore.setMaxVisible(2);

      let id1 = '', id2 = '', id3 = '', id4 = '';
      act(() => {
        id1 = toast('Toast 1');
        id2 = toast('Toast 2');
        id3 = toast('Toast 3');
        id4 = toast('Toast 4');
      });

      expect(toastStore.getSnapshot().toasts.map((t) => t.id)).toEqual([id1, id2]);
      expect(toastStore.getSnapshot().queue.map((t) => t.id)).toEqual([id3, id4]);

      // Expand maxVisible to 3
      act(() => {
        toastStore.setMaxVisible(3);
      });

      expect(toastStore.getSnapshot().toasts.map((t) => t.id)).toEqual([id1, id2, id3]);
      expect(toastStore.getSnapshot().queue.map((t) => t.id)).toEqual([id4]);
    });

    it('re-queues items when maxVisible limit is dynamically reduced', () => {
      toastStore.setMaxVisible(4);

      let id1 = '', id2 = '', id3 = '', id4 = '';
      act(() => {
        id1 = toast('Toast 1');
        id2 = toast('Toast 2');
        id3 = toast('Toast 3');
        id4 = toast('Toast 4');
      });

      expect(toastStore.getSnapshot().toasts).toHaveLength(4);

      // Reduce maxVisible to 2
      act(() => {
        toastStore.setMaxVisible(2);
      });

      expect(toastStore.getSnapshot().toasts.map((t) => t.id)).toEqual([id1, id2]);
      expect(toastStore.getSnapshot().queue.map((t) => t.id)).toEqual([id3, id4]);
    });
  });

  describe('4. Dismissal Idempotency & Edge Cases', () => {
    it('handles dismissing non-existent or already-dismissed IDs without error', () => {
      render(<Toaster disableAnimations={true} />);

      expect(() => {
        act(() => {
          toast.dismiss('non-existent-id-12345');
          toast.dismiss('another-fake-id');
          toast.remove('non-existent-id-12345');
        });
      }).not.toThrow();
    });

    it('handles calling toast.dismiss() on an empty toaster without error', () => {
      expect(() => {
        act(() => {
          toast.dismiss();
          toast.dismiss();
        });
      }).not.toThrow();
    });
  });

  describe('5. Unmounting & Timer Cleanup Lifecycle', () => {
    it('cancels all active timers cleanly when Toaster unmounts', () => {
      const { unmount } = render(<Toaster duration={3000} />);

      act(() => {
        toast.info('Temporary notice 1');
        toast.info('Temporary notice 2');
        toast.info('Temporary notice 3');
      });

      expect(screen.getAllByText(/Temporary notice/)).toHaveLength(3);

      // Unmount the toaster component
      unmount();

      // Advancing timers should not cause any unmounted state updates or errors
      expect(() => {
        act(() => {
          vi.advanceTimersByTime(5000);
        });
      }).not.toThrow();
    });
  });

  describe('6. Simultaneous Pause on Hover & Focus', () => {
    it('keeps toast alive while hovered and focused, then resumes properly once both exit', async () => {
      render(<Toaster duration={2000} disableAnimations={true} />);

      act(() => {
        toast('Hover and Focus Test', {
          action: { label: 'Click Me', onClick: vi.fn() }
        });
      });

      const card = screen.getByText('Hover and Focus Test').closest('.toastnova-toast') as HTMLElement;
      const btn = screen.getByRole('button', { name: 'Click Me' });

      // Hover card
      fireEvent.pointerEnter(card);

      // Advance 1500ms
      act(() => {
        vi.advanceTimersByTime(1500);
      });
      expect(screen.getByText('Hover and Focus Test')).toBeInTheDocument();

      // Focus button inside
      btn.focus();

      // Leave pointer (still focused)
      fireEvent.pointerLeave(card);

      // Advance another 1500ms (focus should keep it paused)
      act(() => {
        vi.advanceTimersByTime(1500);
      });
      expect(screen.getByText('Hover and Focus Test')).toBeInTheDocument();

      // Blur button (both hover and focus are now false)
      btn.blur();

      // Advance remaining time + buffer
      act(() => {
        vi.advanceTimersByTime(2100);
      });

      expect(screen.queryByText('Hover and Focus Test')).not.toBeInTheDocument();
    });
  });
});
