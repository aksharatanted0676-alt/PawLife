/**
 * Rule-based default diet from pet attributes (no random filler).
 * @param {import('../models/Pet.js').Pet | object} pet
 */
export function buildDefaultDietPlan(pet) {
  const petType = pet.petType || "dog";
  const breed = String(pet.breed || "").toLowerCase();
  const weightKg = Math.max(0.1, Number(pet.weightKg) || 1);
  const ageYears = Number.isFinite(pet.ageYears) ? pet.ageYears : deriveAgeYearsFromBirthdate(pet.birthdate);

  const baseCalories = Math.round(
    weightKg *
      (petType === "cat" ? 45 : petType === "dog" ? 70 : petType === "bird" ? 35 : petType === "rabbit" ? 40 : 20)
  );

  const slotsByType = {
    dog: {
      notes: `Dog diet for ${breed || "mixed"}: age ~${ageYears}y, weight ${weightKg}kg. Adjust portions if body condition changes; consult a vet for medical diets.`,
      waterMl: Math.round(weightKg * 50 + 400),
      morning: "High-quality kibble (measured portion)",
      afternoon: "Lean protein topper or vet-approved wet food",
      evening: "Kibble + optional steamed vegetables (no onion/garlic)"
    },
    cat: {
      notes: `Cat diet (${breed || "domestic"}): protein-forward; age ~${ageYears}y, ${weightKg}kg. Fresh water always; watch carb-heavy foods.`,
      waterMl: Math.round(weightKg * 60 + 150),
      morning: "Wet food (high protein) + small kibble",
      afternoon: "Wet food portion or freeze-dried protein",
      evening: "Kibble puzzle feeder + hydration broth (sodium-free)"
    },
    bird: {
      notes: `Bird (${breed || "species"}): species-appropriate pellets + fresh produce; avoid avocado/chocolate; age context ~${ageYears}y.`,
      waterMl: Math.round(40 + weightKg * 20),
      morning: "Pelleted base diet + small fruit piece",
      afternoon: "Chopped dark greens + calcium source per vet",
      evening: "Pellets + low-salt seed mix (breed-specific)"
    },
    rabbit: {
      notes: `Rabbit (${breed || "breed"}): unlimited timothy hay; age ~${ageYears}y, ${weightKg}kg. Introduce new greens slowly.`,
      waterMl: Math.round(150 + weightKg * 80),
      morning: "Timothy hay + small pellet ration",
      afternoon: "Mixed leafy greens (romaine, cilantro) — rotate",
      evening: "Hay + herb variety; limited treats"
    },
    fish: {
      notes: `Fish (${breed || "species"}): feed small amounts 1–2× daily; match food to species; tank context for biomass.`,
      waterMl: 0,
      morning: "Species-appropriate flakes/pellets (small pinch)",
      afternoon: "Frozen daphnia/brine shrimp if carnivore species",
      evening: "Light feeding; fast one day/week if vet-approved"
    }
  };

  const t = slotsByType[petType] || slotsByType.dog;
  const perDayCal = Math.max(1, Math.round(baseCalories / 7));
  const meals = weeklyRowsFromSlots(
    { morning: t.morning, afternoon: t.afternoon, evening: t.evening },
    perDayCal
  );

  const breedHint =
    breed.includes("labrador") || breed.includes("golden")
      ? " Large-breed kibble portions; avoid rapid growth excess in young dogs."
      : breed.includes("persian")
        ? " Long-hair cats: hairball formula may help — vet guidance."
        : "";

  return {
    meals,
    calories: Math.min(8000, Math.max(200, baseCalories)),
    waterIntakeMl: t.waterMl,
    notes: t.notes + breedHint,
    planType: "auto"
  };
}

export function deriveAgeYearsFromBirthdate(birthdate) {
  if (!birthdate) return 1;
  const d = new Date(String(birthdate));
  if (Number.isNaN(d.getTime())) return 1;
  const diff = Date.now() - d.getTime();
  return Math.max(0, Math.min(40, diff / (365.25 * 24 * 3600 * 1000)));
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function weeklyRowsFromSlots({ morning, afternoon, evening }, dayCalories) {
  return DAYS.map((day) => ({
    day,
    morning,
    afternoon,
    evening,
    calories: dayCalories
  }));
}
