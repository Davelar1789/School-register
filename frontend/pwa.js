// src/pwa.js
import { registerSW } from "virtual:pwa-register";

// This will auto-update and reload silently
registerSW({
  onNeedRefresh() {
    // force update + reload immediately
    window.location.reload();
  },
  onRegisteredSW(swUrl, registration) {
    if (registration) {
      // optional: check for updates every 1h
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);
    }
  },
});
