import type { PetType } from "./types";

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function maxAgeGapYears(petType: PetType): number {
  if (petType === "dog" || petType === "cat") return 5;
  if (petType === "bird" || petType === "rabbit") return 3;
  return 2;
}

export function minBreedingAgeYears(petType: PetType): number {
  if (petType === "fish") return 0.25;
  return 1;
}

export function agesCompatibleForBreeding(ageA: number, ageB: number, petType: PetType): boolean {
  const min = minBreedingAgeYears(petType);
  return ageA >= min && ageB >= min && Math.abs(ageA - ageB) <= maxAgeGapYears(petType);
}

export function agesCompatible(ageA: number, ageB: number, petType: PetType): boolean {
  return Math.abs(ageA - ageB) <= maxAgeGapYears(petType);
}

export function oppositeGender(a: string, b: string): boolean {
  if (a === "male" && b === "female") return true;
  if (a === "female" && b === "male") return true;
  return false;
}

export type MatchMode = "social" | "breeding";

export function computeCompatibilityScore(input: {
  myBreed: string;
  candidateBreed: string;
  filterBreed?: string;
  healthScoreA: number;
  healthScoreB: number;
  distanceKm: number;
  maxRadiusKm: number;
  ageA: number;
  ageB: number;
  petType: PetType;
  boostProfile: boolean;
}): number {
  const breedTarget = input.filterBreed?.trim().toLowerCase();
  const myB = input.myBreed.trim().toLowerCase();
  const candB = input.candidateBreed.trim().toLowerCase();
  const breedMatch =
    (breedTarget ? candB === breedTarget : false) || (!breedTarget && candB === myB && myB.length > 0);
  const breedPoints = breedMatch ? 30 : 0;

  const hs = Math.max(0, Math.min(100, Math.min(input.healthScoreA, input.healthScoreB)));
  const healthPoints = (30 * hs) / 100;

  const maxR = Math.max(1, input.maxRadiusKm);
  const distFactor = Math.max(0, 1 - input.distanceKm / maxR);
  const distancePoints = 20 * distFactor;

  const gap = Math.abs(input.ageA - input.ageB);
  const maxGap = maxAgeGapYears(input.petType);
  const ageFactor = Math.max(0, 1 - gap / maxGap);
  const agePoints = 20 * ageFactor;

  let total = breedPoints + healthPoints + distancePoints + agePoints;
  if (input.boostProfile) total += 5;
  return Math.min(100, Math.round(total));
}

export function formatHealthStatus(status: string): string {
  if (status === "healthy") return "Healthy";
  if (status === "under_observation") return "Under observation";
  if (status === "critical") return "Critical";
  return status;
}
