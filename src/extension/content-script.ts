import {
  extractPageSnapshot,
  getElementById,
  executeDomAction,
} from './dom-extractor';
import { ExtensionMessage, ExtensionResponse, PlannedAction, AutofillMapping } from './types';
import { getOptimalHighlightColor } from '../utils/contrast';

// Highlight DOM elements injected into the host page
let activeHighlightOverlay: HTMLDivElement | null = null;
let activeTooltipEl: HTMLDivElement | null = null;
let removeScrollListener: (() => void) | null = null;

/**
 * Removes any active highlight overlays on the page
 */
function removeActiveHighlight() {
  if (activeHighlightOverlay) {
    activeHighlightOverlay.remove();
    activeHighlightOverlay = null;
  }
  if (activeTooltipEl) {
    activeTooltipEl.remove();
    activeTooltipEl = null;
  }
  if (removeScrollListener) {
    removeScrollListener();
    removeScrollListener = null;
  }
}

/**
 * Draws a high-contrast 3px glowing outline + floating tooltip on a target element
 */
function highlightElement(elementId: string, tooltipText: string, reason?: string) {
  removeActiveHighlight();

  const target = getElementById(elementId);
  if (!target) {
    return { success: false, error: `Element ${elementId} not found or not visible.` };
  }

  // Scroll target into view
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Compute adaptive contrast color from OneStep palette
  const highlightConfig = getOptimalHighlightColor(target);

  const updatePosition = () => {
    if (!target.isConnected) {
      removeActiveHighlight();
      return;
    }
    const rect = target.getBoundingClientRect();

    if (activeHighlightOverlay) {
      activeHighlightOverlay.style.top = `${rect.top + window.scrollY - 3}px`;
      activeHighlightOverlay.style.left = `${rect.left + window.scrollX - 3}px`;
      activeHighlightOverlay.style.width = `${rect.width + 6}px`;
      activeHighlightOverlay.style.height = `${rect.height + 6}px`;
    }

    if (activeTooltipEl) {
      const isNearTop = rect.top < 60;
      activeTooltipEl.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
      activeTooltipEl.style.top = isNearTop
        ? `${rect.bottom + window.scrollY + 10}px`
        : `${rect.top + window.scrollY - 36}px`;
    }
  };

  const rect = target.getBoundingClientRect();

  // Create outline container (non-blocking pointer-events: none)
  const overlay = document.createElement('div');
  overlay.id = 'onestep-extension-highlight';
  overlay.style.position = 'absolute';
  overlay.style.top = `${rect.top + window.scrollY - 3}px`;
  overlay.style.left = `${rect.left + window.scrollX - 3}px`;
  overlay.style.width = `${rect.width + 6}px`;
  overlay.style.height = `${rect.height + 6}px`;
  overlay.style.border = `3px solid ${highlightConfig.hex}`;
  overlay.style.borderRadius = '8px';
  overlay.style.boxShadow = `0 0 0 1px rgba(255, 255, 255, 0.4), 0 0 20px 4px ${highlightConfig.glow}`;
  overlay.style.pointerEvents = 'none';
  overlay.style.zIndex = '2147483640';
  overlay.style.transition = 'all 0.2s ease-out';
  document.body.appendChild(overlay);
  activeHighlightOverlay = overlay;

  // Create floating tooltip
  const tooltip = document.createElement('div');
  tooltip.id = 'onestep-extension-tooltip';
  tooltip.style.position = 'absolute';
  tooltip.style.transform = 'translateX(-50%)';
  tooltip.style.zIndex = '2147483645';
  tooltip.style.pointerEvents = 'auto';
  tooltip.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  tooltip.style.fontSize = '12px';
  tooltip.style.fontWeight = '600';
  tooltip.style.padding = '5px 12px';
  tooltip.style.borderRadius = '6px';
  tooltip.style.backgroundColor = highlightConfig.badgeBg;
  tooltip.style.color = highlightConfig.badgeText;
  tooltip.style.boxShadow = '0 4px 14px rgba(0,0,0,0.2)';
  tooltip.style.whiteSpace = 'nowrap';
  tooltip.style.cursor = 'pointer';
  tooltip.style.display = 'flex';
  tooltip.style.alignItems = 'center';
  tooltip.style.gap = '6px';
  tooltip.innerHTML = `<span style="width:6px; height:6px; border-radius:50%; background:white; display:inline-block;"></span> <span>${tooltipText || 'Click here'}</span>`;

  tooltip.onclick = () => {
    target.focus();
    target.click();
    removeActiveHighlight();
  };

  const isNearTop = rect.top < 60;
  tooltip.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
  tooltip.style.top = isNearTop
    ? `${rect.bottom + window.scrollY + 10}px`
    : `${rect.top + window.scrollY - 36}px`;

  document.body.appendChild(tooltip);
  activeTooltipEl = tooltip;

  const onScrollOrResize = () => updatePosition();
  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize, { passive: true });

  removeScrollListener = () => {
    window.removeEventListener('scroll', onScrollOrResize);
    window.removeEventListener('resize', onScrollOrResize);
  };

  return { success: true };
}

