import mongoose, { Schema } from "mongoose";
import type { PetType } from "../types";

export interface PetLocation {
  city?: string;
  lat?: number | null;
  lng?: number | null;
}

export interface PetDoc {
  userId: mongoose.Types.ObjectId;
  petType: PetType;
  name: string;
  ageYears: number;
  breed: string;
  weightKg: number;
  gender: string;
  healthStatus: string;
  vaccinationStatus: string;
  location: PetLocation;
  healthScore: number;
  connectOptIn: boolean;
  petConnectVerified: boolean;
  verifiedBreeder: boolean;
  boostProfile: boolean;
  profileImageUrl?: string;
}

const locationSchema = new Schema<PetLocation>(
  {
    city: { type: String, default: "", trim: true },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  },
  { _id: false }
);

const petSchema = new Schema<PetDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    petType: { type: String, enum: ["dog", "cat", "bird", "rabbit", "fish"], required: true },
    name: { type: String, required: true, trim: true },
    ageYears: { type: Number, default: 1, min: 0 },
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
    petConnectVerified: { type: Boolean, default: false },
    verifiedBreeder: { type: Boolean, default: false },
    boostProfile: { type: Boolean, default: false },
    profileImageUrl: { type: String, default: "", trim: true }
  },
  { timestamps: true }
);

export const PetModel = mongoose.models.Pet || mongoose.model<PetDoc>("Pet", petSchema);
