/**
 * Core Observability Layer
 * Captures exceptions and web vitals in the wild, batching them
 * for efficient delivery to your APM without blocking the main thread.
 */

interface TelemetryEvent {
  type: 'error' | 'promise_rejection' | 'csp_violation' | 'web_vital';
  payload: any;
  timestamp: number;
}

const eventQueue: TelemetryEvent[] = [];
const BATCH_SIZE = 10;
const FLUSH_INTERVAL = 5000;

function queueEvent(type: TelemetryEvent['type'], payload: any) {
  eventQueue.push({ type, payload, timestamp: Date.now() });
  if (eventQueue.length >= BATCH_SIZE) {
    flushQueue();
  }
}

function flushQueue() {
  if (eventQueue.length === 0) return;
  const payload = JSON.stringify(eventQueue);

  // Use an absolute APM endpoint. GitHub Pages does not support relative /api routes.
  const endpoint = import.meta.env.PUBLIC_TELEMETRY_ENDPOINT || 'https://api.your-apm-service.com/v1/telemetry';

  // Use sendBeacon for reliable delivery even if the user navigates away
  if (navigator.sendBeacon) {
    // Force text/plain to prevent CORS preflight failures, which sendBeacon cannot handle.
    const blob = new Blob([payload], { type: 'text/plain' });
    navigator.sendBeacon(endpoint, blob);
  } else {
    // Fallback for unsupported browsers
    fetch(endpoint, {
      method: 'POST',
      body: payload,
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => {});
  }

  eventQueue.length = 0;
}

export function initTelemetry() {
  if (typeof window === 'undefined') return;

  // Periodically flush the queue, and ensure we flush when the user leaves the page
  setInterval(flushQueue, FLUSH_INTERVAL);
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushQueue();
  });

  // Flush telemetry queue during Astro view transitions
  document.addEventListener('astro:before-swap', () => {
    flushQueue();
  });

  window.addEventListener('error', (event: ErrorEvent) => {
    queueEvent('error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    queueEvent('promise_rejection', { reason: String(event.reason) });
  });

  // ============= SECURITY OBSERVABILITY =============
  window.addEventListener('securitypolicyviolation', (event: SecurityPolicyViolationEvent) => {
    queueEvent('csp_violation', {
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
        queueEvent('web_vital', { metric: 'LCP', value: Math.round(lastEntry.startTime) });
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      // Cumulative Layout Shift (CLS)
      new PerformanceObserver((entryList) => {
        let cls = 0;
        for (const entry of entryList.getEntries()) {
          const layoutShift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
          if (!layoutShift.hadRecentInput && layoutShift.value) cls += layoutShift.value;
        }
        if (cls > 0) queueEvent('web_vital', { metric: 'CLS', value: cls });
      }).observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      console.warn('[Telemetry] PerformanceObserver configuration failed', e);
    }
  }
}
