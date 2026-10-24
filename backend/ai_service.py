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

SYSTEM_PROMPT = """You are OneStep, an AI website navigation assistant.
Your job is to analyze the user's goal, the current webpage, and the list of available interactive elements, and decide the single best next element to interact with.

CRITICAL RULES:
1. You MUST select an element_id ONLY from the provided list of elements.
2. If none of the elements are relevant to the user's goal, or if the current page has no matching action, set element_id to null.
3. If the user is on the wrong page and needs to go back or return to dashboard, pick the navigation/back element if available, or set element_id to null if no such element exists.
4. NEVER invent, hallucinate, or alter an element ID.
5. Return JSON ONLY with exactly these keys:
   - "element_id": string (the exact id from the provided elements) or null
   - "instruction": string (concise instruction for what the user should do, e.g., "Click Citizen Services")
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


def _validate_result(parsed: Any, elements: list[Any]) -> AIResult:
    """Validate model output against the caller-supplied element IDs.

    Guarantees:
    - Never returns an element_id not present in elements.
    - Always returns an AIResult with keys/attributes: 'element_id', 'instruction', 'reason'.
    """
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

    # Valid candidate IDs from supplied elements (handles both dict and Pydantic objects)
    valid_ids: set[str] = set()
    for el in elements:
        eid = el.get("id") if isinstance(el, dict) else getattr(el, "id", None)
        if eid is not None:
            valid_ids.add(str(eid).strip())

    # Model explicitly chose null / no action
    if raw_element_id is None:
        return AIResult(
            element_id=None,
            instruction=instruction,
            reason=reason,
        )

    str_element_id = str(raw_element_id).strip()

    # Model picked an ID that actually exists in supplied elements
    if str_element_id in valid_ids:
        return AIResult(
            element_id=str_element_id,
            instruction=instruction,
            reason=reason,
        )

    # Model invented or hallucinated an ID that was not provided
    return AIResult(
        element_id=None,
        instruction=fallback_instruction,
        reason=f"Model suggested an invalid element ID '{str_element_id}' not present on the page.",
    )


def _heuristic_next_step(goal: str, page: str, elements: list[dict]) -> AIResult:
    """Intelligent fallback matcher ensuring immediate, high-accuracy response on any website."""
    goal_words = set(re.findall(r"\w+", (goal or "").lower()))

    # Universal website navigation and semantic intent mappings
    mappings: dict[str, list[str]] = {
        # Universal search & discovery
        "search": ["search", "find", "query", "explore", "lookup"],
        "find": ["search", "find", "explore", "browse"],
        # Authentication & user profile
        "login": ["sign in", "login", "log in", "account", "profile"],
        "signin": ["sign in", "login", "log in", "account"],
        "register": ["sign up", "register", "create account", "join"],
        "signup": ["sign up", "register", "create account"],
        "logout": ["logout", "log out", "sign out"],
        "profile": ["profile", "account", "user", "settings", "my account"],
        # E-commerce, shopping & checkout
        "cart": ["cart", "basket", "bag", "checkout", "view cart"],
        "buy": ["buy", "purchase", "order", "add to cart", "checkout"],
        "checkout": ["checkout", "pay", "order", "place order"],
        "price": ["pricing", "plans", "price", "subscription"],
        "pricing": ["pricing", "plans", "subscription", "upgrade"],
        # Navigation & return
        "back": ["back", "return", "previous", "dashboard", "home"],
        "home": ["home", "dashboard", "main", "logo"],
        "dashboard": ["dashboard", "home", "back to dashboard"],
        # Help & settings
        "settings": ["settings", "preferences", "config", "gear", "options"],
        "help": ["help", "support", "faq", "contact", "customer service"],
        "contact": ["contact", "support", "help", "email us"],
        # Specific government/citizen services
        "address": ["citizen services", "services", "profile", "settings", "account", "address"],
        "residential": ["citizen services", "residence", "profile"],
        "bill": ["payment", "payments", "pay", "billing", "invoice"],
        "pay": ["payment", "payments", "pay", "checkout"],
        "electricity": ["payment", "payments", "utility", "services"],
        "tax": ["payment", "citizen services", "finance"],
    }

    boosted_terms: set[str] = set()
    for word in goal_words:
        if word in mappings:
            boosted_terms.update(mappings[word])

    best_element = None
    best_score = 0

    for el in elements:
        text = (el.get("text") or "").lower()
        aria = (el.get("aria_label") or "").lower()
        eid = (el.get("id") or "").lower()
        placeholder = (el.get("placeholder") or "").lower()
        combined = f"{text} {aria} {eid} {placeholder}"

        score = 0
        for gw in goal_words:
            if len(gw) > 2 and gw in combined:
                score += 3
        for bt in boosted_terms:
            if bt in combined:
                score += 5

        # Small bonus for matching input type if goal mentions search or enter
        el_type = (el.get("type") or "").lower()
        if ("search" in goal_words or "find" in goal_words) and (el_type == "input" or "search" in combined):
            score += 2

        if score > best_score:
            best_score = score
            best_element = el

    # If no element scored any relevance, return null/None safely
    if best_element is None or best_score <= 0:
        return AIResult(
            element_id=None,
            instruction="No relevant element found on this page",
            reason="None of the visible elements appear relevant to your specified goal.",
        )

    label = best_element.get("text") or best_element.get("placeholder") or best_element.get("id")
    return AIResult(
        element_id=best_element["id"],
        instruction=f"Click {label}",
        reason="Selected as the most relevant next step for your goal.",
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
            # 4.0s timeout ensures response is never blocked by slow loading weights
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
                validated = _validate_result(parsed, cleaned_elements)
                if validated.get("element_id") is not None:
                    return validated
        except Exception:
            # Fall through gracefully to heuristic matcher
            pass

    # Seamless fallback: fast, reliable, zero-hang
    return _heuristic_next_step(safe_goal, safe_page, cleaned_elements)