/**
 * Executes batch autofill on approved fields
 */
function executeAutofill(mappings: AutofillMapping[]): { filled: number; skipped: number; details: string[] } {
  let filled = 0;
  let skipped = 0;
  const details: string[] = [];

  for (const map of mappings) {
    const el = getElementById(map.element_id);
    if (!el || (el as HTMLInputElement).disabled) {
      skipped++;
      details.push(`Skipped [${map.element_id}] (${map.field_label}): not found or disabled`);
      continue;
    }

    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      const input = el as HTMLInputElement;
      input.focus();
      input.value = map.proposed_value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new Event('blur', { bubbles: true }));
      filled++;
      details.push(`Filled [${map.element_id}] (${map.field_label}) with "${map.proposed_value}"`);
    } else if (el.tagName === 'SELECT') {
      const select = el as HTMLSelectElement;
      let matched = false;
      const targetVal = map.proposed_value.toLowerCase();
      for (let i = 0; i < select.options.length; i++) {
        const opt = select.options[i];
        if (opt.value.toLowerCase() === targetVal || opt.text.toLowerCase().includes(targetVal)) {
          select.selectedIndex = i;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          matched = true;
          break;
        }
      }
      if (matched) {
        filled++;
        details.push(`Selected "${map.proposed_value}" for [${map.element_id}] (${map.field_label})`);
      } else {
        skipped++;
        details.push(`Could not match option "${map.proposed_value}" in select [${map.element_id}]`);
      }
    }
  }

  return { filled, skipped, details };
}

// Main message listener for Chrome extension runtime
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener(
    (message: ExtensionMessage<any>, _sender: chrome.runtime.MessageSender, sendResponse: (res: ExtensionResponse<any>) => void) => {
      try {
        switch (message.type) {
          case 'PING': {
            sendResponse({ success: true, data: 'PONG' });
            break;
          }

          case 'CAPTURE_PAGE_DOM': {
            const snapshot = extractPageSnapshot(document);
            sendResponse({ success: true, data: snapshot });
            break;
          }

          case 'HIGHLIGHT_DOM_ELEMENT': {
            const { element_id, tooltipText, reason } = message.payload || {};
            const result = highlightElement(element_id, tooltipText, reason);
            sendResponse({ success: result.success, error: result.error });
            break;
          }

          case 'CLEAR_DOM_HIGHLIGHT': {
            removeActiveHighlight();
            sendResponse({ success: true });
            break;
          }

          case 'EXECUTE_ELEMENT_ACTION': {
            const action: PlannedAction = message.payload;
            const execResult = executeDomAction(action);
            sendResponse({ success: execResult.success, error: execResult.success ? undefined : execResult.message, data: execResult });
            break;
          }

          case 'EXECUTE_AUTOFILL': {
            const mappings: AutofillMapping[] = message.payload?.mappings || [];
            const autofillResult = executeAutofill(mappings);
            sendResponse({ success: true, data: autofillResult });
            break;
          }

          case 'VERIFY_PAGE_COMPLETION': {
            const evidencePattern = message.payload?.evidenceText || '';
            const pageText = document.body.innerText.toLowerCase();
            const found = evidencePattern ? pageText.includes(evidencePattern.toLowerCase()) : false;
            sendResponse({ success: true, data: { found, url: window.location.href } });
            break;
          }

          default:
            sendResponse({ success: false, error: `Unknown content-script action: ${message.type}` });
        }
      } catch (err: any) {
        sendResponse({ success: false, error: String(err.message || err) });
      }
      return true; // Keep asynchronous channel open
    }
  );
}
