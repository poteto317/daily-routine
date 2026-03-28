import { createRoutineCrudResult } from "../routineCrudResult";
import { routine } from "./useRoutineCrud.test.setup";

describe("routineCrudResult", () => {
  it("form state と CRUD handlers の公開 shape を組み立てる", () => {
    const closeForm = jest.fn();
    const handlers = {
      addRoutineAction: jest.fn(),
      editRoutineAction: jest.fn(),
      submitRoutineAction: jest.fn(),
      cancelRoutineAction: jest.fn(),
      deleteRoutineAction: jest.fn(),
    };

    expect(
      createRoutineCrudResult({
        showForm: true,
        editingRoutine: routine,
        closeForm,
        handlers,
      }),
    ).toEqual({
      showForm: true,
      editingRoutine: routine,
      closeForm,
      ...handlers,
    });
  });
});
