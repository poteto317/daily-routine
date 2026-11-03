import type { JournalEntry } from "@/types/routine";
import { createJournalInputChangeHandlers } from "../journalInputChangeHandlers";

const TODAY = "2026-03-15";

describe("createJournalInputChangeHandlers", () => {
  const pastEntry: JournalEntry = {
    id: "past",
    date: "2026-03-10",
    title: "過去",
    content: "本文",
    createdAt: "2026-03-10T10:00:00.000Z",
    updatedAt: "2026-03-10T10:00:00.000Z",
  };

  const setup = (editingEntry: JournalEntry | null) => {
    const setTitleInput = jest.fn();
    const setContentInput = jest.fn();
    const setDateInput = jest.fn();
    const getToday = jest.fn(() => TODAY);
    const handlers = createJournalInputChangeHandlers({
      editingEntry,
      getToday,
      setTitleInput,
      setContentInput,
      setDateInput,
    });
    return { handlers, setTitleInput, setContentInput, setDateInput, getToday };
  };

  // setDateInput に渡された関数更新を、前の値に適用した結果を返す
  const applyDateUpdate = (setDateInput: jest.Mock, prev: string | null) => {
    const updater = setDateInput.mock.calls[0][0] as (
      value: string | null,
    ) => string | null;
    return updater(prev);
  };

  it("新規のタイトル入力は、未操作（null）なら今日で日付を固定し、タイトルを入れる", () => {
    const { handlers, setTitleInput, setDateInput, getToday } = setup(null);

    handlers.handleTitleChange("タイトル");

    expect(setTitleInput).toHaveBeenCalledWith("タイトル");
    expect(getToday).toHaveBeenCalledTimes(1);
    expect(applyDateUpdate(setDateInput, null)).toBe(TODAY);
  });

  it("新規の本文入力も、未操作（null）なら今日で日付を固定し、本文を入れる", () => {
    const { handlers, setContentInput, setDateInput } = setup(null);

    handlers.handleContentChange("本文");

    expect(setContentInput).toHaveBeenCalledWith("本文");
    expect(applyDateUpdate(setDateInput, null)).toBe(TODAY);
  });

  it("既に日付がある（固定済み・選んだ値・空にした値）なら上書きしない", () => {
    const { handlers, setDateInput } = setup(null);

    handlers.handleContentChange("本文");

    expect(applyDateUpdate(setDateInput, "2026-03-01")).toBe("2026-03-01");
    expect(applyDateUpdate(setDateInput, "")).toBe("");
  });

  it("編集はエントリの日付で固定し、今日を取らない（null に戻っていても今日にしない）", () => {
    const { handlers, setDateInput, getToday } = setup(pastEntry);

    handlers.handleTitleChange("直したタイトル");

    expect(getToday).not.toHaveBeenCalled();
    expect(applyDateUpdate(setDateInput, null)).toBe(pastEntry.date);
  });

  it("日付欄の変更は固定せず、選んだ値（空を含む）をそのまま入れる", () => {
    const { handlers, setDateInput, setTitleInput, getToday } = setup(null);

    handlers.handleDateChange("2026-03-01");
    handlers.handleDateChange("");

    expect(setDateInput).toHaveBeenNthCalledWith(1, "2026-03-01");
    expect(setDateInput).toHaveBeenNthCalledWith(2, "");
    expect(getToday).not.toHaveBeenCalled();
    expect(setTitleInput).not.toHaveBeenCalled();
  });
});
