import { fireEvent, render, screen } from "@testing-library/react";
import { PresetApplySection } from "../components/PresetApplySection";
import type { RoutinePreset } from "@/types/routine";

const preset: RoutinePreset = {
  id: "p1",
  name: "朝ルーティン",
  routineTemplates: [
    { title: "朝食", startTime: "07:00", duration: 30, category: "life" },
    { title: "運動", startTime: "07:30", duration: 20, category: "health" },
  ],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

describe("PresetApplySection", () => {
  it("ルーティンテンプレートの概要を一覧表示する", () => {
    render(
      <PresetApplySection
        preset={preset}
        selectedDays={new Set()}
        onToggleDay={jest.fn()}
        onApply={jest.fn()}
      />,
    );
    expect(screen.getByText(/朝食 \(07:00, 30分\)/)).toBeInTheDocument();
    expect(screen.getByText(/運動 \(07:30, 20分\)/)).toBeInTheDocument();
  });

  it("既知のカテゴリはその絵文字を表示する", () => {
    render(
      <PresetApplySection
        preset={preset}
        selectedDays={new Set()}
        onToggleDay={jest.fn()}
        onApply={jest.fn()}
      />,
    );

    expect(screen.getByText(/朝食/).textContent).toBe("🏠 朝食 (07:00, 30分)");
    expect(screen.getByText(/運動/).textContent).toBe("💪 運動 (07:30, 20分)");
  });

  it("型から外れたカテゴリでも「その他」の絵文字で表示する", () => {
    // 旧データやインポートしたデータには型に無いカテゴリが入りうる。
    // 選択リスト（RoutineSelectionList）やホーム画面と同じく📌にそろえ、
    // 同じプリセット画面の中で絵文字の有無が食い違わないようにする
    const presetWithUnknown: RoutinePreset = {
      ...preset,
      routineTemplates: [
        {
          title: "謎の予定",
          startTime: "22:00",
          duration: 30,
          category: "legacy-unknown" as never,
        },
      ],
    };

    render(
      <PresetApplySection
        preset={presetWithUnknown}
        selectedDays={new Set()}
        onToggleDay={jest.fn()}
        onApply={jest.fn()}
      />,
    );

    expect(screen.getByText(/謎の予定/).textContent).toBe(
      "📌 謎の予定 (22:00, 30分)",
    );
  });

  it("曜日ボタンクリックで onToggleDay が該当曜日で呼ばれ、伝播が止まる", () => {
    const onToggleDay = jest.fn();
    const onParentClick = jest.fn();
    render(
      <div onClick={onParentClick}>
        <PresetApplySection
          preset={preset}
          selectedDays={new Set()}
          onToggleDay={onToggleDay}
          onApply={jest.fn()}
        />
      </div>,
    );
    fireEvent.click(screen.getByText("月"));
    expect(onToggleDay).toHaveBeenCalledWith(1);
    expect(onParentClick).not.toHaveBeenCalled();
  });

  it("曜日が選択されていないとき適用ボタンは disabled", () => {
    render(
      <PresetApplySection
        preset={preset}
        selectedDays={new Set()}
        onToggleDay={jest.fn()}
        onApply={jest.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: /選択した曜日に適用/ }),
    ).toBeDisabled();
  });

  it("曜日が選択されているとき適用ボタンクリックで onApply が呼ばれ、伝播が止まる", () => {
    const onApply = jest.fn();
    const onParentClick = jest.fn();
    render(
      <div onClick={onParentClick}>
        <PresetApplySection
          preset={preset}
          selectedDays={new Set([1])}
          onToggleDay={jest.fn()}
          onApply={onApply}
        />
      </div>,
    );
    const applyButton = screen.getByRole("button", {
      name: /選択した曜日に適用/,
    });
    expect(applyButton).not.toBeDisabled();
    fireEvent.click(applyButton);
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onParentClick).not.toHaveBeenCalled();
  });
});
