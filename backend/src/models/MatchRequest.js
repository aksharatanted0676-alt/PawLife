import mongoose from "mongoose";

const matchRequestSchema = new mongoose.Schema(
  {
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fromPetId: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
    toUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    toPetId: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
    message: { type: String, default: "", trim: true, maxlength: 1000 },
    status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" }
  },
  { timestamps: true }
);

matchRequestSchema.index({ fromUserId: 1, toPetId: 1 }, { unique: true });

export const MatchRequest = mongoose.model("MatchRequest", matchRequestSchema);
