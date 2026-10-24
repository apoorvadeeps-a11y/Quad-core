/**
 * OneStep Dynamic Popup Script
 * Universal navigation and AI model training coordinator for any website.
 */

const BACKEND_URL = 'http://localhost:8000';

let currentPageData = null;
let currentResult = null;
let activeTabId = null;

// DOM Elements
const backendStatusEl = document.getElementById('backendStatus');
const statusTextEl = document.getElementById('statusText');
const siteDomainEl = document.getElementById('siteDomain');
const pageTitleEl = document.getElementById('pageTitle');
const pageMetaEl = document.getElementById('pageMeta');
const elementCountEl = document.getElementById('elementCount');
const goalInputEl = document.getElementById('goalInput');
const clearGoalBtn = document.getElementById('clearGoalBtn');
const chipContainerEl = document.getElementById('chipContainer');
const findStepBtn = document.getElementById('findStepBtn');
const resultCardEl = document.getElementById('resultCard');
const targetIdBadgeEl = document.getElementById('targetIdBadge');
const instructionTextEl = document.getElementById('instructionText');
const reasonTextEl = document.getElementById('reasonText');
const highlightBtn = document.getElementById('highlightBtn');
const clickBtn = document.getElementById('clickBtn');
const clearHighlightBtn = document.getElementById('clearHighlightBtn');
const saveTrainBtn = document.getElementById('saveTrainBtn');
const refreshPageBtn = document.getElementById('refreshPageBtn');
const trainCountBadgeEl = document.getElementById('trainCountBadge');
const trainingNoteEl = document.getElementById('trainingNote');
const errorMessageEl = document.getElementById('errorMessage');

// Check if a URL allows content script execution
function isScriptableUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const lower = url.toLowerCase();
  return !(
    lower.startsWith('chrome://') ||
    lower.startsWith('chrome-extension://') ||
    lower.startsWith('edge://') ||
    lower.startsWith('about:') ||
    lower.startsWith('view-source:') ||
    lower.includes('chromewebstore.google.com') ||
    lower.includes('chrome.google.com/webstore')
  );
}

