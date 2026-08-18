import { render, screen } from "@testing-library/react";
import { FeatureVisibilitySection } from "../components/FeatureVisibilitySection";
import { TrainDelaySection } from "../components/TrainDelaySection";
import type { VisibleFeaturesState } from "../state/featureVisibility";

const visibleFeatures = {
  journal: true,
  calendar: false,
} as VisibleFeaturesState;

describe("設定画面のトグルのアクセシビリティ", () => {
  it("機能表示トグルが名前と状態を持つ", () => {
    // 名前が無いとスクリーンリーダーには「ボタン」としか読まれず、
    // 何のトグルか分からない
    render(
      <FeatureVisibilitySection
        visibleFeatures={visibleFeatures}
        setVisibleFeatures={jest.fn()}
      />,
    );

    expect(screen.getByRole("switch", { name: /ジャーナル/ })).toBeChecked();
  });

  it("オフの機能表示トグルは状態が false になる", () => {
    // 名前だけあってもオンオフが読めないと操作できない
    render(
      <FeatureVisibilitySection
        visibleFeatures={visibleFeatures}
        setVisibleFeatures={jest.fn()}
      />,
    );

    expect(
      screen.getByRole("switch", { name: /達成カレンダー/ }),
    ).not.toBeChecked();
  });

  it("電車遅延トグルが名前と状態を持つ", () => {
    render(
      <TrainDelaySection
        trainDelayEnabled
        setTrainDelayEnabled={jest.fn()}
        selectedLineInput=""
        setSelectedLineInput={jest.fn()}
        availableLines={[]}
        monitoredLines={[]}
        handleAddLine={jest.fn()}
        handleRemoveLine={jest.fn()}
      />,
    );

    expect(screen.getAllByRole("switch")[0]).toBeChecked();
  });
});
