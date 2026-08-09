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

// jest.requireActual("@/lib/firebase") は使わない。
// 実モジュールは読み込み時に initializeFirebaseIfConfigured() を実行するため、
// NEXT_PUBLIC_FIREBASE_* が設定された環境（Firebase 実設定を持つ開発者のローカル等）では
// モック済みの firebase/auth に存在しない getAuth を呼びに行き、
// テストスイート全体が起動に失敗する。
// このテストが必要とするのは isFirebaseConfigured と getAuthInstance だけなので、
// 副作用のない形で個別に定義する。
jest.mock("@/lib/firebase", () => ({
  ...jest.requireActual("@/lib/firebase-modules/error"),
  isFirebaseConfigured: true,
  getAuthInstance: jest.fn(),
  getFCMToken: jest.fn(),
  onForegroundMessage: jest.fn(),
  getOrCreateUser: jest.fn(),
  getFirestoreInstance: jest.fn(),
  app: undefined,
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

// テスト側は @/features/auth を直接 import せず、必ずこの setup 経由で受け取る。
// テストファイルが @/features/auth を先に import すると、この setup の
// jest.mock 登録より前に firebase/auth の実モジュールがバインドされてしまい、
// モックが効かないまま実 Firebase が動く（act 警告や環境依存の失敗の原因になる）。
export { useAuth };

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
