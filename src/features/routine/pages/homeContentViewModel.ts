import type {
  HomeContentSource,
  HomeRoutineFormProps,
  HomeRoutineListProps,
  HomeToolbarProps,
} from "./homeTypes";
import {
  createHomeRoutineFormProps,
  createHomeRoutineListProps,
  createHomeToolbarProps,
} from "./pageViewModelActions";

export type HomeContentViewModel = {
  toolbarProps: HomeToolbarProps;
  routineListProps: HomeRoutineListProps;
  routineFormProps: HomeRoutineFormProps;
  showRoutineForm: boolean;
};

export const createHomeContentViewModel = (
  data: HomeContentSource,
): HomeContentViewModel => ({
  toolbarProps: createHomeToolbarProps(data),
  routineListProps: createHomeRoutineListProps(data),
  routineFormProps: createHomeRoutineFormProps(data),
  showRoutineForm: data.crud.showForm,
});
