import { HOLIDAY_DAY_VALUE } from "@/types/routine";
import { createHomeContentViewModel } from "../homeContentViewModel";
import { createData } from "./homeContentViewModel.test.setup";

describe("createHomeContentViewModel", () => {
  it("各UIコンポーネント向けpropsへ必要データをマッピングする", () => {
    const data = createData(1);

    const result = createHomeContentViewModel(data);

    expect(result.toolbarProps.view).toBe(data.view);
    expect(result.toolbarProps.display).toBe(data.display);
    expect(result.toolbarProps.trainDelays).toBe(data.trainDelays);
    expect(result.toolbarProps.onAddRoutineAction).toBe(
      data.crud.addRoutineAction,
    );

    expect(result.routineListProps.sortedRoutines).toBe(
      data.display.sortedRoutines,
    );
    expect(result.routineListProps.allRoutinesCount).toBe(2);
    expect(result.routineListProps.displayRoutinesCount).toBe(1);
    expect(result.routineListProps.onToggleAction).toBe(
      data.routineOps.toggleComplete,
    );
    expect(result.routineListProps.onEditAction).toBe(
      data.crud.editRoutineAction,
    );
    expect(result.routineListProps.onDeleteAction).toBe(
      data.crud.deleteRoutineAction,
    );
    expect(result.routineListProps.onAddRoutineAction).toBe(
      data.crud.addRoutineAction,
    );
    expect(result.routineListProps.onReorderAction).toBe(
      data.routineOps.reorderRoutines,
    );

    expect(result.routineFormProps.routine).toBe(data.crud.editingRoutine);
    expect(result.routineFormProps.onSubmitAction).toBe(
      data.crud.submitRoutineAction,
    );
    expect(result.routineFormProps.onCancelAction).toBe(
      data.crud.cancelRoutineAction,
    );
    expect(result.routineFormProps.currentDayOfWeek).toBe(1);
    expect(result.showRoutineForm).toBe(true);
  });

  it("holiday表示時はフォームの曜日をHOLIDAY_DAY_VALUEへ変換する", () => {
    const data = createData("holiday");

    const result = createHomeContentViewModel(data);

    expect(result.routineFormProps.currentDayOfWeek).toBe(HOLIDAY_DAY_VALUE);
  });
});
