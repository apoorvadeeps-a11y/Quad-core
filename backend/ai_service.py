"""OneStep AI reasoning service.

Responsibilities:
- Accept a user's goal, current page, and visible UI elements.
- Ask a local Qwen model through Ollama for the next action.
- Parse and validate the model response.
- Never return an element ID that was not supplied by the caller.

This module does not depend on FastAPI.
"""

import json
import os
import re
from typing import Any

# Configuration via environment variables with sensible defaults
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:0.5b")

try:
    from ollama import AsyncClient
    client = AsyncClient(host=OLLAMA_HOST)
except ImportError:
    AsyncClient = None  # type: ignore
    client = None



# Defensive safety limits
MAX_ELEMENTS = 100
MAX_TEXT_LENGTH = 300
MAX_GOAL_LENGTH = 1000
MAX_PAGE_LENGTH = 300

SYSTEM_PROMPT = """You are OneStep, an expert AI website navigation assistant.
Your job is to analyze the user's goal, the current webpage, and the interactive elements, then choose the single best element to interact with.

CRITICAL RULES:
1. You MUST select an element_id ONLY from the provided list of elements.
2. Direct Match Priority: If an element directly matches or accomplishes the user's goal (e.g. goal is "search" and there is a "Search" button or search input; goal is "login" and there is a Login button), you MUST select that element.
3. If no element on the page matches the user's goal, return "element_id": null.
4. NEVER invent, hallucinate, or alter an element ID.
5. Return JSON ONLY with exactly these keys:
   - "element_id": string (the exact id from the provided elements) or null
   - "instruction": string (concise instruction for what the user should do, e.g., "Click Search")
   - "reason": string (clear, concise explanation of why this element was selected)
"""


def _parse_json(raw_text: Any) -> dict | None:
    """Defensively parse a JSON object from model output text.

    Handles raw JSON, markdown-wrapped JSON codeblocks, and text surrounding JSON.
    """
    if not isinstance(raw_text, str):
        return None

    cleaned = raw_text.strip()
    if not cleaned:
        return None

    # 1. Try direct JSON parsing
    try:
        data = json.loads(cleaned)
        if isinstance(data, dict):
            return data
    except (json.JSONDecodeError, ValueError):
        pass

    # 2. Extract from markdown code fences ```json ... ``` or ``` ... ```
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned, re.IGNORECASE)
    if match:
        snippet = match.group(1).strip()
        try:
            data = json.loads(snippet)
            if isinstance(data, dict):
                return data
        except (json.JSONDecodeError, ValueError):
            pass

    # 3. Extract the first outermost {...} block from the text
    brace_match = re.search(r"\{[\s\S]*\}", cleaned)
    if brace_match:
        snippet = brace_match.group(0).strip()
        try:
            data = json.loads(snippet)
            if isinstance(data, dict):
                return data
        except (json.JSONDecodeError, ValueError):
            pass

    return None


class AIResult(dict):
    """Dictionary supporting dot-notation attribute access (e.g. res.element_id)."""

    def __getattr__(self, name: str) -> Any:
        try:
            return self[name]
        except KeyError:
            raise AttributeError(f"'AIResult' object has no attribute '{name}'")

    def __setattr__(self, name: str, value: Any) -> None:
        self[name] = value


STOPWORDS: set[str] = {
    "with", "to", "on", "in", "and", "the", "a", "an", "for", "of", "from",
    "at", "by", "or", "is", "it", "my", "me", "this", "page", "site", "web",
    "website", "please", "can", "you", "i", "want", "need", "go"
}

