import { LOCAL_DATA_UPDATED_AT_EVENT } from "@/lib/storage/core";
import { subscribeWorkoutStorage } from "../page/subscribeWorkoutStorage";
it("同一タブと別タブの更新を通知し、解除後は通知しない", () => {
  const reload = jest.fn();
  const unsubscribe = subscribeWorkoutStorage(reload);
  window.dispatchEvent(new Event(LOCAL_DATA_UPDATED_AT_EVENT));
  window.dispatchEvent(new Event("storage"));
  expect(reload).toHaveBeenCalledTimes(2);
  unsubscribe();
  window.dispatchEvent(new Event(LOCAL_DATA_UPDATED_AT_EVENT));
  window.dispatchEvent(new Event("storage"));
  expect(reload).toHaveBeenCalledTimes(2);
});
