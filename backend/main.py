import sys
from pathlib import Path
from typing import Set

# Ensure backend directory is in sys.path for direct imports
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import json
from models import HealthResponse, NextStepRequest, NextResponse, TrainingSample
from ai_service import get_ai_next_step

TRAINING_FILE = backend_dir / "training_data.jsonl"

app = FastAPI(
    title="OneStep API",
    description="Backend API connecting the OneStep frontend navigation assistant to the AI service.",
    version="1.0.0",
)

# Enable CORS for frontend web apps, localhost dev servers, and browser extensions
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Catch Pydantic validation errors and return clear HTTP 400 Bad Request responses.
    """
    error_messages = []
    clean_errors = []
    for err in exc.errors():
        loc_parts = [str(part) for part in err.get("loc", []) if part != "body"]
        loc = " -> ".join(loc_parts)
        msg = err.get("msg", "Invalid value")
        if loc:
            error_messages.append(f"{loc}: {msg}")
        else:
            error_messages.append(msg)

        clean_errors.append({
            "field": loc if loc else "body",
            "message": msg,
            "type": err.get("type", "validation_error"),
        })

    detail_msg = "; ".join(error_messages) if error_messages else "Invalid request body"

    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "detail": detail_msg,
            "errors": clean_errors,
        },
    )


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health():
    """
    Check if the API server is operational.
    """
    return HealthResponse(status="ok")


@app.post(
    "/next-step",
    response_model=NextResponse,
    status_code=status.HTTP_200_OK,
    tags=["Navigation"],
)
async def next_step(payload: NextStepRequest):
    """
    Process page interactive elements and user goal to identify the next navigation step.
    """
    # Request is validated by Pydantic (non-empty goal and non-empty elements)
    valid_ids: Set[str] = {el.id for el in payload.elements}

    try:
        response = await get_ai_next_step(
            goal=payload.goal,
            page=payload.page,
            elements=payload.elements,
        )

        # Enforce rule: returned element_id must exist in the request if not null/None
        returned_id = getattr(response, "element_id", None) if not isinstance(response, dict) else response.get("element_id")
        if returned_id is not None and returned_id not in valid_ids:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"AI service returned element_id '{returned_id}' which does not exist in the request elements list.",
            )

        return response

    except HTTPException:
        raise
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI evaluation failed: {str(exc)}",
        )


@app.post("/train/collect", tags=["Training"])
async def collect_training_sample(sample: TrainingSample):
    """
    Store real-world website interactive elements and chosen navigation action as a training sample.
    """
    try:
        sample_dict = sample.model_dump()
        with open(TRAINING_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(sample_dict, ensure_ascii=False) + "\n")
        
        # Calculate total count
        count = 0
        if TRAINING_FILE.exists():
            with open(TRAINING_FILE, "r", encoding="utf-8") as f:
                count = sum(1 for line in f if line.strip())

        return {
            "status": "saved",
            "total_samples": count,
            "message": f"Successfully collected training sample from {sample.domain or sample.page}."
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save training sample: {str(e)}"
        )


@app.get("/train/stats", tags=["Training"])
async def get_training_stats():
    """
    Retrieve statistics on training samples collected from any websites.
    """
    if not TRAINING_FILE.exists():
        return {"total_samples": 0, "domains": []}

    total = 0
    domains = set()
    try:
        with open(TRAINING_FILE, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    total += 1
                    try:
                        data = json.loads(line)
                        if data.get("domain"):
                            domains.add(data["domain"])
                    except Exception:
                        pass
        return {
            "total_samples": total,
            "unique_domains": list(domains),
            "file_path": str(TRAINING_FILE)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
