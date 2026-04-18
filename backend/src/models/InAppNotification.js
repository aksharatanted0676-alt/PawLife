import mongoose from "mongoose";

const inAppNotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    petId: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", default: null },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, default: "", trim: true, maxlength: 2000 },
    type: {
      type: String,
      enum: ["pet_added", "diet_updated", "subscription", "reminder", "appointment", "system"],
      default: "system"
    },
    read: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

inAppNotificationSchema.index({ userId: 1, createdAt: -1 });

export const InAppNotification = mongoose.model("InAppNotification", inAppNotificationSchema);