MAPPINGS: dict[str, list[str]] = {
    "search": ["search", "find", "query", "lookup"],
    "find": ["search", "find", "lookup"],
    "address": ["citizen services", "services", "profile", "settings", "account", "address"],
    "residential": ["citizen services", "residence", "profile"],
    "bill": ["payment", "payments", "pay", "billing", "invoice"],
    "pay": ["payment", "payments", "pay", "checkout"],
    "electricity": ["payment", "payments", "utility", "services"],
    "back": ["back", "return", "previous", "dashboard", "home", "back to dashboard"],
    "dashboard": ["dashboard", "home", "back to dashboard"],
    "login": ["sign in", "login", "log in", "account", "continue with", "sign in with"],
    "signin": ["sign in", "login", "log in", "account", "continue with"],
    "register": ["sign up", "register", "create account", "join", "sign up for free"],
    "signup": ["sign up", "register", "create account", "sign up for free"],
    "google": ["google", "continue with google", "sign in with google", "log in with google"],
    "apple": ["apple", "continue with apple", "sign in with apple"],
    "phone": ["phone", "continue with phone"],
    "chat": ["chat", "ask", "composer", "prompt", "message", "send", "textarea", "ask chatgpt"],
    "message": ["message", "send", "chat", "ask", "textarea", "send message"],
    "send": ["send", "submit", "post", "enter", "send message"],
    "prompt": ["prompt", "ask", "chat", "textarea", "input"],
    "hi": ["prompt", "ask", "chat", "textarea", "input", "message", "ask chatgpt"],
    "hello": ["prompt", "ask", "chat", "textarea", "input", "message"],
    "explore": ["explore", "discover", "browse"],
    "upgrade": ["upgrade", "pricing", "plans", "pro", "plus", "see plans"],
    "pricing": ["pricing", "plans", "upgrade", "see plans and pricing"],
    "cart": ["cart", "basket", "bag", "checkout", "view cart"],
    "buy": ["buy", "purchase", "order", "add to cart", "checkout"],
    "checkout": ["checkout", "pay", "order", "place order"],
    "settings": ["settings", "preferences", "config", "gear", "options"],
    "help": ["help", "support", "faq", "contact", "customer service"],
}


def _score_element_relevance(el: Any, goal: str, domain: str = "") -> int:
    """Compute deterministic semantic relevance of an element against the user goal."""
    if not goal:
        return 0
    clean_goal = goal.lower().strip()
    if not clean_goal:
        return 0

    text = (el.get("text") if isinstance(el, dict) else getattr(el, "text", "")) or ""
    aria = (el.get("aria_label") if isinstance(el, dict) else (getattr(el, "aria_label", None) or getattr(el, "aria-label", ""))) or ""
    placeholder = (el.get("placeholder") if isinstance(el, dict) else getattr(el, "placeholder", "")) or ""

    t_clean = str(text).lower().strip()
    a_clean = str(aria).lower().strip()
    p_clean = str(placeholder).lower().strip()
    combined = f"{t_clean} {a_clean} {p_clean}".strip()

    if not combined:
        return 0

    score = 0
    # Exact full match
    if clean_goal in [t_clean, a_clean, p_clean]:
        score += 150
    elif clean_goal in combined:
        score += 80

    domain_clean = re.sub(r"^(www\.)|(\.com|\.org|\.net|\.in|\.io|\.gov|\.nic\.in)$", "", domain.lower().strip())
    words = [w for w in re.findall(r"\w+", clean_goal) if w not in STOPWORDS]
    if domain_clean and len(domain_clean) > 2:
        words = [w for w in words if w != domain_clean]

    for w in words:
        if len(w) > 1:
            if w == t_clean or w == a_clean or w == p_clean:
                score += 50
            elif w in combined:
                score += 35

            if w in MAPPINGS:
                for term in MAPPINGS[w]:
                    if term == t_clean or term == a_clean or term == p_clean:
                        score += 45
                    elif term in combined:
                        score += 30

    # Type matching for search / typing inputs
    el_type = (el.get("type") if isinstance(el, dict) else getattr(el, "type", "")) or ""
    el_type_str = str(el_type).lower()
    if any(k in words for k in ["search", "find"]) and ("search" in combined or el_type_str in ["input", "textarea"]):
        score += 30
    if any(k in words for k in ["chat", "send", "ask", "prompt", "hi", "hello"]) and el_type_str in ["textarea", "input"]:
        score += 40

    return score


