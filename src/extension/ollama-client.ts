import {
  OllamaConfig,
  PageSnapshot,
  AiPlanResponse,
  PlannedAction,
  ActionType,
} from './types';

export const DEFAULT_OLLAMA_CONFIG: OllamaConfig = {
  baseUrl: 'http://localhost:11434',
  modelTag: 'qwen2.5:0.5b',
  timeoutMs: 30000,
  temperature: 0.1,
};

const ALLOWED_ACTIONS: Set<ActionType> = new Set([
  'highlight',
  'click',
  'fill',
  'select_option',
  'scroll',
  'wait_and_reinspect',
  'ask_user',
  'finish',
]);

const SYSTEM_PROMPT = `You are OneStep, an intelligent web navigation assistant powered by Qwen 2.5.
Your job is to examine the user's high-level goal and the provided snapshot of interactive elements on the current webpage, then output a structured JSON plan with the single best next step to take.

RULES:
1. ONLY return a valid JSON object matching the requested schema. No conversational prose, markdown explanation outside the JSON, or markdown ticks.
2. ONLY reference element IDs ("e1", "e2", etc.) that exist in the provided snapshot. Never invent elements.
3. Actions must be one of: "highlight", "click", "fill", "select_option", "scroll", "wait_and_reinspect", "ask_user", "finish".
4. Set "is_sensitive": true for any action that submits a form, initiates a download, accepts a legal agreement, or performs payments.
5. If the current page contains the final goal (e.g. receipt displayed or task accomplished), use action "finish" and provide "completion_evidence".
6. Never execute or output JavaScript code, shell commands, or arbitrary CSS selectors.

JSON SCHEMA:
{
  "status": "continue" | "needs_approval" | "complete" | "error" | "ask_user",
  "message": "Clear explanation for the user describing what to do next",
  "actions": [
    {
      "type": "highlight" | "click" | "fill" | "select_option" | "scroll" | "wait_and_reinspect" | "ask_user" | "finish",
      "element_id": "e2",
      "value": "optional string value for fill/select",
      "reason": "Why this element leads toward the goal",
      "is_sensitive": false
    }
  ],
  "needs_user_input": false,
  "completion_evidence": "Found official receipt download confirmation",
  "safety_notes": "Safe navigation action"
}`;

/**
 * Strips markdown code blocks if the model wrapped its output in ```json ... ```
 */
function cleanJsonOutput(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '');
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/```\s*$/, '');
  }
  return cleaned.trim();
}

/**
 * Validates the raw JSON object from the model against our strict schema
 */
export function validatePlanResponse(parsed: any, snapshot: PageSnapshot): AiPlanResponse {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Model did not return a valid JSON object');
  }

  const validStatuses = ['continue', 'needs_approval', 'complete', 'error', 'ask_user'];
  const status = validStatuses.includes(parsed.status) ? parsed.status : 'continue';
  const message = typeof parsed.message === 'string' && parsed.message.trim()
    ? parsed.message.trim()
    : 'Proceeding with the next navigation step.';

  const validatedActions: PlannedAction[] = [];
  const rawActions = Array.isArray(parsed.actions) ? parsed.actions : [];

  const existingElementIds = new Set(snapshot.elements.map((e) => e.id));

  for (const act of rawActions) {
    if (!act || typeof act !== 'object') continue;
    const type = act.type as ActionType;

    if (!ALLOWED_ACTIONS.has(type)) {
      continue; // Skip unsupported actions
    }

    let elementId = typeof act.element_id === 'string' ? act.element_id.trim() : undefined;

    // Verify element_id exists if specified
    if (elementId && !existingElementIds.has(elementId)) {
      // Element not in snapshot
      elementId = undefined;
    }

    validatedActions.push({
      type,
      element_id: elementId,
      value: typeof act.value === 'string' ? act.value : undefined,
      reason: typeof act.reason === 'string' ? act.reason : 'Navigating step',
      is_sensitive: Boolean(act.is_sensitive),
    });
  }

  // If no valid actions were returned but finish/evidence is present
  if (validatedActions.length === 0 && (status === 'complete' || parsed.completion_evidence)) {
    validatedActions.push({
      type: 'finish',
      reason: 'Goal accomplished based on page evidence.',
    });
  }

  return {
    status,
    message,
    actions: validatedActions,
    needs_user_input: Boolean(parsed.needs_user_input),
    completion_evidence: typeof parsed.completion_evidence === 'string' ? parsed.completion_evidence : null,
    safety_notes: typeof parsed.safety_notes === 'string' ? parsed.safety_notes : undefined,
  };
}

/**
 * Pings Ollama /api/tags to test reachability and list available models
 */
export async function testOllamaConnection(
  baseUrl: string,
  timeoutMs: number = 5000
): Promise<{ ok: boolean; models: string[]; error?: string }> {
  const cleanUrl = baseUrl.replace(/\/+$/, '');
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${cleanUrl}/api/tags`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return {
        ok: false,
        models: [],
        error: `Ollama returned HTTP ${res.status}: ${res.statusText}`,
      };
    }

    const data = await res.json();
    const models = Array.isArray(data.models) ? data.models.map((m: any) => m.name || m.model) : [];
    return { ok: true, models };
  } catch (err: any) {
    clearTimeout(timeoutId);
    let msg = 'Ollama server unreachable.';
    if (err.name === 'AbortError') {
      msg = `Connection timed out after ${timeoutMs}ms. Check IP and port.`;
    } else if (err.message) {
      msg = `Failed to connect: ${err.message}. Ensure Ollama is running with OLLAMA_HOST=0.0.0.0`;
    }
    return { ok: false, models: [], error: msg };
  }
}

