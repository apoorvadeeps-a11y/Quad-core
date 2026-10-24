/**
 * Shared Type Definitions for OneStep Cross-Website Chrome Extension
 * Architecture: OneStep UI -> Service Worker -> Ollama (Qwen 2.5) -> Content Script -> DOM
 */

export interface OllamaConfig {
  baseUrl: string; // e.g. "http://192.168.1.100:11434" or "http://localhost:11434"
  modelTag: string; // e.g. "qwen2.5:7b", "qwen2.5:latest", "qwen2.5:3b"
  timeoutMs: number; // default 30000ms
  temperature: number; // default 0.1 for deterministic planning
}

export interface InteractiveElementDescriptor {
  id: string; // Temporary identifier: "e1", "e2", etc.
  tag: string; // "button", "a", "input", "select", "textarea"
  type?: string; // "text", "email", "tel", "checkbox", "radio", "submit", etc.
  text: string; // Visible text or button label
  accessibleName: string; // aria-label, title, placeholder, or associated <label>
  role?: string; // ARIA role
  context?: string; // Heading or parent section context
  placeholder?: string;
  currentValue?: string;
  checked?: boolean;
  disabled?: boolean;
  required?: boolean;
  isClickable: boolean;
  selectorHint?: string; // Stable CSS path hint for verification
}

export interface PageSnapshot {
  url: string;
  title: string;
  headings: string[];
  elements: InteractiveElementDescriptor[];
  timestamp: number;
  totalElementsFound: number;
  filteredCount: number;
}

export type ActionType =
  | 'highlight'
  | 'click'
  | 'fill'
  | 'select_option'
  | 'scroll'
  | 'wait_and_reinspect'
  | 'ask_user'
  | 'finish';

export interface PlannedAction {
  type: ActionType;
  element_id?: string; // e.g. "e2"
  value?: string; // Value to fill or select
  reason: string; // Human-readable explanation of why this action was chosen
  is_sensitive?: boolean; // Requires explicit user approval
}

export interface AutofillMapping {
  element_id: string;
  field_label: string;
  field_type: string;
  proposed_value: string;
  confidence: number;
}

export type PlanStatus =
  | 'continue'
  | 'needs_approval'
  | 'complete'
  | 'error'
  | 'ask_user';

export interface AiPlanResponse {
  status: PlanStatus;
  message: string;
  actions: PlannedAction[];
  form_autofill?: AutofillMapping[];
  needs_user_input?: boolean;
  completion_evidence: string | null;
  safety_notes?: string;
  raw_response?: string;
}

export interface ExtensionMessage<T = unknown> {
  type:
    | 'PING'
    | 'GET_OLLAMA_STATUS'
    | 'TEST_OLLAMA_CONNECTION'
    | 'SAVE_OLLAMA_CONFIG'
    | 'CAPTURE_PAGE_DOM'
    | 'REQUEST_AI_PLAN'
    | 'EXECUTE_ELEMENT_ACTION'
    | 'HIGHLIGHT_DOM_ELEMENT'
    | 'CLEAR_DOM_HIGHLIGHT'
    | 'EXECUTE_AUTOFILL'
    | 'VERIFY_PAGE_COMPLETION';
  payload?: T;
}

export interface ExtensionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errorCategory?:
    | 'OLLAMA_OFFLINE'
    | 'MODEL_NOT_FOUND'
    | 'TIMEOUT'
    | 'MALFORMED_RESPONSE'
    | 'DOM_ELEMENT_STALE'
    | 'RESTRICTED_PAGE'
    | 'UNKNOWN';
}

export interface UserAutofillProfile {
  fullName: string;
  email: string;
  phone: string;
  studentId: string;
  dateOfBirth: string;
  address: string;
  city: string;
  postalCode: string;
}
