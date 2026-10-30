import { StrictMode } from "react";
import { act, renderHook } from "@testing-library/react";
import { useBugReportImages } from "../hooks/useBugReportImages";
import { MAX_BUG_REPORT_IMAGE_BYTES } from "../constants";

const createFile = (name: string, type: string, size = 10): File => {
  const file = new File([new Uint8Array(Math.min(size, 16))], name, { type });
  if (size > 16) {
    Object.defineProperty(file, "size", { value: size });
  }
  return file;
};

describe("useBugReportImages", () => {
  let createObjectURLMock: jest.Mock;
  let revokeObjectURLMock: jest.Mock;
  let urlCounter = 0;

  beforeEach(() => {
    urlCounter = 0;
    createObjectURLMock = jest.fn(() => `blob:preview-${++urlCounter}`);
    revokeObjectURLMock = jest.fn();
    URL.createObjectURL = createObjectURLMock;
    URL.revokeObjectURL = revokeObjectURLMock;
  });

  it("初期状態は images / previews / errors がすべて空配列", () => {
    const { result } = renderHook(() => useBugReportImages());
    expect(result.current.images).toEqual([]);
    expect(result.current.previews).toEqual([]);
    expect(result.current.errors).toEqual([]);
  });

  it("addImages で有効な画像が加わり、同じ順序で previews が生成される", () => {
    const { result } = renderHook(() => useBugReportImages());
    const f1 = createFile("1.png", "image/png");
    const f2 = createFile("2.jpg", "image/jpeg");

    act(() => {
      result.current.addImages([f1, f2]);
    });

    expect(result.current.images).toEqual([f1, f2]);
    expect(result.current.previews).toEqual([
      "blob:preview-1",
      "blob:preview-2",
    ]);
    expect(result.current.errors).toEqual([]);
  });

  it("不正な形式・サイズ超過・枚数超過は errors に入り、次の addImages で新しい結果に置き換わる", () => {
    const { result } = renderHook(() => useBugReportImages());
    const badType = createFile("bad.svg", "image/svg+xml");
    const tooBig = createFile(
      "big.png",
      "image/png",
      MAX_BUG_REPORT_IMAGE_BYTES + 1,
    );

    act(() => {
      result.current.addImages([badType, tooBig]);
    });

    expect(result.current.images).toEqual([]);
    expect(result.current.errors).toEqual(["unsupportedType", "tooLarge"]);

    const ok = createFile("ok.png", "image/png");
    act(() => {
      result.current.addImages([ok]);
    });

    expect(result.current.images).toEqual([ok]);
    expect(result.current.errors).toEqual([]);
  });

  it("removeImage(index) で指定した画像のみ外れ、古い URL が解放される", () => {
    const { result } = renderHook(() => useBugReportImages());
    const f1 = createFile("1.png", "image/png");
    const f2 = createFile("2.png", "image/png");
    const f3 = createFile("3.png", "image/png");

    act(() => {
      result.current.addImages([f1, f2, f3]);
    });
    expect(result.current.previews).toHaveLength(3);

    act(() => {
      result.current.removeImage(1);
    });

    expect(result.current.images).toEqual([f1, f3]);
    expect(result.current.previews).toHaveLength(2);
    expect(
      createObjectURLMock.mock.calls.length -
        revokeObjectURLMock.mock.calls.length,
    ).toBe(2);
  });

  it("範囲外の index を removeImage に渡しても状態は変わらず URL の再生成も起きない", () => {
    const { result } = renderHook(() => useBugReportImages());
    const f1 = createFile("1.png", "image/png");

    act(() => {
      result.current.addImages([f1]);
    });
    const createdBefore = createObjectURLMock.mock.calls.length;

    act(() => {
      result.current.removeImage(-1);
      result.current.removeImage(1);
    });

    expect(result.current.images).toEqual([f1]);
    expect(createObjectURLMock.mock.calls.length).toBe(createdBefore);
  });

  it("3 枚の状態で追加選択して tooMany エラーが出た後、removeImage を呼ぶと tooMany エラーが解除される", () => {
    const { result } = renderHook(() => useBugReportImages());
    const [f1, f2, f3, f4] = [
      createFile("1.png", "image/png"),
      createFile("2.png", "image/png"),
      createFile("3.png", "image/png"),
      createFile("4.png", "image/png"),
    ];

    act(() => {
      result.current.addImages([f1, f2, f3]);
    });
    expect(result.current.errors).toEqual([]);

    act(() => {
      result.current.addImages([f4]);
    });
    expect(result.current.errors).toEqual(["tooMany"]);
    expect(result.current.images).toHaveLength(3);

    act(() => {
      result.current.removeImage(0);
    });
    expect(result.current.images).toHaveLength(2);
    expect(result.current.errors).toEqual([]);
  });

  it("clearImages() で images / previews / errors が空になり、すべての URL が解放される", () => {
    const { result } = renderHook(() => useBugReportImages());
    const f1 = createFile("1.png", "image/png");
    const bad = createFile("bad.svg", "image/svg+xml");

    act(() => {
      result.current.addImages([f1, bad]);
    });
    expect(result.current.images).toHaveLength(1);
    expect(result.current.errors).toEqual(["unsupportedType"]);

    act(() => {
      result.current.clearImages();
    });

    expect(result.current.images).toEqual([]);
    expect(result.current.previews).toEqual([]);
    expect(result.current.errors).toEqual([]);
    expect(revokeObjectURLMock).toHaveBeenCalledWith("blob:preview-1");
    expect(
      createObjectURLMock.mock.calls.length -
        revokeObjectURLMock.mock.calls.length,
    ).toBe(0);
  });

  it("addImages を複数回呼んでも古い URL が解放され URL リークしない", () => {
    const { result } = renderHook(() => useBugReportImages());
    const f1 = createFile("1.png", "image/png");
    const f2 = createFile("2.png", "image/png");

    act(() => {
      result.current.addImages([f1]);
    });
    act(() => {
      result.current.addImages([f2]);
    });

    expect(result.current.images).toEqual([f1, f2]);
    expect(result.current.previews).toHaveLength(2);
    expect(
      createObjectURLMock.mock.calls.length -
        revokeObjectURLMock.mock.calls.length,
    ).toBe(2);
  });

  it("アンマウント時に残っているすべての URL が解放される", () => {
    const { result, unmount } = renderHook(() => useBugReportImages());
    const f1 = createFile("1.png", "image/png");
    const f2 = createFile("2.png", "image/png");

    act(() => {
      result.current.addImages([f1, f2]);
    });
    expect(revokeObjectURLMock).not.toHaveBeenCalled();

    unmount();

    expect(revokeObjectURLMock).toHaveBeenCalledWith("blob:preview-1");
    expect(revokeObjectURLMock).toHaveBeenCalledWith("blob:preview-2");
    expect(
      createObjectURLMock.mock.calls.length -
        revokeObjectURLMock.mock.calls.length,
    ).toBe(0);
  });

  it("React.StrictMode 下でも二重実行による URL リークや早期 revoke が起きない", () => {
    const { result, unmount } = renderHook(() => useBugReportImages(), {
      wrapper: StrictMode,
    });
    const f1 = createFile("1.png", "image/png");

    act(() => {
      result.current.addImages([f1]);
    });

    expect(result.current.images).toEqual([f1]);
    expect(result.current.previews).toEqual(["blob:preview-1"]);
    expect(revokeObjectURLMock).not.toHaveBeenCalled();

    unmount();

    expect(revokeObjectURLMock).toHaveBeenCalledWith("blob:preview-1");
    expect(
      createObjectURLMock.mock.calls.length -
        revokeObjectURLMock.mock.calls.length,
    ).toBe(0);
  });
});