/**
 * Sends prompt to Ollama /api/chat with Qwen 2.5
 */
export async function requestOllamaPlan(
  goal: string,
  snapshot: PageSnapshot,
  config: OllamaConfig,
  taskHistory: string[] = []
): Promise<AiPlanResponse> {
  const cleanUrl = config.baseUrl.replace(/\/+$/, '');

  // Format elements compactly for LLM prompt context
  const elementsContext = snapshot.elements
    .map((e) => {
      let desc = `[${e.id}] <${e.tag}${e.type ? ` type="${e.type}"` : ''}>`;
      if (e.text) desc += ` text="${e.text}"`;
      if (e.accessibleName) desc += ` label="${e.accessibleName}"`;
      if (e.placeholder) desc += ` placeholder="${e.placeholder}"`;
      if (e.context) desc += ` context="${e.context}"`;
      if (e.currentValue) desc += ` value="${e.currentValue}"`;
      if (e.disabled) desc += ' (disabled)';
      if (e.required) desc += ' (required)';
      return desc;
    })
    .join('\n');

  const userPrompt = `USER GOAL: "${goal}"
CURRENT PAGE TITLE: "${snapshot.title}"
CURRENT URL: "${snapshot.url}"
MAIN HEADINGS: ${snapshot.headings.join(' | ') || 'None'}

INTERACTIVE ELEMENTS ON CURRENT PAGE:
${elementsContext || 'No interactive elements detected on this view.'}

TASK HISTORY SO FAR:
${taskHistory.length > 0 ? taskHistory.map((h, i) => `${i + 1}. ${h}`).join('\n') : 'Task just started.'}

Analyze the page and return the structured JSON next step.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(`${cleanUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: config.modelTag,
        stream: false,
        format: 'json',
        options: {
          temperature: config.temperature,
        },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          `Model "${config.modelTag}" not found in Ollama. Run 'ollama pull ${config.modelTag}' on the host laptop.`
        );
      }
      const errText = await response.text();
      throw new Error(`Ollama API error (HTTP ${response.status}): ${errText}`);
    }

    const data = await response.json();
    const content = data?.message?.content;
    if (!content) {
      throw new Error('Ollama returned empty response message content.');
    }

    const cleaned = cleanJsonOutput(content);
    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      throw new Error(`Failed to parse Qwen JSON response: ${cleaned.slice(0, 150)}...`);
    }

    const plan = validatePlanResponse(parsed, snapshot);
    plan.raw_response = content;
    return plan;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(
        `Request to Ollama timed out after ${config.timeoutMs}ms. Verify host ${config.baseUrl} is online.`
      );
    }
    throw err;
  }
}
