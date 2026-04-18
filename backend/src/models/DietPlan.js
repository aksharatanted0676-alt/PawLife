import mongoose from "mongoose";

/** Supports weekly rows (day + slots) or legacy simple rows (label + time). */
const mealRowSchema = new mongoose.Schema(
  {
    day: { type: String, default: "", trim: true, maxlength: 40 },
    morning: { type: String, default: "", trim: true, maxlength: 500 },
    afternoon: { type: String, default: "", trim: true, maxlength: 500 },
    evening: { type: String, default: "", trim: true, maxlength: 500 },
    label: { type: String, default: "", trim: true, maxlength: 200 },
    time: { type: String, default: "", trim: true, maxlength: 40 },
    calories: { type: Number, default: null, min: 0, max: 20000 }
  },
  { _id: false }
);

const dietPlanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    petId: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
    meals: { type: [mealRowSchema], default: [] },
    calories: { type: Number, default: 0, min: 0, max: 50000 },
    waterIntakeMl: { type: Number, default: 0, min: 0, max: 100000 },
    notes: { type: String, default: "", trim: true, maxlength: 2000 },
    planType: { type: String, enum: ["auto", "custom"], default: "auto" }
  },
  { timestamps: true }
);

dietPlanSchema.index({ userId: 1, petId: 1 }, { unique: true });

export const DietPlan = mongoose.model("DietPlan", dietPlanSchema);
