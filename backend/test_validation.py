"""Unit tests for response parsing and validation logic.

These tests run without requiring Ollama or any running LLM instance.
"""

from ai_service import _parse_json, _validate_result


def test_validation():
    elements = [
        {"id": "el_1", "type": "button", "text": "Profile"},
        {"id": "el_2", "type": "button", "text": "Citizen Services"},
    ]

    # 1. Valid JSON wrapped in explanatory text
    parsed = _parse_json(
        'Here is the answer:\n'
        '{"element_id":"el_2","instruction":"Click Citizen Services",'
        '"reason":"It is relevant to the goal."}'
    )
    result = _validate_result(parsed, elements)
    assert result["element_id"] == "el_2"
    assert result["instruction"] == "Click Citizen Services"

    # 2. Model invents an ID
    parsed = _parse_json(
        '{"element_id":"el_99","instruction":"Click this",'
        '"reason":"It seems relevant."}'
    )
    result = _validate_result(parsed, elements)
    assert result["element_id"] is None

    # 3. Malformed JSON
    parsed = _parse_json('{"element_id": "el_2",')
    result = _validate_result(parsed, elements)
    assert result["element_id"] is None

    # 4. Explicit null
    parsed = _parse_json(
        '{"element_id":null,"instruction":"No action",'
        '"reason":"Nothing relevant is available."}'
    )
    result = _validate_result(parsed, elements)
    assert result["element_id"] is None

    print("All validation tests passed.")


if __name__ == "__main__":
    test_validation()
