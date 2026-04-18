import { apiRequest } from "../http/client";
import type { DietPlanDoc } from "../types";

export const dietService = {
  getDiet: (token: string, petId: string) =>
    apiRequest<{ diet: DietPlanDoc | null }>(`/diet/${petId}`, { method: "GET" }, token),
  saveDiet: (
    token: string,
    payload: {
      petId: string;
      meals: DietPlanDoc["meals"];
      calories: number;
      notes: string;
      waterIntakeMl?: number;
    }
  ) => apiRequest<{ diet: DietPlanDoc }>("/diet", { method: "POST", body: JSON.stringify(payload) }, token),
  updateDiet: (
    token: string,
    dietId: string,
    payload: Partial<{ meals: DietPlanDoc["meals"]; calories: number; notes: string; waterIntakeMl?: number }>
  ) => apiRequest<{ diet: DietPlanDoc }>(`/diet/${dietId}`, { method: "PUT", body: JSON.stringify(payload) }, token),
  deleteDiet: (token: string, dietId: string) =>
    apiRequest<{ success: boolean }>(`/diet/${dietId}`, { method: "DELETE" }, token)
};
