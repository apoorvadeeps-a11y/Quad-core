/**
 * OneStep Dynamic Popup Script
 * Universal navigation coordinator for any website.
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
const refreshPageBtn = document.getElementById('refreshPageBtn');
const errorMessageEl = document.getElementById('errorMessage');

// Initialize on popup load
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await checkBackendStatus();
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

  // Highlight button
  highlightBtn.addEventListener('click', () => {
    if (currentResult && currentResult.element_id && activeTabId) {
      chrome.tabs.sendMessage(activeTabId, {
        action: 'HIGHLIGHT_ELEMENT',
        element_id: currentResult.element_id,
        instruction: currentResult.instruction,
      });
    }
  });

  // Click it for me button
  clickBtn.addEventListener('click', () => {
    if (currentResult && currentResult.element_id && activeTabId) {
      chrome.tabs.sendMessage(activeTabId, {
        action: 'CLICK_ELEMENT',
        element_id: currentResult.element_id,
      });
      // Close popup after triggering action so user sees immediate interaction
      setTimeout(() => window.close(), 150);
    }
  });

  // Clear highlight button
  clearHighlightBtn.addEventListener('click', () => {
    if (activeTabId) {
      chrome.tabs.sendMessage(activeTabId, { action: 'CLEAR_HIGHLIGHTS' });
    }
    resultCardEl.classList.add('hidden');
  });

  // Listen for Enter key in goal input
  goalInputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFindNextStep();
    }
  });
}

// 1. Check if FastAPI backend is healthy
async function checkBackendStatus() {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, { method: 'GET' });
    if (res.ok) {
      backendStatusEl.className = 'status-badge status-online';
      statusTextEl.textContent = 'Qwen AI Ready';
      return true;
    }
  } catch {
    // offline
  }

  backendStatusEl.className = 'status-badge status-offline';
  statusTextEl.textContent = 'Backend Offline';
  showError('FastAPI backend not detected on port 8000. Start backend: uvicorn main:app --reload');
  return false;
}

// 2. Connect to the active Chrome tab and scrape interactive elements
async function initActiveTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      pageTitleEl.textContent = 'Unable to access active tab';
      return;
    }
    activeTabId = tab.id;

    // Check if URL is inspectable (skip chrome:// or edge:// pages)
    if (
      tab.url.startsWith('chrome://') ||
      tab.url.startsWith('edge://') ||
      tab.url.startsWith('about:') ||
      tab.url.startsWith('chrome-extension://')
    ) {
      siteDomainEl.textContent = 'Browser Internal';
      pageTitleEl.textContent = 'Internal browser tab (navigate to any live website)';
      elementCountEl.textContent = '0 elements';
      findStepBtn.disabled = true;
      renderUniversalChips([]);
      return;
    }

    findStepBtn.disabled = false;

    // Try communicating with content script
    chrome.tabs.sendMessage(tab.id, { action: 'SCRAPE_PAGE' }, (response) => {
      if (chrome.runtime.lastError || !response) {
        // Content script might need to be injected on pre-existing tabs
        chrome.scripting.executeScript(
          {
            target: { tabId: tab.id },
            files: ['content.js'],
          },
          () => {
            chrome.scripting.insertCSS({
              target: { tabId: tab.id },
              files: ['content.css'],
            });
            // Retry scrape after injection
            setTimeout(() => {
              chrome.tabs.sendMessage(tab.id, { action: 'SCRAPE_PAGE' }, handleScrapeResponse);
            }, 120);
          }
        );
      } else {
        handleScrapeResponse(response);
      }
    });
  } catch (err) {
    pageTitleEl.textContent = 'Failed to inspect page';
    console.error(err);
  }
}

function handleScrapeResponse(response) {
  if (!response || !response.elements) {
    pageTitleEl.textContent = 'No interactive elements detected';
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
  } else if (response.description) {
    pageMetaEl.textContent = response.description;
    pageMetaEl.classList.remove('hidden');
  } else {
    pageMetaEl.classList.add('hidden');
  }

  elementCountEl.textContent = `${response.elements.length} elements`;
  hideError();

  // Dynamically generate contextual chips based on the site and elements
  generateDynamicChips(response);

  // Restore saved goal for this domain if available
  try {
    const savedGoal = sessionStorage.getItem(`onestep_goal_${domain}`);
    if (savedGoal && !goalInputEl.value) {
      goalInputEl.value = savedGoal;
    }
  } catch {
    // sessionStorage fallback
  }
}

// Generate smart chips dynamically based on website and detected elements
function generateDynamicChips(pageData) {
  const domain = (pageData.domain || '').toLowerCase();
  const elements = pageData.elements || [];
  const chips = [];

  // 1. Domain-specific smart heuristics
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

  // 2. Element-derived heuristics (works for any arbitrary website!)
  if (chips.length < 3) {
    let hasSearch = false;
    let hasAuth = false;
    let hasCart = false;
    let hasHelp = false;

    for (const el of elements) {
      const text = (el.text || '').toLowerCase();
      const aria = (el.aria_label || '').toLowerCase();
      const combined = `${text} ${aria}`;

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

  // 3. Fallbacks if site has minimal cues
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

// 3. Find next step via local backend
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

  // Save goal for domain
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Backend returned status ${res.status}`);
    }

    const decision = await res.json();
    currentResult = decision;

    // Display recommendation card
    targetIdBadgeEl.textContent = decision.element_id || 'no element';
    instructionTextEl.textContent = decision.instruction || 'No action needed';
    reasonTextEl.textContent = decision.reason || '';
    resultCardEl.classList.remove('hidden');

    // Automatically highlight the element on the webpage
    if (decision.element_id && activeTabId) {
      chrome.tabs.sendMessage(activeTabId, {
        action: 'HIGHLIGHT_ELEMENT',
        element_id: decision.element_id,
        instruction: decision.instruction,
      });
    }
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
