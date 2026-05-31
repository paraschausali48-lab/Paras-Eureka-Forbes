import { useState, useEffect } from 'preact/hooks';
import styles from './FloatingActions.module.css';

interface Props {
  waText: string;
  waNumber: string;
}

export function FloatingActions({ waText, waNumber }: Props) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showWa, setShowWa] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    const handleVisibility = () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);

      if (!params.has('p') && (!hash || hash === '' || hash === '#home')) {
        setShowWa(true);
      } else {
        setShowWa(false);
      }
    };

    // Initial evaluations
    handleScroll();
    handleVisibility();

    // Listeners for standard events
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('popstate', handleVisibility);
    window.addEventListener('hashchange', handleVisibility);
    document.addEventListener('astro:page-load', handleVisibility);

    // Safely patch pushState/replaceState to catch manual JS routing updates
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      handleVisibility();
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      handleVisibility();
    };

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('popstate', handleVisibility);
      window.removeEventListener('hashchange', handleVisibility);
      document.removeEventListener('astro:page-load', handleVisibility);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
      <a
        href={`https://wa.me/${waNumber}`}
        class={`${styles.whatsappFloat} whatsapp-float`}
        style={{ display: showWa ? 'flex' : 'none' }}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </svg>
        <span>{waText}</span>
      </a>
      <button
        id="scrollToTop"
        class={`${styles.scrollToTop} scroll-to-top ${showScrollTop ? 'show' : ''}`}
        aria-label="Scroll to top"
        onClick={scrollToTop}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
      </button>
    </>
  );
}
