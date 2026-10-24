"""Integration test suite for OneStep AI reasoning service.

Tests the four key scenarios:
1. Address change (should pick Citizen Services)
2. Electricity bill (should pick Payments)
3. No relevant element (should return element_id: None)
4. Wrong page / Navigation (should pick Back or return element_id: None)
"""

import asyncio
import json
import sys
from ai_service import get_ai_next_step

TEST_CASES = [
    {
        "name": "Test 1 - Residential address",
        "goal": "Change my residential address",
        "page": "Citizen Dashboard",
        "elements": [
            {"id": "el_1", "type": "button", "text": "Profile"},
            {"id": "el_2", "type": "button", "text": "Citizen Services"},
            {"id": "el_3", "type": "link", "text": "Payments"},
        ],
        "expected_id": "el_2",
    },
    {
        "name": "Test 2 - Electricity bill",
        "goal": "Pay my electricity bill",
        "page": "Citizen Dashboard",
        "elements": [
            {"id": "el_1", "type": "button", "text": "Profile"},
            {"id": "el_2", "type": "button", "text": "Payments"},
            {"id": "el_3", "type": "link", "text": "Documents"},
        ],
        "expected_id": "el_2",
    },
    {
        "name": "Test 3 - No relevant element",
        "goal": "Change my residential address",
        "page": "Citizen Dashboard",
        "elements": [
            {"id": "el_1", "type": "button", "text": "Logout"},
            {"id": "el_2", "type": "button", "text": "Notifications"},
            {"id": "el_3", "type": "button", "text": "Dark Mode"},
        ],
        "expected_id": None,
    },
    {
        "name": "Test 4 - Wrong page / Back navigation",
        "goal": "Change my residential address",
        "page": "Payment History Page",
        "elements": [
            {"id": "el_1", "type": "button", "text": "Back to Dashboard"},
            {"id": "el_2", "type": "link", "text": "Download Invoice"},
            {"id": "el_3", "type": "button", "text": "Filter by Date"},
        ],
        "expected_id": "el_1",
    },
]


async def run_tests():
    print("=" * 60)
    print("OneStep AI Service Test Suite")
    print("=" * 60)

    all_passed_safety = True
    matches_desired = 0

    for i, test in enumerate(TEST_CASES, start=1):
        print(f"\n[{i}/{len(TEST_CASES)}] {test['name']}")
        print(f"Goal: '{test['goal']}' on Page: '{test['page']}'")
        print(f"Available IDs: {[e['id'] for e in test['elements']]}")

        result = await get_ai_next_step(
            goal=test["goal"],
            page=test["page"],
            elements=test["elements"],
        )

        print("AI Response:")
        print(json.dumps(result, indent=2))

        # Critical safety check: element_id must be None OR one of the supplied element IDs
        supplied_ids = {e["id"] for e in test["elements"]}
        returned_id = result.get("element_id")

        if returned_id is not None and returned_id not in supplied_ids:
            print(f"FAILED SAFETY CHECK: returned ID '{returned_id}' was not in supplied elements!")
            all_passed_safety = False
        else:
            print("Passed safety check (no invented ID).")

        expected = test.get("expected_id")
        if returned_id == expected:
            print(f"Matched desired choice ({expected})")
            matches_desired += 1
        else:
            print(f"Note: Returned {returned_id}, desired choice was {expected}")

    print("\n" + "=" * 60)
    print(f"Summary: {matches_desired}/{len(TEST_CASES)} matched ideal choices.")
    print(f"Safety Constraint: {'PASSED (100% valid/safe IDs)' if all_passed_safety else 'FAILED'}")
    print("=" * 60)

    if not all_passed_safety:
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(run_tests())
