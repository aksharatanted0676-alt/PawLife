import mongoose from "mongoose";

const petConnectRequestSchema = new mongoose.Schema(
  {
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    toUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fromPetId: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
    toPetId: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" }
  },
  { timestamps: true }
);

petConnectRequestSchema.index({ fromUserId: 1, toUserId: 1, fromPetId: 1, toPetId: 1 });
petConnectRequestSchema.index({ toUserId: 1, status: 1 });

export const PetConnectRequest = mongoose.model("PetConnectRequest", petConnectRequestSchema);
