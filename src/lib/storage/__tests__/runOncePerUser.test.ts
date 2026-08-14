import { runOncePerUser } from "../core-modules/runOncePerUser";

describe("runOncePerUser", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    localStorage.clear();
  });

  it("1 度目は実行する", () => {
    const task = jest.fn(() => true);

    runOncePerUser("uid-1", "_probe", task);

    expect(task).toHaveBeenCalledTimes(1);
  });

  it("2 度目以降は実行しない", () => {
    runOncePerUser("uid-1", "_probe", () => true);
    const task = jest.fn(() => true);

    runOncePerUser("uid-1", "_probe", task);

    expect(task).not.toHaveBeenCalled();
  });

  it("ユーザーごとに 1 度ずつ実行する", () => {
    runOncePerUser("uid-1", "_probe", () => true);
    const task = jest.fn(() => true);

    runOncePerUser("uid-2", "_probe", task);

    expect(task).toHaveBeenCalledTimes(1);
  });

  it("用途ごとに 1 度ずつ実行する", () => {
    // マーカーが混ざると、片方を走らせただけでもう片方が飛ばされる
    runOncePerUser("uid-1", "_probe-a", () => true);
    const task = jest.fn(() => true);

    runOncePerUser("uid-1", "_probe-b", task);

    expect(task).toHaveBeenCalledTimes(1);
  });

  it("完了として記録してよくない場合は次回もう一度実行する", () => {
    runOncePerUser("uid-1", "_probe", () => false);
    const task = jest.fn(() => true);

    runOncePerUser("uid-1", "_probe", task);

    expect(task).toHaveBeenCalledTimes(1);
  });

  it("マーカーを書けなくても実行自体は済ませる", () => {
    // 保存領域が一杯でも処理は進める。次回もう一度走ることになるが、
    // 済ませた分は条件に合わなくなるため二重には動かない
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    const task = jest.fn(() => true);

    expect(() => runOncePerUser("uid-1", "_probe", task)).not.toThrow();
    expect(task).toHaveBeenCalledTimes(1);
  });
});
