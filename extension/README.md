# OneStep — Chrome / Edge Browser Extension

A standalone Chrome extension (Manifest V3) that runs **independently on any real website** in your browser and connects directly to your local FastAPI backend on port 8000.

---

## 1. How to Install (Takes 10 seconds)

1. Open Google Chrome, Brave, or Microsoft Edge.
2. In the address bar, go to:
   ```text
   chrome://extensions
   ```
   *(or `edge://extensions` in Microsoft Edge, or `brave://extensions` in Brave)*
3. In the top right corner, **turn ON "Developer mode"**.
4. Click the **"Load unpacked"** button in the top left.
5. Select this exact folder:
   ```text
   c:\Users\nehak\OneDrive\Desktop\Hackathons\hacktober\extension
   ```
6. The **OneStep** extension is now installed! You can pin it to your browser toolbar.

---

## 2. How to Use on ANY Real Webpage

1. Make sure your FastAPI backend is running:
   ```bash
   cd backend
   uvicorn main:app --reload
   ```
2. Open any webpage in Chrome (e.g. Wikipedia, a student portal, a government portal, or `http://localhost:3000`).
3. Click the **OneStep** extension icon in your browser toolbar.
4. It will automatically detect:
   - ✅ Backend status (`🟢 Backend Online`)
   - ✅ The current page title
   - ✅ All interactive buttons, links, and form elements on the real page.
5. Enter your goal (or click a quick suggestion) and click **"Find Next Step"**.
6. The backend evaluates the page elements and:
   - Highlights the target element on the real webpage with a **pulsing violet glow**.
   - Displays a floating **"👉 OneStep: Click here"** tooltip.
   - You can also click **"⚡ Click It For Me"** to have OneStep trigger the click automatically!
