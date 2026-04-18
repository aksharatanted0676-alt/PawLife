import mongoose from "mongoose";

const matchProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    petId: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true, unique: true },
    petType: { type: String, required: true, enum: ["dog", "cat", "bird", "rabbit", "fish"] },
    breed: { type: String, default: "", trim: true },
    ageYears: { type: Number, default: 1, min: 0 },
    gender: { type: String, enum: ["male", "female", "unknown"], default: "unknown" },
    vaccinationStatus: { type: String, enum: ["up_to_date", "pending", "unknown"], default: "pending" },
    healthStatus: { type: String, enum: ["healthy", "under_observation", "unknown"], default: "healthy" },
    locationCity: { type: String, default: "", trim: true },
    intent: { type: String, enum: ["breeding", "companion", "playdate"], default: "companion" },
    description: { type: String, default: "", trim: true, maxlength: 2000 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

matchProfileSchema.index({ petType: 1, isActive: 1, locationCity: 1 });

export const MatchProfile = mongoose.model("MatchProfile", matchProfileSchema);
