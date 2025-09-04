// src/pwa.js
import { useRegisterSW } from "virtual:pwa-register/react";

export function usePWA() {
  useRegisterSW({
    onNeedRefresh() {
      // ⚡ automatically update and reload
      updateServiceWorker(true);
    },
    onRegisteredSW(swUrl, registration) {
      // optional: check every hour for updates
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // 1h
      }
    }
  });
}
