import { EMPTY_TRANSFER_OPTIONS } from "../state/constants";
import { downloadExportData } from "../state/exportFileDownload";

/** anchor の click と object URL の生成・解放を差し替える */
const setupDownloadSpies = () => {
  const click = jest.fn();
  const createObjectURL = jest.fn(() => "blob:dummy");
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
    click(this.download);
  });
  return { click, createObjectURL, revokeObjectURL };
};

describe("downloadExportData", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("選択したグループ名と日付をファイル名に入れる", () => {
    const { click } = setupDownloadSpies();

    downloadExportData(
      { ...EMPTY_TRANSFER_OPTIONS, routines: true, budget: true },
      { version: "3.0" },
    );

    const fileName = click.mock.calls[0][0] as string;
    expect(fileName).toContain("routines");
    expect(fileName).toContain("budget");
    expect(fileName).not.toContain("presets");
    expect(fileName).toMatch(/\d{4}-\d{2}-\d{2}\.json$/);
  });

  it("生成した object URL を解放する", () => {
    // 解放しないとページを開いている間ずっとメモリを掴んだままになる
    const { createObjectURL, revokeObjectURL } = setupDownloadSpies();

    downloadExportData(EMPTY_TRANSFER_OPTIONS, { version: "3.0" });

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:dummy");
  });

  it("anchor を DOM に残さない", () => {
    // 残ると書き出すたびに不可視の要素が積み上がる
    setupDownloadSpies();

    downloadExportData(EMPTY_TRANSFER_OPTIONS, { version: "3.0" });

    expect(document.querySelectorAll("a")).toHaveLength(0);
  });
});
