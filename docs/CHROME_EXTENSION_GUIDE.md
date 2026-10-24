# OneStep Chrome Extension — User-Activated Manifest V3 Guide

This guide details how OneStep operates as a **user-activated Chrome Extension** using Chrome's Side Panel API and local **Qwen 2.5** via Ollama on your Wi-Fi network.

---

## 1. Why OneStep Does NOT Open Automatically

Earlier extension prototypes often caused unwanted UI popups or unexpected page modifications because:
1. `action.default_popup` was declared in `manifest.json`, forcing Chrome to open a popup window or interfering with `openPanelOnActionClick`.
2. `content_scripts` was statically declared across `http://*/*` and `https://*/*`, causing Chrome to inject scripts into every page on load.
3. Tab activation (`tabs.onActivated`) or navigation listeners (`webNavigation.onCompleted`) were triggering side-panel opening.

### How OneStep Fixes This:
- **No `default_popup`**: `manifest.json` specifies only `default_title` under `action`.
- **Side Panel API**: The side panel is registered with `chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })`. The side panel opens **ONLY** when the user clicks the pinned OneStep extension icon in the Chrome toolbar.
- **On-Demand Content Script**: The `content_scripts` array has been completely removed from `manifest.json`. No scripts are loaded when visiting your own website or any other website.
- **Zero Pre-Execution**: OneStep performs no DOM extraction, no AI requests, and no highlights until the user explicitly clicks **"Start"** inside the side panel.

---

## 2. System Architecture

```
┌─────────────────────────────────┐
│ User clicks OneStep Icon in     │
│ Chrome Toolbar                  │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│ Chrome opens Native Side Panel  │
│ (index.html -> OneStep UI)      │
└────────────────┬────────────────┘
                 │
                 ▼ User clicks "Start assistance"
┌─────────────────────────────────┐
│ Service Worker (service-worker) │
│ Injects content-script.js via   │
│ chrome.scripting on demand      │
└────────────────┬────────────────┘
                 │
                 ├─────────────────────────────────────────┐
                 ▼                                         ▼
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│ Captures Live DOM Snapshot      │       │ Ollama API (/api/chat)          │
│ (Privacy-filtered, e1..eN)      │       │ Qwen 2.5 on LAN                 │
└────────────────┬────────────────┘       └────────────────┬────────────────┘
                 │                                         │
                 └───────────────────┬─────────────────────┘
                                     │
                                     ▼
                          ┌────────────────────────┐
                          │ Structured Action Plan │
                          │ (Allowlist validated)  │
                          └──────────┬─────────────┘
                                     │
                                     ▼
                          ┌────────────────────────┐
                          │ Real Webpage Element   │
                          │ Highlighted in Chrome  │
                          └────────────────────────┘
```

---

## 3. Ollama LAN Setup on AI Laptop

1. On the AI laptop, find your Wi-Fi IP address:
   - **Windows**: `ipconfig` (look for IPv4 Address, e.g. `192.168.1.105`)
   - **macOS / Linux**: `ifconfig` or `ip addr`
2. Start Ollama listening on all interfaces:
   - **macOS / Linux**:
     ```bash
     OLLAMA_HOST=0.0.0.0 OLLAMA_ORIGINS="*" ollama serve
     ```
   - **Windows (PowerShell)**:
     ```powershell
     $env:OLLAMA_HOST="0.0.0.0"
     $env:OLLAMA_ORIGINS="*"
     ollama serve
     ```
3. Pull Qwen 2.5:
   ```bash
   ollama pull qwen2.5:7b
   ```

---

## 4. Building and Loading into Google Chrome

1. Build the production extension:
   ```bash
   npm run build
   ```
2. Open Google Chrome and go to `chrome://extensions`.
3. Enable **Developer mode** (toggle in upper right).
4. Click **Load unpacked** (top-left) and select the **`dist`** folder.
5. In Chrome's toolbar, click the puzzle icon and **Pin OneStep**.

---

## 5. Verification Checklist

- [x] **Visiting website directly**: Visiting your own website or any external website does NOT open OneStep or inject any UI.
- [x] **Toolbar icon activation**: Clicking the pinned OneStep icon in the Chrome toolbar opens the Side Panel on the right.
- [x] **Explicit user start**: OneStep waits quietly on the start screen. It does not read page DOM or query Ollama until the user clicks **Start**.
- [x] **Live DOM inspection**: When the user clicks **Start**, OneStep injects `content-script.js` into that specific active tab, reads the live DOM, queries Qwen 2.5, and highlights the target element.
- [x] **Closing side panel**: Closing the side panel stops the UI and no popups or windows open unexpectedly.
