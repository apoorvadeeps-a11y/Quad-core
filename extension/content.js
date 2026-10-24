/**
 * OneStep Dynamic Content Script
 * Works across any website (SPAs, modern web apps, traditional multi-page sites).
 * 
 * Features:
 * - Scrapes comprehensive interactive elements (buttons, links, inputs, ARIA widgets, custom clickable elements)
 * - Intelligently extracts text from text nodes, aria-labels, titles, SVGs, and icon classes
 * - Detects live page context (domain, heading, meta description, and dynamic suggestions)
 * - Dynamic SPA navigation detection (pushState, popState, hashChange)
 * - Resilient highlight overlay and interactive in-page floating guide
 */

let activeTooltip = null;
let currentTargetElement = null;

// Determine if element is visible and interactive
function isElementVisible(el) {
  if (!el || el.closest('.onestep-ui-container')) return false;

  const style = window.getComputedStyle(el);
  if (
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    parseFloat(style.opacity || '1') === 0
  ) {
    return false;
  }

  // Check aria-hidden
  if (el.getAttribute('aria-hidden') === 'true') {
    return false;
  }

  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

// Check if element is currently in user's viewport
function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
    rect.bottom > 0 &&
    rect.left < (window.innerWidth || document.documentElement.clientWidth) &&
    rect.right > 0
  );
}

// Extract human-meaningful text from an element, icon, or its children
function extractElementText(node) {
  if (!node) return '';

  // 1. Direct text content
  let text = (node.innerText || node.textContent || '').trim().replace(/\s+/g, ' ');

  // 2. Form input values / placeholders
  if (!text && (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA')) {
    text = node.value || node.getAttribute('placeholder') || '';
  }

  // 3. ARIA attributes & title
  if (!text) {
    text = node.getAttribute('aria-label') || node.getAttribute('title') || '';
  }

  // 4. Alt text from enclosed images
  if (!text) {
    const img = node.querySelector('img[alt]');
    if (img) text = img.getAttribute('alt') || '';
  }

  // 5. SVG title or aria-label
  if (!text) {
    const svg = node.querySelector('svg');
    if (svg) {
      const svgTitle = svg.querySelector('title');
      text = (svgTitle ? svgTitle.textContent : '') || svg.getAttribute('aria-label') || '';
    }
  }

  // 6. Heuristic for common icon-based buttons (search, cart, menu, user, close)
  if (!text) {
    const classList = (node.className || '') + ' ' + (node.id || '');
    const lower = classList.toLowerCase();
    if (lower.includes('search')) text = 'Search';
    else if (lower.includes('cart') || lower.includes('bag')) text = 'Cart';
    else if (lower.includes('menu') || lower.includes('nav-toggle')) text = 'Menu';
    else if (lower.includes('user') || lower.includes('profile') || lower.includes('avatar')) text = 'Account / Profile';
    else if (lower.includes('close') || lower.includes('dismiss')) text = 'Close';
    else if (lower.includes('filter')) text = 'Filter';
    else if (lower.includes('sort')) text = 'Sort';
    else if (lower.includes('help') || lower.includes('support')) text = 'Help / Support';
    else if (lower.includes('bell') || lower.includes('notif')) text = 'Notifications';
  }

  // 7. Check associated label (for inputs)
  if (!text && node.id) {
    const label = document.querySelector(`label[for="${node.id}"]`);
    if (label) text = (label.innerText || label.textContent || '').trim();
  }

  return text.trim();
}

// Scrape interactive elements on any website
function scrapeInteractiveElements() {
  const SELECTORS = [
    'button',
    'a[href]',
    'input:not([type="hidden"])',
    'select',
    'textarea',
    'summary',
    '[role="button"]',
    '[role="link"]',
    '[role="tab"]',
    '[role="menuitem"]',
    '[role="menuitemcheckbox"]',
    '[role="menuitemradio"]',
    '[role="checkbox"]',
    '[role="radio"]',
    '[role="switch"]',
    '[role="combobox"]',
    '[role="searchbox"]',
    '[role="option"]',
    '[tabindex="0"]',
    '[onclick]',
    '[data-action]',
    '[data-click]',
    '[jsaction]'
  ];

  const elements = [];
  const seenIds = new Set();
  const seenTextFingerprints = new Set();
  let counter = 1;

  // Query all standard interactive candidates
  const nodes = Array.from(document.querySelectorAll(SELECTORS.join(', ')));

  // Also query elements with pointer cursor that might be custom clickable div/spans
  const customClickables = document.querySelectorAll('div, span, li');
  for (let i = 0; i < Math.min(customClickables.length, 300); i++) {
    const el = customClickables[i];
    if (el.children.length <= 2 && isElementVisible(el)) {
      const style = window.getComputedStyle(el);
      if (style.cursor === 'pointer' && !nodes.includes(el)) {
        nodes.push(el);
      }
    }
  }

  for (const node of nodes) {
    if (!isElementVisible(node)) continue;

    const rawText = extractElementText(node);
    // Ignore completely empty elements with no action
    if (!rawText && !node.id && node.tagName !== 'INPUT') continue;

    // Determine or assign stable element identifier
    let elId = node.id ? node.id.trim() : '';
    if (!elId || seenIds.has(elId) || elId.length > 50) {
      elId = node.getAttribute('data-onestep-id');
      if (!elId || seenIds.has(elId)) {
        elId = `step_el_${counter++}`;
        node.setAttribute('data-onestep-id', elId);
      }
    }
    seenIds.add(elId);

    // Filter duplicate identical navigation links if redundant
    const type = node.tagName.toLowerCase();
    const fingerprint = `${type}:${rawText.slice(0, 40).toLowerCase()}`;
    if (rawText && seenTextFingerprints.has(fingerprint) && elements.length > 50) {
      continue;
    }
    if (rawText) seenTextFingerprints.add(fingerprint);

    const item = {
      id: elId,
      type: type,
      text: rawText.slice(0, 120),
      in_viewport: isElementInViewport(node),
    };

    const ariaLabel = node.getAttribute('aria-label');
    if (ariaLabel) item.aria_label = ariaLabel.trim().slice(0, 100);

    const placeholder = node.getAttribute('placeholder');
    if (placeholder) item.placeholder = placeholder.trim().slice(0, 100);

    const role = node.getAttribute('role');
    if (role) item.role = role.trim();

    elements.push(item);

    // Limit to top 100 most relevant elements to avoid oversized payloads
    if (elements.length >= 100) break;
  }

  // Extract page context
  const h1 = document.querySelector('h1');
  const h2 = document.querySelector('h2');
  const mainHeading = h1 ? h1.innerText.trim() : (h2 ? h2.innerText.trim() : '');

  // Extract meta description
  const metaDesc = document.querySelector('meta[name="description"]');
  const description = metaDesc ? metaDesc.getAttribute('content') : '';

  return {
    page: document.title || window.location.hostname,
    domain: window.location.hostname,
    url: window.location.href,
    heading: mainHeading ? mainHeading.slice(0, 150) : '',
    description: description ? description.slice(0, 200) : '',
    elements: elements,
  };
}

// Find element by id or data-onestep-id
function findTargetNode(targetId) {
  if (!targetId) return null;
  let node = document.getElementById(targetId);
  if (node) return node;
  node = document.querySelector(`[data-onestep-id="${targetId}"]`);
  return node;
}

// Clear any existing highlight and floating tooltip
function clearHighlights() {
  document.querySelectorAll('.onestep-highlight-target').forEach((el) => {
    el.classList.remove('onestep-highlight-target');
  });
  if (activeTooltip) {
    activeTooltip.remove();
    activeTooltip = null;
  }
  currentTargetElement = null;
}

// Highlight a specific element with glow and floating tooltip
function highlightElement(targetId, instruction) {
  clearHighlights();

  const el = findTargetNode(targetId);
  if (!el) {
    console.warn(`[OneStep] Target element '${targetId}' not found on page.`);
    return false;
  }

  currentTargetElement = el;
  el.classList.add('onestep-highlight-target');
  el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });

  // Create floating instruction tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'onestep-tooltip onestep-ui-container';
  tooltip.innerHTML = `
    <span class="onestep-badge">ONESTEP</span>
    <span class="onestep-instruction-text">👉 ${instruction || 'Click here'}</span>
    <button class="onestep-action-pill" id="onestepDirectClickBtn" title="Perform action">⚡ Click</button>
    <button class="onestep-close-pill" id="onestepDismissBtn" title="Dismiss">✕</button>
  `;

  // Position tooltip relative to element
  const rect = el.getBoundingClientRect();
  const topPos = Math.max(10, window.scrollY + rect.top - 46);
  const leftPos = Math.max(10, Math.min(window.scrollX + rect.left, window.innerWidth - 320));
  tooltip.style.top = `${topPos}px`;
  tooltip.style.left = `${leftPos}px`;

  // Button actions
  tooltip.querySelector('#onestepDirectClickBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    clickTarget(targetId);
  });

  tooltip.querySelector('#onestepDismissBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    clearHighlights();
  });

  // Clicking the tooltip body also clicks the element
  tooltip.addEventListener('click', () => {
    clickTarget(targetId);
  });

  document.body.appendChild(tooltip);
  activeTooltip = tooltip;
  return true;
}

