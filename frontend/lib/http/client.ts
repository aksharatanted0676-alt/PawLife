export type ApiSuccess<T> = { success: true; message: string; data: T };
export type ApiFailure = { success: false; message: string; code?: string; data: null };

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

function parseErrorBody(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "Request failed";
  try {
    const j = JSON.parse(trimmed) as {
      success?: boolean;
      message?: string;
      error?: string;
      code?: string;
    };
    if (j.success === false && typeof j.message === "string") {
      return j.code ? `${j.message} (${j.code})` : j.message;
    }
    if (typeof j.message === "string" && j.success === false) return j.message;
    if (typeof j.error === "string") return j.code ? `${j.error} (${j.code})` : j.error;
  } catch {
    /* plain */
  }
  return trimmed.slice(0, 500);
}

/**
 * JSON request to Express API; unwraps `{ success, message, data }` envelope.
 */
export async function apiRequest<T>(path: string, init?: RequestInit, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((init?.headers as Record<string, string>) || {})
  };
  if (init?.body != null && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store"
  });

  const text = await response.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(parseErrorBody(text));
  }

  if (!response.ok) {
    throw new Error(parseErrorBody(text));
  }

  const body = json as Record<string, unknown>;
  if (body && body.success === true && "data" in body) {
    return body.data as T;
  }

  return json as T;
}

export async function apiUpload<T>(path: string, form: FormData, token?: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: form,
    cache: "no-store"
  });
  const text = await response.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(parseErrorBody(text));
  }
  if (!response.ok) throw new Error(parseErrorBody(text));
  const body = json as Record<string, unknown>;
  if (body && body.success === true && "data" in body) return body.data as T;
  return json as T;
}

export { API_BASE_URL };
