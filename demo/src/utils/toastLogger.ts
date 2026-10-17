import { toastStore } from 'toastnova';
import type { Toast } from 'toastnova';

export interface ToastLogEntry {
  id: string;
  toastId: string;
  timestamp: string;
  timeRaw: number;
  event: 'triggered' | 'updated' | 'dismissed' | 'removed';
  type: string;
  title?: string;
  message: string;
  source?: string;
  duration?: number;
  progress?: number | 'indeterminate';
  action?: { label: string };
  details?: Record<string, any>;
}

type LogListener = (logs: ToastLogEntry[]) => void;

class ToastLoggerService {
  private logs: ToastLogEntry[] = [];
  private listeners: Set<LogListener> = new Set();
  private prevToastsMap: Map<string, Toast> = new Map();
  private initialized = false;

  constructor() {
    this.initStoreListener();
  }

  private initStoreListener() {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    // Seed initial state
    const initialSnapshot = toastStore.getSnapshot();
    for (const t of initialSnapshot.toasts) {
      this.prevToastsMap.set(t.id, { ...t });
    }

    // Subscribe to real-time store changes
    toastStore.subscribe(() => {
      const currentSnapshot = toastStore.getSnapshot();
      const currentMap = new Map<string, Toast>();

      for (const t of currentSnapshot.toasts) {
        currentMap.set(t.id, t);
        const prev = this.prevToastsMap.get(t.id);

        const safeTitle = typeof t.title === 'string' ? t.title : t.title ? '[Custom Title]' : undefined;
        const safeProgress = t.progress === null ? undefined : t.progress;
        const safeAction = t.action ? { label: typeof t.action.label === 'string' ? t.action.label : 'Action' } : undefined;

        if (!prev) {
          // Brand new toast triggered
          this.addLog({
            toastId: t.id,
            event: 'triggered',
            type: t.type,
            title: safeTitle,
            message: typeof t.message === 'string' ? t.message : '[Custom JSX Content]',
            duration: t.duration,
            progress: safeProgress,
            action: safeAction,
            details: {
              id: t.id,
              type: t.type,
              title: safeTitle || null,
              message: typeof t.message === 'string' ? t.message : '[Custom JSX Content]',
              duration: t.duration,
              progress: safeProgress ?? null,
              action: safeAction?.label ?? null,
              dismissible: t.dismissible,
              createdAt: t.createdAt
            }
          });
        } else if (
          prev.type !== t.type ||
          prev.message !== t.message ||
          prev.progress !== t.progress ||
          prev.title !== t.title
        ) {
          // Existing toast updated
          this.addLog({
            toastId: t.id,
            event: 'updated',
            type: t.type,
            title: safeTitle,
            message: typeof t.message === 'string' ? t.message : '[Custom JSX Content]',
            duration: t.duration,
            progress: safeProgress,
            action: safeAction,
            details: {
              updatedId: t.id,
              previousType: prev.type,
              newType: t.type,
              newProgress: safeProgress ?? null,
              message: typeof t.message === 'string' ? t.message : '[Custom JSX Content]'
            }
          });
        }
      }

      // Check for removed / dismissed toasts
      for (const [id, prev] of this.prevToastsMap.entries()) {
        if (!currentMap.has(id)) {
          const prevSafeTitle = typeof prev.title === 'string' ? prev.title : prev.title ? '[Custom Title]' : undefined;
          this.addLog({
            toastId: id,
            event: 'dismissed',
            type: prev.type,
            title: prevSafeTitle,
            message: typeof prev.message === 'string' ? prev.message : '[Custom JSX Content]',
            details: {
              dismissedId: id,
              activeLifetime: `${Date.now() - prev.createdAt}ms`
            }
          });
        }
      }

      this.prevToastsMap = currentMap;
    });
  }

  public addLog(entry: Omit<ToastLogEntry, 'id' | 'timestamp' | 'timeRaw'>) {
    const now = new Date();
    const timeFormatted = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');

    const newLog: ToastLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: timeFormatted,
      timeRaw: Date.now(),
      ...entry
    };

    this.logs = [newLog, ...this.logs.slice(0, 49)]; // Keep latest 50
    this.notify();
  }

  public getLogs(): ToastLogEntry[] {
    return this.logs;
  }

  public clearLogs() {
    this.logs = [];
    this.notify();
  }

  public subscribe(listener: LogListener): () => void {
    this.listeners.add(listener);
    listener(this.logs);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener(this.logs);
    }
  }
}

export const toastLogger = new ToastLoggerService();
