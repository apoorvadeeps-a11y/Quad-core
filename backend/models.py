from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class Element(BaseModel):
    id: str = Field(..., min_length=1, description="DOM element identifier")
    type: str = Field(default="", description="Element type (e.g. button, link, input)")
    text: str = Field(default="", description="Visible text content of the element")
    aria_label: Optional[str] = Field(default=None, alias="aria-label", description="Accessibility label")
    placeholder: Optional[str] = Field(default=None, description="Placeholder text")

    role: Optional[str] = Field(default=None, description="ARIA role")
    in_viewport: Optional[bool] = Field(default=None, description="Whether element is in active viewport")

    @field_validator("id")
    @classmethod
    def id_must_not_be_blank(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Element id must not be empty or blank")
        return v.strip()

    model_config = {
        "populate_by_name": True,
        "extra": "ignore",
    }


class NextStepRequest(BaseModel):
    goal: str = Field(..., min_length=1, description="The user's high-level goal")
    page: str = Field(default="", description="Current page title or URL")
    elements: List[Element] = Field(..., min_length=1, description="List of visible interactive elements")

    @field_validator("goal")
    @classmethod
    def goal_must_not_be_blank(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Goal must not be empty or whitespace-only")
        return v.strip()

    @field_validator("elements")
    @classmethod
    def elements_must_not_be_empty(cls, v: List[Element]) -> List[Element]:
        if not v:
            raise ValueError("Elements list must contain at least one element")
        return v

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "goal": "Change my residential address",
                "page": "Citizen Dashboard",
                "elements": [
                    {"id": "el_1", "type": "button", "text": "Profile"},
                    {"id": "el_2", "type": "button", "text": "Citizen Services"},
                    {"id": "el_3", "type": "link", "text": "Payments"},
                ],
            }
        },
    }


class NextResponse(BaseModel):
    element_id: Optional[str] = Field(
        default=None,
        description="ID of the matching element from the request, or null if no element matches",
    )
    instruction: str = Field(..., description="Actionable instruction for the user")
    reason: str = Field(..., description="Explanation of why this step was selected")

    model_config = {
        "json_schema_extra": {
            "example": {
                "element_id": "el_2",
                "instruction": "Click Citizen Services",
                "reason": "This is the most relevant next step.",
            }
        }
    }


class HealthResponse(BaseModel):
    status: str = "ok"
