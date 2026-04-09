import { createUserWithEmailAndPassword } from "firebase/auth";
import { deleteDoc, setDoc, updateDoc } from "firebase/firestore";
import { getAuthInstance } from "@/lib/firebase";
import { type CreateAccountInput, type UpdateAccountInput } from "./types";
import { createTimestamp, getAccountDocRef, TEST_USER_EMAIL } from "./accountServiceCore";
import { getAccount } from "./accountServiceQueries";
import { getDefaultDisplayNameFromEmail, ANONYMOUS_USER_DEFAULT_DISPLAY_NAME } from "./accountUtils";

export const createAuthUser = async (
  email: string,
  password: string,
): Promise<{ uid: string }> => {
  const credential = await createUserWithEmailAndPassword(
    getAuthInstance(),
    email,
    password,
  );
  return credential.user;
};

export const createAccountRecord = async (
  uid: string,
  input: CreateAccountInput,
): Promise<void> => {
  const now = createTimestamp();

  await setDoc(getAccountDocRef(uid), {
    email: input.email,
    displayName: input.displayName,
    isAdmin: input.isAdmin,
    isAnonymous: false,
    isTestUser: false,
    createdAt: now,
    updatedAt: now,
  });
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
  if (input.isAdmin !== undefined) {
    updateData.isAdmin = input.isAdmin;
  }

  await updateDoc(getAccountDocRef(uid), updateData);
};

export const deleteAccountRecord = async (uid: string): Promise<void> => {
  await deleteDoc(getAccountDocRef(uid));
};

export const ensureAccountRecord = async (
  uid: string,
  email: string | null,
  isAnonymous: boolean,
): Promise<void> => {
  const existing = await getAccount(uid);
  if (existing) return;

  const now = createTimestamp();
  const isTestUser = email === TEST_USER_EMAIL;

  await setDoc(getAccountDocRef(uid), {
    email: email || "",
    displayName: (email && getDefaultDisplayNameFromEmail(email)) || (isAnonymous ? ANONYMOUS_USER_DEFAULT_DISPLAY_NAME : ""),
    isAdmin: !isAnonymous && !isTestUser,
    isAnonymous,
    isTestUser,
    createdAt: now,
    updatedAt: now,
  });
};
