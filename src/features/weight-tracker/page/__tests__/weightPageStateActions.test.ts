import * as actions from "../weightPageStateActions";

describe("weightPageStateActions re-exports", () => {
  it("all mutation and reload actions are exported", () => {
    expect(actions.createCancelWeightFormHandler).toBeDefined();
    expect(actions.createLoadWeightDataAction).toBeDefined();
    expect(actions.createDeleteWeightHandler).toBeDefined();
    expect(actions.createSaveWeightHandler).toBeDefined();
  });
});
