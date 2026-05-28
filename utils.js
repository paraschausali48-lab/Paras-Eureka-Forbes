/**
 * Returns a function that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds.
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Adds swipe-to-close functionality to a mobile element
 */
export function enableSwipeToClose(element, closeAction, direction = 'down') {
  if (!element) return;
  let startPos = 0;
  let currentPos = 0;
  let isSwiping = false;
  element.addEventListener(
    'touchstart',
    (e) => {
      if (direction === 'down' && element.scrollTop > 0) return;
      startPos = direction === 'down' ? e.touches[0].clientY : e.touches[0].clientX;
      isSwiping = true;
    },
    { passive: true },
  );
  element.addEventListener(
    'touchmove',
    (e) => {
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
    element.style.transform = '';
    element.style.transition = '';
    if (currentPos - startPos > 100) closeAction();
  });
}
