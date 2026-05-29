export function initScrollAnimations() {
  const revealObserver = new IntersectionObserver(
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

export function initHeaderScroll() {
  const siteHeader = document.querySelector('.site-header');
  let lastScrollY = window.scrollY;

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
    const contentId = `filter-content-${Math.random().toString(36).substr(2, 9)}`;
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

export function initFaq() {
  document.querySelectorAll<HTMLElement>('.faq-tab').forEach((tab) => {
    tab.addEventListener('click', function () {
      document.querySelectorAll<HTMLElement>('.faq-tab').forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll<HTMLElement>('.faq-tab-panel').forEach((p) => (p.hidden = true));
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');
      const panel = document.querySelector<HTMLElement>(`.faq-tab-panel[data-faq-panel="${this.dataset.faqTab}"]`);
      if (panel) panel.hidden = false;
    });
  });

  document.querySelectorAll<HTMLElement>('.faq-question').forEach((btn) => {
    btn.addEventListener('click', function () {
      const item = this.closest('.faq-item')!;
      const isActive = item.classList.contains('active');
      item
        .closest('.faq-tab-panel')!
        .querySelectorAll('.faq-item')
        .forEach((i) => {
          i.classList.remove('active');
          i.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
        });
      if (!isActive) {
        item.classList.add('active');
        this.setAttribute('aria-expanded', 'true');
      }
    });
  });
}
