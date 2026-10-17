import { useState, useEffect } from 'react';
import { Toaster } from 'toastnova';
import type { ToastPosition, ToastTheme, ToastAnimationPreset, ToastDuplicateStrategy } from 'toastnova';
import 'toastnova/styles.css';
import './demo.css';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { SearchModal } from './components/SearchModal';
import { HeroSection } from './sections/HeroSection';
import { InstallationSection } from './sections/InstallationSection';
import { PlaygroundSection } from './sections/PlaygroundSection';
import { ThemesSection } from './sections/ThemesSection';
import { AnimationsSection } from './sections/AnimationsSection';
import { ApiSection } from './sections/ApiSection';
import { AccessibilitySection } from './sections/AccessibilitySection';
import { SsrSection } from './sections/SsrSection';
import { ExamplesSection } from './sections/ExamplesSection';
import { TroubleshootingSection } from './sections/TroubleshootingSection';
import { Footer } from './sections/Footer';

export function App() {
  // Global Toaster engine state configured through the playground & theme showcase
  const [theme, setTheme] = useState<ToastTheme>('glass');
  const [position, setPosition] = useState<ToastPosition>('top-right');
  const [animation, setAnimation] = useState<ToastAnimationPreset>('spring');
  const [duration, setDuration] = useState<number>(4000);
  const [maxVisible, setMaxVisible] = useState<number>(5);
  const [swipeToDismiss, setSwipeToDismiss] = useState<boolean>(true);
  const [duplicateStrategy, setDuplicateStrategy] = useState<ToastDuplicateStrategy>('group');
  const [dedupeWindow, setDedupeWindow] = useState<number>(2000);

  // Website light/dark theme preference
  const [docsTheme, setDocsTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('toastnova-docs-theme') as 'dark' | 'light' | null;
      if (saved === 'dark' || saved === 'light') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    }
    return 'dark';
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', docsTheme);
      localStorage.setItem('toastnova-docs-theme', docsTheme);
    }
  }, [docsTheme]);

  const handleToggleDocsTheme = () => {
    setDocsTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Navigation & UI state
  const [activeSection, setActiveSection] = useState<string>('section-overview');
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Global Ctrl+K / Cmd+K keyboard shortcut to open search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Intersection observer to track active section during scrolling
  useEffect(() => {
    const sectionIds = [
      'section-overview',
      'section-installation',
      'section-quickstart',
      'section-playground',
      'section-themes',
      'section-animations',
      'section-api',
      'section-accessibility',
      'section-ssr',
      'section-examples',
      'section-troubleshooting'
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const navOffset = 76;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - navOffset,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="doc-app">
      {/* Real active Toaster instance powering all examples and triggers */}
      <Toaster
        theme={theme}
        position={position}
        animation={animation}
        duration={duration}
        maxVisible={maxVisible}
        duplicateStrategy={duplicateStrategy}
        dedupeWindow={dedupeWindow}
        swipeToDismiss={swipeToDismiss}
      />

      {/* Top Header Navigation */}
      <Navbar
        onOpenSearch={() => setSearchOpen(true)}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        docsTheme={docsTheme}
        onToggleDocsTheme={handleToggleDocsTheme}
      />

      <div className="doc-layout">
        {/* Sticky Sidebar Navigation */}
        <Sidebar
          activeSection={activeSection}
          onNavigate={handleNavigate}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Main Documentation Body */}
        <main className="doc-main">
          <HeroSection
            onGoToPlayground={() => handleNavigate('section-playground')}
            onGoToDocs={() => handleNavigate('section-installation')}
          />

          <InstallationSection />

          <PlaygroundSection
            theme={theme}
            setTheme={setTheme}
            position={position}
            setPosition={setPosition}
            animation={animation}
            setAnimation={setAnimation}
            duration={duration}
            setDuration={setDuration}
            maxVisible={maxVisible}
            setMaxVisible={setMaxVisible}
            swipeToDismiss={swipeToDismiss}
            setSwipeToDismiss={setSwipeToDismiss}
            duplicateStrategy={duplicateStrategy}
            setDuplicateStrategy={setDuplicateStrategy}
            dedupeWindow={dedupeWindow}
            setDedupeWindow={setDedupeWindow}
          />

          <ThemesSection
            currentTheme={theme}
            onSelectTheme={(t) => setTheme(t)}
          />

          <AnimationsSection
            currentAnimation={animation}
            onSelectAnimation={(a) => setAnimation(a)}
          />

          <ApiSection />

          <AccessibilitySection />

          <SsrSection />

          <ExamplesSection />

          <TroubleshootingSection />

          <Footer onNavigate={handleNavigate} />
        </main>
      </div>

      {/* In-page Interactive Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={handleNavigate}
      />
    </div>
  );
}
