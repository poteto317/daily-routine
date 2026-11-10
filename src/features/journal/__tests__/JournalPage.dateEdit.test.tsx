import { fireEvent, render, screen, within } from "@testing-library/react";
import type { JournalEntry, JournalHistory } from "@/types/routine";
import { JournalPage } from "../JournalPage";
import journalTexts from "../locales/ja.json";

const STORAGE_KEY = "journal-history";

const makeEntry = (id: string, date: string, title: string): JournalEntry => ({
  id,
  date,
  title,
  content: `${title}の本文`,
  createdAt: `${date}T01:00:00.000Z`,
  updatedAt: `${date}T01:00:00.000Z`,
});

const seedHistory = (history: JournalHistory) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
};

const readHistory = (): JournalHistory =>
  JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as JournalHistory;

// 過去の記録（日次）のカードの見出し（h3）を上から順に返す。
// 「📖 過去の記録」の h2 を持つカードの中に絞って、ほかの見出しを拾わないようにする
const recentTitles = () =>
  within(
    screen.getByRole("heading", { level: 2, name: "📖 過去の記録" })
      .parentElement as HTMLElement,
  )
    .getAllByRole("heading", { level: 3 })
    .map((heading) => heading.textContent);

describe("JournalPage の日付の選択（実際の state と localStorage）", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers().setSystemTime(new Date("2026-03-15T12:00:00+09:00"));
    jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    localStorage.clear();
  });

  it("過去のエントリの日付を変えて保存すると、一覧の位置と日付の表示が変わり、旧バケットが消える", () => {
    seedHistory({
      "2026-03-12": [makeEntry("a", "2026-03-12", "十二日の記録")],
      "2026-03-10": [makeEntry("b", "2026-03-10", "十日の記録")],
    });
    render(<JournalPage />);
    expect(recentTitles()).toEqual(["十二日の記録", "十日の記録"]);

    fireEvent.click(screen.getAllByRole("button", { name: "✏️ 編集" })[1]);
    const dateField = screen.getByLabelText("日付");
    expect(dateField).toHaveValue("2026-03-10");
    expect(dateField).toHaveAttribute("max", "2026-03-15");
    fireEvent.change(dateField, { target: { value: "2026-03-13" } });
    fireEvent.click(screen.getByRole("button", { name: "更新" }));

    expect(window.alert).not.toHaveBeenCalled();
    expect(recentTitles()).toEqual(["十日の記録", "十二日の記録"]);
    expect(screen.getByText("2026年3月13日(金)")).toBeInTheDocument();
    const history = readHistory();
    expect(history).not.toHaveProperty("2026-03-10");
    expect(history["2026-03-13"]).toEqual([
      expect.objectContaining({
        id: "b",
        date: "2026-03-13",
        title: "十日の記録",
      }),
    ]);
  });

  it("今日のエントリの日付を過去へ移すと、今日の欄が空になり、一覧に移した日付で出る", () => {
    seedHistory({
      "2026-03-15": [makeEntry("t", "2026-03-15", "朝の振り返り")],
    });
    render(<JournalPage />);

    // 今日のカードの編集ボタン（一覧の編集ボタンより先に描画される）
    fireEvent.click(screen.getAllByRole("button", { name: "✏️ 編集" })[0]);
    fireEvent.change(screen.getByLabelText("日付"), {
      target: { value: "2026-03-14" },
    });
    // 保存までは今日のカードのフォームのまま（下書きの日付で過去用の編集カードへ切り替えない）
    expect(
      screen.getByRole("heading", { level: 2, name: /^今日の記録/ }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/の記録を編集$/)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "更新" }));

    expect(
      screen.getByText(journalTexts.todayCard.emptyLabel),
    ).toBeInTheDocument();
    expect(screen.getByText("2026年3月14日(土)")).toBeInTheDocument();
    expect(Object.keys(readHistory())).toEqual(["2026-03-14"]);
  });

  it("編集中に別のエントリを削除して再読み込みが走っても、保存で過去のエントリの日付が今日に書き換わらない", () => {
    jest.spyOn(window, "confirm").mockReturnValue(true);
    seedHistory({
      "2026-03-10": [makeEntry("p", "2026-03-10", "十日の記録")],
      "2026-03-05": [makeEntry("q", "2026-03-05", "五日の記録")],
    });
    render(<JournalPage />);

    fireEvent.click(screen.getAllByRole("button", { name: "✏️ 編集" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "🗑️ 削除" })[1]);

    // 再読み込みでタイトル・本文は空に戻るが、日付欄は編集前の日付として表示する
    expect(screen.getByLabelText("本文")).toHaveValue("");
    expect(screen.getByLabelText("日付")).toHaveValue("2026-03-10");

    fireEvent.change(screen.getByLabelText("本文"), {
      target: { value: "打ち直した本文" },
    });
    fireEvent.click(screen.getByRole("button", { name: "更新" }));

    expect(readHistory()).toEqual({
      "2026-03-10": [
        expect.objectContaining({
          id: "p",
          date: "2026-03-10",
          title: journalTexts.page.defaultTitle,
          content: "打ち直した本文",
        }),
      ],
    });
  });

  it("編集で日付を空・未来にして更新すると拒否し、保存済みの履歴を変えず、フォームと入力を残す", () => {
    const seeded = {
      "2026-03-10": [makeEntry("e", "2026-03-10", "十日の記録")],
    };
    seedHistory(seeded);
    render(<JournalPage />);

    fireEvent.click(screen.getAllByRole("button", { name: "✏️ 編集" })[0]);
    fireEvent.change(screen.getByLabelText("本文"), {
      target: { value: "直した本文" },
    });

    fireEvent.change(screen.getByLabelText("日付"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "更新" }));
    expect(window.alert).toHaveBeenLastCalledWith(
      journalTexts.page.alertInvalidDate,
    );

    fireEvent.change(screen.getByLabelText("日付"), {
      target: { value: "2026-03-16" },
    });
    fireEvent.click(screen.getByRole("button", { name: "更新" }));
    expect(window.alert).toHaveBeenLastCalledWith(
      journalTexts.page.alertFutureDate,
    );

    expect(readHistory()).toEqual(seeded);
    expect(screen.getByLabelText("本文")).toHaveValue("直した本文");
    expect(screen.getByLabelText("日付")).toHaveValue("2026-03-16");
  });

  it("編集で日付を 1900 年より前（年を打ちかけた 0202 年）にして更新すると拒否し、保存済みの履歴を変えず、フォームと入力を残す", () => {
    const seeded = {
      "2025-11-03": [makeEntry("o", "2025-11-03", "去年の記録")],
    };
    seedHistory(seeded);
    render(<JournalPage />);

    fireEvent.click(screen.getAllByRole("button", { name: "✏️ 編集" })[0]);
    const dateField = screen.getByLabelText("日付");
    expect(dateField).toHaveAttribute("min", "1900-01-01");
    fireEvent.change(screen.getByLabelText("本文"), {
      target: { value: "直した本文" },
    });

    // デスクトップの Chrome は年を 1 文字打つごとに onChange を送る（"202" まで打った状態）
    fireEvent.change(dateField, { target: { value: "0202-11-03" } });
    fireEvent.click(screen.getByRole("button", { name: "更新" }));

    expect(window.alert).toHaveBeenLastCalledWith(
      journalTexts.page.alertInvalidDate,
    );
    expect(readHistory()).toEqual(seeded);
    expect(screen.getByLabelText("本文")).toHaveValue("直した本文");
    expect(screen.getByLabelText("日付")).toHaveValue("0202-11-03");
  });

  it("新規追加は書き始めた時点の日付で固定され、日をまたいでから保存しても書き始めた日の記録になる", () => {
    jest.setSystemTime(new Date("2026-03-15T23:59:00+09:00"));
    render(<JournalPage />);

    fireEvent.click(screen.getByRole("button", { name: "➕" }));
    fireEvent.change(screen.getByPlaceholderText(/今日感じたこと/), {
      target: { value: "夜に書き始めた" },
    });

    jest.setSystemTime(new Date("2026-03-16T00:01:00+09:00"));
    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    expect(readHistory()).toEqual({
      "2026-03-15": [
        expect.objectContaining({
          date: "2026-03-15",
          title: journalTexts.page.defaultTitle,
          content: "夜に書き始めた",
        }),
      ],
    });
  });

  it("新規追加で日付欄に過去の日付を選ぶと、見出しがその日付になり、その日付で保存される", () => {
    render(<JournalPage />);
    fireEvent.click(screen.getByRole("button", { name: "➕" }));

    const dateField = screen.getByLabelText("日付");
    expect(dateField).toHaveValue("2026-03-15");
    expect(dateField).toHaveAttribute("max", "2026-03-15");
    fireEvent.change(dateField, { target: { value: "2026-03-10" } });
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "2026年3月10日(火) の記録",
      }),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/今日感じたこと/), {
      target: { value: "十日のこと" },
    });
    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    expect(Object.keys(readHistory())).toEqual(["2026-03-10"]);
  });

  it("新規追加で日付欄を空・未来にすると保存を拒否し、理由を示してフォームと入力を残す", () => {
    render(<JournalPage />);
    fireEvent.click(screen.getByRole("button", { name: "➕" }));
    fireEvent.change(screen.getByPlaceholderText(/今日感じたこと/), {
      target: { value: "本文" },
    });

    fireEvent.change(screen.getByLabelText("日付"), { target: { value: "" } });
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: journalTexts.todayCard.titleLabel,
      }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "保存" }));
    expect(window.alert).toHaveBeenLastCalledWith(
      journalTexts.page.alertInvalidDate,
    );

    fireEvent.change(screen.getByLabelText("日付"), {
      target: { value: "2026-03-16" },
    });
    fireEvent.click(screen.getByRole("button", { name: "保存" }));
    expect(window.alert).toHaveBeenLastCalledWith(
      journalTexts.page.alertFutureDate,
    );

    expect(readHistory()).toEqual({});
    expect(screen.getByPlaceholderText(/今日感じたこと/)).toHaveValue("本文");
  });

  it("新規追加で日付欄を 1900 年より前（0202 年）にすると保存を拒否し、不正の文言を示してフォームと入力を残す", () => {
    render(<JournalPage />);
    fireEvent.click(screen.getByRole("button", { name: "➕" }));
    expect(screen.getByLabelText("日付")).toHaveAttribute("min", "1900-01-01");
    fireEvent.change(screen.getByPlaceholderText(/今日感じたこと/), {
      target: { value: "本文" },
    });

    fireEvent.change(screen.getByLabelText("日付"), {
      target: { value: "0202-03-15" },
    });
    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    expect(window.alert).toHaveBeenLastCalledWith(
      journalTexts.page.alertInvalidDate,
    );
    expect(readHistory()).toEqual({});
    expect(screen.getByPlaceholderText(/今日感じたこと/)).toHaveValue("本文");
    expect(screen.getByLabelText("日付")).toHaveValue("0202-03-15");
  });
});
