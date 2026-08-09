import { useEffect } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { isLocalAuthEnabled } from "@/features/auth/storage";
import { getAuthInstance, isFirebaseConfigured } from "@/lib/firebase";
import { subscribeLocalAuthUser } from "@/services/authService";

type UseAuthSyncSubscriptionArgs = {
  handleAuthStateChanged: (user: User | null) => void;
  setLoading: (value: boolean) => void;
  setIsAdminLoading: (value: boolean) => void;
};

export const useAuthSyncSubscription = ({
  handleAuthStateChanged,
  setLoading,
  setIsAdminLoading,
}: UseAuthSyncSubscriptionArgs) => {
  useEffect(() => {
    // effectはStrict Modeでmount→cleanup→mountと二重実行されるため冪等に保つ。
    // 「初回のみ実行する」ためのrefガードを入れると、2回目のmountで
    // 購読処理もcleanup関数を返す処理も一切行われなくなり、1回目のmountの
    // cleanupで解除されたリスナーが二度と再登録されない不具合になる。
    if (!isFirebaseConfigured && isLocalAuthEnabled) {
      return subscribeLocalAuthUser(handleAuthStateChanged);
    }

    if (!isFirebaseConfigured) {
      const timer = setTimeout(() => {
        setLoading(false);
        setIsAdminLoading(false);
      }, 0);
      return () => {
        clearTimeout(timer);
      };
    }

    try {
      const auth = getAuthInstance();
      return onAuthStateChanged(auth, handleAuthStateChanged);
    } catch {
      const timer = setTimeout(() => {
        setLoading(false);
        setIsAdminLoading(false);
      }, 0);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [handleAuthStateChanged, setLoading, setIsAdminLoading]);
};
