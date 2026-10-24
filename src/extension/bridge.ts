import {
  OllamaConfig,
  PageSnapshot,
  AiPlanResponse,
  PlannedAction,
  AutofillMapping,
  ExtensionResponse,
} from './types';
import {
  DEFAULT_OLLAMA_CONFIG,
  testOllamaConnection,
  requestOllamaPlan,
} from './ollama-client';
import {
  extractPageSnapshot,
  executeDomAction,
  generateAutofillMappings,
} from './dom-extractor';

const STORAGE_KEY = 'onestep_ollama_config';

/**
 * Checks if running inside an active Chrome extension runtime
 */
export function isChromeExtensionEnvironment(): boolean {
  return (
    typeof chrome !== 'undefined' &&
    Boolean(chrome.runtime && chrome.runtime.id && chrome.tabs)
  );
}

/**
 * Loads Ollama configuration from chrome.storage.local or localStorage
 */
export async function getStoredOllamaConfig(): Promise<OllamaConfig> {
  if (isChromeExtensionEnvironment() && chrome.storage?.local) {
    try {
      const data = await chrome.storage.local.get(STORAGE_KEY);
      if (data && data[STORAGE_KEY]) {
        return { ...DEFAULT_OLLAMA_CONFIG, ...data[STORAGE_KEY] };
      }
    } catch {
      // fallback to localStorage
    }
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_OLLAMA_CONFIG, ...JSON.parse(raw) };
    }
  } catch {
    // fallback
  }

  return DEFAULT_OLLAMA_CONFIG;
}

/**
 * Saves Ollama configuration
 */
export async function saveStoredOllamaConfig(config: Partial<OllamaConfig>): Promise<OllamaConfig> {
  const current = await getStoredOllamaConfig();
  const updated: OllamaConfig = { ...current, ...config };

  if (isChromeExtensionEnvironment() && chrome.storage?.local) {
    try {
      await chrome.storage.local.set({ [STORAGE_KEY]: updated });
    } catch {
      // ignore
    }
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }

  return updated;
}

/**
 * Unified Bridge for requesting an AI navigation plan
 * Calls Extension Service Worker in Chrome, or local client in web preview
 */
export async function bridgeRequestAiPlan(
  goal: string,
  localRootElement?: HTMLElement | null,
  taskHistory: string[] = []
): Promise<{ plan: AiPlanResponse; snapshot: PageSnapshot }> {
  // If in Chrome Extension environment, send message to Service Worker
  if (isChromeExtensionEnvironment()) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          type: 'REQUEST_AI_PLAN',
          payload: { goal, taskHistory },
        },
        (response: ExtensionResponse<{ plan: AiPlanResponse; snapshot: PageSnapshot }>) => {
          if (chrome.runtime.lastError) {
            return reject(new Error(chrome.runtime.lastError.message));
          }
          if (!response || !response.success || !response.data) {
            return reject(new Error(response?.error || 'Service worker failed to generate plan.'));
          }
          resolve(response.data);
        }
      );
    });
  }

  // Preview / In-page environment: extract snapshot from target container and query Ollama
  const config = await getStoredOllamaConfig();
  const snapshot = extractPageSnapshot(localRootElement || document);

  try {
    const plan = await requestOllamaPlan(goal, snapshot, config, taskHistory);
    return { plan, snapshot };
  } catch (err: any) {
    throw err;
  }
}

/**
 * Unified Bridge for executing a DOM action
 */
export async function bridgeExecuteAction(action: PlannedAction): Promise<{ success: boolean; message: string }> {
  if (isChromeExtensionEnvironment()) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          type: 'EXECUTE_ELEMENT_ACTION',
          payload: action,
        },
        (response: ExtensionResponse<{ success: boolean; message: string }>) => {
          if (chrome.runtime.lastError) {
            return reject(new Error(chrome.runtime.lastError.message));
          }
          if (!response || !response.success || !response.data) {
            return reject(new Error(response?.error || 'Failed to execute action.'));
          }
          resolve(response.data);
        }
      );
    });
  }

  // Local execution
  return executeDomAction(action);
}

/**
 * Unified Bridge for highlighting an element
 */
export async function bridgeHighlightElement(
  elementId: string,
  tooltipText: string,
  reason?: string
): Promise<void> {
  if (isChromeExtensionEnvironment()) {
    chrome.runtime.sendMessage({
      type: 'HIGHLIGHT_DOM_ELEMENT',
      payload: { element_id: elementId, tooltipText, reason },
    });
    return;
  }
  // Handled by in-page HighlightOverlay component in preview mode
}

/**
 * Unified Bridge for clearing highlights
 */
export async function bridgeClearHighlight(): Promise<void> {
  if (isChromeExtensionEnvironment()) {
    chrome.runtime.sendMessage({ type: 'CLEAR_DOM_HIGHLIGHT' });
  }
}

/**
 * Unified Bridge for testing connection to Ollama on the Wi-Fi laptop
 */
export async function bridgeTestOllama(
  baseUrl: string
): Promise<{ ok: boolean; models: string[]; error?: string }> {
  if (isChromeExtensionEnvironment()) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        {
          type: 'TEST_OLLAMA_CONNECTION',
          payload: { baseUrl },
        },
        (response: ExtensionResponse<{ ok: boolean; models: string[]; error?: string }>) => {
          if (chrome.runtime.lastError) {
            return resolve({ ok: false, models: [], error: chrome.runtime.lastError.message });
          }
          if (!response || !response.success || !response.data) {
            return resolve({ ok: false, models: [], error: response?.error || 'Test failed' });
          }
          resolve(response.data);
        }
      );
    });
  }

  // In web preview: direct fetch
  return testOllamaConnection(baseUrl);
}
