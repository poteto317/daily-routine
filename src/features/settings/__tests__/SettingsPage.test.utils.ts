import * as settingsStorage from "@/features/settings/storage";
import * as routineStorage from "@/features/routine/storage";
import * as sync from "@/features/sync/sync";
import * as todoListsStorage from "@/features/todo-lists/storage";
import { type AppSettings } from "@/types/routine";

jest.mock("@/features/settings/storage", () => ({
  getSettings: jest.fn(),
  saveSettings: jest.fn(),
}));

jest.mock("@/features/routine/storage", () => ({
  getRoutines: jest.fn(),
  saveRoutines: jest.fn(),
  getDailyProgress: jest.fn(),
  saveDailyProgress: jest.fn(),
  saveDailyProgressSilently: jest.fn(),
  getMonthlyHistory: jest.fn(),
  saveMonthlyHistory: jest.fn(),
}));

jest.mock("@/features/todo-lists/storage", () => ({
  getTodoLists: jest.fn(),
}));

jest.mock("@/lib/firebase", () => ({
  getFCMToken: jest.fn(),
}));

jest.mock("@/features/sync/sync", () => ({
  uploadToFirestore: jest.fn(),
  downloadFromFirestore: jest.fn(),
  getSyncStatus: jest.fn(),
  refreshRemoteSyncStatus: jest.fn(),
  watchRemoteChanges: jest.fn(),
}));

jest.mock("@/features/api-key", () => ({
  ApiKeySection: () =>
    jest
      .requireActual<typeof import("react")>("react")
      .createElement("div", { "data-testid": "api-key-section" }),
}));

Object.defineProperty(navigator, "serviceWorker", {
  value: {
    ready: Promise.resolve({
      showNotification: jest.fn(),
    }),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  writable: true,
});

export const defaultSettings: AppSettings = {
  defaultDurationMinutes: 30,
  defaultNotificationMinutes: 0,
  theme: "auto",
  swipeAction: "delete",
  pomodoroFocusMinutes: 25,
  pomodoroBreakMinutes: 5,
  backgroundRefreshIntervalMinutes: 30,
};

export const setupSettingsPageMocks = () => {
  const mockGetSettings = settingsStorage.getSettings as jest.Mock;
  const mockSaveSettings = settingsStorage.saveSettings as jest.Mock;
  const mockGetRoutines = routineStorage.getRoutines as jest.Mock;
  const mockGetDailyProgress = routineStorage.getDailyProgress as jest.Mock;
  const mockGetMonthlyHistory = routineStorage.getMonthlyHistory as jest.Mock;
  const mockGetSyncStatus = sync.getSyncStatus as jest.Mock;
  const mockWatchRemoteChanges = sync.watchRemoteChanges as jest.Mock;
  const mockGetTodoLists = todoListsStorage.getTodoLists as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSettings.mockReturnValue(defaultSettings);
    mockGetRoutines.mockReturnValue([]);
    mockGetDailyProgress.mockReturnValue({});
    mockGetMonthlyHistory.mockReturnValue({});
    mockGetTodoLists.mockReturnValue([
      {
        id: "list-1",
        title: "買い物",
        items: [],
        createdAt: "2026-03-01T00:00:00.000Z",
        updatedAt: "2026-03-01T00:00:00.000Z",
      },
      {
        id: "list-2",
        title: "仕事",
        items: [],
        createdAt: "2026-03-02T00:00:00.000Z",
        updatedAt: "2026-03-02T00:00:00.000Z",
      },
    ]);
    mockGetSyncStatus.mockReturnValue({
      isSyncing: false,
      lastSyncTime: null,
      localLastModified: null,
      remoteLastModified: null,
      hasRemoteChanges: false,
      hasLocalChanges: false,
      error: null,
    });
    mockWatchRemoteChanges.mockReturnValue(() => {});
  });

  return {
    mockGetSettings,
    mockSaveSettings,
    mockGetRoutines,
    mockGetDailyProgress,
    mockGetMonthlyHistory,
    mockGetSyncStatus,
    mockGetTodoLists,
    mockWatchRemoteChanges,
  };
};
