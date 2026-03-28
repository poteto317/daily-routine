import { routine } from "./useRoutineCrud.test.setup";
import { createRoutineCrudFormViewStateResult } from "../routineCrudFormViewStateResult";

describe("routineCrudFormViewStateResult", () => {
  it("CRUD form view-state hook の公開 shape を組み立てる", () => {
    const setEditingRoutine = jest.fn();
    const setShowForm = jest.fn();

    expect(
      createRoutineCrudFormViewStateResult({
        editingRoutine: routine,
        setEditingRoutine,
        setShowForm,
        showForm: true,
      }),
    ).toEqual({
      editingRoutine: routine,
      setEditingRoutine,
      setShowForm,
      showForm: true,
    });
  });
});
