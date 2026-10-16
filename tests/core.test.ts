import { describe, it, expect, beforeEach, vi } from 'vitest';
import { toast } from '../src/core/toast';
import { toastStore } from '../src/core/store';

describe('Toast Store and Core Engine', () => {
  beforeEach(() => {
    toastStore.clear();
    toastStore.setMaxVisible(5);
  });

  // 1. Every notification type
  it('dispatches every notification type correctly', () => {
    const successId = toast.success('Success message');
    const errorId = toast.error('Error message');
    const infoId = toast.info('Info message');
    const warningId = toast.warning('Warning message');
    const loadingId = toast.loading('Loading message');
    const defaultId = toast('Default message');

    expect(successId).toBeTruthy();
    expect(errorId).toBeTruthy();
    expect(infoId).toBeTruthy();
    expect(warningId).toBeTruthy();
    expect(loadingId).toBeTruthy();
    expect(defaultId).toBeTruthy();

    const state = toastStore.getSnapshot();
    expect(state.toasts).toHaveLength(5); // maxVisible is 5
    expect(state.queue).toHaveLength(1); // 6th is queued

    const types = state.toasts.map((t) => t.type);
    expect(types).toEqual(['success', 'error', 'info', 'warning', 'loading']);

    expect(state.toasts[0].message).toBe('Success message');
    expect(state.toasts[1].message).toBe('Error message');
    expect(state.toasts[2].message).toBe('Info message');
    expect(state.toasts[3].message).toBe('Warning message');
    expect(state.toasts[4].message).toBe('Loading message');

    expect(state.queue[0].type).toBe('default');
    expect(state.queue[0].message).toBe('Default message');
  });

  // 2. Unique IDs
  it('assigns unique IDs to each notification', () => {
    const id1 = toast.success('First');
    const id2 = toast.success('Second');
    const id3 = toast.success('Third');

    expect(id1).toBeDefined();
    expect(id2).toBeDefined();
    expect(id3).toBeDefined();
    expect(id1).not.toBe(id2);
    expect(id2).not.toBe(id3);
    expect(id1).not.toBe(id3);
  });

  // 3. Dismissing one notification
  it('dismisses a single notification by id', () => {
    const id1 = toast.success('Toast 1');
    const id2 = toast.error('Toast 2');

    expect(toastStore.getSnapshot().toasts).toHaveLength(2);

    toast.dismiss(id1);

    const toasts = toastStore.getSnapshot().toasts;
    const target = toasts.find((t) => t.id === id1);
    const untouched = toasts.find((t) => t.id === id2);

    expect(target?.dismissing).toBe(true);
    expect(untouched?.dismissing).toBe(false);

    // After removal
    toastStore.removeToast(id1);
    expect(toastStore.getSnapshot().toasts).toHaveLength(1);
    expect(toastStore.getSnapshot().toasts[0].id).toBe(id2);
  });

  // 4. Dismissing all notifications
  it('dismisses all visible notifications and clears queue', () => {
    toastStore.setMaxVisible(2);

    toast.info('Toast 1');
    toast.info('Toast 2');
    toast.info('Toast 3 (in queue)');
    toast.info('Toast 4 (in queue)');

    expect(toastStore.getSnapshot().toasts).toHaveLength(2);
    expect(toastStore.getSnapshot().queue).toHaveLength(2);

    toast.dismiss();

    const state = toastStore.getSnapshot();
    expect(state.queue).toHaveLength(0); // queue immediately cleared
    expect(state.toasts.every((t) => t.dismissing === true)).toBe(true);
  });

  // 6. Per-toast duration overrides
  it('respects per-toast duration override', () => {
    const id = toast.success('Custom duration', { duration: 1234 });
    const toastItem = toastStore.getSnapshot().toasts.find((t) => t.id === id);
    expect(toastItem?.duration).toBe(1234);
  });

  // 7. Promise success
  it('updates notification on promise success and returns resolution value', async () => {
    const asyncOperation = () =>
      new Promise<string>((resolve) => {
        setTimeout(() => resolve('Finished successfully'), 50);
      });

    const promise = toast.promise(asyncOperation, {
      loading: 'Processing...',
      success: (data: string) => `Success: ${data}`,
      error: 'Failed!'
    });

    // Check immediate loading state
    const loadingState = toastStore.getSnapshot().toasts[0];
    expect(loadingState.type).toBe('loading');
    expect(loadingState.message).toBe('Processing...');

    const result = await promise;
    expect(result).toBe('Finished successfully');

    // Check updated success state on same toast
    const successState = toastStore.getSnapshot().toasts[0];
    expect(successState.id).toBe(loadingState.id);
    expect(successState.type).toBe('success');
    expect(successState.message).toBe('Success: Finished successfully');
  });

  // 8. Promise rejection and preservation of rejection behavior
  it('updates notification on promise rejection and preserves rejection behavior', async () => {
    const customError = new Error('Database connection failed');
    const failingOperation = () =>
      new Promise<string>((_, reject) => {
        setTimeout(() => reject(customError), 50);
      });

    const promise = toast.promise(failingOperation, {
      loading: 'Connecting...',
      success: 'Connected!',
      error: (err: unknown) => `Error: ${(err as Error).message}`
    });

    const loadingState = toastStore.getSnapshot().toasts[0];
    expect(loadingState.type).toBe('loading');
    expect(loadingState.message).toBe('Connecting...');

    await expect(promise).rejects.toThrow('Database connection failed');

    // Check updated error state on same toast
    const errorState = toastStore.getSnapshot().toasts[0];
    expect(errorState.id).toBe(loadingState.id);
    expect(errorState.type).toBe('error');
    expect(errorState.message).toBe('Error: Database connection failed');
  });

  // 9. Maximum visible count and queue handling
  it('handles maximum visible count and promotes queued items when visible ones are removed', () => {
    toastStore.setMaxVisible(2);

    const id1 = toast.info('Toast 1');
    const id2 = toast.info('Toast 2');
    const id3 = toast.info('Toast 3');
    const id4 = toast.info('Toast 4');

    let state = toastStore.getSnapshot();
    expect(state.toasts.map((t) => t.id)).toEqual([id1, id2]);
    expect(state.queue.map((t) => t.id)).toEqual([id3, id4]);

    // Remove first visible toast
    toastStore.removeToast(id1);

    state = toastStore.getSnapshot();
    // id3 should have been promoted to visible
    expect(state.toasts.map((t) => t.id)).toEqual([id2, id3]);
    expect(state.queue.map((t) => t.id)).toEqual([id4]);

    // Remove id2
    toastStore.removeToast(id2);

    state = toastStore.getSnapshot();
    // id4 should have been promoted to visible
    expect(state.toasts.map((t) => t.id)).toEqual([id3, id4]);
    expect(state.queue).toHaveLength(0);
  });

  // 10. Multiple notifications created concurrently
  it('handles multiple notifications created concurrently without race conditions', () => {
    const ids = Array.from({ length: 20 }, (_, i) => toast.info(`Toast #${i + 1}`));

    expect(new Set(ids).size).toBe(20);

    const state = toastStore.getSnapshot();
    expect(state.toasts).toHaveLength(5);
    expect(state.queue).toHaveLength(15);
  });

  // 12. Timer and subscription cleanup
  it('subscribes and cleans up listener subscriptions correctly', () => {
    const listener = vi.fn();
    const unsubscribe = toastStore.subscribe(listener);

    toast.success('Trigger 1');
    expect(listener).toHaveBeenCalledTimes(1);

    toast.error('Trigger 2');
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();

    toast.info('Trigger 3');
    expect(listener).toHaveBeenCalledTimes(2); // no further calls after unsubscribe
  });
});
