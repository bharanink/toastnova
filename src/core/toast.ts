import { toastStore, generateToastId } from './store';
import type { ToastContent, ToastOptions, PromiseMessages, ToastType, ToastUpdateOptions } from './types';
import type { ReactNode } from 'react';

function createToast(message: ToastContent, type: ToastType = 'default', options?: ToastOptions): string {
  return toastStore.addToast({
    message,
    type,
    ...options
  });
}

export interface ToastFunction {
  (message: ToastContent, options?: ToastOptions): string;
  success: (message: ToastContent, options?: ToastOptions) => string;
  error: (message: ToastContent, options?: ToastOptions) => string;
  info: (message: ToastContent, options?: ToastOptions) => string;
  warning: (message: ToastContent, options?: ToastOptions) => string;
  loading: (message: ToastContent, options?: ToastOptions) => string;
  custom: {
    (renderer: (id: string) => ReactNode, options?: ToastOptions): string;
    (renderer: ReactNode, options?: ToastOptions): string;
  };
  update: (id: string, updates: ToastUpdateOptions) => void;
  dismiss: (id?: string) => void;
  remove: (id: string) => void;
  promise: <T>(
    promise: Promise<T> | (() => Promise<T>),
    messages: PromiseMessages<T>,
    options?: ToastOptions
  ) => Promise<T>;
}

const baseToast = (message: ToastContent, options?: ToastOptions): string => {
  return createToast(message, 'default', options);
};

baseToast.success = (message: ToastContent, options?: ToastOptions): string => {
  return createToast(message, 'success', options);
};

baseToast.error = (message: ToastContent, options?: ToastOptions): string => {
  return createToast(message, 'error', options);
};

baseToast.info = (message: ToastContent, options?: ToastOptions): string => {
  return createToast(message, 'info', options);
};

baseToast.warning = (message: ToastContent, options?: ToastOptions): string => {
  return createToast(message, 'warning', options);
};

baseToast.loading = (message: ToastContent, options?: ToastOptions): string => {
  return createToast(message, 'loading', {
    duration: Infinity,
    ...options
  });
};

baseToast.custom = (
  renderer: ToastContent | ((id: string) => ReactNode),
  options?: ToastOptions
): string => {
  const wrappedMessage: ToastContent =
    typeof renderer === 'function'
      ? (props: { id: string; dismiss: () => void }) => {
          const str = renderer.toString().trim();
          if (
            /^(?:async\s*)?(?:function\s*\w*\s*)?\(\s*\{/.test(str) ||
            str.includes('props.') ||
            str.includes('props[')
          ) {
            return (renderer as any)(props);
          }
          return (renderer as any)(props.id, props);
        }
      : renderer;

  return toastStore.addToast({
    type: 'custom',
    message: wrappedMessage,
    dismissible: options?.dismissible ?? false,
    ...options
  });
};

baseToast.update = (id: string, updates: ToastUpdateOptions): void => {
  toastStore.updateToast(id, updates);
};

baseToast.dismiss = (id?: string): void => {
  toastStore.dismissToast(id);
};

baseToast.remove = (id: string): void => {
  toastStore.removeToast(id);
};

baseToast.promise = async <T>(
  promise: Promise<T> | (() => Promise<T>),
  messages: PromiseMessages<T>,
  options?: ToastOptions
): Promise<T> => {
  const id = options?.id || generateToastId();

  // Create initial loading toast with Infinity duration (no auto-dismiss during pending state)
  toastStore.addToast({
    id,
    type: 'loading',
    message: messages.loading,
    duration: Infinity,
    dismissible: true,
    ...options
  });

  let promiseInstance: Promise<T>;
  try {
    promiseInstance = typeof promise === 'function' ? promise() : promise;
  } catch (syncError) {
    let errorMsg: ToastContent;
    try {
      errorMsg =
        typeof messages.error === 'function'
          ? (messages.error as (err: unknown) => ToastContent)(syncError)
          : messages.error;
    } catch (_) {
      errorMsg = 'An error occurred';
    }

    toastStore.updateToast(id, {
      type: 'error',
      message: errorMsg,
      duration: options?.duration
    });
    throw syncError;
  }

  try {
    const data = await promiseInstance;
    let successMsg: ToastContent;
    try {
      successMsg =
        typeof messages.success === 'function'
          ? (messages.success as (data: T) => ToastContent)(data)
          : messages.success;
    } catch (_) {
      successMsg = 'Operation succeeded';
    }

    toastStore.updateToast(id, {
      type: 'success',
      message: successMsg,
      duration: options?.duration
    });

    return data;
  } catch (error) {
    let errorMsg: ToastContent;
    try {
      errorMsg =
        typeof messages.error === 'function'
          ? (messages.error as (err: unknown) => ToastContent)(error)
          : messages.error;
    } catch (_) {
      errorMsg = 'An error occurred';
    }

    toastStore.updateToast(id, {
      type: 'error',
      message: errorMsg,
      duration: options?.duration
    });

    throw error;
  }
};

export const toast: ToastFunction = baseToast;
