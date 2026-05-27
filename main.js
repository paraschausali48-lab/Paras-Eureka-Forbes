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

  document.querySelectorAll('.reveal').forEach((el) => {
    revealObserver.observe(el);
  });

  // ============= FACETED FILTERING ENGINE ======