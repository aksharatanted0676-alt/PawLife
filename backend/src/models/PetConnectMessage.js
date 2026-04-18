import mongoose from "mongoose";

const petConnectMessageSchema = new mongoose.Schema(
  {
    connectionId: { type: mongoose.Schema.Types.ObjectId, ref: "PetConnectRequest", required: true, index: true },
    senderUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, trim: true, maxlength: 4000 }
  },
  { timestamps: true }
);

petConnectMessageSchema.index({ connectionId: 1, createdAt: 1 });

export const PetConnectMessage = mongoose.model("PetConnectMessage", petConnectMessageSchema);
