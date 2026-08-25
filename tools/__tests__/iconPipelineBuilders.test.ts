import { buildIconPipeline } from "../iconPipelineBuilders";

type PipelineCall = { method: string; args: unknown[] };

type MockSharpPipeline = {
  resize: (...args: unknown[]) => MockSharpPipeline;
  extend: (...args: unknown[]) => MockSharpPipeline;
  flatten: (...args: unknown[]) => MockSharpPipeline;
  __calls: PipelineCall[];
};

const createMockSharp = () => {
  const calls: PipelineCall[] = [];
  const pipeline = {} as MockSharpPipeline;

  (["resize", "extend", "flatten"] as const).forEach((method) => {
    pipeline[method] = (...args: unknown[]) => {
      calls.push({ method, args });
      return pipeline;
    };
  });
  pipeline.__calls = calls;

  return { sharp: () => pipeline, pipeline };
};

describe("buildIconPipeline", () => {
  it("maskableターゲットはセーフゾーンパディング付きでresize→extend→flattenする", () => {
    const { sharp, pipeline } = createMockSharp();
    const target = { file: "icon-maskable-192.png", size: 192, maskable: true };

    buildIconPipeline(sharp, Buffer.from(""), target);

    expect(pipeline.__calls[0]).toEqual({ method: "resize", args: [154, 154] });
    expect(pipeline.__calls[1]).toEqual({
      method: "extend",
      args: [
        { top: 19, bottom: 19, left: 19, right: 19, background: "#2563eb" },
      ],
    });
    expect(pipeline.__calls[2]).toEqual({
      method: "flatten",
      args: [{ background: "#2563eb" }],
    });
  });

  it("flatten指定のない通常ターゲットはresizeのみでflattenしない", () => {
    const { sharp, pipeline } = createMockSharp();
    const target = { file: "icon-192.png", size: 192 };

    buildIconPipeline(sharp, Buffer.from(""), target);

    expect(pipeline.__calls).toEqual([{ method: "resize", args: [192, 192] }]);
  });

  it("flatten指定のある通常ターゲット（apple-touch-icon）はresize後にflattenする", () => {
    const { sharp, pipeline } = createMockSharp();
    const target = { file: "apple-touch-icon.png", size: 180, flatten: true };

    buildIconPipeline(sharp, Buffer.from(""), target);

    expect(pipeline.__calls).toEqual([
      { method: "resize", args: [180, 180] },
      { method: "flatten", args: [{ background: "#2563eb" }] },
    ]);
  });
});
