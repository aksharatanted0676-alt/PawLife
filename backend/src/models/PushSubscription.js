import mongoose from "mongoose";

const pushSubscriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    endpoint: { type: String, required: true },
    keys: {
      p256dh: { type: String, default: "" },
      auth: { type: String, default: "" }
    },
    raw: { type: Object, required: true }
  },
  { timestamps: true }
);

pushSubscriptionSchema.index({ userId: 1, endpoint: 1 }, { unique: true });

export const PushSubscription = mongoose.model("PushSubscription", pushSubscriptionSchema);

