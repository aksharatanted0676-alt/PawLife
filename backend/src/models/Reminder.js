import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    petId: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ["vaccination", "appointment", "medication", "grooming", "custom"], required: true },
    remindAt: { type: Date, required: true },
    sent: { type: Boolean, default: false },
    sentAt: { type: Date, default: null },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

reminderSchema.index({ remindAt: 1, sent: 1 });
reminderSchema.index({ userId: 1, sent: 1, read: 1 });

export const Reminder = mongoose.model("Reminder", reminderSchema);
