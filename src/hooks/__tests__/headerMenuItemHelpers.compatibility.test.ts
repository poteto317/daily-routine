import {
  buildDynamicTodoMenuItems,
  filterStaticHeaderMenuItems,
  orderHeaderMenuItems,
  sortByMenuOrder,
  toTodoListMenuItemId,
} from "@/hooks/headerMenuItemHelpers";
import * as dynamicTodoMenuItems from "@/hooks/dynamicTodoMenuItems";
import * as headerMenuOrder from "@/hooks/headerMenuOrder";
import * as staticHeaderMenuItems from "@/hooks/staticHeaderMenuItems";

describe("headerMenuItemHelpers compatibility exports", () => {
  it("責務別moduleの公開関数を既存経路から再exportする", () => {
    expect(buildDynamicTodoMenuItems).toBe(
      dynamicTodoMenuItems.buildDynamicTodoMenuItems,
    );
    expect(toTodoListMenuItemId).toBe(
      dynamicTodoMenuItems.toTodoListMenuItemId,
    );
    expect(orderHeaderMenuItems).toBe(headerMenuOrder.orderHeaderMenuItems);
    expect(sortByMenuOrder).toBe(headerMenuOrder.sortByMenuOrder);
    expect(filterStaticHeaderMenuItems).toBe(
      staticHeaderMenuItems.filterStaticHeaderMenuItems,
    );
  });
});
