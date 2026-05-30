export interface ClickAction {
  selector: string;
  handle: (el: HTMLElement, e: Event) => void;
}

const clickHandlers: ClickAction[] = [];

/**
 * Registers a global click handler. Modules use this to attach
 * their domain-specific UI behaviors without mutating main.ts.
 */
export function registerClickAction(action: ClickAction) {
  clickHandlers.push(action);
}

/**
 * Centralized event delegation router.
 * Attaches exactly once to the document to survive Astro view transitions.
 */
export function initGlobalEventRouter() {
  document.addEventListener('click', (e: Event) => {
    const target = e.target as HTMLElement;
    for (const action of clickHandlers) {
      const matchedEl = target.closest(action.selector) as HTMLElement;
      if (matchedEl) {
        action.handle(matchedEl, e);
        return; // Ensure only one handler executes per click
      }
    }
  });
}