def _validate_result(parsed: Any, elements: list[Any], goal: str = "", page: str = "") -> AIResult:
    """Validate model output against caller-supplied element IDs with high-accuracy neuro-symbolic verification."""
    fallback_instruction = "No action recommended"
    fallback_reason = "No relevant element found on the current page."

    if not isinstance(parsed, dict):
        return AIResult(
            element_id=None,
            instruction=fallback_instruction,
            reason=fallback_reason,
        )

    raw_element_id = parsed.get("element_id")
    raw_instruction = parsed.get("instruction")
    raw_reason = parsed.get("reason")

    instruction = (
        str(raw_instruction).strip() if raw_instruction is not None and str(raw_instruction).strip()
        else fallback_instruction
    )
    reason = (
        str(raw_reason).strip() if raw_reason is not None and str(raw_reason).strip()
        else fallback_reason
    )

    valid_ids: set[str] = set()
    for el in elements:
        eid = el.get("id") if isinstance(el, dict) else getattr(el, "id", None)
        if eid is not None:
            valid_ids.add(str(eid).strip())

    if raw_element_id is None:
        return AIResult(
            element_id=None,
            instruction=instruction,
            reason=reason,
        )

    str_element_id = str(raw_element_id).strip()

    if str_element_id in valid_ids:
        if goal and elements:
            chosen_el = next((e for e in elements if str(e.get("id") if isinstance(e, dict) else getattr(e, "id", "")).strip() == str_element_id), None)
            chosen_score = _score_element_relevance(chosen_el, goal) if chosen_el else 0

            best_el = max(elements, key=lambda e: _score_element_relevance(e, goal))
            best_score = _score_element_relevance(best_el, goal)

            # Rule: If every element on the page has 0 score, check if back navigation to dashboard is appropriate
            if best_score == 0:
                page_lower = (page or "").lower()
                is_hub = any(h in page_lower for h in ["dashboard", "home", "main"])
                if not is_hub:
                    back_el = next((e for e in elements if any(b in ((e.get("text") if isinstance(e, dict) else getattr(e, "text", "")) or "").lower() for b in ["back to dashboard", "back", "return to dashboard"])), None)
                    if back_el:
                        back_id = str(back_el.get("id") if isinstance(back_el, dict) else getattr(back_el, "id", "")).strip()
                        back_label = (back_el.get("text") if isinstance(back_el, dict) else getattr(back_el, "text", "")) or "Back"
                        return AIResult(
                            element_id=back_id,
                            instruction=f"Click {back_label}",
                            reason=f"The current page does not have options for '{goal}'. Return to dashboard to proceed.",
                        )

                return AIResult(
                    element_id=None,
                    instruction=fallback_instruction,
                    reason=f"None of the visible elements match your goal '{goal}'.",
                )

            # Rule: If the model picked an element with lower score than a direct matching element, auto-correct!
            if chosen_score < best_score and best_score >= 25:
                best_id = str(best_el.get("id") if isinstance(best_el, dict) else getattr(best_el, "id", "")).strip()
                best_label = (best_el.get("text") if isinstance(best_el, dict) else getattr(best_el, "text", "")) or \
                             (best_el.get("aria_label") if isinstance(best_el, dict) else getattr(best_el, "aria_label", "")) or \
                             (best_el.get("placeholder") if isinstance(best_el, dict) else getattr(best_el, "placeholder", "")) or "target"
                return AIResult(
                    element_id=best_id,
                    instruction=f"Click {best_label}",
                    reason=f"Direct match for your goal '{goal}' on this page.",
                )

        return AIResult(
            element_id=str_element_id,
            instruction=instruction,
            reason=reason,
        )

    return AIResult(
        element_id=None,
        instruction=fallback_instruction,
        reason=f"Model suggested an invalid element ID '{str_element_id}' not present on the page.",
    )


def _heuristic_next_step(goal: str, page: str, elements: list[dict]) -> AIResult:
    """Intelligent fallback matcher ensuring immediate, high-accuracy response on any website."""
    if not elements:
        return AIResult(
            element_id=None,
            instruction="No relevant element found on this page",
            reason="None of the visible elements appear relevant to your specified goal.",
        )

    best_el = max(elements, key=lambda el: _score_element_relevance(el, goal))
    best_score = _score_element_relevance(best_el, goal)

    if best_score > 0:
        label = best_el.get("text") or best_el.get("placeholder") or best_el.get("aria_label") or best_el.get("id")
        return AIResult(
            element_id=best_el["id"],
            instruction=f"Click {label}",
            reason="Selected as the most relevant next step for your goal.",
        )

    # Check if page is not hub and back navigation exists
    page_lower = (page or "").lower()
    is_hub = any(h in page_lower for h in ["dashboard", "home", "main"])
    if not is_hub:
        back_el = next((e for e in elements if any(b in ((e.get("text") or "")).lower() for b in ["back to dashboard", "back", "return to dashboard"])), None)
        if back_el:
            return AIResult(
                element_id=back_el["id"],
                instruction=f"Click {back_el.get('text') or 'Back'}",
                reason=f"The current page does not have options for '{goal}'. Return to dashboard to proceed.",
            )

    return AIResult(
        element_id=None,
        instruction="No relevant element found on this page",
        reason="None of the visible elements appear relevant to your specified goal.",
    )


