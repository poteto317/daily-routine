type RegisterCall = { script: string; scope: string | undefined };

/** jest.setup が writable で定義しているため、値の差し替えで置き換える */
const setServiceWorker = (value: unknown) => {
  (navigator as unknown as { serviceWorker: unknown }).serviceWorker = value;
};

const setupServiceWorker = () => {
  const calls: RegisterCall[] = [];

  const register = jest.fn(
    async (script: string, options?: { scope?: string }) => {
      calls.push({ script, scope: options?.scope });
      return { scope: options?.scope ?? "/" };
    },
  );

  setServiceWorker({
    register,
    getRegistration: jest.fn(async () => undefined),
    ready: Promise.resolve({ scope: "/" }),
  });

  return { calls, register };
};

/** 登録済みかどうかをモジュール内に持つため、テストごとに読み込み直す */
const importFresh = async () => await import("../serviceWorkerRegistration");

const withNodeEnv = async (value: string, run: () => Promise<void>) => {
  const original = process.env.NODE_ENV;
  Object.defineProperty(process.env, "NODE_ENV", { value, configurable: true });
  try {
    await run();
  } finally {
    Object.defineProperty(process.env, "NODE_ENV", {
      value: original,
      configurable: true,
    });
  }
};

describe("registerServiceWorkers", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("アプリ本体のSWとFCMのSWを別々のスコープで登録する", async () => {
    await jest.isolateModulesAsync(async () => {
      const { calls } = setupServiceWorker();
      const {
        APP_SHELL_SW_PATH,
        FCM_SW_PATH,
        FCM_SW_SCOPE,
        registerServiceWorkers,
      } = await importFresh();

      await registerServiceWorkers({ enableAppShell: true });

      // 同じスコープに2つ登録すると後勝ちで片方が消えるため、スコープを分ける
      expect(calls).toEqual([
        { script: APP_SHELL_SW_PATH, scope: "/" },
        { script: FCM_SW_PATH, scope: FCM_SW_SCOPE },
      ]);
    });
  });

  it("アプリ本体のSWを無効にするとFCMのSWだけを登録する", async () => {
    await jest.isolateModulesAsync(async () => {
      const { calls } = setupServiceWorker();
      const { FCM_SW_PATH, FCM_SW_SCOPE, registerServiceWorkers } =
        await importFresh();

      await registerServiceWorkers({ enableAppShell: false });

      expect(calls).toEqual([{ script: FCM_SW_PATH, scope: FCM_SW_SCOPE }]);
    });
  });

  it("呼び出しごとに渡した options を必ず使う", async () => {
    // 前の呼び出しの結果を使い回すと、2回目に渡した指定が黙って無視される
    await jest.isolateModulesAsync(async () => {
      const { calls } = setupServiceWorker();
      const { APP_SHELL_SW_PATH, FCM_SW_PATH, registerServiceWorkers } =
        await importFresh();

      await registerServiceWorkers({ enableAppShell: false });
      await registerServiceWorkers({ enableAppShell: true });

      expect(calls.map((c) => c.script)).toEqual([
        FCM_SW_PATH,
        APP_SHELL_SW_PATH,
        FCM_SW_PATH,
      ]);
    });
  });
});

describe("registerAppServiceWorkers", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("本番ではアプリ本体のSWも登録する", async () => {
    await jest.isolateModulesAsync(async () => {
      const { calls } = setupServiceWorker();
      const { APP_SHELL_SW_PATH, FCM_SW_PATH, registerAppServiceWorkers } =
        await importFresh();

      await withNodeEnv("production", async () => {
        await registerAppServiceWorkers();
      });

      expect(calls.map((c) => c.script)).toEqual([
        APP_SHELL_SW_PATH,
        FCM_SW_PATH,
      ]);
    });
  });

  it("複数回呼んでも登録は1回だけ行う", async () => {
    await jest.isolateModulesAsync(async () => {
      const { register } = setupServiceWorker();
      const { registerAppServiceWorkers } = await importFresh();

      await withNodeEnv("production", async () => {
        await registerAppServiceWorkers();
        await registerAppServiceWorkers();
      });

      // アプリ本体と FCM の 2 件。2 回目の呼び出しでは登録し直さない
      expect(register).toHaveBeenCalledTimes(2);
    });
  });

  it("登録に失敗したら次回に再試行できる", async () => {
    await jest.isolateModulesAsync(async () => {
      const register = jest
        .fn()
        .mockRejectedValueOnce(new Error("失敗"))
        .mockResolvedValue({ scope: "/" });

      setServiceWorker({
        register,
        getRegistration: jest.fn(async () => undefined),
      });
      const { registerAppServiceWorkers } = await importFresh();

      await withNodeEnv("development", async () => {
        await expect(registerAppServiceWorkers()).rejects.toThrow("失敗");
        await expect(registerAppServiceWorkers()).resolves.toBeUndefined();
      });
    });
  });

  it("本番でなければFCMのSWだけを登録する", async () => {
    // 開発サーバーでは /sw.js を生成しないため、前回のビルドで残った
    // 古い sw.js を登録すると存在しないチャンクを先読みしてしまう
    await jest.isolateModulesAsync(async () => {
      const { calls } = setupServiceWorker();
      const { FCM_SW_PATH, registerAppServiceWorkers } = await importFresh();

      await withNodeEnv("development", async () => {
        await registerAppServiceWorkers();
      });

      expect(calls.map((c) => c.script)).toEqual([FCM_SW_PATH]);
    });
  });
});

describe("getFcmServiceWorkerRegistration", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("FCM用スコープの登録を返す", async () => {
    await jest.isolateModulesAsync(async () => {
      const { FCM_SW_SCOPE, getFcmServiceWorkerRegistration } =
        await importFresh();
      const fcmRegistration = { scope: FCM_SW_SCOPE };
      const getRegistration = jest.fn(async (scope?: string) =>
        scope === FCM_SW_SCOPE ? fcmRegistration : undefined,
      );

      setServiceWorker({
        register: jest.fn(async () => fcmRegistration),
        getRegistration,
      });

      // アプリ本体のSWが画面を制御しているため、ready ではFCMの登録を取れない
      await expect(getFcmServiceWorkerRegistration()).resolves.toBe(
        fcmRegistration,
      );
      expect(getRegistration).toHaveBeenCalledWith(FCM_SW_SCOPE);
    });
  });
});
