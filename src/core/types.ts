import type { ReactNode, CSSProperties } from 'react';

export type ToastType = 'default' | 'success' | 'error' | 'info' | 'warning' | 'loading' | 'custom';

export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center';

export type ToastTheme = 'glass' | 'neon' | 'minimal' | 'gradient' | 'light' | 'dark';

export const BUILTIN_THEMES: readonly ToastTheme[] = [
  'glass',
  'neon',
  'minimal',
  'gradient',
  'light',
  'dark'
] as const;

export type ToastAnimationPreset = 'slide' | 'fade' | 'bounce' | 'spring' | 'none';

export const BUILTIN_ANIMATIONS: readonly ToastAnimationPreset[] = [
  'slide',
  'fade',
  'bounce',
  'spring',
  'none'
] as const;

export type ToastDuplicateStrategy = 'allow' | 'dedupe' | 'group';

export type ToastContent = ReactNode | ((props: { id: string; dismiss: () => void }) => ReactNode);

export type CustomToastRenderer = (id: string) => ReactNode;

export interface ToastAction {
  /** Button label text or React element */
  label: ReactNode;
  /** Click handler callback */
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  /** Whether clicking the action button automatically dismisses the toast. Default: true */
  dismissOnClick?: boolean;
  /** Accessible name override */
  ariaLabel?: string;
  /** Custom CSS class names applied to the action button */
  className?: string;
  /** Custom inline styles applied to the action button */
  style?: CSSProperties;
}

export interface ToastOptions {
  /** Optional custom ID for this notification */
  id?: string;
  /** Optional title heading for the toast */
  title?: ReactNode;
  /** Duration in milliseconds before auto-dismissal. Set to 0 or Infinity to prevent auto-dismissal. */
  duration?: number;
  /** Whether the notification includes a close button. Default: true (false for custom toasts unless specified) */
  dismissible?: boolean;
  /** Custom CSS class names applied to the toast container */
  className?: string;
  /** Custom inline styles applied to the toast container */
  style?: CSSProperties;
  /** Custom icon override */
  icon?: ReactNode;
  /** Primary action button */
  action?: ToastAction;
  /** Secondary cancel/dismiss action button */
  cancel?: ToastAction;
  /** Long-running task progress value (0 to 100) or 'indeterminate' */
  progress?: number | 'indeterminate' | null;
  /** Custom deduplication key to explicitly identify identical notifications */
  dedupeKey?: string;
  /** Callback fired when the notification is dismissed */
  onDismiss?: (id: string) => void;
}

export interface ToastUpdateOptions extends Partial<Omit<ToastOptions, 'id'>> {
  message?: ToastContent;
  type?: ToastType;
  /** Whether to reset the auto-dismiss timer on update. Default: true when type changes, otherwise false unless specified */
  resetTimer?: boolean;
  /** Internal transition state */
  dismissing?: boolean;
}

export interface Toast extends ToastOptions {
  id: string;
  type: ToastType;
  message: ToastContent;
  createdAt: number;
  /** Internal flag set when the toast begins its exit transition */
  dismissing?: boolean;
  /** Repetition count when duplicateStrategy="group" */
  count?: number;
}

export interface PromiseMessages<T = unknown> {
  loading: ToastContent;
  success: ToastContent | ((data: T) => ToastContent);
  error: ToastContent | ((error: unknown) => ToastContent);
}

export interface ToasterProps {
  /** Visual theme. Default: 'glass' */
  theme?: ToastTheme;
  /** Screen position for the toasts. Default: 'top-right' */
  position?: ToastPosition;
  /** Animation preset for entrance and exit. Default: 'slide' */
  animation?: ToastAnimationPreset;
  /** Custom animation duration in milliseconds. Default: 220 */
  animationDuration?: number;
  /** Spacing between stacked notifications in pixels. Default: 10 */
  stackGap?: number;
  /** Enable touch and pointer swipe-to-dismiss. Default: true */
  swipeToDismiss?: boolean;
  /** Default duration in milliseconds for auto-dismissal. Default: 4000 */
  duration?: number;
  /** Maximum number of toasts displayed simultaneously. Excess are queued. Default: 5 */
  maxVisible?: number;
  /** Strategy for handling repeated notifications: 'allow' | 'dedupe' | 'group'. Default: 'allow' */
  duplicateStrategy?: ToastDuplicateStrategy;
  /** Time window in milliseconds to consider notifications as duplicates. Default: 0 (entire active lifespan) */
  dedupeWindow?: number;
  /** Pause auto-dismiss timer on pointer hover. Default: true */
  pauseOnHover?: boolean;
  /** Pause auto-dismiss timer when keyboard focus is inside toast. Default: true */
  pauseOnFocus?: boolean;
  /** Disable entrance and exit animations. Equivalent to animation="none". Default: false */
  disableAnimations?: boolean;
  /** Custom CSS class names for the toaster container */
  className?: string;
  /** Custom inline styles for the toaster container */
  style?: CSSProperties;
}

export interface ToastStoreState {
  toasts: Toast[];
  queue: Toast[];
  maxVisible: number;
  duplicateStrategy: ToastDuplicateStrategy;
  dedupeWindow: number;
}
