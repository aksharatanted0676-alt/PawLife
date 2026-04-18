import mongoose, { Schema } from "mongoose";
import type { HealthRiskLevel } from "../petHealthSimulation";

export interface PetHealthImageAnalysisDoc {
  petType: string;
  issue: string;
  confidence: number;
  risk: HealthRiskLevel;
  description: string;
  action: string;
  steps: string[];
  originalFilename?: string;
  imageSizeBytes?: number;
  createdAt?: Date;
}

const petHealthImageAnalysisSchema = new Schema<PetHealthImageAnalysisDoc>(
  {
    petType: { type: String, required: true },
    issue: { type: String, required: true },
    confidence: { type: Number, required: true },
    risk: { type: String, required: true, enum: ["LOW", "MEDIUM", "HIGH"] },
    description: { type: String, required: true },
    action: { type: String, required: true },
    steps: { type: [String], required: true },
    originalFilename: { type: String },
    imageSizeBytes: { type: Number }
  },
  { timestamps: true }
);

export const PetHealthImageAnalysisModel =
  mongoose.models.PetHealthImageAnalysis ||
  mongoose.model<PetHealthImageAnalysisDoc>("PetHealthImageAnalysis", petHealthImageAnalysisSchema);
