import {
  ROUTINE_FORM_CATEGORY_LABEL,
  ROUTINE_FORM_DAYS_LABEL,
} from "../helpers";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RoutineFormCoreFields } from "../RoutineFormCoreFields";

const defaultProps = {
  routine: undefined,
  category: "health" as const,
  setCategory: jest.fn(),
  daysOfWeek: [1, 3],
  toggleDay: jest.fn(),
  title: "テストルーティン",
  setTitle: jest.fn(),
};

describe("RoutineFormCoreFields", () => {
  describe("曜日選択ボタン（新規作成時）", () => {
    it("曜日グループが見出しの文字列で引ける", () => {
      // 見出しは <label> ではなく aria-labelledby で結ぶため、
      // 属性の有無ではなくアクセシブル名で確かめる
      render(<RoutineFormCoreFields {...defaultProps} />);

      expect(
        screen.getByRole("group", { name: ROUTINE_FORM_DAYS_LABEL }),
      ).toBeInTheDocument();
    });

    it("カテゴリグループも見出しの文字列で引ける", () => {
      render(<RoutineFormCoreFields {...defaultProps} />);

      expect(
        screen.getByRole("group", { name: ROUTINE_FORM_CATEGORY_LABEL }),
      ).toBeInTheDocument();
    });

    it("選択済み曜日のボタンの aria-pressed が true", () => {
      render(<RoutineFormCoreFields {...defaultProps} daysOfWeek={[1, 3]} />);
      // 月（value=1）: 選択済み
      const mondayBtn = screen.getByRole("button", { name: "月" });
      expect(mondayBtn).toHaveAttribute("aria-pressed", "true");
      // 水（value=3）: 選択済み
      const wedBtn = screen.getByRole("button", { name: "水" });
      expect(wedBtn).toHaveAttribute("aria-pressed", "true");
    });

    it("未選択の曜日のボタンの aria-pressed が false", () => {
      render(<RoutineFormCoreFields {...defaultProps} daysOfWeek={[1]} />);
      // 火（value=2）: 未選択
      const tueBtn = screen.getByRole("button", { name: "火" });
      expect(tueBtn).toHaveAttribute("aria-pressed", "false");
    });

    it("全曜日が未選択のとき全ボタンの aria-pressed が false", () => {
      render(<RoutineFormCoreFields {...defaultProps} daysOfWeek={[]} />);
      const buttons = screen.getAllByRole("button", {
        name: /^(日|月|火|水|木|金|土|祝)$/,
      });
      buttons.forEach((btn) => {
        expect(btn).toHaveAttribute("aria-pressed", "false");
      });
    });

    it("全曜日を選択したとき全ボタンの aria-pressed が true", () => {
      render(
        <RoutineFormCoreFields
          {...defaultProps}
          daysOfWeek={[0, 1, 2, 3, 4, 5, 6, 7]}
        />,
      );
      const buttons = screen.getAllByRole("button", {
        name: /^(日|月|火|水|木|金|土|祝)$/,
      });
      buttons.forEach((btn) => {
        expect(btn).toHaveAttribute("aria-pressed", "true");
      });
    });

    it("ボタンクリックで toggleDay が呼ばれる", async () => {
      const user = userEvent.setup();
      const toggleDay = jest.fn();
      render(<RoutineFormCoreFields {...defaultProps} toggleDay={toggleDay} />);
      await user.click(screen.getByRole("button", { name: "火" }));
      expect(toggleDay).toHaveBeenCalledWith(2);
    });
  });

  describe("編集モード（routine が渡された場合）", () => {
    it("曜日選択ボタングループが表示されない", () => {
      const mockRoutine = {
        id: "r1",
        title: "既存",
        daysOfWeek: [1],
        startTime: "09:00",
        duration: 30,
        category: "health" as const,
        isCompleted: false,
        sortOrder: 0,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      };
      render(<RoutineFormCoreFields {...defaultProps} routine={mockRoutine} />);

      expect(
        screen.queryByRole("group", { name: ROUTINE_FORM_DAYS_LABEL }),
      ).not.toBeInTheDocument();
      // カテゴリは編集モードでも選べる
      expect(
        screen.getByRole("group", { name: ROUTINE_FORM_CATEGORY_LABEL }),
      ).toBeInTheDocument();
    });
  });
});
