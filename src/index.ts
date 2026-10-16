import './styles.css';

export { Toaster } from './components/Toaster';
export { ToastItem } from './components/ToastItem';
export type { ToastItemProps } from './components/ToastItem';
export { toast } from './core/toast';
export type { ToastFunction } from './core/toast';
export { toastStore, generateToastId } from './core/store';
export { BUILTIN_THEMES, BUILTIN_ANIMATIONS } from './core/types';
export type {
  Toast,
  ToastType,
  ToastPosition,
  ToastTheme,
  ToastAnimationPreset,
  ToastContent,
  CustomToastRenderer,
  ToastOptions,
  ToastUpdateOptions,
  ToastAction,
  ToastDuplicateStrategy,
  PromiseMessages,
  ToasterProps,
  ToastStoreState
} from './core/types';
