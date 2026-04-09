import type { Request } from "firebase-functions/https";
import type { Response } from "express";

export const applyCorsHeaders = (res: Response): void => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST");
  res.set("Access-Control-Allow-Headers", "Content-Type");
};

export const handlePreflightRequest = (
  req: Request,
  res: Response,
): boolean => {
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return true;
  }

  return false;
};
