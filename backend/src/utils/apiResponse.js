/**
 * Standard JSON envelope for all API success responses.
 * @template T
 * @param {import('express').Response} res
 * @param {T} data - Payload (object, array, or null)
 * @param {string} [message]
 * @param {number} [status]
 */
export function ok(res, data = null, message = "OK", status = 200) {
  return res.status(status).json({ success: true, message, data });
}
