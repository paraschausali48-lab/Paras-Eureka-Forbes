import { registerClickAction } from './events';
import { navigate } from 'astro:transitions/client';

let revealObserver: IntersectionObserver | null = null;

export function initScrollAnimations() {
  if (revealObserver) revealObserver.disconnect();

  revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target); // Stop tracking once revealed to save memory
        }
      });
    },
    { rootMargin: '0px 0px 150px 0px', threshold: 0 },
  );

  document.querySelectorAll('.reveal').forEach((el) => {
    if (revealObserver) revealObserver.observe(el);
  });
}

let headerScrollInitialized = false;

export function initHeaderScroll() {
  if (headerScrollInitialized) return;
  headerScrollInitialized = true;

  let lastScrollY = window.scrollY;
  let siteHeader = document.querySelector('.site-header');

  // Safely refresh the cached DOM node on Astro page transitions
  document.addEventListener('astro:page-load', () => {
    siteHeader = document.querySelector('.site-header');
  });

  window.addEventListener(
    'scroll',
    () => {
      if (siteHeader) {
        if (window.scrollY > 20) siteHeader.classList.add('scrolled');
        else siteHeader.classList.remove('scrolled');

        // Auto-hide header on scroll down, show on scroll up
        if (window.scrollY > lastScrollY && window.scrollY > 150) {
          siteHeader.classList.add('hidden');
        } else {
          siteHeader.classList.remove('hidden');
        }
      }
      lastScrollY = window.scrollY;
    },
    { passive: true },
  );
}

// ============= UI EVENT BINDINGS =============

if (typeof window !== 'undefined') {
  registerClickAction({
    selector: '.lang-btn',
    handle: (el: HTMLElement) => {
      const lang = el.getAttribute('data-lang');
      const docLang = document.documentElement.lang || 'en';
      if (lang && lang !== docLang) {
        try {
          localStorage.setItem('preferredLanguage', lang);
        } catch (e) {}
        const url = new URL(window.location.href);
        const baseUrl = import.meta.env.BASE_URL;
        const pathParts = url.pathname.replace(baseUrl, '').split('/').filter(Boolean);
        if (pathParts.length > 0 && ['en', 'hi', 'mr', 'gu'].includes(pathParts[0])) {
          pathParts[0] = lang;
          url.pathname = baseUrl + pathParts.join('/');
        } else {
          url.pathname = baseUrl + lang + '/' + pathParts.join('/');
        }
        if (!url.pathname.endsWith('/')) url.pathname += '/';
        navigate(url.pathname + url.search + url.hash);
      }
      const mainSidebar = document.getElementById('main-sidebar');
      if (mainSidebar?.classList.contains('active')) document.getElementById('sidebar-close')?.click();
    },
  });

  registerClickAction({
    selector: '.share-btn, #share-btn, .share-action-btn',
    handle: async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: document.title,
            url: window.location.href,
          });
        } catch (e) {
          // User dismissed share sheet gracefully
        }
      } else {
        navigator.clipboard.writeText(window.location.href);
        import('./toast').then(({ showToast }) => showToast(document.body.dataset.toastLinkCopied || 'Link Copied!'));
      }
    },
  });
}
