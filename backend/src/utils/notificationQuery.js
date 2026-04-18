/**
 * Notifications visible in the panel: already sent by scheduler OR due now/past.
 */
export function notificationVisibilityFilter(userId) {
  const now = new Date();
  return {
    userId,
    $or: [{ sent: true }, { remindAt: { $lte: now } }]
  };
}
