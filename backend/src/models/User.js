import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    /** Account-level flag for Pet Connect trust (demo defaults true; tighten in production). */
    petConnectAccountVerified: { type: Boolean, default: true },
    subscriptionType: { type: String, enum: ["free", "pro", "elite"], default: "free" },
    subscriptionExpiry: { type: Date, default: null }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
