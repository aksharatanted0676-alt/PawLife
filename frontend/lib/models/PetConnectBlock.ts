import mongoose, { Schema } from "mongoose";

export interface PetConnectBlockDoc {
  blockerUserId: mongoose.Types.ObjectId;
  blockedUserId: mongoose.Types.ObjectId;
}

const petConnectBlockSchema = new Schema<PetConnectBlockDoc>(
  {
    blockerUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    blockedUserId: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

petConnectBlockSchema.index({ blockerUserId: 1, blockedUserId: 1 }, { unique: true });

export const PetConnectBlockModel =
  mongoose.models.PetConnectBlock || mongoose.model<PetConnectBlockDoc>("PetConnectBlock", petConnectBlockSchema);
