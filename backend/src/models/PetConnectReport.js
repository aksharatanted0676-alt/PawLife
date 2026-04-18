import mongoose from "mongoose";

const petConnectReportSchema = new mongoose.Schema(
  {
    reporterUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reportedUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetPetId: { type: mongoose.Schema.Types.ObjectId, ref: "Pet" },
    reason: { type: String, required: true, trim: true, maxlength: 2000 }
  },
  { timestamps: true }
);

petConnectReportSchema.index({ reporterUserId: 1, createdAt: -1 });

export const PetConnectReport = mongoose.model("PetConnectReport", petConnectReportSchema);
