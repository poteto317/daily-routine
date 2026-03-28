import { HOLIDAY_DAY_VALUE } from "@/types/routine";
import {
  createHomePageLayoutProps,
  createHomeRoutineFormProps,
  createHomeRoutineListProps,
  createHomeToolbarProps,
  isHomePageEditMode,
  resolveHomeRoutineFormDay,
} from "../pageViewModelActions";
import { createData } from "./homeContentViewModel.test.setup";

describe("pageViewModelActions", () => {
  it("home edit mode 判定を返す", () => {
    expect(isHomePageEditMode(createData(1))).toBe(true);
    expect(
      isHomePageEditMode({ ...createData(1), currentPage: "settings" }),
    ).toBe(
      false,
    );
    expect(
      isHomePageEditMode({
        ...createData(1),
        view: { ...createData(1).view, isEditMode: false },
      }),
    ).toBe(false);
  });

  it("フォーム曜日を解決する", () => {
    expect(resolveHomeRoutineFormDay(1)).toBe(1);
    expect(resolveHomeRoutineFormDay("holiday")).toBe(HOLIDAY_DAY_VALUE);
  });

  it("toolbar/list/form/page layout props を組み立てる", () => {
    const data = createData(1);
    const pageChange = jest.fn();

    expect(createHomeToolbarProps(data)).toEqual({
      view: data.view,
      display: data.display,
      trainDelays: data.trainDelays,
      onAddRoutineAction: data.crud.addRoutineAction,
      showAddButton: true,
    });

    expect(createHomeRoutineListProps(data)).toEqual({
      sortedRoutines: data.display.sortedRoutines,
      allRoutinesCount: 2,
      displayRoutinesCount: 1,
      isEditMode: true,
      onToggleAction: data.routineOps.toggleComplete,
      onEditAction: data.crud.editRoutineAction,
      onDeleteAction: data.crud.deleteRoutineAction,
      onAddRoutineAction: data.crud.addRoutineAction,
      onReorderAction: data.routineOps.reorderRoutines,
      viewMode: data.view.viewMode,
    });

    expect(createHomeRoutineFormProps(data)).toEqual({
      routine: data.crud.editingRoutine,
      onSubmitAction: data.crud.submitRoutineAction,
      onCancelAction: data.crud.cancelRoutineAction,
      currentDayOfWeek: 1,
    });

    expect(
      createHomePageLayoutProps({
        currentPage: data.currentPage,
        view: data.view,
        onPageChangeAction: pageChange,
      }),
    ).toEqual({
      currentPage: "home",
      isEditMode: true,
      onNavigateAction: pageChange,
      onToggleEditModeAction: data.view.toggleEditModeAction,
    });
  });
});
