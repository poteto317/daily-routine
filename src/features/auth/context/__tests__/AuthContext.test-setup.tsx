import { renderHook } from "@testing-library/react";
import { getAuthInstance } from "@/lib/firebase";
import {
  checkIsAdmin,
  ensureAccountRecord,
} from "@/features/account-admin/accountService";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInAnonymously,
  onAuthStateChanged,
  type Auth,
} from "firebase/auth";

jest.mock("@/lib/firebase", () => ({
  ...jest.requireActual("@/lib/firebase"),
  isFirebaseConfigured: true,
  getAuthInstance: jest.fn(),
}));

jest.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  signInAnonymously: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

jest.mock("@/features/account-admin/accountService", () => ({
  checkIsAdmin: jest.fn(),
  ensureAccountRecord: jest.fn(),
}));

import { AuthProvider, useAuth } from "@/features/auth";

export const mockGetAuthInstance = getAuthInstance as jest.MockedFunction<
  typeof getAuthInstance
>;
export const mockSignInWithEmailAndPassword =
  signInWithEmailAndPassword as jest.MockedFunction<
    typeof signInWithEmailAndPassword
  >;
export const mockCreateUserWithEmailAndPassword =
  createUserWithEmailAndPassword as jest.MockedFunction<
    typeof createUserWithEmailAndPassword
  >;
export const mockFirebaseSignOut = firebaseSignOut as jest.MockedFunction<
  typeof firebaseSignOut
>;
export const mockSignInAnonymously = signInAnonymously as jest.MockedFunction<
  typeof signInAnonymously
>;
export const mockOnAuthStateChanged = onAuthStateChanged as jest.MockedFunction<
  typeof onAuthStateChanged
>;
export const mockCheckIsAdmin = checkIsAdmin as jest.MockedFunction<
  typeof checkIsAdmin
>;
export const mockEnsureAccountRecord =
  ensureAccountRecord as jest.MockedFunction<typeof ensureAccountRecord>;

export const setupAuthTestDefaults = () => {
  jest.clearAllMocks();
  mockEnsureAccountRecord.mockResolvedValue(undefined);
  mockCheckIsAdmin.mockResolvedValue(false);
  mockOnAuthStateChanged.mockImplementation(() => jest.fn());
};

export const withMockAuthInstance = () => {
  const mockAuth = {} as Auth;
  mockGetAuthInstance.mockReturnValue(mockAuth);
  return mockAuth;
};

export const renderUseAuthHook = () =>
  renderHook(() => useAuth(), {
    wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
  });
