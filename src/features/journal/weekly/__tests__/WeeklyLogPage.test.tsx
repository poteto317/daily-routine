import { fireEvent, render, screen, within } from "@testing-library/react";
import type { JournalHistory } from "@/types/routine";
import { WeeklyLogPage } from "../WeeklyLogPage";
import journalTexts from "../../locales/ja.json";

const writeWeeklyLog = (content: string) => {
  fireEvent.click(screen.getByRole("button", { name: "➕ 書く" }));
  fireEvent.change(screen.getByLabelText("本文"), {
    target: { value: content },
  });
  fireEvent.click(screen.getByRole("button", { name: "保存" }));
};

describe("WeeklyLogPage", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers().setSystemTime(new Date("2026-03-15T12:00:00+09:00"));
  });

  afterEach(() => {
    jest.useRealTimers();
    localStorage.clear();
  });

  it("画面の見出し（h1）が 1 つだけで、業務日誌の見出しになる", () => {
    render(<WeeklyLogPage />);

    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(journalTexts.weeklyLog.title);
  });

  it("画面の本体は main ランドマークに入る（他の画面と同じ構造）", () => {
    render(<WeeklyLogPage />);

    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("カード内の見出しは h2 から始まり、h3 を使わない", () => {
    render(<WeeklyLogPage />);

    expect(screen.getAllByRole("heading", { level: 2 }).length).toBeGreaterThan(
      0,
    );
    expect(screen.queryAllByRole("heading", { level: 3 })).toHaveLength(0);
  });

  it("保存すると、これまでの業務日誌の一覧に出る（state がカードに配線されている）", () => {
    render(<WeeklyLogPage />);

    writeWeeklyLog("今週の振り返り");

    const list = screen.getByRole("heading", {
      level: 2,
      name: journalTexts.weeklyLog.listTitle,
    }).parentElement as HTMLElement;
    expect(within(list).getByText("今週の振り返り")).toBeInTheDocument();
  });

  it("保存すると、その週の月曜のキーで weekly-log-history に保存される", () => {
    render(<WeeklyLogPage />);

    writeWeeklyLog("今週の振り返り");

    // 2026-03-15（日）を含む週は 2026-03-09（月）開始
    const weekly = JSON.parse(
      localStorage.getItem("weekly-log-history") ?? "{}",
    );
    expect(weekly["2026-03-09"]).toEqual(
      expect.objectContaining({ content: "今週の振り返り" }),
    );
  });

  it("保存しても、日次のジャーナル（journal-history）は変わらない", () => {
    const history: JournalHistory = {
      "2026-03-12": [
        {
          id: "a",
          date: "2026-03-12",
          title: "十二日の記録",
          content: "十二日の記録の本文",
          createdAt: "2026-03-12T01:00:00.000Z",
          updatedAt: "2026-03-12T01:00:00.000Z",
        },
      ],
    };
    const seed = JSON.stringify(history);
    localStorage.setItem("journal-history", seed);
    render(<WeeklyLogPage />);

    writeWeeklyLog("今週の振り返り");

    expect(localStorage.getItem("journal-history")).toBe(seed);
  });
});
