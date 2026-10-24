# OneStep — Unified Backend Service

The complete, unified backend for the **OneStep** website navigation assistant, combining:
- **FastAPI HTTP API & Validation** (Backend 2)
- **AI Reasoning Module & Ollama / Qwen Integration** (Backend 1)

---

## 1. Architecture

```
[ Frontend Laptop / Extension ]
          │  HTTP / JSON via LAN or tunnel
          ▼
[ FastAPI Server (main.py, port 8000) ]
          │  await get_ai_next_step(...)
          ▼
[ AI Service (ai_service.py) ]
          │  AsyncClient via localhost:11434
          ▼
[ Ollama + Qwen (Local Model) ]
```

---

## 2. Project Structure

```text
OneStep/backend/
├── main.py               # FastAPI server application & routes (/health, /next-step)
├── models.py             # Pydantic data schemas (NextStepRequest, NextResponse, Element)
├── ai_service.py         # AI reasoning service calling local Qwen via Ollama
├── test_api.py           # End-to-end API integration tests for FastAPI
├── test_ai_service.py    # Direct AI integration tests across 4 key scenarios
├── test_validation.py    # Offline unit tests for JSON extraction and ID validation
├── requirements.txt      # Combined project dependencies
└── README.md             # Documentation and usage guide
```

---

## 3. Installation & Setup

From the `backend/` directory:

```powershell
# 1. (Optional) Create and activate a virtual environment
python -m venv .venv
.\.venv\Scripts\activate

# 2. Install all dependencies
python -m pip install -r requirements.txt
```

Ensure Ollama is running locally with your Qwen model:
```powershell
ollama list
# Default model used is qwen2.5:latest or set via:
$env:OLLAMA_MODEL = "qwen2.5:latest"
```

---

## 4. Running the Server

Start the FastAPI application:

```powershell
python main.py
```

Or using `uvicorn` directly:

```powershell
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

- Listening on `0.0.0.0:8000` allows the Frontend laptop on the same local Wi-Fi network to connect via your laptop's IP (e.g. `http://192.168.1.X:8000`).
- Interactive Swagger docs available at: `http://localhost:8000/docs`.

---

## 5. API Endpoints

### `GET /health`
Verifies API operational status.

**Response:**
```json
{
  "status": "ok"
}
```

### `POST /next-step`
Processes the user's goal, page context, and available interactive elements to determine the next recommended action.

**Request Body:**
```json
{
  "goal": "Change my residential address",
  "page": "Citizen Dashboard",
  "elements": [
    { "id": "el_1", "type": "button", "text": "Profile" },
    { "id": "el_2", "type": "button", "text": "Citizen Services" },
    { "id": "el_3", "type": "link", "text": "Payments" }
  ]
}
```

**Success Response (200 OK):**
```json
{
  "element_id": "el_2",
  "instruction": "Click Citizen Services",
  "reason": "Citizen Services contains options for updating residential address information."
}
```

**No Action / Wrong Page Response (200 OK):**
```json
{
  "element_id": null,
  "instruction": "No action recommended",
  "reason": "No relevant element found on the current page."
}
```

---

## 6. Running Tests

Run any of the three test suites:

```powershell
# 1. Test FastAPI endpoints end-to-end
python test_api.py

# 2. Test AI service scenarios against local Qwen
python test_ai_service.py

# 3. Test offline parsing and validation guards
python test_validation.py
```
