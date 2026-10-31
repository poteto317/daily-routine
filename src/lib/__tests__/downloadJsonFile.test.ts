import { downloadJsonFile } from "../downloadJsonFile";

/** anchor の click と object URL の生成・解放を差し替える */
const setupDownloadSpies = () => {
  const click = jest.fn();
  const createObjectURL = jest.fn<string, [Blob]>(() => "blob:dummy");
  const revokeObjectURL = jest.fn();
  Object.defineProperty(URL, "createObjectURL", {
    value: createObjectURL,
    configurable: true,
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    value: revokeObjectURL,
    configurable: true,
  });
  jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
    this: HTMLAnchorElement,
  ) {
    click(this.download, this.href, this.isConnected);
  });
  return { click, createObjectURL, revokeObjectURL };
};

/** jsdom の Blob には text() が無いので FileReader で読む */
const readBlobText = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });

describe("downloadJsonFile", () => {
  const urlKeys = ["createObjectURL", "revokeObjectURL"] as const;
  const originalDescriptors = urlKeys.map((key) => ({
    key,
    descriptor: Object.getOwnPropertyDescriptor(URL, key),
  }));

  afterEach(() => {
    jest.restoreAllMocks();
    originalDescriptors.forEach(({ key, descriptor }) => {
      if (descriptor) {
        Object.defineProperty(URL, key, descriptor);
      } else {
        delete (URL as unknown as Record<string, unknown>)[key];
      }
    });
  });

  it("データを 2 スペースのインデントの JSON の Blob にする", async () => {
    const { createObjectURL } = setupDownloadSpies();

    downloadJsonFile("a.json", { x: 1 });

    const blob = createObjectURL.mock.calls[0][0];
    expect(blob.type).toBe("application/json");
    await expect(readBlobText(blob)).resolves.toBe(
      JSON.stringify({ x: 1 }, null, 2),
    );
  });

  it("指定したファイル名で、DOM に置いた anchor をクリックする", () => {
    const { click } = setupDownloadSpies();

    downloadJsonFile("a.json", { x: 1 });

    expect(click).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledWith("a.json", "blob:dummy", true);
  });

  it("生成した object URL を解放する", () => {
    // 解放しないとページを開いている間ずっとメモリを掴んだままになる
    const { createObjectURL, revokeObjectURL } = setupDownloadSpies();

    downloadJsonFile("a.json", { x: 1 });

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:dummy");
  });

  it("anchor を DOM に残さない", () => {
    // 残ると書き出すたびに不可視の要素が積み上がる
    setupDownloadSpies();

    downloadJsonFile("a.json", { x: 1 });

    expect(document.querySelectorAll("a")).toHaveLength(0);
  });
});
