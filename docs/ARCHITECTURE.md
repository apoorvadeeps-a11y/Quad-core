# OneStep — Architecture & System Design

## 1. Executive Summary
**OneStep** is an AI-powered browser navigation assistant that operates alongside any webpage, helping users navigate complex web portals step-by-step. It provides two complementary operational modes:
1. **Guide Me**: The user clicks; OneStep highlights the exact target element with adaptive contrasting colors and floating tooltips, providing recovery if a wrong turn is taken.
2. **Do It For Me**: The AI agent automates the workflow steps, pausing at sensitive action gates (such as financial transactions or document downloads) to request human approval.

---

## 2. Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                        OneStep Desktop Workspace                       │
├────────────────────────────────────────┬───────────────────────────────┤
│         Mock Webpage (70% - 80%)       │   OneStep Assistant (20% - 40%)│
│                                        │                               │
│  ┌──────────────────────────────────┐  │  ┌─────────────────────────┐  │
│  │ University Portal Workspace      │  │  │ Goal Card & Progress    │  │
│  │                                  │  │  ├─────────────────────────┤  │
│  │  [Sidebar Navigation]            │  │  │ Instruction & Tooltip   │  │
│  │   • data-onestep-id="finance-nav"│  │  │  [Show Me] [I'm Stuck]  │  │
│  │                                  │  │  ├─────────────────────────┤  │
│  │  [Finance Ledger Area]           │  │  │ Activity Timeline & Log │  │
│  │   • data-onestep-id="fee-pay..." │  │  │  [Pause] [Stop] [Speed] │  │
│  │   • data-onestep-id="download..."│  │  ├─────────────────────────┤  │
│  │                                  │  │  │ Ask OneStep Q&A         │  │
│  │  [Adaptive Highlight Overlay]    │  │  └─────────────────────────┘  │
│  │   (Outline + Soft Glow + Tip)    │  │                               │
│  └──────────────────────────────────┘  │                               │
└────────────────────────────────────────┴───────────────────────────────┘
                                ▲
                                │ (Future Backend Contract)
                                ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       Future Backend Architecture                      │
│                                                                        │
│  ┌──────────────────┐   ┌───────────────────┐   ┌───────────────────┐  │
│  │   FastAPI Core   │──▶│   Ollama Runtime  │──▶│   Qwen-2.5-VL     │  │
│  │  (Session & CDP) │   │  (Local Execution)│   │ (Visual Grounding)│  │
│  └──────────────────┘   └───────────────────┘   └───────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Frontend Component Breakdown

- **`AppShell` / `App.tsx`**: Top-level orchestrator maintaining layout ratios, portal navigation history, and assistant state machines.
- **`BrowserHeader`**: Simulates the host browser's URL address bar, navigation controls, and layout preset buttons (`70:30`, `60:40`, `80:20`).
- **`ResizableDivider`**: Handles smooth pointer drag events to dynamically resize the split, persisting ratio in `localStorage`.
- **`HighlightOverlay`**: Non-blocking visual overlay that computes element bounding boxes and applies relative luminance contrast calculations against the 4-color palette (`Violet`, `Terracotta`, `Cyan`, `Amber`).
- **`MockPortal`**: Realistic university student service portal with student profile, academic results, billing, and ledger history.
- **`WrongTurnCard`**: Detects route deviations in Guide mode and presents non-disruptive recovery paths.
- **`ApprovalCard`**: Security boundary that halts autonomous agent flows for sensitive actions (downloads, submissions).

---

## 4. Backend Team Integration Contract

When the backend team implements the Ollama / Qwen model integration, the frontend requires only target element selectors:

```json
{
  "stepNumber": 2,
  "targetId": "fee-payments",
  "instruction": "Open Fee Payments",
  "whyThisStep": "Billing statements and vouchers are kept in this directory.",
  "isSensitive": false
}
```

The frontend's `data-onestep-id` system immediately binds to any element decorated with the matching identifier.
