import { createRoutineCrudFormStateResult } from "../routineCrudFormStateResult";

describe("routineCrudFormStateResult", () => {
  it("CRUD form state の公開 shape を組み立てる", () => {
    const closeForm = jest.fn();
    const openForm = jest.fn();
    const restoreScroll = jest.fn();

    expect(
      createRoutineCrudFormStateResult({
        restoreScroll,
        viewState: {
          showForm: false,
          editingRoutine: undefined,
          setEditingRoutine: jest.fn(),
          setShowForm: jest.fn(),
        },
        actions: {
          closeForm,
          openForm,
        },
      }),
    ).toEqual({
      showForm: false,
      editingRoutine: undefined,
      closeForm,
      openForm,
      restoreScroll,
    });
  });
});
