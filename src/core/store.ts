import type { Toast, ToastStoreState, ToastDuplicateStrategy, ToastUpdateOptions } from './types';

let idCounter = 0;

export function generateToastId(): string {
  idCounter += 1;
  const rand = Math.random().toString(36).substring(2, 8);
  return `tn_${Date.now()}_${idCounter}_${rand}`;
}

type Listener = () => void;

const SERVER_SNAPSHOT: ToastStoreState = Object.freeze({
  toasts: [],
  queue: [],
  maxVisible: 5,
  duplicateStrategy: 'allow',
  dedupeWindow: 0
});

class ToastStore {
  private state: ToastStoreState = {
    toasts: [],
    queue: [],
    maxVisible: 5,
    duplicateStrategy: 'allow',
    dedupeWindow: 0
  };

  private listeners: Set<Listener> = new Set();

  private emit(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  public subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  public getSnapshot = (): ToastStoreState => {
    return this.state;
  };

  public getServerSnapshot = (): ToastStoreState => {
    return SERVER_SNAPSHOT;
  };

  public setMaxVisible(maxVisible: number): void {
    if (typeof maxVisible !== 'number' || maxVisible < 1) {
      maxVisible = 5;
    }
    if (this.state.maxVisible === maxVisible) return;

    let nextToasts = [...this.state.toasts];
    let nextQueue = [...this.state.queue];

    // If new limit is higher, promote queued items
    while (nextToasts.length < maxVisible && nextQueue.length > 0) {
      const promoted = nextQueue.shift();
      if (promoted) {
        nextToasts.push(promoted);
      }
    }

    // If new limit is lower, demote excess visible items back to the head of the queue
    while (nextToasts.length > maxVisible) {
      const demoted = nextToasts.pop();
      if (demoted) {
        nextQueue.unshift(demoted);
      }
    }

    this.state = {
      ...this.state,
      toasts: nextToasts,
      queue: nextQueue,
      maxVisible
    };

    this.emit();
  }

  public setDuplicateConfig(strategy?: ToastDuplicateStrategy, dedupeWindow?: number): void {
    const nextStrategy = strategy || 'allow';
    const nextWindow = typeof dedupeWindow === 'number' && dedupeWindow >= 0 ? dedupeWindow : 0;
    if (this.state.duplicateStrategy === nextStrategy && this.state.dedupeWindow === nextWindow) {
      return;
    }
    this.state = {
      ...this.state,
      duplicateStrategy: nextStrategy,
      dedupeWindow: nextWindow
    };
  }

  private isDuplicate(existing: Toast, incoming: Omit<Toast, 'createdAt' | 'id'> & { id?: string }): boolean {
    if (existing.dismissing) return false;

    // Distinguish notifications with different types
    if (existing.type !== incoming.type) return false;

    // If explicit dedupeKey is provided, compare by key
    if (incoming.dedupeKey) {
      if (existing.dedupeKey !== incoming.dedupeKey) return false;
    } else {
      // Do not group or dedupe custom content unless a deduplication key is provided
      if (incoming.type === 'custom' || typeof incoming.message !== 'string') {
        return false;
      }
      // Compare by message string and optional title
      if (existing.message !== incoming.message) return false;
      if (existing.title !== incoming.title) return false;
    }

    // Check time window if dedupeWindow > 0
    if (this.state.dedupeWindow > 0) {
      const elapsed = Date.now() - existing.createdAt;
      if (elapsed > this.state.dedupeWindow) {
        return false;
      }
    }

    return true;
  }

  public addToast(input: Omit<Toast, 'createdAt' | 'id'> & { id?: string }): string {
    const id = input.id || generateToastId();

    // On the server (SSR / Node.js), return generated ID without retaining state in memory
    if (typeof window === 'undefined') {
      return id;
    }

    // Check if toast with exact ID already exists in visible toasts or queue
    if (input.id) {
      const existingVisibleIndex = this.state.toasts.findIndex((t) => t.id === input.id);
      if (existingVisibleIndex !== -1) {
        this.updateToast(input.id, input);
        return input.id;
      }

      const existingQueueIndex = this.state.queue.findIndex((t) => t.id === input.id);
      if (existingQueueIndex !== -1) {
        this.updateToast(input.id, input);
        return input.id;
      }
    }

    // Handle duplicate strategies ('dedupe' or 'group')
    if (this.state.duplicateStrategy !== 'allow') {
      const matchVisibleIndex = this.state.toasts.findIndex((t) => this.isDuplicate(t, input));
      if (matchVisibleIndex !== -1) {
        const match = this.state.toasts[matchVisibleIndex];
        if (this.state.duplicateStrategy === 'dedupe') {
          return match.id;
        }
        if (this.state.duplicateStrategy === 'group') {
          const nextToasts = [...this.state.toasts];
          const newCount = (match.count || 1) + 1;
          nextToasts[matchVisibleIndex] = {
            ...match,
            count: newCount,
            createdAt: Date.now() // Reset timer on grouping
          };
          this.state = {
            ...this.state,
            toasts: nextToasts
          };
          this.emit();
          return match.id;
        }
      }

      const matchQueueIndex = this.state.queue.findIndex((t) => this.isDuplicate(t, input));
      if (matchQueueIndex !== -1) {
        const match = this.state.queue[matchQueueIndex];
        if (this.state.duplicateStrategy === 'dedupe') {
          return match.id;
        }
        if (this.state.duplicateStrategy === 'group') {
          const nextQueue = [...this.state.queue];
          nextQueue[matchQueueIndex] = {
            ...match,
            count: (match.count || 1) + 1,
            createdAt: Date.now()
          };
          this.state = {
            ...this.state,
            queue: nextQueue
          };
          this.emit();
          return match.id;
        }
      }
    }

    // Clamping progress if passed as number
    let safeProgress = input.progress;
    if (typeof safeProgress === 'number') {
      if (isNaN(safeProgress)) {
        safeProgress = 0;
      } else {
        safeProgress = Math.min(100, Math.max(0, safeProgress));
      }
    }

    const newToast: Toast = {
      dismissible: input.type === 'custom' ? false : true,
      ...input,
      progress: safeProgress,
      id,
      createdAt: Date.now(),
      dismissing: false,
      count: 1
    };

    let nextToasts = [...this.state.toasts];
    let nextQueue = [...this.state.queue];

    if (nextToasts.length < this.state.maxVisible) {
      nextToasts.push(newToast);
    } else {
      nextQueue.push(newToast);
    }

    this.state = {
      ...this.state,
      toasts: nextToasts,
      queue: nextQueue
    };

    this.emit();
    return id;
  }

  public updateToast(id: string, updates: ToastUpdateOptions): void {
    if (typeof window === 'undefined') return;
    if (!id) return;

    // Validate and clamp progress if provided as a number
    let safeProgress = updates.progress;
    if (typeof safeProgress === 'number') {
      if (isNaN(safeProgress)) {
        safeProgress = 0;
      } else {
        safeProgress = Math.min(100, Math.max(0, safeProgress));
      }
    }

    const normalizedUpdates = {
      ...updates,
      ...(safeProgress !== undefined ? { progress: safeProgress } : {})
    };

    const visibleIndex = this.state.toasts.findIndex((t) => t.id === id);
    if (visibleIndex !== -1) {
      const current = this.state.toasts[visibleIndex];
      const shouldResetTimer =
        updates.resetTimer ??
        (updates.type !== undefined && updates.type !== current.type);

      const updated: Toast = {
        ...current,
        ...normalizedUpdates,
        id: current.id, // prevent ID modification
        createdAt: shouldResetTimer ? Date.now() : current.createdAt,
        dismissing: updates.dismissing ?? current.dismissing
      };

      const nextToasts = [...this.state.toasts];
      nextToasts[visibleIndex] = updated;

      this.state = {
        ...this.state,
        toasts: nextToasts
      };

      this.emit();
      return;
    }

    const queueIndex = this.state.queue.findIndex((t) => t.id === id);
    if (queueIndex !== -1) {
      const current = this.state.queue[queueIndex];
      const updated: Toast = {
        ...current,
        ...normalizedUpdates,
        id: current.id
      };

      const nextQueue = [...this.state.queue];
      nextQueue[queueIndex] = updated;

      this.state = {
        ...this.state,
        queue: nextQueue
      };

      this.emit();
    }
  }

  public dismissToast(id?: string): void {
    if (typeof window === 'undefined') return;
    if (id) {
      // Dismiss specific toast
      // If in queue, remove immediately
      const queueIndex = this.state.queue.findIndex((t) => t.id === id);
      if (queueIndex !== -1) {
        const item = this.state.queue[queueIndex];
        const nextQueue = this.state.queue.filter((t) => t.id !== id);
        this.state = { ...this.state, queue: nextQueue };
        item.onDismiss?.(id);
        this.emit();
        return;
      }

      // If in visible toasts, mark dismissing
      const visibleIndex = this.state.toasts.findIndex((t) => t.id === id);
      if (visibleIndex !== -1) {
        const current = this.state.toasts[visibleIndex];
        if (current.dismissing) return; // already dismissing

        const nextToasts = [...this.state.toasts];
        nextToasts[visibleIndex] = { ...current, dismissing: true };
        this.state = { ...this.state, toasts: nextToasts };
        current.onDismiss?.(id);
        this.emit();
      }
    } else {
      // Dismiss all
      if (this.state.toasts.length === 0 && this.state.queue.length === 0) return;

      // Clear queue completely
      for (const item of this.state.queue) {
        item.onDismiss?.(item.id);
      }

      // Mark all visible toasts as dismissing
      const nextToasts = this.state.toasts.map((toast) => {
        toast.onDismiss?.(toast.id);
        return { ...toast, dismissing: true };
      });

      this.state = {
        ...this.state,
        toasts: nextToasts,
        queue: []
      };

      this.emit();
    }
  }

  public removeToast(id: string): void {
    if (typeof window === 'undefined') return;
    const existsInVisible = this.state.toasts.some((t) => t.id === id);
    const existsInQueue = this.state.queue.some((t) => t.id === id);

    if (!existsInVisible && !existsInQueue) return;

    let nextToasts = this.state.toasts.filter((t) => t.id !== id);
    let nextQueue = this.state.queue.filter((t) => t.id !== id);

    // Promote next toast from queue if slot available
    while (nextToasts.length < this.state.maxVisible && nextQueue.length > 0) {
      const promoted = nextQueue.shift();
      if (promoted) {
        nextToasts.push(promoted);
      }
    }

    this.state = {
      ...this.state,
      toasts: nextToasts,
      queue: nextQueue
    };

    this.emit();
  }

  public clear(): void {
    this.state = {
      toasts: [],
      queue: [],
      maxVisible: this.state.maxVisible,
      duplicateStrategy: this.state.duplicateStrategy,
      dedupeWindow: this.state.dedupeWindow
    };
    this.emit();
  }
}

export const toastStore = new ToastStore();
