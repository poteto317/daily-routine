import { type Response } from "express";

export const sendMethodNotAllowed = (res: Response): void => {
  res.status(405).send({ error: "Method Not Allowed" });
};

export const sendInvalidSyncRequest = (res: Response): void => {
  res.status(400).send({ error: "Missing token or routines" });
};

export const sendUnauthorizedSyncRequest = (res: Response): void => {
  res.status(401).send({ error: "Unauthorized" });
};

export const sendSubscriptionOwnerMismatch = (res: Response): void => {
  res
    .status(403)
    .send({ error: "Forbidden", code: "subscription-owner-mismatch" });
};

export const sendSyncSuccess = (res: Response, routinesCount: number): void => {
  res.status(200).send({ success: true, routinesCount });
};

export const sendInternalServerError = (res: Response): void => {
  res.status(500).send({ error: "Internal server error" });
};
