# OneStep — Cross-Website AI Navigation Assistant (Chrome Extension)

OneStep is an AI-powered browser navigation assistant built as a **Manifest V3 Chrome Extension**. It helps users accomplish multi-step workflows across diverse websites using a locally hosted **Qwen 2.5** model via Ollama running on another laptop on your trusted Wi-Fi network.

---

## 1. Architecture Overview

```
OneStep UI (Side Panel / Popup)
  │
  ▼
Extension Service Worker (service-worker.js)
  │
  ├─────────────────────────────────────────────────┐
  │                                                 │
  ▼                                                 ▼
Ollama API (/api/chat, Qwen 2.5 on LAN)       Active Tab Content Script (content-script.js)
  │                                                 │
  ▼                                                 ▼
Structured JSON Plan                          Live Webpage DOM Extraction & Highlights
```

- **OneStep UI**: Preserves the warm, elegant OneStep interface (ivory `#F7F3EC`, violet `#7656A7`, sage green `#4A7C59`, dark charcoal `#2B2825`), featuring Guide Me, Do It For Me, Review Before Continuing, and Form Autofill cards.
- **Extension Service Worker**: Background coordinator querying Ollama from the extension security realm without cross-origin webpage restrictions.
- **Content Script & DOM Extractor**: Captures privacy-filtered snapshots with temporary IDs (`e1`, `e2`...), renders adaptive glowing outlines and tooltips, and executes actions.
- **Ollama Client**: Queries Qwen 2.5 using strict JSON schema prompting (`format: "json"`), action allowlists, and error recovery.

---

## 2. Key Capabilities

1. **Cross-Website Operation**:
   - Works on arbitrary websites without site-specific hardcoding.
   - Dual-demo workspace included:
     - **Site 1**: Apex State University Student Portal
     - **Site 2**: GovDirect Citizen Registry & Certificate Application
2. **Local Qwen 2.5 via Ollama**:
   - Configurable host IP (e.g. `http://192.168.1.105:11434`) and model tag (`qwen2.5:7b`, `qwen2.5:3b`, `qwen2.5-coder:7b`).
   - One-click connection test checking `/api/tags` on the remote laptop.
3. **Adaptive Contrast Highlighting**:
   - 3px glowing outline + floating direction tooltip.
   - Inspects target background color and selects from predefined contrasting palette (`Violet`, `Terracotta`, `Cyan`, `Amber`).
4. **Form Autofill with Review Gate**:
   - Detects form controls (`text`, `email`, `tel`, `date`, `textarea`, `select`, `checkbox`, `radio`).
   - Proposes mappings from user profile for review before filling.
   - Never submits forms automatically.
5. **Safety & User Control**:
   - Sensitive actions (downloads, submissions) require explicit confirmation.
   - Visible stop and pause controls at all times.
   - Automatic re-indexing on navigation to prevent stale element errors.

---

## 3. Quick Start (Web Preview & Chrome Extension)

### Run in Local Preview Mode
```bash
npm install
npm run dev
```
Open `http://localhost:3000` to interact with OneStep and both test websites in a side-by-side workspace.

### Build and Load as Chrome Extension
```bash
npm run build
```
1. Open Google Chrome and go to `chrome://extensions`.
2. Toggle on **Developer mode** (top-right).
3. Click **Load unpacked** (top-left) and select the `dist/` folder.
4. Pin **OneStep** in your Chrome toolbar.

---

## 4. Ollama Configuration on the Second Laptop

1. On the AI laptop, find your Wi-Fi IP address:
   - Windows: `ipconfig`
   - macOS / Linux: `ifconfig` or `ip addr`
2. Launch Ollama listening on all network interfaces:
   ```bash
   OLLAMA_HOST=0.0.0.0 OLLAMA_ORIGINS="*" ollama serve
   ```
3. Pull Qwen 2.5:
   ```bash
   ollama pull qwen2.5:7b
   ```
4. In OneStep, click the **Settings Gear** and enter `http://<IP>:11434`. Click **Test Connection**.

For complete instructions and troubleshooting, see [docs/CHROME_EXTENSION_GUIDE.md](docs/CHROME_EXTENSION_GUIDE.md).
