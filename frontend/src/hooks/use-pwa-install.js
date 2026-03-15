"use client";
import { useEffect, useState } from "react";

/**
 * Captures the beforeinstallprompt event and detects if the app is already
 * running as an installed PWA (standalone mode).
 *
 * Returns:
 *  - isStandalone: true when the app is already installed / running in standalone mode
 *  - canNativeInstall: true when the browser fired beforeinstallprompt (Chrome/Edge/Android)
 *  - triggerInstall: call this to show the native install prompt
 */
export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect standalone display mode (installed PWA)
    const mq = window.matchMedia("(display-mode: standalone)");
    const checkStandalone = () => {
      setIsStandalone(mq.matches || navigator.standalone === true);
    };
    checkStandalone();
    mq.addEventListener("change", checkStandalone);

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // If app gets installed, hide the button
    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
    };
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      mq.removeEventListener("change", checkStandalone);
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const triggerInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  return {
    isStandalone,
    canNativeInstall: !!deferredPrompt,
    triggerInstall,
  };
}
