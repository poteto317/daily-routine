/** @jest-environment node */
jest.mock("firebase-functions/v2/https", () => ({
  HttpsError: class extends Error {
    constructor(
      readonly code: string,
      message: string,
    ) {
      super(message);
    }
  },
}));
import { createFakeFirestore } from "../../../agentApi/__tests__/fakeFirestore";
import { validateImageReport } from "../validateImageReport";
import {
  claimExpiredReservation,
  imageReservationRef,
  imageUsageRefs,
  reserveImages,
  submitReservedReport,
} from "../imageReservations";
import { reclaimExpiredImages, removeLateImage } from "../imageCleanup";
import { MANAGED_REPORT_IMAGES_PREFIX } from "../../imageFormats";

const now = 1000;
const pendingEnd = now + 60 * 60 * 1000;
const png = Buffer.from("iVBORw0KGgo=", "base64");
const pngAttachment = {
  contentType: "image/png",
  base64: png.toString("base64"),
};
const meta = {
  appVersion: "1",
  userAgent: "",
  url: "/",
  locale: "ja",
  timezone: "Asia/Tokyo",
  createdAtClient: "2026-11-22T00:00:00.000Z",
};
const input = { description: "  sample  ", meta, images: [pngAttachment] };

const reserveOne = (db: ReturnType<typeof createFakeFirestore>["db"]) =>
  reserveImages(
    db,
    "user",
    "report",
    [{ bytes: png, contentType: "image/png" }],
    now,
  );

describe("image report input", () => {
  it("retains only allowed text fields and uses decoded bytes", () => {
    const result = validateImageReport({
      ...input,
      uid: "another",
      status: "issued",
    });
    expect(result.fields).toEqual({
      title: "",
      description: "sample",
      stepsToReproduce: "",
      meta,
    });
    expect(result.images).toEqual([{ bytes: png, contentType: "image/png" }]);
  });

  it.each([
    { ...input, description: "  " },
    { ...input, images: [] },
    { ...input, images: Array(4).fill(pngAttachment) },
    {
      ...input,
      images: [{ ...pngAttachment, base64: pngAttachment.base64 + "?" }],
    },
    { ...input, images: [{ ...pngAttachment, contentType: "image/gif" }] },
    { ...input, images: [{ ...pngAttachment, base64: "A".repeat(7_000_000) }] },
  ])("denies malformed or oversized input", (body) => {
    expect(() => validateImageReport(body)).toThrow();
  });
});

describe("image reservations", () => {
  it("charges both counters, and publishes only a submitted report", async () => {
    const { db, get } = createFakeFirestore({});
    const images = await reserveOne(db);
    const { user, global } = imageUsageRefs(db, "user");
    expect(get(user.path)).toEqual({ count: 1, bytes: png.length });
    expect(get(global.path)).toEqual({ count: 1, bytes: png.length });
    expect(get("bugReports/report")).toBeUndefined();
    expect(images[0].path).toBe(
      `${MANAGED_REPORT_IMAGES_PREFIX}/user/report/0.png`,
    );

    await submitReservedReport(
      db,
      "report",
      validateImageReport(input).fields,
      () => pendingEnd - 1,
    );

    expect(get("bugReports/report")).toMatchObject({
      uid: "user",
      status: "pending",
      images,
    });
    expect(get(imageReservationRef(db, "report").path)).toMatchObject({
      status: "submitted",
    });
    await expect(
      claimExpiredReservation(db, "report", () => pendingEnd),
    ).resolves.toBeNull();
  });

  it.each([
    ["user", { count: 20, bytes: 0 }],
    ["user", { count: 1, bytes: 50 * 1024 * 1024 }],
    ["global", { count: 1000, bytes: 0 }],
    ["global", { count: 1, bytes: 2 * 1024 * 1024 * 1024 }],
  ] as const)("rejects if %s is at a quota boundary", async (kind, usage) => {
    const usagePath = imageUsageRefs(createFakeFirestore({}).db, "user")[kind]
      .path;
    const { db, get } = createFakeFirestore({ [usagePath]: usage });

    await expect(reserveOne(db)).rejects.toMatchObject({
      code: "resource-exhausted",
    });

    expect(get(imageReservationRef(db, "report").path)).toBeUndefined();
    expect(get(usagePath)).toEqual(usage);
  });

  it("keeps a failed deletion charged and releases both counters once on recovery", async () => {
    const { db, get } = createFakeFirestore({});
    await reserveOne(db);
    const reservationPath = imageReservationRef(db, "report").path;
    const remove = jest
      .fn()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValue(undefined);

    await expect(
      reclaimExpiredImages(db, "report", remove, () => pendingEnd),
    ).rejects.toThrow("network");
    expect(get(reservationPath)).toMatchObject({ status: "deleting" });
    expect(get(imageUsageRefs(db, "user").global.path)).toEqual({
      count: 1,
      bytes: png.length,
    });
    await expect(
      submitReservedReport(
        db,
        "report",
        validateImageReport(input).fields,
        () => pendingEnd,
      ),
    ).rejects.toThrow();
    await reclaimExpiredImages(
      db,
      "report",
      remove,
      () => pendingEnd + 15 * 60 * 1000,
    );
    await reclaimExpiredImages(
      db,
      "report",
      remove,
      () => pendingEnd + 15 * 60 * 1000,
    );

    const { user, global } = imageUsageRefs(db, "user");
    expect(remove).toHaveBeenCalledTimes(2);
    expect(get(reservationPath)).toBeUndefined();
    expect(get(user.path)).toBeUndefined();
    expect(get(global.path)).toEqual({ count: 0, bytes: 0 });
  });

  it("retains the usage record while another reservation is charged", async () => {
    const { db, get } = createFakeFirestore({});
    await reserveOne(db);
    await reserveImages(
      db,
      "user",
      "other-report",
      [{ bytes: png, contentType: "image/png" }],
      now + 1,
    );

    await reclaimExpiredImages(db, "report", jest.fn(), () => pendingEnd);

    expect(get(imageUsageRefs(db, "user").user.path)).toEqual({
      count: 1,
      bytes: png.length,
    });
  });

  it("ignores legacy paths and pins orphan deletion to the event generation", async () => {
    const { db } = createFakeFirestore({});
    const [image] = await reserveOne(db);
    const remove = jest.fn();
    await removeLateImage(db, "bugReports/user/report/0.png", 123, remove);
    await removeLateImage(db, image.path, 123, remove);
    expect(remove).not.toHaveBeenCalled();

    await removeLateImage(db, image.path, 123, remove);
    expect(remove).not.toHaveBeenCalled();
    await claimExpiredReservation(db, "report", () => pendingEnd);
    await removeLateImage(db, image.path, 123, remove);

    expect(remove).toHaveBeenCalledWith(image.path, 123);
  });
});
