import mongoose from "mongoose";

const historySchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    note: { type: String, required: true },
    type: { type: String, enum: ["illness", "visit", "vaccine"], required: true }
  },
  { _id: true }
);

const vaccinationSchema = new mongoose.Schema(
  {
    vaccine: { type: String, required: true },
    dueDate: { type: String, required: true },
    status: { type: String, enum: ["pending", "done"], default: "pending" }
  },
  { _id: true }
);

const locationSchema = new mongoose.Schema(
  {
    city: { type: String, default: "", trim: true },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  },
  { _id: false }
);

const petSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    petType: { type: String, enum: ["dog", "cat", "bird", "rabbit", "fish"], required: true },
    name: { type: String, required: true, trim: true },
    ageYears: { type: Number, default: 1, min: 0 },
    birthdate: { type: Date, default: null },
    breed: { type: String, required: true, trim: true },
    weightKg: { type: Number, default: 1, min: 0 },
    gender: { type: String, enum: ["male", "female", "unknown"], default: "unknown" },
    healthStatus: {
      type: String,
      enum: ["healthy", "under_observation", "critical"],
      default: "healthy"
    },
    vaccinationStatus: { type: String, enum: ["up_to_date", "pending"], default: "pending" },
    location: { type: locationSchema, default: () => ({}) },
    healthScore: { type: Number, default: 0, min: 0, max: 100 },
    connectOptIn: { type: Boolean, default: false },
    /** Shown in Pet Connect only when true (demo: user completes verification step). */
    petConnectVerified: { type: Boolean, default: false },
    verifiedBreeder: { type: Boolean, default: false },
    boostProfile: { type: Boolean, default: false },
    profileImageUrl: { type: String, default: "", trim: true },
    medicalHistory: { type: [historySchema], default: [] },
    vaccinationRecords: { type: [vaccinationSchema], default: [] },
    reports: { type: [String], default: [] }
  },
  { timestamps: true }
);

petSchema.index({ userId: 1, createdAt: -1 });
petSchema.index({ petType: 1, connectOptIn: 1, petConnectVerified: 1, healthStatus: 1, vaccinationStatus: 1 });

export const Pet = mongoose.model("Pet", petSchema);
