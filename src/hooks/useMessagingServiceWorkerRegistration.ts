"use client";

import { useEffect } from "react";
import { ERROR_MESSAGES } from "./constants";
import {
  isServiceWorkerSupported,
  registerAppServiceWorkers,
} from "./serviceWorkerRegistration";

export const useMessagingServiceWorkerRegistration = (
  onRegistered: () => Promise<void>,
) => {
  useEffect(() => {
    if (typeof window === "undefined" || !isServiceWorkerSupported()) {
      return;
    }

    const registerSW = async () => {
      try {
        await registerAppServiceWorkers();
        await navigator.serviceWorker.ready;
        await onRegistered();
      } catch (error) {
        console.error(ERROR_MESSAGES.serviceWorkerRegistrationFailed, error);
      }
    };

    if (document.readyState === "complete") {
      void registerSW();
    } else {
      window.addEventListener("load", registerSW);
    }

    return () => {
      window.removeEventListener("load", registerSW);
    };
  }, [onRegistered]);
};
