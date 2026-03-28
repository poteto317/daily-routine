import { createRoutineCrudActionBindings } from "../routineCrudActionBindings";
import { buildOps, routine } from "./useRoutineCrud.test.setup";

describe("routineCrudActionBindings", () => {
  it("action handler 用の依存を束ねる", () => {
    const closeForm = jest.fn();
    const openForm = jest.fn();
    const restoreScroll = jest.fn();
    const ops = buildOps();

    expect(
      createRoutineCrudActionBindings({
        ops,
        editingRoutine: routine,
        closeForm,
        openForm,
        restoreScroll,
      }),
    ).toEqual({
      ops,
      editingRoutine: routine,
      closeForm,
      openForm,
      restoreScroll,
    });
  });
});
