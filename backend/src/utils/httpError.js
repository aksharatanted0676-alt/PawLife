/** Structured HTTP error for the global error handler. */
export class HttpError extends Error {
  /**
   * @param {number} status - HTTP status code
   * @param {string} message - Safe client-facing message
   * @param {string} [code] - Optional machine-readable code (e.g. PET_LIMIT)
   */
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
