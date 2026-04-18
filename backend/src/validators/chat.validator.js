import { HttpError } from "../utils/httpError.js";

export function assertChatMessage(body) {
  const message = body?.message;
  if (typeof message !== "string" || !message.trim()) throw new HttpError(400, "message is required");
  if (message.length > 2000) throw new HttpError(400, "message is too long");
  return message.trim();
}
