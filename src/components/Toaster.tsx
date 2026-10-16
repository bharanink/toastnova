import React, { useEffect, useSyncExternalStore } from 'react';
import type { ToasterProps, ToastPosition, ToastTheme, ToastAnimationPreset } from '../core/types';
import { BUILTIN_THEMES, BUILTIN_ANIMATIONS } from '../core/types';
import { toastStore } from '../core/store';
import { ToastItem } from './ToastItem';

const VALID_POSITIONS: readonly ToastPosition[] = [
  'top-right',
  'top-left',
  'top-center',
  'bottom-right',
  'bottom-left',
  'bottom-center'
] as const;

export const Toaster: React.FC<ToasterProps> = ({
  theme = 'glass',
  position = 'top-right',
  animation = 'slide',
  animationDuration = 220,
  stackGap = 10,
  swipeToDismiss = true,
  duration = 4000,
  maxVisible = 5,
  duplicateStrategy = 'allow',
  dedupeWindow = 0,
  pauseOnHover = true,
  pauseOnFocus = true,
  disableAnimations = false,
  className = '',
  style
}) => {
  const storeState = useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getSnapshot,
    toastStore.getServerSnapshot
  );

  // Sync maxVisible with the store
  useEffect(() => {
    toastStore.setMaxVisible(maxVisible);
  }, [maxVisible]);

  // Sync duplicateStrategy and dedupeWindow with the store
  useEffect(() => {
    toastStore.setDuplicateConfig(duplicateStrategy, dedupeWindow);
  }, [duplicateStrategy, dedupeWindow]);

  // Safe theme validation with development warning and fallback to 'glass'
  let safeTheme: ToastTheme = 'glass';
  if (BUILTIN_THEMES.includes(theme as ToastTheme)) {
    safeTheme = theme as ToastTheme;
  } else {
    if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
      console.warn(
        `[ToastNova] Unknown theme "${theme}". Falling back to default "glass" theme.`
      );
    }
    safeTheme = 'glass';
  }

  // Safe animation preset validation with development warning and fallback to 'slide'
  let safeAnimation: ToastAnimationPreset = 'slide';
  if (disableAnimations) {
    safeAnimation = 'none';
  } else if (BUILTIN_ANIMATIONS.includes(animation as ToastAnimationPreset)) {
    safeAnimation = animation as ToastAnimationPreset;
  } else {
    if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
      console.warn(
        `[ToastNova] Unknown animation "${animation}". Falling back to default "slide" preset.`
      );
    }
    safeAnimation = 'slide';
  }

  const safeDuration = typeof animationDuration === 'number' && animationDuration >= 0 ? animationDuration : 220;
  const safeGap = typeof stackGap === 'number' && stackGap >= 0 ? stackGap : 10;
  const safePosition = VALID_POSITIONS.includes(position) ? position : 'top-right';
  const isBottom = safePosition.startsWith('bottom');

  const containerStyle: React.CSSProperties = {
    ['--toastnova-anim-duration' as string]: `${safeDuration}ms`,
    ['--toastnova-stack-gap' as string]: `${safeGap}px`,
    ...style
  };

  // If no toasts, return container with pointer-events: none so live regions remain accessible
  return (
    <section
      role="region"
      aria-label="Notifications"
      data-theme={safeTheme}
      data-animation={safeAnimation}
      className={`toastnova-toaster toastnova-theme-${safeTheme} toastnova-anim-${safeAnimation} toastnova-position-${safePosition} ${
        safeAnimation === 'none' || disableAnimations ? 'toastnova-no-animations' : ''
      } ${className}`}
      style={containerStyle}
    >
      <div className={`toastnova-toast-list ${isBottom ? 'toastnova-list-bottom' : 'toastnova-list-top'}`}>
        {storeState.toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            position={safePosition}
            animation={safeAnimation}
            animationDuration={safeDuration}
            swipeToDismiss={swipeToDismiss}
            defaultDuration={duration}
            pauseOnHover={pauseOnHover}
            pauseOnFocus={pauseOnFocus}
            disableAnimations={disableAnimations || safeAnimation === 'none'}
          />
        ))}
      </div>
    </section>
  );
};
