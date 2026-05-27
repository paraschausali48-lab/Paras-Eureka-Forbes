document.addEventListener('DOMContentLoaded', function () {
  const productCards = document.querySelectorAll('.product-card');
  const vendorWhatsApp = '918928002642';

  // ============= 1. SCROLL ANIMATIONS =============
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

  // ============= 2. HEADER SCROLL EFFECT =============
  const siteHeader = document.querySelector('.site-header');
  window.addEventListener(
    'scroll',
    () => {
      if (window.scrollY > 20) siteHeader.classList.add('scrolled');
      else siteHeader.classList.remove('scrolled');
    },
    { passive: true },
  );

  // ============= 3. FACETED FILTERING ENGINE =============
  const filterSidebar = document.getElementById('filter-sidebar');
  const filterToggle = document.getElementById('filter-mobile-toggle');
  const filterClose = document.getElementById('filter-sidebar-close');
  const clearAllBtn = document.getElementById('filter-clear-all');
  const searchInput = document.getElementById('product-search');
  const productGrid = document.getElementById('product-grid');
  const defaultOrder = Array.from(productCards);

  // ============= 3.5 SORTING LOGIC =============
  const desktopSort = document.getElementById('desktop-sort-select');
  function sortProducts(sortType) {
    const visibleCards = Array.from(productCards).filter((c) => c.style.display !== 'none');
    const hiddenCards = Array.from(productCards).filter((c) => c.style.display === 'none');
    let sorted = visibleCards;
    if (sortType === 'price-low-high') {
      sorted.sort((a, b) => getCardPrice(a) - getCardPrice(b));
    } else if (sortType === 'price-high-low') {
      sorted.sort((a, b) => getCardPrice(b) - getCardPrice(a));
    } else {
      sorted.sort((a, b) => defaultOrder.indexOf(a) - defaultOrder.indexOf(b));
    }
    if (productGrid) {
      sorted.forEach((c) => productGrid.appendChild(c));
      hiddenCards.forEach((c) => productGrid.appendChild(c));
    }
  }

  // Mobile Overlay
  const overlay = document.createElement('div');
  overlay.className = 'filter-overlay';
  document.body.appendChild(overlay);

  function closeFilters() {
    if (filterSidebar) filterSidebar.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (filterToggle) {
    filterToggle.addEventListener('click', () => {
      filterSidebar.classList.add('open');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }

  if (filterClose) filterClose.addEventListener('click', closeFilters);
  overlay.addEventListener('click', closeFilters);

  function getCardCategory(card) {
    return card.querySelector('.product-tag')?.dataset.category || '';
  }

  function getCardPrice(card) {
    const priceEl = card.querySelector('.price');
    return priceEl ? parseInt(priceEl.textContent.replace(/[^0-9]/g, '')) || 0 : 0;
  }

  function cardMatchesFacets(card, facetValues, category) {
    const subs = (card.dataset.subcategory || '')
      .toLowerCase()
      .split(',')
      .map((s) => s.trim());
    const price = getCardPrice(card);

    for (const val of facetValues) {
      // Price filtering logic
      if (val === '0-10000' && price >= 10000) return false;
      if (val === '10000-15000' && (price < 10000 || price >= 15000)) return false;
      if (val === '15000-20000' && (price < 15000 || price >= 20000)) return false;
      if (val === '20000+' && price < 20000) return false;

      // Generic offers
      if (['exchange', 'free-installation', 'municipal'].includes(val)) continue;

      // Spec mappings
      const specialMappings = {
        ro: ['ro', 'ro-uv', 'ro-uv-uf', 'ro-uv-alk', 'ro-uv-alk-ss', 'ro-uv-ss', 'ro-uv-mc'],
        uv: ['uv', 'uv-uf', 'ro-uv', 'ro-uv-uf', 'ro-uv-alk', 'ro-uv-alk-ss', 'ro-uv-ss', 'uv-uf-ss'],
        uf: ['uf', 'uv-uf', 'ro-uv-uf', 'uv-uf-ss'],
        small: ['small', 'without-storage'],
        medium: ['medium', 'storage'],
        upright: ['upright', 'stick'],
        bagless: ['bagless', 'cyclonic'],
        cordless: ['cordless', 'battery'],
      };

      const mapped = specialMappings[val] || [val];
      if (!mapped.some((m) => subs.includes(m) || category === m)) {
        if (val === 'wall-mounted' && category === 'Water Purifier' && !subs.includes('under-counter')) continue;
        return false;
      }
    }
    return true;
  }

  function applyFilters() {
    const checkedCats = Array.from(document.querySelectorAll('.filter-cat:checked')).map((cb) => cb.value);
    const activeFacets = Array.from(document.querySelectorAll('.filter-facet:checked')).map((cb) => cb.value);
    const query = (searchInput?.value || '').toLowerCase().trim();
    const searchTerms = query.split(' ').filter((t) => t.length > 0);

    let visibleCount = 0;
    const isAllSelected = checkedCats.includes('all');

    productCards.forEach((card) => {
      const cat = getCardCategory(card);
      const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
      const desc = (card.querySelector('p')?.textContent || '').toLowerCase();

      const matchesCat = isAllSelected || checkedCats.includes(cat);
      const matchesSearch =
        searchTerms.length === 0 || searchTerms.every((term) => title.includes(term) || desc.includes(term));
      const matchesFacet = activeFacets.length === 0 || cardMatchesFacets(card, activeFacets, cat);

      if (matchesCat && matchesSearch && matchesFacet) {
        card.style.display = 'flex';
        card.style.animation = 'none';
        void card.offsetWidth; // trigger reflow
        card.style.animation = `filterReveal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards`;
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    const currentSort = desktopSort ? desktopSort.value : 'relevance';
    sortProducts(currentSort);

    // Category counts update
    ['Water Purifier', 'Air Purifier', 'Vacuum Cleaner', 'Water Softener'].forEach((catName) => {
      const count = Array.from(productCards).filter(
        (c) => getCardCategory(c) === catName && c.style.display !== 'none',
      ).length;
      const countEl = document.querySelector(`.filter-count[data-cat="${catName}"]`);
      if (countEl) countEl.textContent = `(${count})`;
    });
  }

  // Wire up sorting events
  if (desktopSort) desktopSort.addEventListener('change', (e) => sortProducts(e.target.value));
  const sortMobileToggle = document.getElementById('sort-mobile-toggle');
  const sortModal = document.getElementById('sort-modal');
  if (sortMobileToggle && sortModal) {
    sortMobileToggle.addEventListener('click', () => {
      sortModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
    document.querySelectorAll('input[name="mobile-sort"]').forEach((radio) => {
      radio.addEventListener('change', (e) => {
        if (desktopSort) desktopSort.value = e.target.value;
        sortProducts(e.target.value);
        setTimeout(() => {
          sortModal.classList.remove('active');
          document.body.style.overflow = '';
        }, 300);
      });
    });
  }

  document.querySelectorAll('.filter-cat').forEach((cb) => {
    cb.addEventListener('change', function () {
      if (this.value === 'all' && this.checked) {
        document.querySelectorAll('.filter-cat:not([value="all"])').forEach((c) => (c.checked = false));
      } else if (this.value !== 'all') {
        const allCb = document.querySelector('.filter-cat[value="all"]');
        if (allCb) allCb.checked = false;
      }
      applyFilters();
    });
  });

  document.querySelectorAll('.filter-facet').forEach((cb) => cb.addEventListener('change', applyFilters));
  if (searchInput)
    searchInput.addEventListener('input', () => {
      document.getElementById('products').style.display = '';
      applyFilters();
    });

  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      document.querySelectorAll('.filter-cat, .filter-facet').forEach((cb) => (cb.checked = false));
      document.querySelector('.filter-cat[value="all"]').checked = true;
      if (searchInput) searchInput.value = '';
      applyFilters();
    });
  }

  // ============= 4. VISUAL FILTERS =============
  document.querySelectorAll('.visual-filter-btn').forEach((btn) => {
    btn.addEventListener('click', function () {
      document.getElementById('products').style.display = '';
      const navCat = this.dataset.navCategory;
      const filterVal = this.dataset.filter;

      // Update visual active state highlight
      const parentContainer = this.closest('.visual-filters');
      if (parentContainer) {
        parentContainer.querySelectorAll('.visual-filter-btn').forEach((b) => b.classList.remove('active'));
      }
      this.classList.add('active');

      if (navCat) {
        document.querySelectorAll('.visual-filters').forEach((vf) => (vf.style.display = 'none'));
        const vfId = navCat === 'Water Softener' ? 'vf-softener' : `vf-${navCat.split(' ')[0].toLowerCase()}`;
        const targetVf = document.getElementById(vfId);
        if (targetVf) targetVf.style.display = 'flex';

        document.querySelectorAll('.filter-cat').forEach((cb) => (cb.checked = cb.value === navCat));
        document.querySelectorAll('.filter-facet').forEach((cb) => (cb.checked = false));
      } else if (filterVal) {
        document.querySelectorAll('.filter-facet').forEach((cb) => (cb.checked = cb.value === filterVal));
        let targetCat = 'Water Purifier';
        if (['robotic', 'canister', 'handheld', 'wet-dry'].includes(filterVal)) targetCat = 'Vacuum Cleaner';
        else if (['Air Purifier', 'Water Softener'].includes(filterVal)) targetCat = filterVal;
        document.querySelectorAll('.filter-cat').forEach((cb) => (cb.checked = cb.value === targetCat));
      }

      if (searchInput) searchInput.value = '';
      applyFilters();
      document.getElementById('products').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  document.querySelectorAll('.vf-back-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.visual-filters').forEach((vf) => (vf.style.display = 'none'));
      document.getElementById('vf-main').style.display = 'flex';
      // Remove active highlights when returning to the main category menu
      document.querySelectorAll('.visual-filter-btn').forEach((b) => b.classList.remove('active'));
      if (clearAllBtn) clearAllBtn.click();
    });
  });

  // ============= 5. PRICING & DISCOUNTS =============
  productCards.forEach((card) => {
    const priceEl = card.querySelector('.price');
    const mrpEl = card.querySelector('.mrp');
    if (!priceEl || !mrpEl) return;

    const mop = parseInt(priceEl.textContent.replace(/[^0-9]/g, ''));
    const mrp = parseInt(mrpEl.textContent.replace(/[^0-9]/g, ''));

    if (mrp > mop && mop > 0) {
      const discount = Math.round(((mrp - mop) / mrp) * 100);
      if (discount > 0 && !card.querySelector('.discount-badge')) {
        const badge = document.createElement('span');
        badge.className = 'discount-badge';
        badge.textContent = `${discount}% OFF`;

        if (!mrpEl.parentElement.classList.contains('mrp-wrapper')) {
          const wrapper = document.createElement('div');
          wrapper.className = 'mrp-wrapper';
          mrpEl.parentNode.insertBefore(wrapper, mrpEl);
          wrapper.appendChild(mrpEl);
          wrapper.appendChild(badge);
        }
      }
    }
  });

  // ============= 6. PDP MODAL & DYNAMIC GALLERY =============
  const pdpModal = document.getElementById('pdp-modal');
  const pdpGallery = document.getElementById('pdp-gallery');
  let lastFocused = null;

  document.querySelectorAll('.pdp-close').forEach((btn) =>
    btn.addEventListener('click', function () {
      this.closest('.pdp-modal').classList.remove('active');
      document.body.style.overflow = '';
      if (this.closest('#pdp-modal')) {
        pdpGallery.innerHTML = ''; // Memory cleanup
        if (lastFocused) lastFocused.focus();
        if (window.location.hash.startsWith('#EF-')) {
          window.history.replaceState(null, null, window.location.pathname + window.location.search);
        }
      }
    }),
  );

  productCards.forEach((card) => {
    card.addEventListener('click', function (e) {
      if (e.target.closest('.product-btn') || e.target.closest('a')) return;
      lastFocused = this;

      const title = this.querySelector('h3').textContent;
      const category = getCardCategory(this);
      const priceHTML = this.querySelector('.price-info')?.innerHTML || '';
      const specsHTML = this.querySelector('.hidden-specs')?.innerHTML || '';
      const sku =
        'EF-' +
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .toUpperCase();
      const count = parseInt(this.dataset.galleryCount || '1');

      // Determine image directory slug
      const imgMatch = this.querySelector('img')?.src.match(/images\/([^\/]+)\//);
      const slug = imgMatch ? imgMatch[1] : '';

      document.getElementById('pdp-title').textContent = title;
      document.getElementById('pdp-category').textContent = category;
      document.getElementById('pdp-sku').querySelector('span').textContent = sku;
      document.getElementById('pdp-price').innerHTML = priceHTML;
      document.getElementById('pdp-specs').innerHTML = specsHTML;

      // Generate Gallery
      pdpGallery.innerHTML = '';
      if (slug && count > 0) {
        const mainWrap = document.createElement('div');
        mainWrap.className = 'pdp-main-image-container';
        const mainImg = document.createElement('img');
        mainImg.className = 'pdp-main-image';
        mainImg.src = `images/${slug}/1.webp`;
        mainWrap.appendChild(mainImg);
        pdpGallery.appendChild(mainWrap);

        if (count > 1) {
          const thumbStrip = document.createElement('div');
          thumbStrip.className = 'pdp-thumb-strip';
          for (let i = 1; i <= count; i++) {
            const tWrap = document.createElement('div');
            tWrap.className = `pdp-thumb-wrapper ${i === 1 ? 'active' : ''}`;
            const tImg = document.createElement('img');
            tImg.className = 'pdp-thumb';
            tImg.src = `images/${slug}/${i}.webp`;
            tImg.onerror = () => (tWrap.style.display = 'none');
            tImg.onclick = () => {
              mainImg.src = tImg.src;
              thumbStrip.querySelectorAll('.pdp-thumb-wrapper').forEach((w) => w.classList.remove('active'));
              tWrap.classList.add('active');
            };
            tWrap.appendChild(tImg);
            thumbStrip.appendChild(tWrap);
          }
          pdpGallery.appendChild(thumbStrip);
        }
      }

      // Action Buttons
      const btnContainer = document.getElementById('pdp-action-btn');
      btnContainer.innerHTML = '';

      const bookDemoBtn = document.createElement('button');
      bookDemoBtn.className = 'product-btn';
      bookDemoBtn.textContent = 'Book a Free Demo'; // This could also be a translation key
      bookDemoBtn.onclick = (e) => {
        e.preventDefault();
        // IMPORTANT: Replace with your actual Calendly link
        const calendlyUrl = 'https://calendly.com/your-link/30min';
        Calendly.initPopupWidget({
          url: calendlyUrl,
          prefill: {
            name: '',
            email: '',
            customAnswers: {
              a1: `Product of Interest: ${title}`,
            },
          },
        });
        return false;
      };
      btnContainer.appendChild(bookDemoBtn);

      // Native Share Button
      const shareBtn = document.createElement('button');
      shareBtn.className = 'product-btn product-btn-secondary';
      shareBtn.innerHTML =
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-right: 6px;"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>Share';
      shareBtn.onclick = async () => {
        const url = window.location.href.split('#')[0] + '#' + sku;
        if (navigator.share) {
          try {
            await navigator.share({ title, url });
          } catch (err) {}
        } else {
          navigator.clipboard.writeText(url);
          shareBtn.innerHTML = 'Copied!';
          setTimeout(
            () =>
              (shareBtn.innerHTML =
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-right: 6px;"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>Share'),
            2000,
          );
        }
      };
      btnContainer.appendChild(shareBtn);

      // URL Direct linking
      if (window.history.pushState) window.history.pushState(null, null, '#' + sku);

      pdpModal.classList.add('active');
      pdpModal.scrollTop = 0;
      document.body.style.overflow = 'hidden';
      if (typeof updateWishlistUI === 'function') updateWishlistUI();
    });
  });

  // ============= 7. FAQ ACCORDION LOGIC =============
  document.querySelectorAll('.faq-tab').forEach((tab) => {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.faq-tab').forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.faq-tab-panel').forEach((p) => (p.hidden = true));
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');
      const panel = document.querySelector(`.faq-tab-panel[data-faq-panel="${this.dataset.faqTab}"]`);
      if (panel) panel.hidden = false;
    });
  });

  document.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', function () {
      const item = this.closest('.faq-item');
      const isActive = item.classList.contains('active');
      item
        .closest('.faq-tab-panel')
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

  // ============= 8. COUNTDOWN TIMER =============
  const cdEl = document.getElementById('offer-countdown');
  if (cdEl) {
    const endDate = new Date('May 31, 2026 23:59:59').getTime();
    const updateTimer = () => {
      const now = new Date().getTime();
      const dist = endDate - now;
      if (dist < 0) {
        if (typeof timer !== 'undefined') clearInterval(timer);
        cdEl.style.display = 'none';
        return;
      }
      document.getElementById('cd-days').textContent = Math.floor(dist / (1000 * 60 * 60 * 24))
        .toString()
        .padStart(2, '0');
      document.getElementById('cd-hours').textContent = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        .toString()
        .padStart(2, '0');
      document.getElementById('cd-minutes').textContent = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60))
        .toString()
        .padStart(2, '0');
      document.getElementById('cd-seconds').textContent = Math.floor((dist % (1000 * 60)) / 1000)
        .toString()
        .padStart(2, '0');
    };
    updateTimer(); // Initialize immediately to prevent the 1-second "00" flash
    const timer = setInterval(updateTimer, 1000);
  }

  // ============= 9. WISHLIST & SECONDARY MODALS =============
  const wishlistToggleBtns = document.querySelectorAll('.wishlist-toggle-btn');
  const wishlistModal = document.getElementById('wishlist-modal');
  const wishlistContainer = document.getElementById('wishlist-items-container');
  const wishlistClearBtn = document.getElementById('wishlist-clear-all');

  function getWishlist() {
    return JSON.parse(localStorage.getItem('ef_wishlist') || '[]');
  }
  function saveWishlist(list) {
    localStorage.setItem('ef_wishlist', JSON.stringify(list));
    updateWishlistUI();
  }

  function updateWishlistUI() {
    const list = getWishlist();
    document.querySelectorAll('.wishlist-badge').forEach((badge) => {
      badge.style.display = list.length > 0 ? 'flex' : 'none';
      badge.textContent = list.length;
    });
    const pdpWishBtn = document.getElementById('pdp-wishlist-btn');
    if (pdpWishBtn) {
      const currentSku = document.getElementById('pdp-sku').querySelector('span').textContent;
      pdpWishBtn.innerHTML = list.includes(currentSku)
        ? '<svg width="24" height="24" fill="#e63946" stroke="#e63946" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>'
        : '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';
    }
  }

  wishlistToggleBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      renderWishlist();
      if (wishlistModal) {
        wishlistModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  document.querySelectorAll('.wishlist-close, .sort-close').forEach((btn) =>
    btn.addEventListener('click', function () {
      this.closest('.pdp-modal').classList.remove('active');
      document.body.style.overflow = '';
    }),
  );

  if (wishlistClearBtn) {
    wishlistClearBtn.addEventListener('click', () => {
      saveWishlist([]);
      renderWishlist();
    });
  }

  function renderWishlist() {
    const list = getWishlist();
    if (!wishlistContainer) return;
    wishlistContainer.innerHTML = '';
    if (wishlistClearBtn) wishlistClearBtn.style.display = list.length > 0 ? 'block' : 'none';

    if (list.length === 0) {
      wishlistContainer.innerHTML =
        '<div class="wishlist-empty"><p data-i18n="wishlist_empty">Your wishlist is currently empty.</p></div>';
      if (window.applyTranslations) window.applyTranslations(document.documentElement.lang || 'en');
      return;
    }

    list.forEach((sku) => {
      const card = Array.from(productCards).find((c) => {
        const title = c.querySelector('h3').textContent;
        return (
          'EF-' +
            title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '')
              .toUpperCase() ===
          sku
        );
      });
      if (card) {
        const title = card.querySelector('h3').textContent;
        const price = card.querySelector('.price').textContent;
        const img = card.querySelector('img').src;
        const item = document.createElement('div');
        item.className = 'wishlist-item';
        item.innerHTML = `<img src="${img}" alt="${title}"><div class="wishlist-item-details"><div class="wishlist-item-title">${title}</div><div class="wishlist-item-price">${price}</div></div><button class="wishlist-item-remove" data-sku="${sku}">×</button>`;

        item.querySelector('.wishlist-item-title').addEventListener('click', () => {
          wishlistModal.classList.remove('active');
          document.body.style.overflow = '';
          document.getElementById('products').style.display = '';
          card.click();
        });

        item.querySelector('.wishlist-item-remove').addEventListener('click', (e) => {
          saveWishlist(getWishlist().filter((s) => s !== e.target.dataset.sku));
          renderWishlist();
        });
        wishlistContainer.appendChild(item);
      }
    });
  }

  document.getElementById('pdp-wishlist-btn')?.addEventListener('click', function () {
    const sku = document.getElementById('pdp-sku').querySelector('span').textContent;
    let list = getWishlist();
    if (list.includes(sku)) list = list.filter((item) => item !== sku);
    else list.push(sku);
    saveWishlist(list);
  });
  updateWishlistUI();

  // ============= 10. URL DIRECT LINKING (HASH ROUTING) =============
  function checkHashForModal() {
    if (window.location.hash.startsWith('#EF-')) {
      const sku = window.location.hash.substring(1);
      const targetCard = Array.from(productCards).find((c) => {
        const title = c.querySelector('h3').textContent;
        return (
          'EF-' +
            title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '')
              .toUpperCase() ===
          sku
        );
      });
      if (targetCard && !pdpModal.classList.contains('active')) {
        document.getElementById('products').style.display = '';
        targetCard.click();
      }
    }
  }
  window.addEventListener('hashchange', checkHashForModal);
  setTimeout(checkHashForModal, 300);

  // ============= 11. SCROLL TO TOP BUTTON =============
  const scrollToTopBtn = document.getElementById('scrollToTop');
  if (scrollToTopBtn) {
    window.addEventListener(
      'scroll',
      () => {
        if (window.scrollY > 300) {
          scrollToTopBtn.classList.add('show');
        } else {
          scrollToTopBtn.classList.remove('show');
        }
      },
      { passive: true },
    );

    scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ============= 12. PRODUCT CARD BUTTONS (CALENDLY) =============
  // Ensure all "Book a Demo" buttons on the main grid open the Calendly widget
  document.querySelectorAll('.product-card .product-btn').forEach((btn) => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation(); // Prevents the product details modal from opening simultaneously
      const title = this.closest('.product-card').querySelector('h3').textContent;
      const calendlyUrl = 'https://calendly.com/paraschausali48/30min'; // IMPORTANT: Replace with your link
      if (typeof Calendly !== 'undefined') {
        Calendly.initPopupWidget({
          url: calendlyUrl,
          prefill: { customAnswers: { a1: `Product of Interest: ${title}` } },
        });
      }
    });
  });

  // Apply default filtering state on load
  applyFilters();
});
