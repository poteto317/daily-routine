// storybook/test は Jest 環境では解決できないためモックする
jest.mock("storybook/test", () => ({
  fn: jest.fn(() => jest.fn()),
}));

import { createBaseViewModel } from "../__fixtures__/homeContentFixtures";

describe("createBaseViewModel", () => {
  it("呼び出しごとに独立した fn() インスタンスを返す", () => {
    const vm1 = createBaseViewModel();
    const vm2 = createBaseViewModel();
    expect(vm1.toolbarProps.onAddRoutineAction).not.toBe(vm2.toolbarProps.onAddRoutineAction);
    expect(vm1.toolbarProps.view.toggleEditModeAction).not.toBe(vm2.toolbarProps.view.toggleEditModeAction);
    expect(vm1.routineListProps.onToggleAction).not.toBe(vm2.routineListProps.onToggleAction);
    expect(vm1.routineFormProps.onSubmitAction).not.toBe(vm2.routineFormProps.onSubmitAction);
  });

  it("HomeContentViewModel の必須プロパティを全て持つ", () => {
    const vm = createBaseViewModel();
    expect(vm).toHaveProperty("toolbarProps");
    expect(vm).toHaveProperty("routineListProps");
    expect(vm).toHaveProperty("routineFormProps");
    expect(vm).toHaveProperty("showRoutineForm");
  });

  it("showRoutineForm のデフォルト値が false である", () => {
    const vm = createBaseViewModel();
    expect(vm.showRoutineForm).toBe(false);
  });

  it("routineListProps.sortedRoutines の件数が allRoutinesCount と一致する", () => {
    const vm = createBaseViewModel();
    expect(vm.routineListProps.sortedRoutines).toHaveLength(
      vm.routineListProps.allRoutinesCount,
    );
  });

  it("routineListProps.displayRoutinesCount が allRoutinesCount と一致する", () => {
    const vm = createBaseViewModel();
    expect(vm.routineListProps.displayRoutinesCount).toBe(
      vm.routineListProps.allRoutinesCount,
    );
  });

  it("routineFormProps.routine のデフォルト値が undefined である", () => {
    const vm = createBaseViewModel();
    expect(vm.routineFormProps.routine).toBeUndefined();
  });

  it("toolbarProps.trainDelays が空配列である", () => {
    const vm = createBaseViewModel();
    expect(vm.toolbarProps.trainDelays).toHaveLength(0);
  });

  it("routineListProps.isEditMode のデフォルト値が false である", () => {
    const vm = createBaseViewModel();
    expect(vm.routineListProps.isEditMode).toBe(false);
  });

  it("routineFormProps.currentDayOfWeek のデフォルト値が 6（土曜）である", () => {
    const vm = createBaseViewModel();
    expect(vm.routineFormProps.currentDayOfWeek).toBe(6);
  });

  it("toolbarProps.view.viewMode と routineListProps.viewMode が一致する", () => {
    const vm = createBaseViewModel();
    expect(vm.routineListProps.viewMode).toBe(vm.toolbarProps.view.viewMode);
  });
});
