import { fireEvent, render, screen } from "@testing-library/react";
import { StorageWriteFailureBanner } from "../StorageWriteFailureBanner";

const defaultProps = {
  reason: "quota-exceeded" as const,
  onDismiss: jest.fn(),
};

describe("StorageWriteFailureBanner", () => {
  beforeEach(() => {
    defaultProps.onDismiss.mockClear();
  });

  it("容量超過のときは対処方法まで含めて伝える", () => {
    render(<StorageWriteFailureBanner {...defaultProps} />);

    expect(
      screen.getByText(/保存できる容量の上限に達したため/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/設定画面から不要なデータを削除してください/),
    ).toBeInTheDocument();
  });

  it("原因が不明なときは別の文言を出す", () => {
    render(<StorageWriteFailureBanner {...defaultProps} reason="unknown" />);

    expect(screen.getByText(/データの保存に失敗しました/)).toBeInTheDocument();
  });

  it("スクリーンリーダーに読み上げさせるため role=alert を持つ", () => {
    // データが消えている状況なので、視覚以外の経路でも伝わる必要がある
    render(<StorageWriteFailureBanner {...defaultProps} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("閉じるボタンで onDismiss が呼ばれる", () => {
    render(<StorageWriteFailureBanner {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "閉じる" }));

    expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
  });
});
