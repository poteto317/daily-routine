import { useEffect } from "react";
import { getOrCreateUser, isFirebaseConfigured } from "@/lib/firebase";
import { watchRemoteChanges } from "@/features/sync";

/** Firebase認証とリモート変更の同期 */
export const useFirebaseSync = () => {
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    getOrCreateUser().catch(() => {});
    const unsubscribe = watchRemoteChanges(() => {});
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);
};
