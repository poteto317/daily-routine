import { fireEvent, render, screen } from "@testing-library/react";
import { BudgetExpenseDateSelect } from "../components/BudgetExpenseDateSelect";

describe("BudgetExpenseDateSelect", () => {
  it("月（前月/当月/翌月）と日の2つのselectを表示し、クリア用の空選択肢を持たない", () => {
    render(<BudgetExpenseDateSelect value="2026-03-15" onChange={jest.fn()} />);

    const monthSelect = screen.getByLabelText("日付（月）");
    const daySelect = screen.getByLabelText("日付（日）");

    expect(monthSelect).toHaveValue("2026-03");
    expect(daySelect).toHaveValue("2026-03-15");

    expect(
      Array.from(monthSelect.querySelectorAll("option")).map(
        (option) => option.value,
      ),
    ).toEqual(["2026-02", "2026-03", "2026-04"]);
    expect(
      Array.from(daySelect.querySelectorAll("option")).map(
        (option) => option.value,
      ),
    ).toHaveLength(31);
    expect(monthSelect.querySelector('option[value=""]')).toBeNull();
    expect(daySelect.querySelector('option[value=""]')).toBeNull();
  });

  it("日を変更すると同じ月のまま新しい日付でonChangeが呼ばれる", () => {
    const onChange = jest.fn();
    render(<BudgetExpenseDateSelect value="2026-03-15" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("日付（日）"), {
      target: { value: "2026-03-20" },
    });

    expect(onChange).toHaveBeenCalledWith("2026-03-20");
  });

  it("月を変更すると同じ日のまま新しい月でonChangeが呼ばれる", () => {
    const onChange = jest.fn();
    render(<BudgetExpenseDateSelect value="2026-03-15" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("日付（月）"), {
      target: { value: "2026-04" },
    });

    expect(onChange).toHaveBeenCalledWith("2026-04-15");
  });

  it("月をまたいで日数が減る場合、選択中の日を新しい月の末日にクランプする", () => {
    const onChange = jest.fn();
    render(<BudgetExpenseDateSelect value="2026-03-31" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("日付（月）"), {
      target: { value: "2026-04" },
    });

    expect(onChange).toHaveBeenCalledWith("2026-04-30");
  });

  it("年をまたぐ前後の月も選択肢に含まれる", () => {
    render(<BudgetExpenseDateSelect value="2026-01-10" onChange={jest.fn()} />);

    const monthSelect = screen.getByLabelText("日付（月）");
    expect(
      Array.from(monthSelect.querySelectorAll("option")).map(
        (option) => option.value,
      ),
    ).toEqual(["2025-12", "2026-01", "2026-02"]);
  });

  it("31日を含む月のvalueでも、月選択肢が重複・欠落しない（shiftMonthToFirstDayのオーバーフロー回帰）", () => {
    // 表示中の月（currentDate）ではなく value 自身の月を基準にしているため、
    // かつては「表示中の月」が31日だと前月/翌月の計算がずれる不具合があったが、
    // 月キー起点のロジックのため常に正しい前後月になる。
    render(<BudgetExpenseDateSelect value="2026-03-31" onChange={jest.fn()} />);

    const monthSelect = screen.getByLabelText("日付（月）");
    expect(
      Array.from(monthSelect.querySelectorAll("option")).map(
        (option) => option.value,
      ),
    ).toEqual(["2026-02", "2026-03", "2026-04"]);
  });

  it("表示中のページの月に関わらず、渡された value 自身の月を基準に選択肢を組み立てる", () => {
    // ページ側のcurrentDateをこのコンポーネントは受け取らないため、
    // 編集中にページの月ナビゲーションを操作しても選択肢と値がズレない。
    render(<BudgetExpenseDateSelect value="2026-11-05" onChange={jest.fn()} />);

    const monthSelect = screen.getByLabelText("日付（月）");
    expect(monthSelect).toHaveValue("2026-11");
    expect(
      Array.from(monthSelect.querySelectorAll("option")).map(
        (option) => option.value,
      ),
    ).toEqual(["2026-10", "2026-11", "2026-12"]);
  });
});
