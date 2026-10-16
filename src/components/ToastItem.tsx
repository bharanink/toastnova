import React, { useEffect, useRef, useCallback } from 'react';
import type { Toast, ToastType, ToastPosition, ToastAnimationPreset } from '../core/types';
import { toastStore } from '../core/store';

export interface ToastItemProps {
  toast: Toast;
  position?: ToastPosition;
  animation?: ToastAnimationPreset;
  animationDuration?: number;
  swipeToDismiss?: boolean;
  defaultDuration: number;
  pauseOnHover: boolean;
  pauseOnFocus: boolean;
  disableAnimations: boolean;
}

const TYPE_SR_LABELS: Record<ToastType, string> = {
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Information',
  loading: 'Loading',
  default: 'Notification',
  custom: 'Notification'
};

const SuccessIcon: React.FC = () => (
  <svg
    className="toastnova-icon-svg"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M16.666 5L7.49935 14.1667L3.33268 10"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ErrorIcon: React.FC = () => (
  <svg
    className="toastnova-icon-svg"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M10 6.667v4.166M10 14.167h.008M18.333 10A8.333 8.333 0 111.667 10a8.333 8.333 0 0116.666 0z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const WarningIcon: React.FC = () => (
  <svg
    className="toastnova-icon-svg"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M10 7.5v3.333M10 14.167h.008M8.57 3.22L1.89 14.536A1.667 1.667 0 003.32 17h13.36a1.667 1.667 0 001.43-2.464L11.43 3.22a1.667 1.667 0 00-2.86 0z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const InfoIcon: React.FC = () => (
  <svg
    className="toastnova-icon-svg"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M10 9.167v4.166M10 6.667h.008M18.333 10A8.333 8.333 0 111.667 10a8.333 8.333 0 0116.666 0z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LoadingSpinner: React.FC = () => (
  <svg
    className="toastnova-icon-svg toastnova-spinner"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25" />
    <path
      d="M10 2.5a7.5 7.5 0 017.5 7.5"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

const CloseIcon: React.FC = () => (
  <svg
    className="toastnova-close-svg"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M12 4L4 12M4 4l8 8"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function renderIcon(type: ToastType, customIcon?: React.ReactNode): React.ReactNode {
  if (customIcon !== undefined) return customIcon;
  switch (type) {
    case 'success':
      return <SuccessIcon />;
    case 'error':
      return <ErrorIcon />;
    case 'warning':
      return <WarningIcon />;
    case 'info':
      return <InfoIcon />;
    case 'loading':
      return <LoadingSpinner />;
    default:
      return null;
  }
}

const ToastItemComponent: React.FC<ToastItemProps> = ({
  toast,
  position = 'top-right',
  animation = 'slide',
  animationDuration = 220,
  swipeToDismiss = true,
  defaultDuration,
  pauseOnHover,
  pauseOnFocus,
  disableAnimations
}) => {
  const toastRef = useRef<HTMLDivElement | null>(null);
  const remainingTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHoveredRef = useRef<boolean>(false);
  const isFocusedRef = useRef<boolean>(false);

  // Swipe gesture tracking refs
  const startXRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);
  const swipeStartTimeRef = useRef<number>(0);
  const dragXRef = useRef<number>(0);
  const isSwipingRef = useRef<boolean>(false);
  const hasMovedRef = useRef<boolean>(false);

  const effectiveDuration =
    toast.duration !== undefined
      ? toast.duration
      : toast.type === 'loading'
        ? Infinity
        : defaultDuration;

  const handleDismiss = useCallback(() => {
    // If focus was inside the toast when dismissed, safely blur to prevent detached focus
    if (
      typeof document !== 'undefined' &&
      document.activeElement &&
      toastRef.current &&
      toastRef.current.contains(document.activeElement)
    ) {
      if (typeof (document.activeElement as HTMLElement).blur === 'function') {
        (document.activeElement as HTMLElement).blur();
      }
    }
    toastStore.dismissToast(toast.id);
  }, [toast.id]);

  const startTimer = useCallback(() => {
    if (effectiveDuration <= 0 || effectiveDuration === Infinity) return;
    if (remainingTimeRef.current <= 0) {
      handleDismiss();
      return;
    }

    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      handleDismiss();
    }, remainingTimeRef.current);
  }, [effectiveDuration, handleDismiss]);

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (startTimeRef.current !== null) {
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
      startTimeRef.current = null;
    }
  }, []);

  const resumeTimer = useCallback(() => {
    if (isHoveredRef.current || isFocusedRef.current || isSwipingRef.current) return;
    startTimer();
  }, [startTimer]);

  // Main countdown timer setup
  useEffect(() => {
    if (toast.dismissing) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (effectiveDuration <= 0 || effectiveDuration === Infinity) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    remainingTimeRef.current = effectiveDuration;
    startTimer();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [toast.id, toast.type, toast.count, effectiveDuration, toast.dismissing, startTimer]);

  // Handle dismissal exit animation and removal with prefers-reduced-motion support
  useEffect(() => {
    if (!toast.dismissing) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (disableAnimations || animation === 'none' || prefersReducedMotion) {
      toastStore.removeToast(toast.id);
      return;
    }

    const removalTimer = setTimeout(() => {
      toastStore.removeToast(toast.id);
    }, animationDuration);

    return () => clearTimeout(removalTimer);
  }, [toast.dismissing, toast.id, disableAnimations, animation, animationDuration]);

  // Pointer hover handlers
  const handlePointerEnter = () => {
    if (!pauseOnHover || toast.dismissing || isSwipingRef.current) return;
    isHoveredRef.current = true;
    pauseTimer();
  };

  const handlePointerLeave = () => {
    if (!pauseOnHover || toast.dismissing || isSwipingRef.current) return;
    isHoveredRef.current = false;
    resumeTimer();
  };

  // Keyboard focus handlers
  const handleFocus = () => {
    if (!pauseOnFocus || toast.dismissing) return;
    isFocusedRef.current = true;
    pauseTimer();
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!pauseOnFocus || toast.dismissing) return;
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      isFocusedRef.current = false;
      resumeTimer();
    }
  };

  // Swipe gesture handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!swipeToDismiss || toast.dismissing) return;

    // Do not initiate swipe if clicking interactive elements inside toast
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, textarea, select, [role="button"]')) {
      return;
    }

    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    swipeStartTimeRef.current = Date.now();
    dragXRef.current = 0;
    isSwipingRef.current = false;
    hasMovedRef.current = false;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (startXRef.current === null || startYRef.current === null) return;

    const deltaX = e.clientX - startXRef.current;
    const deltaY = e.clientY - startYRef.current;

    if (!isSwipingRef.current) {
      // Determine if movement is primarily horizontal and passes threshold
      if (Math.abs(deltaX) > 6 && Math.abs(deltaX) > Math.abs(deltaY)) {
        isSwipingRef.current = true;
        hasMovedRef.current = true;
        pauseTimer();
      } else if (Math.abs(deltaY) > 8) {
        // Vertical scroll, ignore horizontal swipe
        startXRef.current = null;
        startYRef.current = null;
        return;
      }
    }

    if (isSwipingRef.current && toastRef.current) {
      dragXRef.current = deltaX;
      toastRef.current.classList.add('toastnova-swiping');
      toastRef.current.style.transform = `translate3d(${deltaX}px, 0, 0)`;
      const opacityFactor = Math.max(0.15, 1 - Math.abs(deltaX) / 280);
      toastRef.current.style.opacity = `${opacityFactor}`;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (startXRef.current === null) return;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}

    if (isSwipingRef.current && toastRef.current) {
      const deltaX = dragXRef.current;
      const elapsed = Math.max(1, Date.now() - swipeStartTimeRef.current);
      const velocity = Math.abs(deltaX) / elapsed;

      // Qualifying swipe: either threshold distance or quick flick velocity
      const isQualified = Math.abs(deltaX) > 75 || (Math.abs(deltaX) > 35 && velocity > 0.35);

      if (isQualified) {
        // Fly out in swipe direction
        const flyOutTarget = deltaX > 0 ? 350 : -350;
        toastRef.current.classList.remove('toastnova-swiping');
        toastRef.current.classList.add('toastnova-swipe-dismiss');
        toastRef.current.style.transform = `translate3d(${flyOutTarget}px, 0, 0)`;
        toastRef.current.style.opacity = '0';

        setTimeout(() => {
          handleDismiss();
        }, 120);
      } else {
        // Snap back to origin
        toastRef.current.classList.remove('toastnova-swiping');
        toastRef.current.classList.add('toastnova-swipe-cancel');
        toastRef.current.style.transform = 'translate3d(0, 0, 0)';
        toastRef.current.style.opacity = '';

        setTimeout(() => {
          if (toastRef.current) {
            toastRef.current.classList.remove('toastnova-swipe-cancel');
          }
        }, 260);

        resumeTimer();
      }
    }

    startXRef.current = null;
    startYRef.current = null;
    isSwipingRef.current = false;
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (startXRef.current === null) return;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}

    if (toastRef.current) {
      toastRef.current.classList.remove('toastnova-swiping');
      toastRef.current.classList.add('toastnova-swipe-cancel');
      toastRef.current.style.transform = 'translate3d(0, 0, 0)';
      toastRef.current.style.opacity = '';

      setTimeout(() => {
        if (toastRef.current) {
          toastRef.current.classList.remove('toastnova-swipe-cancel');
        }
      }, 260);
    }

    startXRef.current = null;
    startYRef.current = null;
    isSwipingRef.current = false;
    resumeTimer();
  };

  const handleClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    // If a swipe gesture just took place, prevent click from bubbling
    if (hasMovedRef.current) {
      e.stopPropagation();
      e.preventDefault();
      hasMovedRef.current = false;
    }
  };

  const handleAction = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!toast.action) return;
    try {
      await toast.action.onClick(e);
      if (toast.action.dismissOnClick !== false) {
        handleDismiss();
      }
    } catch (err) {
      console.error('[ToastNova] Action callback error:', err);
    }
  };

  const handleCancel = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!toast.cancel) return;
    try {
      await toast.cancel.onClick(e);
      if (toast.cancel.dismissOnClick !== false) {
        handleDismiss();
      }
    } catch (err) {
      console.error('[ToastNova] Cancel callback error:', err);
    }
  };

  const isAlert = toast.type === 'error';
  const iconElement = renderIcon(toast.type, toast.icon);
  const typeSrLabel = TYPE_SR_LABELS[toast.type] || 'Notification';
  const closeAriaLabel =
    typeof toast.title === 'string' && toast.title.trim()
      ? `Close notification: ${toast.title}`
      : 'Close notification';

  return (
    <div
      ref={toastRef}
      role={isAlert ? 'alert' : 'status'}
      aria-live={isAlert ? 'assertive' : 'polite'}
      aria-atomic="true"
      data-toast-id={toast.id}
      data-toast-type={toast.type}
      data-position={position}
      data-animation={animation}
      data-dismissing={toast.dismissing ? 'true' : 'false'}
      className={`toastnova-toast toastnova-${toast.type} ${
        toast.dismissing ? 'toastnova-toast-exit' : 'toastnova-toast-enter'
      } ${swipeToDismiss ? 'toastnova-swipeable' : ''} ${toast.className || ''}`}
      style={toast.style}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onClickCapture={handleClickCapture}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {iconElement && (
        <div className="toastnova-icon-wrapper" aria-hidden="true">
          {iconElement}
        </div>
      )}

      <div className={`toastnova-content ${toast.type === 'custom' ? 'toastnova-custom-content' : ''}`}>
        <span className="toastnova-sr-only">{typeSrLabel}: </span>
        {toast.title && (
          <div className="toastnova-title">
            <span>{toast.title}</span>
            {toast.count && toast.count > 1 && (
              <span className="toastnova-badge-count" aria-label={`${toast.count} occurrences`}>
                ×{toast.count}
              </span>
            )}
          </div>
        )}
        <div className="toastnova-message">
          {typeof toast.message === 'function'
            ? toast.message({ id: toast.id, dismiss: handleDismiss })
            : toast.message}
          {!toast.title && toast.count && toast.count > 1 && (
            <span className="toastnova-badge-count" aria-label={`${toast.count} occurrences`}>
              ×{toast.count}
            </span>
          )}
        </div>

        {(toast.action || toast.cancel) && (
          <div className="toastnova-actions">
            {toast.action && (
              <button
                type="button"
                className={`toastnova-action-btn ${toast.action.className || ''}`}
                style={toast.action.style}
                onClick={handleAction}
                aria-label={
                  toast.action.ariaLabel ||
                  (typeof toast.action.label === 'string' ? toast.action.label : undefined)
                }
              >
                {toast.action.label}
              </button>
            )}
            {toast.cancel && (
              <button
                type="button"
                className={`toastnova-action-btn toastnova-cancel-btn ${toast.cancel.className || ''}`}
                style={toast.cancel.style}
                onClick={handleCancel}
                aria-label={
                  toast.cancel.ariaLabel ||
                  (typeof toast.cancel.label === 'string' ? toast.cancel.label : undefined)
                }
              >
                {toast.cancel.label}
              </button>
            )}
          </div>
        )}

        {toast.progress !== undefined && toast.progress !== null && (
          <div
            role="progressbar"
            aria-label={typeof toast.title === 'string' ? `${toast.title} progress` : 'Progress'}
            aria-valuenow={typeof toast.progress === 'number' ? toast.progress : undefined}
            aria-valuemin={typeof toast.progress === 'number' ? 0 : undefined}
            aria-valuemax={typeof toast.progress === 'number' ? 100 : undefined}
            className={`toastnova-progress-track ${
              toast.progress === 'indeterminate' ? 'toastnova-progress-indeterminate' : ''
            }`}
          >
            <div
              className="toastnova-progress-fill"
              style={{
                width: typeof toast.progress === 'number' ? `${toast.progress}%` : undefined
              }}
            />
          </div>
        )}
      </div>

      {toast.dismissible !== false && (
        <button
          type="button"
          aria-label={closeAriaLabel}
          className="toastnova-close-btn"
          onClick={handleDismiss}
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
};

export const ToastItem = React.memo(ToastItemComponent);