// In-page scraping function executed directly inside the active tab
function inPageScrape() {
  function isVisible(el) {
    if (!el || el.closest('.onestep-ui-container')) return false;
    const style = window.getComputedStyle(el);
    if (
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      parseFloat(style.opacity || '1') === 0 ||
      el.getAttribute('aria-hidden') === 'true'
    ) {
      return false;
    }
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function extractText(node) {
    if (!node) return '';
    let text = (node.innerText || node.textContent || '').trim().replace(/\s+/g, ' ');
    if (!text && (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA')) {
      text = node.value || node.getAttribute('placeholder') || '';
    }
    if (!text) {
      text = node.getAttribute('aria-label') || node.getAttribute('title') || node.getAttribute('data-testid') || '';
    }
    if (!text) {
      const img = node.querySelector('img[alt]');
      if (img) text = img.getAttribute('alt') || '';
    }
    if (!text) {
      const svg = node.querySelector('svg');
      if (svg) {
        const svgTitle = svg.querySelector('title');
        text = (svgTitle ? svgTitle.textContent : '') || svg.getAttribute('aria-label') || '';
      }
    }
    if (!text) {
      const lower = ((node.className || '') + ' ' + (node.id || '') + ' ' + (node.getAttribute('data-testid') || '')).toLowerCase();
      if (lower.includes('search')) text = 'Search';
      else if (lower.includes('cart') || lower.includes('bag')) text = 'Cart';
      else if (lower.includes('menu') || lower.includes('nav')) text = 'Menu';
      else if (lower.includes('user') || lower.includes('profile')) text = 'Profile / Account';
      else if (lower.includes('close')) text = 'Close';
    }
    return text.trim();
  }

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
    '[role="checkbox"]',
    '[role="radio"]',
    '[role="switch"]',
    '[role="combobox"]',
    '[role="searchbox"]',
    '[role="option"]',
    '[tabindex="0"]',
    '[onclick]',
    '[data-action]',
    '[contenteditable="true"]'
  ];

  const candidates = Array.from(document.querySelectorAll(SELECTORS.join(', ')));
  const custom = document.querySelectorAll('div, span');
  for (let i = 0; i < Math.min(custom.length, 250); i++) {
    const el = custom[i];
    if (el.children.length <= 1 && isVisible(el)) {
      if (window.getComputedStyle(el).cursor === 'pointer' && !candidates.includes(el)) {
        candidates.push(el);
      }
    }
  }

  const elements = [];
  const seenIds = new Set();
  let counter = 1;

  for (const node of candidates) {
    if (!isVisible(node)) continue;

    // Skip nested children if their parent is already an interactive button, link, or candidate
    const isInsideOtherCandidate = candidates.some(
      (cand) => cand !== node && cand.contains(node)
    );
    if (isInsideOtherCandidate) continue;

    const parentInteractive = node.parentElement?.closest(
      'button, a, select, textarea, input, [role="button"], [role="link"], [role="tab"], [role="menuitem"], [tabindex="0"]'
    );
    if (parentInteractive && parentInteractive !== node) {
      continue;
    }

    const text = extractText(node);
    if (!text && !node.id && node.tagName !== 'INPUT' && !node.isContentEditable) continue;

    let elId = (node.id && node.id.trim().length <= 50) ? node.id.trim() : '';
    if (!elId || seenIds.has(elId)) {
      while (seenIds.has(`step_el_${counter}`)) {
        counter++;
      }
      elId = `step_el_${counter++}`;
      node.setAttribute('data-onestep-id', elId);
    }
    seenIds.add(elId);

    elements.push({
      id: elId,
      type: node.tagName.toLowerCase(),
      text: text.slice(0, 120),
      aria_label: (node.getAttribute('aria-label') || '').slice(0, 100),
      placeholder: (node.getAttribute('placeholder') || '').slice(0, 100),
      role: node.getAttribute('role') || undefined,
    });

    if (elements.length >= 100) break;
  }

  const h1 = document.querySelector('h1')?.innerText?.trim() || '';
  const h2 = document.querySelector('h2')?.innerText?.trim() || '';

  return {
    page: document.title || window.location.hostname,
    domain: window.location.hostname,
    url: window.location.href,
    heading: (h1 || h2 || '').slice(0, 150),
    elements: elements,
  };
}

// Initialize on popup load
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await checkBackendStatus();
  await updateTrainingStats();
  await initActiveTab();
});

// Setup click and input listeners
function setupEventListeners() {
  findStepBtn.addEventListener('click', handleFindNextStep);

  clearGoalBtn.addEventListener('click', () => {
    goalInputEl.value = '';
    goalInputEl.focus();
  });

  refreshPageBtn.addEventListener('click', async () => {
    refreshPageBtn.style.transform = 'rotate(180deg)';
    await initActiveTab();
    setTimeout(() => {
      refreshPageBtn.style.transform = 'none';
    }, 300);
  });

  highlightBtn.addEventListener('click', () => {
    if (currentResult && currentResult.element_id && activeTabId) {
      chrome.tabs.sendMessage(activeTabId, {
        action: 'HIGHLIGHT_ELEMENT',
        element_id: currentResult.element_id,
        instruction: currentResult.instruction,
      });
    }
  });

  clickBtn.addEventListener('click', async () => {
    if (currentResult && currentResult.element_id && activeTabId) {
      chrome.tabs.sendMessage(activeTabId, {
        action: 'CLICK_ELEMENT',
        element_id: currentResult.element_id,
      });
      // Save confirmed action as training data for Qwen
      await saveCurrentStepForTraining();
      setTimeout(() => window.close(), 150);
    }
  });

  clearHighlightBtn.addEventListener('click', () => {
    if (activeTabId) {
      chrome.tabs.sendMessage(activeTabId, { action: 'CLEAR_HIGHLIGHTS' });
    }
    resultCardEl.classList.add('hidden');
  });

  saveTrainBtn.addEventListener('click', async () => {
    await saveCurrentStepForTraining();
  });

  goalInputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFindNextStep();
    }
  });
}

// Check FastAPI backend status
async function checkBackendStatus() {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, { method: 'GET' });
    if (res.ok) {
      backendStatusEl.className = 'status-badge status-online';
      statusTextEl.textContent = 'Qwen AI Ready';
      return true;
    }
  } catch {}

  backendStatusEl.className = 'status-badge status-offline';
  statusTextEl.textContent = 'Backend Offline';
  showError('FastAPI backend not detected on port 8000. Start backend: uvicorn main:app --reload');
  return false;
}

