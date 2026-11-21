import { deleteApp, initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  inMemoryPersistence,
  initializeAuth,
} from "firebase/auth";
import { getAuthInstance } from "@/lib/firebase";

export const createAuthUser = async (
  email: string,
  password: string,
): Promise<{ uid: string }> => {
  const { app } = getAuthInstance();
  const temporaryApp = initializeApp(
    app.options,
    `account-creation-${crypto.randomUUID()}`,
  );
  try {
    const auth = initializeAuth(temporaryApp, {
      persistence: inMemoryPersistence,
    });
    const { user } = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return { uid: user.uid };
  } finally {
    await deleteApp(temporaryApp);
  }
};
