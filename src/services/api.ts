/**
 * OneStep Backend API Client
 * Connects the React frontend to the FastAPI server at http://localhost:8000.
 */

export interface ApiElement {
  id: string;
  type?: string;
  text?: string;
  'aria-label'?: string;
  placeholder?: string;
}

export interface NextStepRequest {
  goal: string;
  page: string;
  elements: ApiElement[];
}

export interface NextStepResponse {
  element_id: string | null;
  instruction: string;
  reason: string;
}

const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:8000';

/**
 * Check if the backend is running and healthy.
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
}

/**
 * Query the AI backend for the next navigation step.
 */
export async function getNextStepFromBackend(
  goal: string,
  page: string,
  elements: ApiElement[]
): Promise<NextStepResponse | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/next-step`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        goal,
        page,
        elements,
      }),
    });

    if (!res.ok) {
      console.warn(`[OneStep API] Backend returned status ${res.status}`);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.warn('[OneStep API] Could not connect to backend:', err);
    return null;
  }
}