// Fetch training dataset statistics from backend
async function updateTrainingStats() {
  try {
    const res = await fetch(`${BACKEND_URL}/train/stats`);
    if (res.ok) {
      const data = await res.json();
      trainCountBadgeEl.textContent = `${data.total_samples || 0} samples`;
    }
  } catch {}
}

// Save current step as training data
async function saveCurrentStepForTraining() {
  if (!currentPageData || !currentResult) return;

  try {
    const payload = {
      goal: goalInputEl.value.trim(),
      page: currentPageData.page,
      domain: currentPageData.domain,
      elements: currentPageData.elements,
      selected_element_id: currentResult.element_id,
      instruction: currentResult.instruction,
      reason: currentResult.reason,
    };

    const res = await fetch(`${BACKEND_URL}/train/collect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      showTrainingNote(`🧠 Saved to Qwen training dataset (${data.total_samples} total)!`);
      trainCountBadgeEl.textContent = `${data.total_samples} samples`;
    }
  } catch (err) {
    console.warn('[OneStep] Could not save training sample:', err);
  }
}

// Connect to the active Chrome tab and scrape interactive elements
async function initActiveTab() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];
    if (!tab || !tab.id) {
      pageTitleEl.textContent = 'No active tab detected';
      return;
    }
    activeTabId = tab.id;

    const url = tab.url || tab.pendingUrl || '';

    // Check if URL is inspectable
    if (!isScriptableUrl(url)) {
      siteDomainEl.textContent = 'Browser Page';
      pageTitleEl.textContent = 'Open any website (e.g. google.com, wikipedia.org, github.com) to navigate';
      elementCountEl.textContent = '0 elements';
      findStepBtn.disabled = true;
      renderUniversalChips([]);
      return;
    }

    findStepBtn.disabled = false;

    // Inject styles and content script
    try {
      await chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ['content.css'],
      });
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js'],
      });
    } catch {
      // Script may already be injected
    }

    // Direct in-page execution guarantees 100% reliable extraction on ANY website
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: inPageScrape,
    });

    const pageData = results[0]?.result;
    if (pageData && pageData.elements) {
      handleScrapeResponse(pageData);
    } else {
      pageTitleEl.textContent = tab.title || 'Webpage';
      elementCountEl.textContent = '0 elements';
    }
  } catch (err) {
    console.error('[OneStep] Scrape error:', err);
    pageTitleEl.textContent = 'Webpage ready (click 🔄 to inspect)';
  }
}

function handleScrapeResponse(response) {
  if (!response || !response.elements) {
    pageTitleEl.textContent = 'No interactive elements found';
    elementCountEl.textContent = '0 elements';
    renderUniversalChips([]);
    return;
  }

  currentPageData = response;
  const domain = response.domain || 'Active Site';
  siteDomainEl.textContent = domain.replace(/^www\./, '');
  pageTitleEl.textContent = response.page || domain;

  if (response.heading) {
    pageMetaEl.textContent = `Topic: ${response.heading}`;
    pageMetaEl.classList.remove('hidden');
  } else {
    pageMetaEl.classList.add('hidden');
  }

  elementCountEl.textContent = `${response.elements.length} elements`;
  hideError();

  generateDynamicChips(response);

  // Restore saved goal for this domain
  try {
    const savedGoal = sessionStorage.getItem(`onestep_goal_${domain}`);
    if (savedGoal && !goalInputEl.value) {
      goalInputEl.value = savedGoal;
    }
  } catch {}
}

// Generate smart chips dynamically based on website and detected elements
function generateDynamicChips(pageData) {
  const domain = (pageData.domain || '').toLowerCase();
  const elements = pageData.elements || [];
  const chips = [];

  if (domain.includes('github')) {
    chips.push('Search repositories', 'View pull requests', 'Fork repository', 'Sign in');
  } else if (domain.includes('google')) {
    chips.push('Search query', 'Google Images', 'Google Account', 'Settings');
  } else if (domain.includes('youtube')) {
    chips.push('Search videos', 'Subscriptions', 'Library', 'Trending');
  } else if (domain.includes('wikipedia')) {
    chips.push('Search Wikipedia', 'Contents', 'Random article', 'Current events');
  } else if (domain.includes('reddit')) {
    chips.push('Search Reddit', 'Log in', 'Popular communities', 'Dark mode');
  } else if (
    domain.includes('amazon') ||
    domain.includes('ebay') ||
    domain.includes('walmart') ||
    domain.includes('shop') ||
    domain.includes('store')
  ) {
    chips.push('Search products', 'Go to cart', 'Today\'s deals', 'Track orders');
  }

  if (chips.length < 3) {
    let hasSearch = false;
    let hasAuth = false;
    let hasCart = false;
    let hasHelp = false;

    for (const el of elements) {
      const combined = `${el.text || ''} ${el.aria_label || ''}`.toLowerCase();

      if (!hasSearch && (el.type === 'input' || combined.includes('search'))) {
        chips.push('Search on this page');
        hasSearch = true;
      }
      if (!hasAuth && (combined.includes('sign in') || combined.includes('login') || combined.includes('account'))) {
        chips.push('Sign in / Account');
        hasAuth = true;
      }
      if (!hasCart && (combined.includes('cart') || combined.includes('basket') || combined.includes('checkout'))) {
        chips.push('View shopping cart');
        hasCart = true;
      }
      if (!hasHelp && (combined.includes('contact') || combined.includes('support') || combined.includes('faq'))) {
        chips.push('Contact / Help');
        hasHelp = true;
      }

      if (chips.length >= 4) break;
    }
  }

  if (chips.length === 0) {
    chips.push('Find navigation menu', 'Sign in or register', 'Search website', 'Contact support');
  }

  renderUniversalChips(chips.slice(0, 4));
}

function renderUniversalChips(chipTexts) {
  chipContainerEl.innerHTML = '';
  chipTexts.forEach((text) => {
    const btn = document.createElement('button');
    btn.className = 'chip';
    btn.textContent = text;
    btn.addEventListener('click', () => {
      goalInputEl.value = text;
      goalInputEl.focus();
    });
    chipContainerEl.appendChild(btn);
  });
}

// Find next step via local backend
async function handleFindNextStep() {
  const goal = goalInputEl.value.trim();
  if (!goal) {
    showError('Please enter a goal for this webpage.');
    goalInputEl.focus();
    return;
  }

  if (!currentPageData || !currentPageData.elements || currentPageData.elements.length === 0) {
    showError('No interactive elements detected on the page to analyze.');
    return;
  }

  try {
    if (currentPageData.domain) {
      sessionStorage.setItem(`onestep_goal_${currentPageData.domain}`, goal);
    }
  } catch {}

  findStepBtn.disabled = true;
  findStepBtn.textContent = 'Reasoning with Qwen...';
  hideError();

  try {
    const payload = {
      goal,
      page: currentPageData.page || currentPageData.domain || 'Webpage',
      elements: currentPageData.elements,
    };

    const res = await fetch(`${BACKEND_URL}/next-step`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Backend returned status ${res.status}`);
    }

    const decision = await res.json();
    currentResult = decision;

    targetIdBadgeEl.textContent = decision.element_id || 'no element';
    instructionTextEl.textContent = decision.instruction || 'No action needed';
    reasonTextEl.textContent = decision.reason || '';
    resultCardEl.classList.remove('hidden');

    if (decision.element_id && activeTabId) {
      chrome.tabs.sendMessage(activeTabId, {
        action: 'HIGHLIGHT_ELEMENT',
        element_id: decision.element_id,
        instruction: decision.instruction,
      });
    }

    // Automatically record training sample in the background
    await saveCurrentStepForTraining();
  } catch (err) {
    showError(`Error: ${err.message}`);
  } finally {
    findStepBtn.disabled = false;
    findStepBtn.innerHTML = '<span>Find Next Step</span><span class="btn-arrow">→</span>';
  }
}

function showError(msg) {
  errorMessageEl.textContent = msg;
  errorMessageEl.classList.remove('hidden');
}

function hideError() {
  errorMessageEl.classList.add('hidden');
}

function showTrainingNote(msg) {
  trainingNoteEl.textContent = msg;
  trainingNoteEl.classList.remove('hidden');
  setTimeout(() => {
    trainingNoteEl.classList.add('hidden');
  }, 3500);
}
