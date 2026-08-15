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

  it("task が例外を投げても呼び出し元へ伝播させない", () => {
    // ログイン直後の準備処理から呼ばれる。ここで例外が抜けると
    // ログインそのものが失敗する。
    expect(() =>
      runOncePerUser("uid-1", "_probe", () => {
        throw new Error("boom");
      }),
    ).not.toThrow();
  });

  it("task が例外を投げた場合は次回もう一度実行する", () => {
    runOncePerUser("uid-1", "_probe", () => {
      throw new Error("boom");
    });
    const task = jest.fn(() => true);

    runOncePerUser("uid-1", "_probe", task);

    expect(task).toHaveBeenCalledTimes(1);
  });

  it("マーカーを読めなくても落ちない", () => {
    // Safari のプライベートモードなど、localStorage への参照自体が
    // 例外になる環境がある。
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });

    expect(() => runOncePerUser("uid-1", "_probe", () => true)).not.toThrow();
  });

  it("マーカーを読めない場合は実行する", () => {
    // 実行済みか判断できない。移行は冪等なので、飛ばすより試すほうがよい
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    const task = jest.fn(() => true);

    runOncePerUser("uid-1", "_probe", task);

    expect(task).toHaveBeenCalledTimes(1);
  });
});
