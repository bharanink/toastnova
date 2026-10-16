import { describe, it, expect } from 'vitest';
import * as ToastNova from 'toastnova';
import fs from 'fs';
import path from 'path';

describe('Public Exports and Declarations', () => {
  it('exports all expected core components and functions from public index', () => {
    expect(ToastNova.Toaster).toBeDefined();
    expect(ToastNova.ToastItem).toBeDefined();
    expect(ToastNova.toast).toBeDefined();
    expect(ToastNova.toastStore).toBeDefined();
    expect(ToastNova.BUILTIN_THEMES).toEqual([
      'glass',
      'neon',
      'minimal',
      'gradient',
      'light',
      'dark'
    ]);
    expect(ToastNova.BUILTIN_ANIMATIONS).toEqual([
      'slide',
      'fade',
      'bounce',
      'spring',
      'none'
    ]);

    // Verify all advertised toast methods exist
    expect(typeof ToastNova.toast).toBe('function');
    expect(typeof ToastNova.toast.success).toBe('function');
    expect(typeof ToastNova.toast.error).toBe('function');
    expect(typeof ToastNova.toast.info).toBe('function');
    expect(typeof ToastNova.toast.warning).toBe('function');
    expect(typeof ToastNova.toast.loading).toBe('function');
    expect(typeof ToastNova.toast.custom).toBe('function');
    expect(typeof ToastNova.toast.update).toBe('function');
    expect(typeof ToastNova.toast.dismiss).toBe('function');
    expect(typeof ToastNova.toast.remove).toBe('function');
    expect(typeof ToastNova.toast.promise).toBe('function');
  });

  it('generates dist artifacts matching package.json exports', () => {
    const distPath = path.resolve(__dirname, '../dist');
    expect(fs.existsSync(distPath)).toBe(true);

    const esmBundle = path.join(distPath, 'index.js');
    const cjsBundle = path.join(distPath, 'index.cjs');
    const dtsBundle = path.join(distPath, 'index.d.ts');
    const cssBundle = path.join(distPath, 'styles.css');

    expect(fs.existsSync(esmBundle)).toBe(true);
    expect(fs.existsSync(cjsBundle)).toBe(true);
    expect(fs.existsSync(dtsBundle)).toBe(true);
    expect(fs.existsSync(cssBundle)).toBe(true);

    // Verify dts file contains expected type exports
    const dtsContent = fs.readFileSync(dtsBundle, 'utf-8');
    expect(dtsContent).toContain('export declare const Toaster');
    expect(dtsContent).toContain('export declare const toast');
    expect(dtsContent).toContain('export declare const BUILTIN_THEMES');
    expect(dtsContent).toContain('export declare const BUILTIN_ANIMATIONS');
    expect(dtsContent).toContain('export declare interface ToastOptions');
    expect(dtsContent).toContain('export declare type ToastTheme');
    expect(dtsContent).toContain('export declare type ToastAnimationPreset');

    // Verify all 6 themes are compiled into dist/styles.css
    const cssContent = fs.readFileSync(cssBundle, 'utf-8');
    expect(cssContent).toContain('.toastnova-theme-glass');
    expect(cssContent).toContain('.toastnova-theme-neon');
    expect(cssContent).toContain('.toastnova-theme-minimal');
    expect(cssContent).toContain('.toastnova-theme-gradient');
    expect(cssContent).toContain('.toastnova-theme-light');
    expect(cssContent).toContain('.toastnova-theme-dark');

    // Verify animation presets are compiled into dist/styles.css
    expect(cssContent).toContain('.toastnova-anim-slide');
    expect(cssContent).toContain('.toastnova-anim-fade');
    expect(cssContent).toContain('.toastnova-anim-bounce');
    expect(cssContent).toContain('.toastnova-anim-spring');
    expect(cssContent).toContain('.toastnova-anim-none');
    expect(cssContent).toContain('.toastnova-swipeable');
  });
});
