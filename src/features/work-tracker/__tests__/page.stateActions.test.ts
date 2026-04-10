import type { MoodType } from "@/types/routine";
import {
  deleteTrackedSession,
  hasWorkNameInput,
  resetWorkTrackerForm,
  saveWorkTrackerSession,
  startWorkTrackerTimer,
  stopWorkTrackerTimer,
} from "../page/stateActions";

describe("work-tracker stateActions", () => {
  it("作業名の入力有無を判定する", () => {
    expect(hasWorkNameInput("設計")).toBe(true);
    expect(hasWorkNameInput("   ")).toBe(false);
  });

  it("フォーム状態を初期値へ戻す", () => {
    const setWorkName = jest.fn();
    const setNotes = jest.fn();
    const setSelectedMood = jest.fn();
    const setSelectedTemplate = jest.fn();
    const setElapsedTime = jest.fn();
    const setShowInputForm = jest.fn();
    const setShowTemplateDropdown = jest.fn();
    const startTimeRef = { current: new Date("2026-03-07T12:00:00.000Z") };

    resetWorkTrackerForm({
      setWorkName,
      setNotes,
      setSelectedMood,
      setSelectedTemplate,
      setElapsedTime,
      setShowInputForm,
      setShowTemplateDropdown,
      startTimeRef,
    });

    expect(setWorkName).toHaveBeenCalledWith("");
    expect(setNotes).toHaveBeenCalledWith("");
    expect(setSelectedMood).toHaveBeenCalledWith("normal");
    expect(setSelectedTemplate).toHaveBeenCalledWith(null);
    expect(setElapsedTime).toHaveBeenCalledWith(0);
    expect(setShowInputForm).toHaveBeenCalledWith(false);
    expect(setShowTemplateDropdown).toHaveBeenCalledWith(false);
    expect(startTimeRef.current).toBeNull();
  });

  it("タイマー開始時の状態を組み立てる", () => {
    const setElapsedTime = jest.fn();
    const setIsRunning = jest.fn();
    const startTimeRef = { current: null as Date | null };
    const now = new Date("2026-03-07T12:34:56.000Z");

    startWorkTrackerTimer({
      setElapsedTime,
      setIsRunning,
      startTimeRef,
      now,
    });

    expect(startTimeRef.current).toBe(now);
    expect(setElapsedTime).toHaveBeenCalledWith(0);
    expect(setIsRunning).toHaveBeenCalledWith(true);
  });

  it("タイマー停止時に入力フォームを表示する", () => {
    const setIsRunning = jest.fn();
    const setShowInputForm = jest.fn();

    stopWorkTrackerTimer({ setIsRunning, setShowInputForm });

    expect(setIsRunning).toHaveBeenCalledWith(false);
    expect(setShowInputForm).toHaveBeenCalledWith(true);
  });

  it("無効な作業名なら保存せず false を返す", () => {
    const onInvalidWorkName = jest.fn();
    const persistSession = jest.fn();

    expect(
      saveWorkTrackerSession({
        workName: "   ",
        selectedMood: "normal",
        elapsedTime: 0,
        notes: "",
        startTime: null,
        onInvalidWorkName,
        persistSession,
        refreshSessions: jest.fn(),
        refreshTemplates: jest.fn(),
        setSessions: jest.fn(),
        setTemplates: jest.fn(),
        resetForm: jest.fn(),
      }),
    ).toBe(false);

    expect(onInvalidWorkName).toHaveBeenCalled();
    expect(persistSession).not.toHaveBeenCalled();
  });

  it("有効な作業なら保存・再取得・リセットを行う", () => {
    const persistSession = jest.fn();
    const refreshSessions = jest.fn(() => [
      {
        id: "s1",
        workTemplateId: "t1",
        workName: "設計",
        mood: "good" as MoodType,
        startTime: "2026-03-07T10:00:00.000Z",
        endTime: "2026-03-07T11:00:00.000Z",
        duration: 3600,
        createdAt: "2026-03-07T11:00:00.000Z",
      },
    ]);
    const refreshTemplates = jest.fn(() => [
      {
        id: "t1",
        name: "設計",
        createdAt: "2026-03-07T00:00:00.000Z",
        updatedAt: "2026-03-07T00:00:00.000Z",
      },
    ]);
    const setSessions = jest.fn();
    const setTemplates = jest.fn();
    const resetForm = jest.fn();
    const startTime = new Date("2026-03-07T10:00:00.000Z");

    expect(
      saveWorkTrackerSession({
        workName: "設計",
        selectedMood: "good",
        elapsedTime: 3600,
        notes: "集中",
        startTime,
        onInvalidWorkName: jest.fn(),
        persistSession,
        refreshSessions,
        refreshTemplates,
        setSessions,
        setTemplates,
        resetForm,
      }),
    ).toBe(true);

    expect(persistSession).toHaveBeenCalledWith({
      workName: "設計",
      selectedMood: "good",
      elapsedTime: 3600,
      notes: "集中",
      startTime,
    });
    expect(setSessions).toHaveBeenCalledWith(
      refreshSessions.mock.results[0].value,
    );
    expect(setTemplates).toHaveBeenCalledWith(
      refreshTemplates.mock.results[0].value,
    );
    expect(resetForm).toHaveBeenCalled();
  });

  it("削除確認に応じて削除と再取得を切り替える", () => {
    const removeSession = jest.fn();
    const refreshSessions = jest.fn(() => [
      {
        id: "s2",
        workTemplateId: "t1",
        workName: "実装",
        mood: "normal" as MoodType,
        startTime: "2026-03-07T12:00:00.000Z",
        endTime: "2026-03-07T12:10:00.000Z",
        duration: 600,
        createdAt: "2026-03-07T12:10:00.000Z",
      },
    ]);
    const setSessions = jest.fn();

    expect(
      deleteTrackedSession({
        sessionId: "s1",
        confirmDelete: () => false,
        removeSession,
        refreshSessions,
        setSessions,
      }),
    ).toBe(false);

    expect(removeSession).not.toHaveBeenCalled();

    expect(
      deleteTrackedSession({
        sessionId: "s1",
        confirmDelete: () => true,
        removeSession,
        refreshSessions,
        setSessions,
      }),
    ).toBe(true);

    expect(removeSession).toHaveBeenCalledWith("s1");
    expect(setSessions).toHaveBeenCalledWith(
      refreshSessions.mock.results[0].value,
    );
  });
});
