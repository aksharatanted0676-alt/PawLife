"use client";

import type { InAppNotification } from "@/lib/types";

export function NotificationsPanel({
  open,
  notifications,
  unreadCount,
  onClose,
  onMarkAllRead,
  onMarkOneRead
}: {
  open: boolean;
  notifications: InAppNotification[];
  unreadCount: number;
  onClose: () => void;
  onMarkAllRead: () => void;
  onMarkOneRead: (id: string) => void;
}) {
  if (!open) return null;

  return (
    <section className="mb-6 glass-panel p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Notifications</h2>
          <p className="text-xs text-slate-300">Alerts for pets, diet updates, and subscription changes.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onMarkAllRead} className="rounded-lg border border-white/20 px-2 py-1 text-xs">
            Mark all read {unreadCount > 0 ? `(${unreadCount})` : ""}
          </button>
          <button onClick={onClose} className="rounded-lg border border-white/20 px-2 py-1 text-xs">
            Close
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {notifications.length === 0 ? <p className="text-sm text-slate-300">No notifications yet.</p> : null}
        {notifications.map((n) => (
          <div key={n._id} className="flex items-start justify-between gap-3 rounded-xl bg-white/5 p-3 text-sm">
            <div>
              <p className="font-medium">
                {n.title}{" "}
                {!n.read ? <span className="ml-2 rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] text-rose-200">NEW</span> : null}
              </p>
              {n.message ? <p className="mt-1 text-xs text-slate-300">{n.message}</p> : null}
              <p className="mt-1 text-[11px] text-slate-500">
                {n.type}
                {n.createdAt ? ` · ${new Date(n.createdAt).toLocaleString()}` : ""}
              </p>
            </div>
            {!n.read ? (
              <button onClick={() => onMarkOneRead(n._id)} className="shrink-0 rounded-lg border border-cyan-400/40 px-2 py-1 text-xs">
                Mark read
              </button>
            ) : (
              <span className="shrink-0 text-xs text-emerald-300">Read</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
