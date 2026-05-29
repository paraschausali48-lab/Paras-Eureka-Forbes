/**
 * Core Observability Layer
 * Captures exceptions in the wild to prevent silent production failures.
 */
export function initTelemetry() {
  if (typeof window === 'undefined') return;

  window.addEventListener('error', (event: ErrorEvent) => {
    // In production, dispatch this to your APM (Sentry, Datadog, etc.)
    console.error('[Telemetry] Uncaught Exception:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    // Tracks broken fetch requests, unhandled Astro router fails, etc.
    console.error('[Telemetry] Unhandled Promise Rejection:', event.reason);
  });

  // ============= SECURITY OBSERVABILITY =============
  window.addEventListener('securitypolicyviolation', (event: SecurityPolicyViolationEvent) => {
    // Dispatches an alert when an XSS attack is blocked by your CSP
    console.error('[Telemetry] CSP Violation Detected:', {
      blockedURI: event.blockedURI,
      violatedDirective: event.violatedDirective,
      originalPolicy: event.originalPolicy,
    });
  });

  // ============= PERFORMANCE OBSERVABILITY (Web Vitals) =============
  if ('PerformanceObserver' in window) {
    try {
      // Largest Contentful Paint (LCP)
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.debug(`[Telemetry] LCP: ${Math.round(lastEntry.startTime)}ms`);
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      // Cumulative Layout Shift (CLS)
      new PerformanceObserver((entryList) => {
        let cls = 0;
        for (const entry of entryList.getEntries()) {
          // Type safely access CLS specific properties without 'any'
          const layoutShift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
          if (!layoutShift.hadRecentInput && layoutShift.value) cls += layoutShift.value;
        }
        if (cls > 0) console.debug(`[Telemetry] CLS: ${cls.toFixed(3)}`);
      }).observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      console.warn('[Telemetry] PerformanceObserver configuration failed', e);
    }
  }
}
