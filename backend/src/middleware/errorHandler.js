import { HttpError } from "../utils/httpError.js";

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const status =
    err instanceof HttpError ? err.status : err.status || err.statusCode || 500;
  const message = err.message || "Server error";
  const code = err instanceof HttpError ? err.code : undefined;

  if (status >= 500) {
    console.error("[server]", err);
  } else {
    console.warn("[http]", status, message);
  }

  return res.status(status).json({
    success: false,
    message,
    code: code || undefined,
    data: null
  });
}
