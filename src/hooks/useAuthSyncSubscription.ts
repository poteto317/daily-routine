import { useEffect, useRef } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { getAuthInstance, isFirebaseConfigured } from "@/lib/firebase";
import { subscribeLocalAuthUser } from "@/services/authService";

type UseAuthSyncSubscriptionArgs = {
  handleAuthStateChanged: (user: User | null) => void;
  setLoading: (value: boolean) => void;
};

export const useAuthSyncSubscription = ({
  handleAuthStateChanged,
  setLoading,
}: UseAuthSyncSubscriptionArgs) => {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (!isFirebaseConfigured) {
      return subscribeLocalAuthUser(handleAuthStateChanged);
    }

    try {
      const auth = getAuthInstance();
      return onAuthStateChanged(auth, handleAuthStateChanged);
    } catch {
      const timer = setTimeout(() => setLoading(false), 0);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [handleAuthStateChanged, setLoading]);
};
