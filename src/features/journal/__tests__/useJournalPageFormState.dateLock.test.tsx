import { act, renderHook } from "@testing-library/react";
import type { JournalEntry } from "@/types/routine";
import { useJournalPageFormState } from "../useJournalPageFormState";

const pastEntry: JournalEntry = {
  id: "past",
  date: "2026-03-10",
  title: "過去のタイトル",
  content: "過去の本文",
  createdAt: "2026-03-10T10:00:00.000Z",
  updatedAt: "2026-03-10T10:00:00.000Z",
};

const initialState = {
  titleInput: "",
  contentInput: "",
  dateInput: null,
  showForm: false,
};

describe("useJournalPageFormState の日付の固定", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("新規は最初のタイトル入力の時点の今日で固定し、日をまたいでも変えない", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-15T23:59:00+09:00"));
    const { result } = renderHook(() => useJournalPageFormState(initialState));

    act(() => {
      result.current.openForm();
    });
    expect(result.current.dateInput).toBeNull();

    act(() => {
      result.current.handleTitleChange("夜のメモ");
    });
    expect(result.current.dateInput).toBe("2026-03-15");

    jest.setSystemTime(new Date("2026-03-16T00:01:00+09:00"));
    act(() => {
      result.current.handleContentChange("日をまたいだ");
    });
    expect(result.current.dateInput).toBe("2026-03-15");
    expect(result.current.titleInput).toBe("夜のメモ");
    expect(result.current.contentInput).toBe("日をまたいだ");
  });

  it("描画のあとに日をまたいでも、最初の入力は固定する時点の今日で固定する（描画時の今日を使わない）", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-15T23:59:00+09:00"));
    const { result } = renderHook(() => useJournalPageFormState(initialState));

    act(() => {
      result.current.openForm();
    });
    // 再描画せずに時計だけ進める。ハンドラが描画時に取った今日を持っていると、前の日で固定される
    jest.setSystemTime(new Date("2026-03-16T00:01:00+09:00"));
    act(() => {
      result.current.handleTitleChange("日をまたいだ最初の入力");
    });

    expect(result.current.dateInput).toBe("2026-03-16");
  });

  it("新規で最初の変更が日付欄なら、選んだ値で固定する（今日にならない）", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-15T12:00:00+09:00"));
    const { result } = renderHook(() => useJournalPageFormState(initialState));

    act(() => {
      result.current.openForm();
      result.current.handleDateChange("2026-03-10");
    });
    act(() => {
      result.current.handleTitleChange("十日の記録");
    });

    expect(result.current.dateInput).toBe("2026-03-10");
  });

  it("日付欄を空にした値はそのまま入り、その後の入力で今日に戻らない", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-15T12:00:00+09:00"));
    const { result } = renderHook(() => useJournalPageFormState(initialState));

    act(() => {
      result.current.openForm();
      result.current.handleTitleChange("タイトル");
    });
    act(() => {
      result.current.handleDateChange("");
    });
    act(() => {
      result.current.handleContentChange("本文");
    });

    expect(result.current.dateInput).toBe("");
  });

  it("フォームを開く・閉じるリセットは日付を固定しない（null に戻す）", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-15T12:00:00+09:00"));
    const { result } = renderHook(() => useJournalPageFormState(initialState));

    act(() => {
      result.current.openForm();
      result.current.handleTitleChange("タイトル");
    });
    expect(result.current.dateInput).toBe("2026-03-15");

    act(() => {
      result.current.handleCancelForm();
    });
    expect(result.current.dateInput).toBeNull();
    expect(result.current.titleInput).toBe("");

    act(() => {
      result.current.openForm();
    });
    expect(result.current.dateInput).toBeNull();
  });

  it("編集はエントリの日付を入れ、再読み込みで null に戻っても次の入力でエントリの日付に戻す", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-15T12:00:00+09:00"));
    const { result } = renderHook(() => useJournalPageFormState(initialState));

    act(() => {
      result.current.openEditForm(pastEntry);
    });
    expect(result.current.dateInput).toBe(pastEntry.date);

    // 再読み込み（createLoadJournalDataAction）と同じく素のセッターで戻す
    act(() => {
      result.current.setTitleInput("");
      result.current.setContentInput("");
      result.current.setDateInput(null);
    });
    expect(result.current.dateInput).toBeNull();
    expect(result.current.editingEntry).toBe(pastEntry);

    act(() => {
      result.current.handleContentChange("打ち直した本文");
    });
    expect(result.current.dateInput).toBe(pastEntry.date);
  });
});
