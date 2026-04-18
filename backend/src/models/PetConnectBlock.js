import mongoose from "mongoose";

const petConnectBlockSchema = new mongoose.Schema(
  {
    blockerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    blockedUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

petConnectBlockSchema.index({ blockerUserId: 1, blockedUserId: 1 }, { unique: true });

export const PetConnectBlock = mongoose.model("PetConnectBlock", petConnectBlockSchema);
