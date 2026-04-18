import { HttpError } from "../utils/httpError.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function assertSignupPayload(body) {
  const name = String(body?.name || "").trim();
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");
  if (!name || name.length > 80) throw new HttpError(400, "name is required (max 80 chars)");
  if (!email || !EMAIL_RE.test(email)) throw new HttpError(400, "Invalid email address");
  if (password.length < 6) throw new HttpError(400, "password must be at least 6 characters");
  if (password.length > 128) throw new HttpError(400, "password too long");
  return { name, email, password };
}

export function assertLoginPayload(body) {
  const email = body?.email;
  const password = body?.password;
  if (!email || !password) throw new HttpError(400, "email and password are required");
  return { email: String(email).trim().toLowerCase(), password: String(password) };
}
