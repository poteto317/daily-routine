import { runTransaction, writeBatch } from "firebase/firestore";
import { getFirestoreInstance } from "@/lib/firebase";
import { type CreateAccountInput, type UpdateAccountInput } from "./types";
import {
  createTimestamp,
  getAccountAdminGrantRef,
  getAccountDocRef,
  TEST_USER_EMAIL,
} from "./accountServiceCore";
import {
  getDefaultDisplayNameFromEmail,
  ANONYMOUS_USER_DEFAULT_DISPLAY_NAME,
} from "./accountUtils";

export const createAccountRecord = async (
  uid: string,
  input: CreateAccountInput,
): Promise<void> => {
  const now = createTimestamp();

  const batch = writeBatch(getFirestoreInstance());
  batch.set(getAccountDocRef(uid), {
    email: input.email,
    displayName: input.displayName,
    isAdmin: false,
    isAnonymous: false,
    isTestUser: false,
    createdAt: now,
    updatedAt: now,
  });
  if (input.isAdmin) {
    batch.set(getAccountAdminGrantRef(uid), {});
  }
  await batch.commit();
};

export const updateAccountRecord = async (
  uid: string,
  input: UpdateAccountInput,
): Promise<void> => {
  const updateData: Record<string, unknown> = {
    updatedAt: createTimestamp(),
  };

  if (input.displayName !== undefined) {
    updateData.displayName = input.displayName;
  }
  const batch = writeBatch(getFirestoreInstance());
  batch.update(getAccountDocRef(uid), updateData);
  if (input.isAdmin === true) {
    batch.set(getAccountAdminGrantRef(uid), {});
  } else if (input.isAdmin === false) {
    batch.delete(getAccountAdminGrantRef(uid));
  }
  await batch.commit();
};

export const deleteAccountRecord = async (uid: string): Promise<void> => {
  const batch = writeBatch(getFirestoreInstance());
  batch.delete(getAccountAdminGrantRef(uid));
  batch.delete(getAccountDocRef(uid));
  await batch.commit();
};

export const ensureAccountRecord = async (
  uid: string,
  email: string | null,
  isAnonymous: boolean,
): Promise<void> => {
  const ref = getAccountDocRef(uid);
  const now = createTimestamp();

  await runTransaction(getFirestoreInstance(), async (transaction) => {
    if ((await transaction.get(ref)).exists()) return;

    transaction.set(ref, {
      email: email ?? "",
      displayName:
        (email && getDefaultDisplayNameFromEmail(email)) ||
        (isAnonymous ? ANONYMOUS_USER_DEFAULT_DISPLAY_NAME : ""),
      isAdmin: false,
      isAnonymous,
      isTestUser: email === TEST_USER_EMAIL,
      createdAt: now,
      updatedAt: now,
    });
  });
};
