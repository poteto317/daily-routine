import { migrateToUserStorage, setCurrentUserId } from "@/lib/storage/core";
import { getNotificationBootstrapRoutines } from "../storageRoutinesCore";

const uid = "routine-owner";
const scopedKey = `user:${uid}:daily-routines`;
const stored = JSON.stringify([
  { id: "r1", title: "Routine", startTime: "08:00", daysOfWeek: [1] },
]);

beforeEach(() => {
  localStorage.clear();
  setCurrentUserId(null);
});

it("現在のグローバルスコープに関わらず、対象ユーザー自身の保存済み設定を読む", () => {
  setCurrentUserId("previous-owner");
  localStorage.setItem(
    "user:previous-owner:daily-routines",
    '[{"id":"previous"}]',
  );
  localStorage.setItem(scopedKey, stored);
  expect(getNotificationBootstrapRoutines(uid)).toEqual([
    expect.objectContaining({ id: "r1" }),
  ]);
});

it("未取得または読み取れない設定を明示的な空配列と区別する", () => {
  expect(getNotificationBootstrapRoutines(uid)).toBeNull();
  localStorage.setItem(scopedKey, "{invalid");
  expect(getNotificationBootstrapRoutines(uid)).toBeNull();
  localStorage.setItem(scopedKey, "[]");
  expect(getNotificationBootstrapRoutines(uid)).toEqual([]);
});

it("旧データからコピーした設定は再ログイン後にも自動送信対象にしない", () => {
  localStorage.setItem("daily-routines", stored);
  expect(getNotificationBootstrapRoutines(uid)).toBeNull();
  migrateToUserStorage(uid);
  localStorage.removeItem("daily-routines");
  expect(localStorage.getItem(scopedKey)).toBe(stored);
  expect(getNotificationBootstrapRoutines(uid)).toBeNull();
});

it("旧版でコピー済みと判別した設定は再ログインでも除外する", () => {
  localStorage.setItem("daily-routines", stored);
  localStorage.setItem(scopedKey, stored);
  expect(getNotificationBootstrapRoutines(uid)).toBeNull();
  localStorage.removeItem("daily-routines");
  expect(getNotificationBootstrapRoutines(uid)).toBeNull();
});
