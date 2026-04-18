import { apiRequest, apiUpload } from "../http/client";
import type { PetProfile } from "../types";

export const petsService = {
  getPets: (token: string) => apiRequest<{ pets: PetProfile[] }>("/pets", undefined, token),
  getPet: (token: string, petId: string) => apiRequest<{ pet: PetProfile }>(`/pets/${petId}`, { method: "GET" }, token),
  addPet: (
    token: string,
    pet: Omit<PetProfile, "_id" | "medicalHistory" | "vaccinationRecords"> & {
      medicalHistory: PetProfile["medicalHistory"];
      vaccinationRecords: PetProfile["vaccinationRecords"];
    }
  ) =>
    apiRequest<{ pet: PetProfile }>(
      "/pets",
      {
        method: "POST",
        body: JSON.stringify(pet)
      },
      token
    ),
  updatePet: (token: string, petId: string, patch: Partial<PetProfile>) =>
    apiRequest<{ pet: PetProfile }>(`/pets/${petId}`, { method: "PUT", body: JSON.stringify(patch) }, token),
  deletePet: (token: string, petId: string) => apiRequest<{ success: boolean }>(`/pets/${petId}`, { method: "DELETE" }, token),
  uploadReport: (token: string, petId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiUpload<{ reportUrl: string; pet: PetProfile }>(`/pets/${petId}/reports`, form, token);
  }
};
