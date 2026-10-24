# OneStep — AI Browser Navigation Assistant

> **Frontend Prototype:** This repository currently implements the complete, interactive frontend user experience and UI prototype for **OneStep**. The backend service, Ollama integration, and Qwen model pipeline will be developed separately by the backend team.

---

## 1. What is OneStep?

**OneStep** is an AI-powered browser navigation assistant that sits alongside any webpage in a side-by-side workspace (similar to an AI coding assistant beside a code editor). It helps users accomplish multi-step web tasks without frustration.

### Key Capabilities
- **Desktop Side-by-Side Workspace**: Default 70% webpage / 30% assistant layout with quick presets (`70:30`, `60:40`, `80:20`), draggable divider, and persistent size memory stored in `localStorage`.
- **Mode 1 — Guide Me (Human in the Loop)**:
  - Highlights target buttons or links directly on the webpage with glowing, non-blocking 3px outlines and floating tooltips.
  - Automatically selects high-contrast highlight colors (`Violet`, `Terracotta`, `Cyan`, `Amber`) by inspecting the target element's background color in real time.
  - Provides "Show me", "I'm stuck", and expandable "Why this step?" explanations.
  - Detects **wrong turns** (e.g. clicking Library instead of Finance) and displays an instant recovery card to guide the user back.
- **Mode 2 — Do It For Me (Autonomous Agent)**:
  - Simulates an AI agent automatically performing steps with realistic timing and activity logs.
  - Allows the user to pause, resume, change playback speed (`1x` vs `2x`), or stop.
  - **Review Before Continuing Gate**: For sensitive or high-impact actions (such as downloading financial records or submitting forms), the agent automatically pauses and presents an approval screen detailing completed actions, pending actions, and safety impact notes before proceeding.
- **Mock University Student Portal**:
  - Full-featured mock portal (Apex State University) including Dashboard, Academic Records, Attendance, and Finance ledger with Semester 5 Fee receipts.
  - Supports downloadable simulated PDF vouchers.

---

## 2. High-Level Architecture

```
┌────────────────────────────────────────────────────────┐
│                        OneStep                         │
├───────────────────────────┬────────────────────────────┤
│         Frontend          │       Future Backend       │
│  (Implemented Prototype)  │      (Planned / Spec)      │
├───────────────────────────┼────────────────────────────┤
│ • React 19 + TypeScript   │ • FastAPI Application      │
│ • Vite + Tailwind CSS     │ • Local Ollama Runtime     │
│ • Adaptive Highlighting   │ • Qwen-2.5-VL Reasoning    │
│ • Draggable Resizable UI  │ • CDP Browser Automation   │
│ • LocalStorage Sync       │ • Multi-tenant sessions    │
└───────────────────────────┴────────────────────────────┘
```

---

## 3. Repository Structure

```
onestep/
├── README.md                # Project documentation and quickstart
├── .gitignore               # Git ignore rules
├── index.html               # Main HTML entry point
├── package.json             # App dependencies & run scripts
├── vite.config.ts           # Vite configuration
├── src/                     # Frontend implementation
│   ├── App.tsx              # App orchestrator & layout state
│   ├── main.tsx             # React bootstrap
│   ├── index.css            # Tailwind CSS design tokens & animations
│   ├── types/               # TypeScript models & workflows
│   ├── data/                # Mock workflows & university portal data
│   ├── utils/               # Contrast inspection engine
│   └── components/
│       ├── BrowserHeader.tsx         # Address bar & layout presets
│       ├── ResizableDivider.tsx      # Draggable divider
│       ├── HighlightOverlay.tsx      # Adaptive glowing target overlay
│       ├── ReceiptModal.tsx          # Downloaded PDF preview
│       ├── mock-portal/              # University portal pages & sidebar
│       └── onestep-panel/            # Assistant panel, modes & cards
├── backend/                 # Reserved for backend team
│   ├── README.md            # Backend instructions (handled by backend team)
│   ├── app/                 # Placeholder for future backend services
│   └── tests/               # Placeholder for backend test suites
└── docs/
    └── ARCHITECTURE.md      # Detailed system architecture document
```

---

## 4. Getting Started (Frontend Prototype)

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation & Run

```bash
# 1. Install dependencies
npm install

# 2. Run the Vite development server
npm run dev
```

The application will be live at `http://localhost:3000`.

### Trying Out OneStep

1. **Enter a Goal**: Use the prefilled suggestion *"Download my university fee receipt"* or pick one from the suggestions list.
2. **Test Guide Me Mode**:
   - Notice the glowing outline and tooltip on **Finance** in the left sidebar.
   - Click **Finance**. The next element (**Fee Payments**) is highlighted.
   - Click **Fee Payments**, then click **Payment History**.
   - Notice the button **Download Receipt** is highlighted. Click it to complete the task and view the verified fee voucher!
3. **Test Wrong Turn Recovery**:
   - In Guide Me mode, try clicking **Library** or **Attendance** on the sidebar instead of Finance.
   - OneStep detects that you're on a different page and shows the *Wrong Turn* card. Click *"Find the right path"* to recover.
4. **Test Do It For Me Mode**:
   - Return to Home, choose **Do It For Me**, and hit Start.
   - Watch the agent navigate through the portal with live timeline updates.
   - Observe how the agent automatically stops before downloading to display the **Review Before Continuing** safety gate.
   - Click *"Approve & Continue"* to finish the workflow.
5. **Test Layout Resizing**:
   - Click the preset buttons in the browser bar (`70:30`, `60:40`, `80:20`).
   - Drag the divider handle between the mock website and the assistant.
   - Refresh the page to verify your custom split ratio is preserved.
