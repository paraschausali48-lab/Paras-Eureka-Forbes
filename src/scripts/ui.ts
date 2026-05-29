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
    { rootMargin: '0px 0px -50px 0px', threshold: 0.05 },
  );

  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
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

export function initAccordions() {
  document.querySelectorAll('.filter-group').forEach((group) => {
    const titleEl = group.querySelector('.filter-group-title');
    if (!titleEl || group.querySelector('.filter-group-toggle')) return;

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'filter-group-toggle';
    toggleBtn.setAttribute('aria-expanded', 'true');
    const contentId = `filter-content-${Math.random().toString(36).substring(2, 11)}`;
    toggleBtn.setAttribute('aria-controls', contentId);
    toggleBtn.setAttribute('type', 'button');

    const chevron = document.createElement('span');
    chevron.className = 'filter-chevron';
    chevron.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';

    const newTitle = document.createElement('div');
    newTitle.className = 'filter-group-title';
    newTitle.textContent = titleEl.textContent;
    toggleBtn.appendChild(newTitle);
    toggleBtn.appendChild(chevron);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'filter-group-content';
    contentDiv.id = contentId;

    Array.from(group.children).forEach((child) => {
      if (child !== titleEl) contentDiv.appendChild(child);
    });

    titleEl.remove();
    group.appendChild(toggleBtn);
    group.appendChild(contentDiv);

    toggleBtn.addEventListener('click', () => {
      const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      toggleBtn.setAttribute('aria-expanded', String(!expanded));
    });
  });
}
