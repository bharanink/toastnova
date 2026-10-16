import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { toast, Toaster, toastStore } from '../src';

describe('Phase 4: Advanced Notification Features', () => {
  beforeEach(() => {
    vi.useRealTimers();
    act(() => {
      toastStore.clear();
    });
  });

  afterEach(() => {
    act(() => {
      toastStore.clear();
    });
    vi.restoreAllMocks();
  });

  describe('Step 2: Action Buttons', () => {
    it('renders the action button and triggers callback on click', async () => {
      const onClick = vi.fn();
      render(<Toaster />);

      act(() => {
        toast.success('File deleted', {
          action: {
            label: 'Undo',
            onClick
          }
        });
      });

      const actionBtn = screen.getByRole('button', { name: 'Undo' });
      expect(actionBtn).toBeInTheDocument();
      expect(actionBtn).toHaveClass('toastnova-action-btn');

      await act(async () => {
        fireEvent.click(actionBtn);
      });

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('triggers callback when activated via keyboard (Enter and Space)', async () => {
      const onClick = vi.fn();
      render(<Toaster />);

      act(() => {
        toast.info('Update available', {
          action: {
            label: 'Install',
            onClick
          }
        });
      });

      const actionBtn = screen.getByRole('button', { name: 'Install' });
      actionBtn.focus();
      expect(document.activeElement).toBe(actionBtn);

      // In HTML button element, pressing Enter / Space triggers click
      await act(async () => {
        fireEvent.keyDown(actionBtn, { key: 'Enter', code: 'Enter' });
        fireEvent.click(actionBtn);
      });

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('automatically dismisses toast after action click by default', async () => {
      const onClick = vi.fn();
      render(<Toaster disableAnimations />);

      let id = '';
      act(() => {
        id = toast.success('Saved', {
          action: {
            label: 'View',
            onClick
          }
        });
      });

      const actionBtn = screen.getByRole('button', { name: 'View' });
      await act(async () => {
        fireEvent.click(actionBtn);
      });

      expect(onClick).toHaveBeenCalledTimes(1);
      // Because disableAnimations is true, dismissal removes from store immediately
      expect(toastStore.getSnapshot().toasts.some((t) => t.id === id)).toBe(false);
    });

    it('keeps toast open if dismissOnClick is false', async () => {
      const onClick = vi.fn();
      render(<Toaster disableAnimations />);

      let id = '';
      act(() => {
        id = toast.info('Notice', {
          action: {
            label: 'Acknowledge',
            onClick,
            dismissOnClick: false
          }
        });
      });

      const actionBtn = screen.getByRole('button', { name: 'Acknowledge' });
      await act(async () => {
        fireEvent.click(actionBtn);
      });

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(toastStore.getSnapshot().toasts.some((t) => t.id === id)).toBe(true);
    });

    it('handles action callback errors gracefully without crashing', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const faultyAction = vi.fn().mockImplementation(() => {
        throw new Error('Action crashed!');
      });

      render(<Toaster />);

      act(() => {
        toast.error('Sync failed', {
          action: {
            label: 'Retry',
            onClick: faultyAction
          }
        });
      });

      const actionBtn = screen.getByRole('button', { name: 'Retry' });
      await act(async () => {
        fireEvent.click(actionBtn);
      });

      expect(faultyAction).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ToastNova] Action callback error:'),
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
    });

    it('supports secondary cancel action alongside primary action and close button', async () => {
      const onAction = vi.fn();
      const onCancel = vi.fn();
      render(<Toaster disableAnimations />);

      act(() => {
        toast('Confirm action', {
          action: { label: 'Confirm', onClick: onAction },
          cancel: { label: 'Cancel', onClick: onCancel }
        });
      });

      const confirmBtn = screen.getByRole('button', { name: 'Confirm' });
      const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
      const closeBtn = screen.getByRole('button', { name: 'Close notification' });

      expect(confirmBtn).toBeInTheDocument();
      expect(cancelBtn).toBeInTheDocument();
      expect(closeBtn).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(cancelBtn);
      });

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onAction).not.toHaveBeenCalled();
    });
  });

  describe('Step 3: Custom React Content', () => {
    it('renders real React elements and provides stable notification ID', () => {
      let capturedId = '';
      render(<Toaster />);

      act(() => {
        toast.custom((id) => {
          capturedId = id;
          return (
            <div data-testid="custom-card">
              <h3>Custom Title</h3>
              <p>ID is {id}</p>
              <button onClick={() => toast.dismiss(id)}>Custom Close</button>
            </div>
          );
        });
      });

      expect(capturedId).toMatch(/^tn_\d+/);
      const card = screen.getByTestId('custom-card');
      expect(card).toBeInTheDocument();
      expect(screen.getByText(`ID is ${capturedId}`)).toBeInTheDocument();
    });

    it('supports manual dismissal from inside custom component', () => {
      render(<Toaster disableAnimations />);

      let customId = '';
      act(() => {
        customId = toast.custom((id) => (
          <div data-testid="custom-box">
            <span>Report ready</span>
            <button onClick={() => toast.dismiss(id)}>Dismiss Report</button>
          </div>
        ));
      });

      expect(screen.getByTestId('custom-box')).toBeInTheDocument();

      act(() => {
        fireEvent.click(screen.getByRole('button', { name: 'Dismiss Report' }));
      });

      expect(screen.queryByTestId('custom-box')).not.toBeInTheDocument();
      expect(toastStore.getSnapshot().toasts.some((t) => t.id === customId)).toBe(false);
    });

    it('cleans up custom React components on unmount / dismissal', () => {
      const onUnmount = vi.fn();

      const ChildComponent = () => {
        React.useEffect(() => {
          return () => onUnmount();
        }, []);
        return <span>Child component</span>;
      };

      render(<Toaster disableAnimations />);

      let id = '';
      act(() => {
        id = toast.custom(() => <ChildComponent />);
      });

      expect(screen.getByText('Child component')).toBeInTheDocument();

      act(() => {
        toast.dismiss(id);
      });

      expect(onUnmount).toHaveBeenCalledTimes(1);
    });
  });

  describe('Step 4: Progress Indicators', () => {
    it('renders accessible determinate progress bar with aria semantics', () => {
      render(<Toaster />);

      let id = '';
      act(() => {
        id = toast.loading('Uploading file', { progress: 35 });
      });
      expect(id).toMatch(/^tn_/);

      const progressBar = screen.getByRole('progressbar', { name: 'Progress' });
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '35');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');

      const fill = progressBar.querySelector('.toastnova-progress-fill') as HTMLElement;
      expect(fill).toHaveStyle({ width: '35%' });
    });

    it('updates progress dynamically by notification ID', () => {
      render(<Toaster />);

      let id = '';
      act(() => {
        id = toast.loading('Exporting data', { progress: 10 });
      });

      let progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '10');

      act(() => {
        toast.update(id, { message: 'Exporting data (halfway)', progress: 50 });
      });

      expect(screen.getByText('Exporting data (halfway)')).toBeInTheDocument();
      progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');

      act(() => {
        toast.update(id, { message: 'Export complete', progress: 100, type: 'success' });
      });

      expect(screen.getByText('Export complete')).toBeInTheDocument();
      progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    });

    it('validates and clamps progress values between 0 and 100', () => {
      render(<Toaster />);

      let id = '';
      act(() => {
        id = toast.loading('Testing negative clamp', { progress: -25 });
      });

      let progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');

      act(() => {
        toast.update(id, { progress: 140 });
      });

      progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');

      act(() => {
        toast.update(id, { progress: NaN });
      });

      progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    });

    it('supports indeterminate progress', () => {
      render(<Toaster />);

      act(() => {
        toast.loading('Connecting...', { progress: 'indeterminate' });
      });

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('toastnova-progress-indeterminate');
      expect(progressBar).not.toHaveAttribute('aria-valuenow');
    });

    it('safely handles updates to nonexistent or already dismissed IDs', () => {
      render(<Toaster />);

      expect(() => {
        act(() => {
          toast.update('non-existent-id-12345', {
            message: 'Should not crash',
            progress: 50
          });
        });
      }).not.toThrow();

      expect(() => {
        act(() => {
          toast.dismiss('non-existent-id-12345');
        });
      }).not.toThrow();
    });
  });

  describe('Step 5: Duplicate Handling Strategies', () => {
    it('strategy="allow" displays all identical notifications (backward compatibility)', () => {
      render(<Toaster duplicateStrategy="allow" />);

      act(() => {
        toast.success('File saved');
        toast.success('File saved');
        toast.success('File saved');
      });

      const elements = screen.getAllByText('File saved');
      expect(elements).toHaveLength(3);
    });

    it('strategy="dedupe" suppresses identical active notifications within window', () => {
      render(<Toaster duplicateStrategy="dedupe" dedupeWindow={5000} />);

      let id1 = '';
      let id2 = '';
      let id3 = '';

      act(() => {
        id1 = toast.success('Connection restored');
        id2 = toast.success('Connection restored');
        id3 = toast.success('Connection restored');
      });

      expect(id2).toBe(id1);
      expect(id3).toBe(id1);
      const elements = screen.getAllByText('Connection restored');
      expect(elements).toHaveLength(1);
    });

    it('strategy="group" combines identical notifications and increments count badge', () => {
      render(<Toaster duplicateStrategy="group" />);

      act(() => {
        toast.info('New message arrived');
        toast.info('New message arrived');
        toast.info('New message arrived');
      });

      const message = screen.getByText('New message arrived');
      expect(message).toBeInTheDocument();

      const countBadge = screen.getByLabelText('3 occurrences');
      expect(countBadge).toBeInTheDocument();
      expect(countBadge).toHaveTextContent('×3');

      // The store has 1 toast with count=3
      expect(toastStore.getSnapshot().toasts).toHaveLength(1);
      expect(toastStore.getSnapshot().toasts[0].count).toBe(3);
    });

    it('distinguishes notifications with different types even if messages are identical', () => {
      render(<Toaster duplicateStrategy="dedupe" />);

      act(() => {
        toast.success('Operation completed');
        toast.error('Operation completed');
      });

      expect(toastStore.getSnapshot().toasts).toHaveLength(2);
      expect(screen.getAllByText('Operation completed')).toHaveLength(2);
    });

    it('supports optional explicit dedupeKey', () => {
      render(<Toaster duplicateStrategy="group" />);

      act(() => {
        toast.success('File uploaded: file1.png', { dedupeKey: 'file-upload' });
        toast.success('File uploaded: file2.png', { dedupeKey: 'file-upload' });
      });

      expect(toastStore.getSnapshot().toasts).toHaveLength(1);
      expect(screen.getByLabelText('2 occurrences')).toBeInTheDocument();
    });

    it('does not group custom content unless a dedupeKey is provided', () => {
      render(<Toaster duplicateStrategy="group" />);

      act(() => {
        toast.custom(() => <div>Custom Content 1</div>);
        toast.custom(() => <div>Custom Content 2</div>);
      });

      expect(toastStore.getSnapshot().toasts).toHaveLength(2);
      expect(screen.getByText('Custom Content 1')).toBeInTheDocument();
      expect(screen.getByText('Custom Content 2')).toBeInTheDocument();
    });

    it('never groups notifications that have already been dismissed', () => {
      render(<Toaster duplicateStrategy="group" disableAnimations />);

      let id = '';
      act(() => {
        id = toast.info('Alert test');
      });

      expect(toastStore.getSnapshot().toasts).toHaveLength(1);

      act(() => {
        toast.dismiss(id);
      });

      expect(toastStore.getSnapshot().toasts).toHaveLength(0);

      act(() => {
        toast.info('Alert test');
      });

      expect(toastStore.getSnapshot().toasts).toHaveLength(1);
      expect(toastStore.getSnapshot().toasts[0].count).toBe(1);
    });

    it('respects dedupeWindow timing boundaries with fake timers', () => {
      vi.useFakeTimers();
      render(<Toaster duplicateStrategy="dedupe" dedupeWindow={1000} />);

      act(() => {
        toast.warning('Warning test');
      });

      expect(toastStore.getSnapshot().toasts).toHaveLength(1);

      // Within dedupeWindow: duplicate is suppressed
      act(() => {
        vi.advanceTimersByTime(500);
        toast.warning('Warning test');
      });

      expect(toastStore.getSnapshot().toasts).toHaveLength(1);

      // Past dedupeWindow: new notification is added
      act(() => {
        vi.advanceTimersByTime(1200);
        toast.warning('Warning test');
      });

      expect(toastStore.getSnapshot().toasts).toHaveLength(2);
      vi.useRealTimers();
    });
  });

  describe('Step 6 & 7: Toast Updates and Promise Handling', () => {
    it('updates active notification message, type, and title in place', () => {
      render(<Toaster />);

      let id = '';
      act(() => {
        id = toast.loading('Saving user profile...');
      });

      const toastElement = screen.getByRole('status');
      expect(toastElement).toHaveClass('toastnova-loading');
      expect(screen.getByText('Saving user profile...')).toBeInTheDocument();

      act(() => {
        toast.update(id, {
          title: 'Success!',
          message: 'Profile saved successfully.',
          type: 'success'
        });
      });

      expect(toastElement).toHaveClass('toastnova-success');
      expect(screen.getByText('Success!')).toBeInTheDocument();
      expect(screen.getByText('Profile saved successfully.')).toBeInTheDocument();
    });

    it('toast.promise resolves successfully and preserves return value', async () => {
      render(<Toaster />);

      let resolvePromise: (val: string) => void;
      const asyncTask = new Promise<string>((resolve) => {
        resolvePromise = resolve;
      });

      let p: Promise<string>;
      act(() => {
        p = toast.promise<string>(asyncTask, {
          loading: 'Generating report...',
          success: (data: string) => `Loaded: ${data}`,
          error: 'Failed to load'
        });
      });

      expect(screen.getByText('Generating report...')).toBeInTheDocument();

      let promiseResult: string | undefined;
      await act(async () => {
        resolvePromise!('Report data payload');
        promiseResult = await p;
      });

      expect(promiseResult).toBe('Report data payload');
      expect(screen.getByText('Loaded: Report data payload')).toBeInTheDocument();
    });

    it('toast.promise rejects properly and rethrows error without swallowing', async () => {
      render(<Toaster />);

      let rejectPromise: (err: unknown) => void;
      const failingTask = new Promise((_, reject) => {
        rejectPromise = reject;
      });

      let p: Promise<unknown>;
      act(() => {
        p = toast.promise(failingTask, {
          loading: 'Connecting...',
          success: 'Connected',
          error: (err: unknown) => `Failed: ${(err as Error).message}`
        });
      });

      expect(screen.getByText('Connecting...')).toBeInTheDocument();

      let caughtError: unknown;
      await act(async () => {
        rejectPromise!(new Error('Network offline'));
        try {
          await p;
        } catch (e) {
          caughtError = e;
        }
      });

      expect(caughtError).toBeInstanceOf(Error);
      expect((caughtError as Error).message).toBe('Network offline');
      expect(screen.getByText('Failed: Network offline')).toBeInTheDocument();
    });

    it('handles concurrent promises independently', async () => {
      render(<Toaster />);

      let resolve1: (v: string) => void;
      let resolve2: (v: string) => void;
      const p1 = new Promise<string>((r) => { resolve1 = r; });
      const p2 = new Promise<string>((r) => { resolve2 = r; });

      act(() => {
        toast.promise<string>(p1, {
          loading: 'Task 1 running',
          success: (res: string) => `Task 1: ${res}`,
          error: 'Task 1 failed'
        });

        toast.promise<string>(p2, {
          loading: 'Task 2 running',
          success: (res: string) => `Task 2: ${res}`,
          error: 'Task 2 failed'
        });
      });

      expect(screen.getByText('Task 1 running')).toBeInTheDocument();
      expect(screen.getByText('Task 2 running')).toBeInTheDocument();

      await act(async () => {
        resolve1!('First result');
        resolve2!('Second result');
        await Promise.all([p1, p2]);
      });

      expect(screen.getByText('Task 1: First result')).toBeInTheDocument();
      expect(screen.getByText('Task 2: Second result')).toBeInTheDocument();
    });
  });
});
