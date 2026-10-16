import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toaster, toastStore } from '../src';
import { CodeBlock } from '../demo/src/components/CodeBlock';
import { SearchModal } from '../demo/src/components/SearchModal';
import { Navbar } from '../demo/src/components/Navbar';
import { Sidebar } from '../demo/src/components/Sidebar';
import { HeroSection } from '../demo/src/sections/HeroSection';
import { InstallationSection } from '../demo/src/sections/InstallationSection';
import { PlaygroundSection } from '../demo/src/sections/PlaygroundSection';
import { ThemesSection } from '../demo/src/sections/ThemesSection';
import { AnimationsSection } from '../demo/src/sections/AnimationsSection';

describe('Phase 7: Documentation Website & Interactive Playground', () => {
  beforeEach(() => {
    toastStore.clear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    act(() => {
      toastStore.clear();
    });
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('1. CodeBlock & Copy-Code Component', () => {
    it('renders code snippet and provides copy button with feedback', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock
        }
      });

      render(<CodeBlock language="tsx" code="const x = 42;" title="test.tsx" />);

      expect(screen.getByText('TSX')).toBeInTheDocument();
      expect(screen.getByText('test.tsx')).toBeInTheDocument();
      expect(screen.getByText('const x = 42;')).toBeInTheDocument();

      const copyBtn = screen.getByRole('button', { name: /copy code to clipboard/i });
      expect(copyBtn).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(copyBtn);
      });

      expect(writeTextMock).toHaveBeenCalledWith('const x = 42;');
      expect(screen.getByText('Copied!')).toBeInTheDocument();

      // After timer expires, label returns to Copy
      act(() => {
        vi.advanceTimersByTime(2100);
      });
      expect(screen.getByText('Copy')).toBeInTheDocument();
    });
  });

  describe('2. In-Page Search Modal', () => {
    it('filters documentation items based on search query and navigates on selection', () => {
      const onSelect = vi.fn();
      const onClose = vi.fn();

      const { rerender } = render(
        <SearchModal isOpen={true} onClose={onClose} onSelect={onSelect} />
      );

      const input = screen.getByPlaceholderText(/search documentation/i);
      expect(input).toBeInTheDocument();

      // Filter for 'Playground'
      fireEvent.change(input, { target: { value: 'Playground' } });

      const playgroundOption = screen.getByText('Interactive Playground');
      expect(playgroundOption).toBeInTheDocument();

      // Click option
      fireEvent.click(playgroundOption);
      expect(onSelect).toHaveBeenCalledWith('section-playground');
      expect(onClose).toHaveBeenCalledTimes(1);

      // Verify closed modal renders nothing
      rerender(<SearchModal isOpen={false} onClose={onClose} onSelect={onSelect} />);
      expect(screen.queryByPlaceholderText(/search documentation/i)).not.toBeInTheDocument();
    });
  });

  describe('3. Hero Section Live Triggers', () => {
    it('dispatches real notifications when clicking quick trigger buttons', () => {
      render(
        <>
          <Toaster disableAnimations={true} />
          <HeroSection onGoToPlayground={vi.fn()} onGoToDocs={vi.fn()} />
        </>
      );

      const successQuickBtn = screen.getByRole('button', { name: /toast\.success\(\)/i });
      act(() => {
        fireEvent.click(successQuickBtn);
      });

      expect(screen.getByText('Your changes were successfully published.')).toBeInTheDocument();
      expect(screen.getByText('Deployment Ready')).toBeInTheDocument();
    });
  });

  describe('4. Installation Section & Package Manager Switcher', () => {
    it('switches between npm, pnpm, and yarn commands', () => {
      render(<InstallationSection />);

      expect(screen.getByText('npm install toastnova')).toBeInTheDocument();

      const pnpmTab = screen.getByRole('button', { name: 'pnpm' });
      fireEvent.click(pnpmTab);
      expect(screen.getByText('pnpm add toastnova')).toBeInTheDocument();

      const yarnTab = screen.getByRole('button', { name: 'yarn' });
      fireEvent.click(yarnTab);
      expect(screen.getByText('yarn add toastnova')).toBeInTheDocument();
    });
  });

  describe('5. Interactive Playground Live Studio', () => {
    it('synchronizes form controls with the live code snippet reflection and triggers real toasts', () => {
      const setTheme = vi.fn();
      const setPosition = vi.fn();
      const setAnimation = vi.fn();
      const setDuration = vi.fn();
      const setMaxVisible = vi.fn();
      const setSwipeToDismiss = vi.fn();
      const setDuplicateStrategy = vi.fn();
      const setDedupeWindow = vi.fn();

      render(
        <>
          <Toaster disableAnimations={true} />
          <PlaygroundSection
            theme="glass"
            setTheme={setTheme}
            position="top-right"
            setPosition={setPosition}
            animation="spring"
            setAnimation={setAnimation}
            duration={4000}
            setDuration={setDuration}
            maxVisible={5}
            setMaxVisible={setMaxVisible}
            swipeToDismiss={true}
            setSwipeToDismiss={setSwipeToDismiss}
            duplicateStrategy="group"
            setDuplicateStrategy={setDuplicateStrategy}
            dedupeWindow={2000}
            setDedupeWindow={setDedupeWindow}
          />
        </>
      );

      // Verify initial generated code reflects glass theme and spring animation
      expect(screen.getByText(/theme="glass"/)).toBeInTheDocument();
      expect(screen.getByText(/animation="spring"/)).toBeInTheDocument();

      // Trigger notification using the playground button
      const triggerBtn = screen.getByRole('button', { name: /trigger notification/i });
      act(() => {
        fireEvent.click(triggerBtn);
      });

      // Notification should appear in DOM
      expect(screen.getByText('Changes Deployed')).toBeInTheDocument();
      expect(screen.getByText('Production build #1042 was deployed to 12 edge nodes.')).toBeInTheDocument();

      // Change title input and verify live code reflection updates
      const titleInput = screen.getByLabelText(/title \(optional\)/i);
      fireEvent.change(titleInput, { target: { value: 'Database Backup' } });

      expect(screen.getByText(/title: "Database Backup"/)).toBeInTheDocument();
    });

    it('resets playground configuration to defaults when reset button is clicked', () => {
      const setTheme = vi.fn();
      const setPosition = vi.fn();
      const setAnimation = vi.fn();

      render(
        <PlaygroundSection
          theme="neon"
          setTheme={setTheme}
          position="bottom-left"
          setPosition={setPosition}
          animation="bounce"
          setAnimation={setAnimation}
          duration={6000}
          setDuration={vi.fn()}
          maxVisible={3}
          setMaxVisible={vi.fn()}
          swipeToDismiss={false}
          setSwipeToDismiss={vi.fn()}
          duplicateStrategy="dedupe"
          setDuplicateStrategy={vi.fn()}
          dedupeWindow={3000}
          setDedupeWindow={vi.fn()}
        />
      );

      const resetBtn = screen.getByRole('button', { name: /reset defaults/i });
      act(() => {
        fireEvent.click(resetBtn);
      });

      expect(setTheme).toHaveBeenCalledWith('glass');
      expect(setPosition).toHaveBeenCalledWith('top-right');
      expect(setAnimation).toHaveBeenCalledWith('spring');
    });
  });

  describe('6. Theme Gallery Showcase', () => {
    it('renders all 6 handcrafted themes with preview trigger buttons', () => {
      const onSelectTheme = vi.fn();

      render(
        <>
          <Toaster disableAnimations={true} />
          <ThemesSection currentTheme="glass" onSelectTheme={onSelectTheme} />
        </>
      );

      // Verify all 6 theme names are rendered
      expect(screen.getByText('Glassmorphism')).toBeInTheDocument();
      expect(screen.getByText('Cyberpunk Neon')).toBeInTheDocument();
      expect(screen.getByText('Swiss Minimal')).toBeInTheDocument();
      expect(screen.getByText('Sunset Gradient')).toBeInTheDocument();
      expect(screen.getByText('Clean Daylight')).toBeInTheDocument();
      expect(screen.getByText('Midnight Slate')).toBeInTheDocument();

      // Trigger neon theme preview
      const neonCard = screen.getByText('Cyberpunk Neon').closest('.doc-theme-card') as HTMLElement;
      const neonSuccessBtn = neonCard.querySelector('.doc-mini-btn.success') as HTMLButtonElement;

      act(() => {
        fireEvent.click(neonSuccessBtn);
      });

      expect(onSelectTheme).toHaveBeenCalledWith('neon');
      expect(screen.getByText('NEON • Success')).toBeInTheDocument();
    });
  });

  describe('7. Animations Showcase', () => {
    it('renders all 5 animation presets with working preview buttons', () => {
      const onSelectAnimation = vi.fn();

      render(
        <>
          <Toaster disableAnimations={true} />
          <AnimationsSection currentAnimation="slide" onSelectAnimation={onSelectAnimation} />
        </>
      );

      expect(screen.getByText('Directional Slide')).toBeInTheDocument();
      expect(screen.getByText('Physics Spring')).toBeInTheDocument();
      expect(screen.getByText('Playful Bounce')).toBeInTheDocument();
      expect(screen.getByText('Opacity Fade')).toBeInTheDocument();
      expect(screen.getByText('Instant (No Motion)')).toBeInTheDocument();

      const previewSpringBtn = screen.getByRole('button', { name: /preview physics spring/i });
      act(() => {
        fireEvent.click(previewSpringBtn);
      });

      expect(onSelectAnimation).toHaveBeenCalledWith('spring');
      expect(screen.getByText('Animation • SPRING')).toBeInTheDocument();
    });
  });

  describe('8. Navigation Components (Navbar & Sidebar)', () => {
    it('highlights active section in Navbar and triggers onNavigate', () => {
      const onNavigate = vi.fn();

      render(
        <Navbar
          onOpenSearch={vi.fn()}
          activeSection="section-playground"
          onNavigate={onNavigate}
          mobileMenuOpen={false}
          onToggleMobileMenu={vi.fn()}
        />
      );

      const playgroundLink = screen.getByRole('button', { name: 'Playground' });
      expect(playgroundLink).toHaveClass('active');

      const apiLink = screen.getByRole('button', { name: 'API' });
      fireEvent.click(apiLink);
      expect(onNavigate).toHaveBeenCalledWith('section-api');
    });

    it('renders grouped sidebar links and highlights active item', () => {
      const onNavigate = vi.fn();
      const onCloseMobile = vi.fn();

      render(
        <Sidebar
          activeSection="section-themes"
          onNavigate={onNavigate}
          mobileOpen={false}
          onCloseMobile={onCloseMobile}
        />
      );

      expect(screen.getByText('Getting Started')).toBeInTheDocument();
      expect(screen.getByText('Interactive Studio')).toBeInTheDocument();
      expect(screen.getByText('Engineering & Architecture')).toBeInTheDocument();

      const themeLink = screen.getByRole('button', { name: /theme gallery/i });
      expect(themeLink).toHaveClass('active');

      const animLink = screen.getByRole('button', { name: /animation presets/i });
      fireEvent.click(animLink);
      expect(onNavigate).toHaveBeenCalledWith('section-animations');
      expect(onCloseMobile).toHaveBeenCalledTimes(1);
    });
  });
});