// Click the target element safely
function clickTarget(targetId) {
  const el = findTargetNode(targetId);
  if (el) {
    // If it's an input or textarea, focus it
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable) {
      el.focus();
    } else {
      el.click();
    }
    clearHighlights();
    return true;
  }
  return false;
}

// SPA Navigation listener - notifies extension when client-side routing occurs
(function setupSpaObserver() {
  let lastUrl = location.href;

  const notifyRouteChange = () => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      try {
        chrome.runtime.sendMessage({ action: 'PAGE_NAVIGATED', url: currentUrl });
      } catch {
        // Extension context might be unloaded or closed
      }
    }
  };

  window.addEventListener('popstate', notifyRouteChange);
  window.addEventListener('hashchange', notifyRouteChange);

  // Monkey patch pushState and replaceState for React / Next / Vue SPAs
  const origPushState = history.pushState;
  if (origPushState) {
    history.pushState = function (...args) {
      origPushState.apply(this, args);
      notifyRouteChange();
    };
  }

  const origReplaceState = history.replaceState;
  if (origReplaceState) {
    history.replaceState = function (...args) {
      origReplaceState.apply(this, args);
      notifyRouteChange();
    };
  }
})();

// Message listener from popup / background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'SCRAPE_PAGE') {
    const data = scrapeInteractiveElements();
    sendResponse(data);
  } else if (request.action === 'HIGHLIGHT_ELEMENT') {
    const success = highlightElement(request.element_id, request.instruction);
    sendResponse({ success });
  } else if (request.action === 'CLICK_ELEMENT') {
    const success = clickTarget(request.element_id);
    sendResponse({ success });
  } else if (request.action === 'CLEAR_HIGHLIGHTS') {
    clearHighlights();
    sendResponse({ success: true });
  }
  return true; // asynchronous reply
});
