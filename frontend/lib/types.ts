export type PetType = "dog" | "cat" | "bird" | "rabbit" | "fish";

export type SubscriptionTier = "free" | "pro" | "elite";

export interface User {
  id: string;
  name: string;
  email: string;
  subscriptionType?: SubscriptionTier;
  subscriptionExpiry?: string | null;
}

/** Weekly row (API default) or legacy simple meal row. */
export interface DietMeal {
  day?: string;
  morning?: string;
  afternoon?: string;
  evening?: string;
  label?: string;
  calories?: number | null;
  time?: string;
}

export interface DietPlanDoc {
  _id: string;
  petId: string;
  userId: string;
  meals: DietMeal[];
  calories: number;
  notes: string;
  waterIntakeMl?: number;
  planType?: "auto" | "custom";
}

export interface InAppNotification {
  _id: string;
  userId?: string;
  petId?: string | null;
  title: string;
  message?: string;
  type: string;
  read: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface MedicalEntry {
  _id?: string;
  date: string;
  note: string;
  type: "illness" | "visit" | "vaccine";
}

export interface VaccinationEntry {
  _id?: string;
  vaccine: string;
  dueDate: string;
  status: "pending" | "done";
}

export type PetGender = "male" | "female" | "unknown";
export type PetHealthStatus = "healthy" | "under_observation" | "critical";
export type PetVaccinationConnectStatus = "up_to_date" | "pending";

export interface PetLocationProfile {
  city?: string;
  lat?: number | null;
  lng?: number | null;
}

export interface PetProfile {
  _id: string;
  name: string;
  petType: PetType;
  breed: string;
  ageYears: number;
  birthdate?: string | null;
  weightKg: number;
  gender?: PetGender;
  healthStatus?: PetHealthStatus;
  vaccinationStatus?: PetVaccinationConnectStatus;
  location?: PetLocationProfile;
  healthScore?: number;
  connectOptIn?: boolean;
  petConnectVerified?: boolean;
  verifiedBreeder?: boolean;
  boostProfile?: boolean;
  profileImageUrl?: string;
  medicalHistory: MedicalEntry[];
  vaccinationRecords: VaccinationEntry[];
  reports?: string[];
  updatedAt?: string;
}

export interface PetMatchResult {
  petId: string;
  petName: string;
  breed: string;
  age: number;
  distance: string;
  compatibilityScore: number;
  healthStatus: string;
  profileImageUrl: string;
  ownerUserId: string;
  verifiedBreeder: boolean;
  boostProfile: boolean;
}

export interface PopulatedPetBrief {
  _id: string;
  name: string;
  breed: string;
  petType: PetType;
  profileImageUrl?: string;
}

export interface PetConnectRequestRow {
  _id: string;
  status: string;
  fromUserId: string;
  toUserId: string;
  fromPetId: PopulatedPetBrief | string;
  toPetId: PopulatedPetBrief | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PetConnectMessageRow {
  _id: string;
  connectionId: string;
  senderUserId: string;
  body: string;
  createdAt?: string;
}

export interface Reminder {
  _id: string;
  petId: string;
  title: string;
  type: "vaccination" | "appointment" | "medication" | "grooming" | "custom";
  remindAt: string;
  sent: boolean;
  read: boolean;
}

export interface ChatResponse {
  reply: string;
}
