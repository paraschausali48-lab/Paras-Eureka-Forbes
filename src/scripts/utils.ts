/**
 * Returns a function that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds.
 */
export function debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return function executedFunction(this: any, ...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Adds swipe-to-close functionality to a mobile element
 */
export function enableSwipeToClose(
  element: HTMLElement | null,
  closeAction: () => void,
  direction: 'down' | 'left' | 'right' = 'down',
) {
  if (!element) return;
  let startPos = 0;
  let currentPos = 0;
  let isSwiping = false;
  element.addEventListener(
    'touchstart',
    (e: TouchEvent) => {
      if (direction === 'down' && element.scrollTop > 0) return;
      startPos = direction === 'down' ? e.touches[0].clientY : e.touches[0].clientX;
      isSwiping = true;
    },
    { passive: true },
  );
  element.addEventListener(
    'touchmove',
    (e: TouchEvent) => {
      if (!isSwiping || (direction === 'down' && element.scrollTop > 0)) return;
      currentPos = direction === 'down' ? e.touches[0].clientY : e.touches[0].clientX;
      const diff = currentPos - startPos;
      if (diff > 0) {
        element.style.transform = direction === 'down' ? `translateY(${diff}px)` : `translateX(${diff}px)`;
        element.style.transition = 'none';
      }
    },
    { passive: true },
  );
  element.addEventListener('touchend', () => {
    if (!isSwiping) return;
    isSwiping = false;
    element.style.removeProperty('transform');
    element.style.removeProperty('transition');
    if (currentPos - startPos > 100) closeAction();
  });
}

/**
 * Escapes HTML characters to prevent Cross-Site Scripting (XSS)
 * @param {string} str - The string to escape
 * @returns {string} The escaped HTML string
 */
export function escapeHTML(str: string | number | boolean | null | undefined): string {
  if (typeof str !== 'string' && typeof str !== 'number') return '';
  return String(str).replace(
    /[&<>'"]/g,
    (tag) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      })[tag] || tag,
  );
}

/**
 * Generates a standardized SKU from a product title.
 * Must remain perfectly synced with the pre-rendering implementation in vite.config.js
 */
export function getSku(title: string): string {
  return (
    'EF-' +
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .toUpperCase()
  );
}

/**
 * Traps keyboard focus within a specified DOM element to improve accessibility.
 * Prevents screen-reader or keyboard users from tabbing outside an active modal.
 */
export function handleFocusTrap(e: KeyboardEvent, activeElement: HTMLElement) {
  const isTabPressed = e.key === 'Tab';
  if (!isTabPressed) return;

  const focusableEls = activeElement.querySelectorAll<HTMLElement>(
    'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
  );
  if (focusableEls.length === 0) return;

  const firstFocusableEl = focusableEls[0];
  const lastFocusableEl = focusableEls[focusableEls.length - 1];

  if (e.shiftKey && (document.activeElement === firstFocusableEl || document.activeElement === document.body)) {
    lastFocusableEl.focus();
    e.preventDefault();
  } else if (!e.shiftKey && document.activeElement === lastFocusableEl) {
    firstFocusableEl.focus();
    e.preventDefault();
  }
}
