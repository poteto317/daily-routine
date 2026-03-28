import { fireEvent, render, screen } from "@testing-library/react";
import { WorkTrackerPage } from "../page/WorkTrackerPageView";

jest.mock("../page/useWorkTrackerPageState", () => ({
  useWorkTrackerPageState: jest.fn(),
}));

jest.mock("@/lib/storage", () => ({
  formatTimerLong: (seconds: number) => `${seconds}秒`,
  getSessionsByTemplateId: jest.fn(() => [
    {
      id: "old-1",
      workTemplateId: "t1",
      workName: "設計",
      mood: "good",
      duration: 400,
      createdAt: "2026-03-06T00:00:00.000Z",
      notes: "前回",
    },
  ]),
  getTemplateStats: jest.fn(() => ({
    count: 2,
    averageDuration: 350,
    bestDuration: 300,
    latestDuration: 400,
    trend: "improving",
  })),
}));

import { useWorkTrackerPageState } from "../page/useWorkTrackerPageState";

const mockUseWorkTrackerPageState =
  useWorkTrackerPageState as jest.MockedFunction<typeof useWorkTrackerPageState>;

const template = {
  id: "t1",
  name: "設計",
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
  lastUsedAt: "2026-03-07T00:00:00.000Z",
};

const createState = (overrides: Record<string, unknown> = {}) => ({
  sessions: [
    {
      id: "s1",
      workTemplateId: "t1",
      workName: "設計",
      mood: "good" as const,
      startTime: "2026-03-07T09:00:00+09:00",
      endTime: "2026-03-07T10:00:00+09:00",
      duration: 3600,
      notes: "集中",
      createdAt: "2026-03-07T10:00:00.000Z",
    },
  ],
  templates: [template],
  isRunning: false,
  elapsedTime: 120,
  showInputForm: true,
  showTemplateDropdown: true,
  workName: "設",
  notes: "メモ",
  selectedMood: "normal" as const,
  selectedTemplate: template,
  setWorkName: jest.fn(),
  setNotes: jest.fn(),
  setSelectedMood: jest.fn(),
  setSelectedTemplate: jest.fn(),
  setShowTemplateDropdown: jest.fn(),
  startTimer: jest.fn(),
  stopTimer: jest.fn(),
  handleSaveSession: jest.fn(),
  handleCancelSession: jest.fn(),
  handleDeleteSession: jest.fn(),
  ...overrides,
});

describe("WorkTrackerPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("主要コンポーネントを描画し入力イベントを委譲する", () => {
    const state = createState();
    mockUseWorkTrackerPageState.mockReturnValue(state as never);

    render(<WorkTrackerPage />);

    expect(screen.getByText("⏱️ 作業記録タイマー")).toBeInTheDocument();
    expect(screen.getByText("3600秒")).toBeInTheDocument();
    expect(screen.getAllByText("120秒").length).toBeGreaterThan(0);
    expect(screen.getAllByText("設計").length).toBeGreaterThan(0);
    expect(screen.getByText("改善傾向！ベスト記録に近づいています")).toBeInTheDocument();
    expect(screen.getByText(/集中/)).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("例: プロジェクト資料作成"), {
      target: { value: "実装" },
    });
    expect(state.setWorkName).toHaveBeenCalledWith("実装");
    expect(state.setShowTemplateDropdown).toHaveBeenCalledWith(true);

    fireEvent.click(screen.getAllByText("設計")[0]);
    expect(state.setSelectedTemplate).toHaveBeenCalledWith(template);
    expect(state.setShowTemplateDropdown).toHaveBeenLastCalledWith(false);

    fireEvent.change(screen.getByPlaceholderText("例: 新しい方法を試した、集中できた、途中で中断があった など"), {
      target: { value: "新メモ" },
    });
    expect(state.setNotes).toHaveBeenCalledWith("新メモ");

    fireEvent.click(screen.getByText("絶好調"));
    expect(state.setSelectedMood).toHaveBeenCalledWith("great");

    fireEvent.click(screen.getByText("💾 記録を保存"));
    fireEvent.click(screen.getByText("キャンセル"));
    fireEvent.click(screen.getByLabelText("削除"));

    expect(state.handleSaveSession).toHaveBeenCalled();
    expect(state.handleCancelSession).toHaveBeenCalled();
    expect(state.handleDeleteSession).toHaveBeenCalledWith("s1");
  });

  it("フォーム非表示時は開始ボタンと空履歴を表示する", () => {
    const state = createState({
      sessions: [],
      showInputForm: false,
      showTemplateDropdown: false,
      selectedTemplate: null,
      workName: "",
      isRunning: false,
    });
    mockUseWorkTrackerPageState.mockReturnValue(state as never);

    render(<WorkTrackerPage />);

    fireEvent.click(screen.getByText("▶️ スタート"));

    expect(state.startTimer).toHaveBeenCalled();
    expect(screen.getByText("まだ作業記録がありません")).toBeInTheDocument();
    expect(screen.queryByText("💾 記録を保存")).not.toBeInTheDocument();
  });

  it("実行中は停止ボタンを表示する", () => {
    const state = createState({ isRunning: true, showInputForm: false });
    mockUseWorkTrackerPageState.mockReturnValue(state as never);

    render(<WorkTrackerPage />);

    fireEvent.click(screen.getByText("⏹️ ストップ"));
    expect(state.stopTimer).toHaveBeenCalled();
  });
});
