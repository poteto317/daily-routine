import { createGithubIssue } from "../createGithubIssue";

describe("createGithubIssue", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("GitHub API へ POST し issueNumber/issueUrl を返す", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        number: 42,
        html_url: "https://github.com/poteto317/daily-routine/issues/42",
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await createGithubIssue({
      token: "secret-token",
      repo: "poteto317/daily-routine",
      content: { title: "件名", body: "本文", labels: ["bug"] },
    });

    expect(result).toEqual({
      issueNumber: 42,
      issueUrl: "https://github.com/poteto317/daily-routine/issues/42",
    });

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(
      "https://api.github.com/repos/poteto317/daily-routine/issues",
    );
    expect(options.method).toBe("POST");
    expect(options.headers.Authorization).toBe("Bearer secret-token");
    expect(options.headers.Accept).toBe("application/vnd.github+json");
    expect(options.headers["X-GitHub-Api-Version"]).toBe("2022-11-28");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.headers["User-Agent"]).toBe("daily-routine-bug-report");
    expect(JSON.parse(options.body)).toEqual({
      title: "件名",
      body: "本文",
      labels: ["bug"],
    });
  });

  it("レスポンスが ok でない場合は例外を投げる", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: async () => "Forbidden",
    }) as unknown as typeof fetch;

    await expect(
      createGithubIssue({
        token: "t",
        repo: "o/r",
        content: { title: "t", body: "b", labels: [] },
      }),
    ).rejects.toThrow(/status=403/);
  });

  it("fetch 自体が例外を投げる場合はそのまま伝播する", async () => {
    global.fetch = jest.fn().mockRejectedValue(
      new Error("network error"),
    ) as unknown as typeof fetch;

    await expect(
      createGithubIssue({
        token: "t",
        repo: "o/r",
        content: { title: "t", body: "b", labels: [] },
      }),
    ).rejects.toThrow("network error");
  });

  it("response.json() が malformed JSON で失敗した場合、例外が伝播する", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockRejectedValue(new SyntaxError("Unexpected token")),
    }) as unknown as typeof fetch;

    await expect(
      createGithubIssue({
        token: "t",
        repo: "o/r",
        content: { title: "t", body: "b", labels: [] },
      }),
    ).rejects.toThrow("Unexpected token");
  });

  it("エラーレスポンスの text() が失敗した場合、errorText は空文字になる", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: jest.fn().mockRejectedValue(new Error("cannot read body")),
    }) as unknown as typeof fetch;

    let caughtError: Error | null = null;
    try {
      await createGithubIssue({
        token: "t",
        repo: "o/r",
        content: { title: "t", body: "b", labels: [] },
      });
    } catch (e) {
      caughtError = e as Error;
    }

    expect(caughtError).not.toBeNull();
    expect(caughtError!.message).toContain("status=500");
    // text() が reject したため errorText は "" になり、メッセージは ": " で終わる
    expect(caughtError!.message).toMatch(/status=500\): $/);
  });
});
