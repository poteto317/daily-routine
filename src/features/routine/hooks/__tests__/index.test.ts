import * as hooks from "../index";

describe("routine hooks index exports", () => {
  it("all routine hooks are exported", () => {
    expect(hooks.usePageNavigation).toBeDefined();
    expect(hooks.useHomeViewState).toBeDefined();
    expect(hooks.useRoutineCrud).toBeDefined();
    expect(hooks.useRoutineDisplay).toBeDefined();
    expect(hooks.useTrainDelays).toBeDefined();
    expect(hooks.useFirebaseSync).toBeDefined();
    expect(hooks.useHomePopState).toBeDefined();
    expect(hooks.useHomePageData).toBeDefined();
    expect(hooks.useHomePageViewModel).toBeDefined();
    expect(hooks.useHomePageDependencies).toBeDefined();
    expect(hooks.useHomePageEffects).toBeDefined();
    expect(hooks.useRoutineMutations).toBeDefined();
    expect(hooks.useRoutineQueries).toBeDefined();
  });
});
