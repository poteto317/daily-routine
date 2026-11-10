import { fireEvent, render, screen, within } from "@testing-library/react";
import { WeeklyLogCard } from "../components/WeeklyLogCard";
import type { WeeklyLogState } from "../useWeeklyLogState";
import type { WeeklyLogEntry } from "@/types/routine";

const entry = (weekStart: string, content: string): WeeklyLogEntry => ({
  id: `w-${weekStart}`,
  weekStart,
  content,
  createdAt: "2026-11-06T12:00:00.000Z",
  updatedAt: "2026-11-06T12:00:00.000Z",
});

const createState = (
  overrides: Partial<WeeklyLogState> = {},
): WeeklyLogState => ({
  currentWeekStart: "2026-11-02",
  selectedWeekStart: "2026-11-02",
  selectedEntry: null,
  entries: [],
  isEditing: false,
  contentInput: "",
  canNavigate: true,
  canGoNext: false,
  goToPreviousWeek: jest.fn(),
  goToNextWeek: jest.fn(),
  openWeek: jest.fn(),
  startEditing: jest.fn(),
  cancelEditing: jest.fn(),
  changeContent: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  ...overrides,
});

describe("WeeklyLogCard", () => {
  it("見出しで名前の付いた領域になり、編集中の本文欄がその中にある", () => {
    render(
      <WeeklyLogCard
        state={createState({ isEditing: true, contentInput: "" })}
      />,
    );

    const region = screen.getByRole("region", { name: "🗓️ 週ごとの業務日誌" });
    expect(within(region).getByLabelText("本文")).toBeInTheDocument();
  });

  it("週の見出し・期間・今週の印を出し、今週では次の週を押せない", () => {
    render(<WeeklyLogCard state={createState()} />);

    expect(screen.getByText("2026年11月2日（月）開始の週")).toBeInTheDocument();
    expect(screen.getByText("11月2日〜11月8日")).toBeInTheDocument();
    expect(screen.getByText("今週")).toBeInTheDocument();
    expect(screen.getByText("2026年11月2日（月）開始の週").tagName).toBe("H2");
    expect(screen.getByRole("button", { name: "次の週" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "前の週" })).not.toBeDisabled();
  });

  it("前の週を表示中は今週の印を出さず、次の週を押せる", () => {
    const state = createState({
      selectedWeekStart: "2026-10-26",
      canGoNext: true,
    });
    render(<WeeklyLogCard state={state} />);

    expect(screen.queryByText("今週")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "次の週" }));
    expect(state.goToNextWeek).toHaveBeenCalled();
  });

  it("日誌が無ければ空の表示と書くボタン", () => {
    const state = createState();
    render(<WeeklyLogCard state={state} />);

    expect(
      screen.getByText("この週の業務日誌はまだありません"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "➕ 書く" }));
    expect(state.startEditing).toHaveBeenCalled();
  });

  it("日誌があれば本文と編集・削除ボタン", () => {
    const state = createState({
      selectedEntry: entry("2026-11-02", "今週の成果"),
    });
    render(<WeeklyLogCard state={state} />);

    expect(screen.getByText("今週の成果")).toBeInTheDocument();
    expect(screen.getByText(/最終更新:/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "✏️ 編集" }));
    fireEvent.click(screen.getByRole("button", { name: "🗑️ 削除" }));
    expect(state.startEditing).toHaveBeenCalled();
    expect(state.remove).toHaveBeenCalled();
  });

  it("フォームでは本文を入力して保存・キャンセルでき、週の切り替えは押せない", () => {
    const state = createState({
      isEditing: true,
      contentInput: "書きかけ",
      canNavigate: false,
    });
    render(<WeeklyLogCard state={state} />);

    const textarea = screen.getByLabelText("本文");
    expect(textarea).toHaveValue("書きかけ");
    fireEvent.change(textarea, { target: { value: "書いた" } });
    expect(state.changeContent).toHaveBeenCalledWith("書いた");
    fireEvent.click(screen.getByRole("button", { name: "保存" }));
    fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));
    expect(state.save).toHaveBeenCalled();
    expect(state.cancelEditing).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "前の週" })).toBeDisabled();
  });

  it("一覧は表示中の週に「表示中」、ほかに「開く」を出す", () => {
    const state = createState({
      entries: [
        entry("2026-11-02", "今週の成果"),
        entry("2026-10-26", "先週の成果"),
      ],
      selectedEntry: entry("2026-11-02", "今週の成果"),
    });
    render(<WeeklyLogCard state={state} />);

    expect(screen.getByText("表示中")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", {
        name: "2026年10月26日（月）開始の週を開く",
      }),
    );
    expect(state.openWeek).toHaveBeenCalledWith("2026-10-26");
  });

  it("入力中は一覧の「開く」を押せない", () => {
    const state = createState({
      entries: [entry("2026-10-26", "先週の成果")],
      isEditing: true,
      canNavigate: false,
    });
    render(<WeeklyLogCard state={state} />);
    expect(
      screen.getByRole("button", {
        name: "2026年10月26日（月）開始の週を開く",
      }),
    ).toBeDisabled();
  });

  it("一覧が空なら記録がありません", () => {
    render(<WeeklyLogCard state={createState()} />);
    expect(screen.getByText("記録がありません")).toBeInTheDocument();
  });
});
