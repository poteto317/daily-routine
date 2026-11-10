import { fireEvent, render, screen } from "@testing-library/react";
import { FeatureVisibilitySection } from "../FeatureVisibilitySection";
import { VISIBLE_FEATURE_ITEMS } from "../../state/constants";
import type { VisibleFeaturesState } from "../../state/featureVisibility";

/** 項目の一覧から作るので、機能を足しても手で直さなくてよい */
const allOn = Object.fromEntries(
  VISIBLE_FEATURE_ITEMS.map((item) => [item.key, true]),
) as VisibleFeaturesState;

describe("FeatureVisibilitySection", () => {
  it("「業務日誌」のトグルを操作すると weeklyLog だけが変わる（キーの取り違えの検出）", () => {
    const setVisibleFeatures = jest.fn();
    render(
      <FeatureVisibilitySection
        visibleFeatures={allOn}
        setVisibleFeatures={setVisibleFeatures}
      />,
    );

    fireEvent.click(screen.getByRole("switch", { name: /業務日誌/ }));

    expect(setVisibleFeatures).toHaveBeenCalledTimes(1);
    expect(setVisibleFeatures).toHaveBeenCalledWith({
      ...allOn,
      weeklyLog: false,
    });
  });
});