async def get_ai_next_step(goal: str, page: str, elements: list[Any]) -> AIResult:
    """Analyze the user's goal and current webpage elements to recommend the next step.

    Parameters:
        goal: Plain English description of what the user wants to achieve.
        page: Name or title of the current webpage.
        elements: List of UI element dictionaries or Pydantic models.

    Returns:
        AIResult (dict) with keys/attributes 'element_id' (str or None), 'instruction' (str), and 'reason' (str).
    """
    import asyncio

    # Defensive checks on elements
    if not isinstance(elements, list) or not elements:
        return AIResult(
            element_id=None,
            instruction="No action recommended",
            reason="No interactive elements were provided on the page.",
        )

    # Clean and filter elements: deduplicate IDs and trim text fields
    cleaned_elements: list[dict] = []
    seen_ids: set[str] = set()

    for el in elements:
        if isinstance(el, dict):
            raw_id = el.get("id")
            raw_type = el.get("type", "element")
            text_val = el.get("text", "")
            aria_val = el.get("aria_label") or el.get("aria-label") or ""
            placeholder_val = el.get("placeholder", "")
        elif hasattr(el, "id"):  # Pydantic Element model or object
            raw_id = getattr(el, "id", None)
            raw_type = getattr(el, "type", "element") or "element"
            text_val = getattr(el, "text", "") or ""
            aria_val = getattr(el, "aria_label", None) or getattr(el, "aria-label", "") or ""
            placeholder_val = getattr(el, "placeholder", "") or ""
        else:
            continue

        if raw_id is None:
            continue
        clean_id = str(raw_id).strip()
        if not clean_id or clean_id in seen_ids:
            continue
        seen_ids.add(clean_id)

        clean_item: dict[str, Any] = {
            "id": clean_id,
            "type": str(raw_type)[:MAX_TEXT_LENGTH],
        }

        # Compact representation of relevant accessibility and text attributes
        text = str(text_val).strip()[:MAX_TEXT_LENGTH]
        if text:
            clean_item["text"] = text

        aria_label = str(aria_val).strip()[:MAX_TEXT_LENGTH]
        if aria_label:
            clean_item["aria_label"] = aria_label

        placeholder = str(placeholder_val).strip()[:MAX_TEXT_LENGTH]
        if placeholder:
            clean_item["placeholder"] = placeholder

        cleaned_elements.append(clean_item)
        if len(cleaned_elements) >= MAX_ELEMENTS:
            break

    if not cleaned_elements:
        return AIResult(
            element_id=None,
            instruction="No action recommended",
            reason="No valid element IDs found in the supplied elements list.",
        )

    # Sanitize input goal and page
    safe_goal = str(goal or "").strip()[:MAX_GOAL_LENGTH]
    safe_page = str(page or "").strip()[:MAX_PAGE_LENGTH]

    # Pre-rank elements by goal relevance so highest matching candidates appear first for LLM attention
    cleaned_elements.sort(key=lambda x: _score_element_relevance(x, safe_goal), reverse=True)

    # Build prompt
    elements_json = json.dumps(cleaned_elements, indent=2)
    user_prompt = (
        f"Goal: {safe_goal}\n"
        f"Current Page: {safe_page}\n\n"
        f"Available UI Elements:\n{elements_json}\n\n"
        "Recommend the single best next element to interact with to achieve the goal.\n"
        "Return a JSON object with keys: 'element_id', 'instruction', and 'reason'."
    )

    # Try Ollama inference
    active_client = client
    if active_client is None:
        try:
            from ollama import AsyncClient
            active_client = AsyncClient(host=OLLAMA_HOST)
        except ImportError:
            active_client = None

    if active_client is not None:
        model_name = os.getenv("OLLAMA_MODEL", OLLAMA_MODEL)
        try:
            response = await asyncio.wait_for(
                active_client.chat(
                    model=model_name,
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": user_prompt},
                    ],
                ),
                timeout=float(os.getenv("OLLAMA_TIMEOUT", "8.0")),
            )

            raw_content = ""
            if hasattr(response, "message") and hasattr(response.message, "content"):
                raw_content = response.message.content
            elif isinstance(response, dict):
                raw_content = response.get("message", {}).get("content", "")

            parsed = _parse_json(raw_content)
            if parsed:
                validated = _validate_result(parsed, cleaned_elements, goal=safe_goal, page=safe_page)
                if validated.get("element_id") is not None:
                    return validated
        except Exception:
            # Fall through gracefully to heuristic matcher
            pass

    # Seamless fallback: fast, reliable, zero-hang
    return _heuristic_next_step(safe_goal, safe_page, cleaned_elements)
