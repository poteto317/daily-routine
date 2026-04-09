import {
  type AuthSyncSetters,
  applySignedOutUserState,
} from "./authSyncStateActions";

type CreateSignedOutAuthStateHandlerArgs = AuthSyncSetters & {
  setCurrentUserId: (uid: string | null) => void;
};

export const createSignedOutAuthStateHandler = ({
  setUser,
  setIsAdmin,
  setLoading,
  setCurrentUserId,
}: CreateSignedOutAuthStateHandlerArgs) => {
  return () => {
    applySignedOutUserState(
      { setUser, setIsAdmin, setLoading },
      setCurrentUserId,
    );
  };
};
