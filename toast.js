/**
 * Displays a toast notification on the screen
 * @param {string} messageKey - The i18n translation key for the message
 */
export function showToast(messageKey) {
  let container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span data-i18n="${messageKey}"></span>`;
  container.appendChild(toast);

  if (typeof window.applyTranslations === 'function') {
    window.applyTranslations(document.documentElement.lang || 'en');
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
