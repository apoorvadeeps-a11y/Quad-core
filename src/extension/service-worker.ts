import {
  OllamaConfig,
  ExtensionMessage,
  ExtensionResponse,
  PageSnapshot,
  AiPlanResponse,
  PlannedAction,
} from './types';
import {
  DEFAULT_OLLAMA_CONFIG,
  testOllamaConnection,
  requestOllamaPlan,
} from './ollama-client';

const STORAGE_KEY_CONFIG = 'onestep_ollama_config';

/**
 * Loads current Ollama configuration from chrome.storage.local with defaults
 */
async function loadConfig(): Promise<OllamaConfig> {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    const data = await chrome.storage.local.get(STORAGE_KEY_CONFIG);
    if (data && data[STORAGE_KEY_CONFIG]) {
      return { ...DEFAULT_OLLAMA_CONFIG, ...data[STORAGE_KEY_CONFIG] };
    }
  }
  return DEFAULT_OLLAMA_CONFIG;
}

/**
 * Saves Ollama configuration to chrome.storage.local
 */
async function saveConfig(config: Partial<OllamaConfig>): Promise<OllamaConfig> {
  const current = await loadConfig();
  const updated = { ...current, ...config };
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    await chrome.storage.local.set({ [STORAGE_KEY_CONFIG]: updated });
  }
  return updated;
}

/**
 * Ensures content-script.js is injected into the active tab before communicating
 */
async function ensureContentScriptInjected(tabId: number): Promise<void> {
  try {
    // Ping content script to see if it's already listening
    const pong = await chrome.tabs.sendMessage(tabId, { type: 'PING' });
    if (pong?.success) {
      return;
    }
  } catch {
    // If receiving end doesn't exist, inject via scripting API
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content-script.js'],
    });
    // Brief settling delay
    await new Promise((resolve) => setTimeout(resolve, 80));
  } catch (err: any) {
    throw new Error(
      `Could not inject content script on tab ${tabId}: ${err.message || err}. Ensure you are on a standard http/https webpage.`
    );
  }
}

/**
 * Sends a message to the active tab's content script on demand
 */
async function sendMessageToActiveTab<T = any>(message: ExtensionMessage): Promise<T> {
  if (typeof chrome === 'undefined' || !chrome.tabs) {
    throw new Error('Chrome tabs API is not available in this environment.');
  }

  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!activeTab || !activeTab.id) {
    throw new Error('No active browser tab found.');
  }

  // Check for restricted URLs (chrome://, edge://, about:blank, chrome-extension://)
  const url = activeTab.url || '';
  if (
    url.startsWith('chrome://') ||
    url.startsWith('chrome-extension://') ||
    url.startsWith('edge://') ||
    url.startsWith('about:') ||
    url.startsWith('view-source:')
  ) {
    throw new Error(
      `OneStep cannot interact with restricted browser internal pages (${url}). Please navigate to a standard web page (http:// or https://).`
    );
  }

  // Inject content script on demand
  await ensureContentScriptInjected(activeTab.id);

  try {
    const response: ExtensionResponse<T> = await chrome.tabs.sendMessage(activeTab.id, message);
    if (!response || !response.success) {
      throw new Error(response?.error || 'Content script returned failure.');
    }
    return response.data as T;
  } catch (err: any) {
    throw new Error(err.message || 'Failed communicating with content script.');
  }
}

/**
 * Configures Side Panel to open ONLY when user clicks the extension toolbar icon.
 * No automatic opening on tab activation, web navigation, or site load!
 */
function setupSidePanelBehavior() {
  if (typeof chrome !== 'undefined' && chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch((err: any) => console.warn('Could not set side panel behavior:', err));
  }
}

setupSidePanelBehavior();

if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onInstalled) {
  chrome.runtime.onInstalled.addListener(() => {
    setupSidePanelBehavior();
  });
}

// Extension message listener
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener(
    (message: ExtensionMessage<any>, _sender: chrome.runtime.MessageSender, sendResponse: (res: ExtensionResponse<any>) => void) => {
      (async () => {
        try {
          switch (message.type) {
            case 'TEST_OLLAMA_CONNECTION': {
              const url = message.payload?.baseUrl || (await loadConfig()).baseUrl;
              const testResult = await testOllamaConnection(url);
              sendResponse({
                success: testResult.ok,
                data: testResult,
                error: testResult.error,
                errorCategory: testResult.ok ? undefined : 'OLLAMA_OFFLINE',
              });
              break;
            }

            case 'GET_OLLAMA_STATUS': {
              const config = await loadConfig();
              sendResponse({ success: true, data: config });
              break;
            }

            case 'SAVE_OLLAMA_CONFIG': {
              const saved = await saveConfig(message.payload);
              sendResponse({ success: true, data: saved });
              break;
            }

            case 'CAPTURE_PAGE_DOM': {
              const snapshot = await sendMessageToActiveTab<PageSnapshot>({
                type: 'CAPTURE_PAGE_DOM',
              });
              sendResponse({ success: true, data: snapshot });
              break;
            }

            case 'REQUEST_AI_PLAN': {
              const { goal, taskHistory = [] } = message.payload || {};
              const config = await loadConfig();

              // Capture fresh page snapshot on demand
              const snapshot = await sendMessageToActiveTab<PageSnapshot>({
                type: 'CAPTURE_PAGE_DOM',
              });

              // Query Ollama with Qwen 2.5
              const plan = await requestOllamaPlan(goal, snapshot, config, taskHistory);
              sendResponse({ success: true, data: { plan, snapshot } });
              break;
            }

            case 'HIGHLIGHT_DOM_ELEMENT': {
              await sendMessageToActiveTab({
                type: 'HIGHLIGHT_DOM_ELEMENT',
                payload: message.payload,
              });
              sendResponse({ success: true });
              break;
            }

            case 'CLEAR_DOM_HIGHLIGHT': {
              await sendMessageToActiveTab({
                type: 'CLEAR_DOM_HIGHLIGHT',
              });
              sendResponse({ success: true });
              break;
            }

            case 'EXECUTE_ELEMENT_ACTION': {
              const result = await sendMessageToActiveTab({
                type: 'EXECUTE_ELEMENT_ACTION',
                payload: message.payload,
              });
              sendResponse({ success: true, data: result });
              break;
            }

            case 'EXECUTE_AUTOFILL': {
              const result = await sendMessageToActiveTab({
                type: 'EXECUTE_AUTOFILL',
                payload: message.payload,
              });
              sendResponse({ success: true, data: result });
              break;
            }

            case 'VERIFY_PAGE_COMPLETION': {
              const result = await sendMessageToActiveTab({
                type: 'VERIFY_PAGE_COMPLETION',
                payload: message.payload,
              });
              sendResponse({ success: true, data: result });
              break;
            }

            default:
              sendResponse({ success: false, error: `Unhandled message type: ${message.type}` });
          }
        } catch (err: any) {
          sendResponse({
            success: false,
            error: err.message || String(err),
            errorCategory: err.message?.includes('timed out') ? 'TIMEOUT' : 'UNKNOWN',
          });
        }
      })();

      return true; // Keep asynchronous channel open
    }
  );
}
