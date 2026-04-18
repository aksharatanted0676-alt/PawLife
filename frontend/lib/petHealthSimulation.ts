import type { PetType } from "./types";

export type HealthRiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface PetHealthAnalysis {
  issue: string;
  confidence: number;
  risk: HealthRiskLevel;
  description: string;
  action: string;
  steps: string[];
}

type Template = Omit<PetHealthAnalysis, "confidence" | "risk"> & {
  baseRisk: HealthRiskLevel;
};

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function pickWeighted<T extends { w: number; t: Template }>(items: T[]): Template {
  const total = items.reduce((s, i) => s + i.w, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.w;
    if (r <= 0) return item.t;
  }
  return items[items.length - 1].t;
}

function bumpRisk(base: HealthRiskLevel, confidence: number): HealthRiskLevel {
  if (base === "LOW") return "LOW";
  if (base === "HIGH") return "HIGH";
  if (confidence >= 88) return "HIGH";
  return "MEDIUM";
}

const dogTemplates: Array<{ w: number; t: Template }> = [
  {
    w: 0.38,
    t: {
      issue: "Possible skin infection",
      baseRisk: "MEDIUM",
      description: "Visible redness and patchy fur patterns consistent with localized irritation or infection.",
      action: "Monitor closely and consult a vet if the area spreads, oozes, or your pet seems painful.",
      steps: ["Check the affected area daily", "Keep the area clean and dry", "Avoid home medication unless your vet advises"]
    }
  },
  {
    w: 0.22,
    t: {
      issue: "Possible eye infection",
      baseRisk: "MEDIUM",
      description: "Signs such as red conjunctiva or discharge may suggest irritation or infection.",
      action: "Schedule a vet visit if discharge persists beyond 24–48 hours or vision seems affected.",
      steps: ["Gently wipe outer eye with clean damp cloth if tolerated", "Prevent pawing at the eyes", "Do not use human eye drops"]
    }
  },
  {
    w: 0.25,
    t: {
      issue: "Possible weight concern",
      baseRisk: "LOW",
      description: "Body condition from this angle suggests checking whether weight is ideal for breed and age.",
      action: "Ask your vet to score body condition and adjust feeding or exercise with a plan.",
      steps: ["Measure food portions consistently", "Add gradual daily activity", "Recheck weight in 2–4 weeks"]
    }
  },
  {
    w: 0.15,
    t: {
      issue: "No obvious acute visible concerns",
      baseRisk: "LOW",
      description: "No strong visual cues of acute skin, eye, or posture problems in this image.",
      action: "Continue routine wellness care and re-check if behavior or appetite changes.",
      steps: ["Keep photos for comparison over time", "Note any new lumps or odors", "Maintain regular vet exams"]
    }
  }
];

const catTemplates: Array<{ w: number; t: Template }> = [
  {
    w: 0.28,
    t: {
      issue: "Possible skin infection",
      baseRisk: "MEDIUM",
      description: "Patchy coat or pink skin areas may reflect allergy, parasites, or secondary infection.",
      action: "Consult a vet if scratching is intense or lesions spread.",
      steps: ["Check for fleas and grooming pain", "Use vet-approved parasite control", "Avoid topical steroids without guidance"]
    }
  },
  {
    w: 0.32,
    t: {
      issue: "Possible eye infection",
      baseRisk: "MEDIUM",
      description: "Redness or ocular discharge can indicate conjunctivitis or corneal irritation.",
      action: "Seek prompt vet care if the eye is squinting, cloudy, or painful.",
      steps: ["Keep the face clean", "Separate from dusty environments if sneezing too", "Do not delay if both eyes worsen"]
    }
  },
  {
    w: 0.22,
    t: {
      issue: "Possible weight concern",
      baseRisk: "LOW",
      description: "Silhouette and fullness suggest verifying ideal weight with your veterinarian.",
      action: "Discuss diet calories and indoor enrichment to support healthy condition.",
      steps: ["Weigh monthly on the same scale", "Use puzzle feeders for mental stimulation", "Track treats in daily calories"]
    }
  },
  {
    w: 0.18,
    t: {
      issue: "No obvious acute visible concerns",
      baseRisk: "LOW",
      description: "This snapshot does not show clear acute warning signs from visible cues alone.",
      action: "Stay observant for hiding, litter changes, or appetite shifts.",
      steps: ["Film short clips if odd posture appears", "Refresh water daily", "Book wellness if anything feels off"]
    }
  }
];

const birdTemplates: Array<{ w: number; t: Template }> = [
  {
    w: 0.45,
    t: {
      issue: "Possible feather loss or plucking",
      baseRisk: "MEDIUM",
      description: "Thinning feathers or bare patches may reflect stress, diet imbalance, or illness.",
      action: "Have an avian vet examine skin and diet if feather loss progresses.",
      steps: ["Review diet for complete pellets and fresh foods", "Check for cage stressors (noise, boredom)", "Avoid home sprays near the bird"]
    }
  },
  {
    w: 0.35,
    t: {
      issue: "Possible abnormal posture",
      baseRisk: "MEDIUM",
      description: "Perching stance or head position may look uneven compared to a relaxed neutral posture.",
      action: "If balance, breathing, or droppings change, seek same-day avian veterinary advice.",
      steps: ["Observe tail bobbing at rest", "Note grip strength on perches", "Keep the cage warm and quiet while arranging care"]
    }
  },
  {
    w: 0.2,
    t: {
      issue: "No obvious acute visible concerns",
      baseRisk: "LOW",
      description: "Plumage and stance appear broadly typical for a casual photo.",
      action: "Continue species-appropriate care and lighting.",
      steps: ["Ensure full-spectrum light per vet guidance", "Rotate toys weekly", "Weigh weekly on a gram scale"]
    }
  }
];

const rabbitTemplates: Array<{ w: number; t: Template }> = [
  {
    w: 0.45,
    t: {
      issue: "Possible fur or skin issues",
      baseRisk: "MEDIUM",
      description: "Dull coat, dandruff, or uneven fur may suggest parasites, pain, or poor grooming.",
      action: "A vet can rule out mites, dental pain affecting grooming, and urinary soiling.",
      steps: ["Check hindquarters for urine scald", "Brush gently if tolerated", "Improve hay intake for dental health"]
    }
  },
  {
    w: 0.35,
    t: {
      issue: "Possible eye swelling",
      baseRisk: "HIGH",
      description: "Periorbital puffiness can accompany dental disease, infection, or trauma in rabbits.",
      action: "Treat as urgent: eye swelling in rabbits often needs professional evaluation quickly.",
      steps: ["Keep environment dust-free", "Do not apply pressure to the eye", "Offer favorite hay and water while arranging transport"]
    }
  },
  {
    w: 0.2,
    t: {
      issue: "No obvious acute visible concerns",
      baseRisk: "LOW",
      description: "No dramatic swelling or coat loss is evident in this frame.",
      action: "Maintain routine exotic-pet vet visits.",
      steps: ["Monitor eating and droppings daily", "Weigh weekly", "Update enclosure enrichment"]
    }
  }
];

const fishTemplates: Array<{ w: number; t: Template }> = [
  {
    w: 0.45,
    t: {
      issue: "Possible water-related stress signs",
      baseRisk: "MEDIUM",
      description: "Clamped fins, rapid breathing, or faded activity can track with water quality swings.",
      action: "Test ammonia, nitrite, nitrate, and pH; adjust slowly with partial water changes if needed.",
      steps: ["Run liquid tests before large changes", "Match temperature when refilling", "Reduce feeding until parameters stabilize"]
    }
  },
  {
    w: 0.35,
    t: {
      issue: "Possible color fading",
      baseRisk: "LOW",
      description: "Dull coloration may relate to stress, diet, lighting, or illness in some species.",
      action: "Review diet variety and tank enrichment; consult an aquatic vet if appetite drops.",
      steps: ["Confirm species-appropriate foods", "Check for bullying tankmates", "Assess lighting schedule"]
    }
  },
  {
    w: 0.2,
    t: {
      issue: "No obvious acute visible concerns",
      baseRisk: "LOW",
      description: "From this image, fins and general tone look within a broad normal range.",
      action: "Keep logging parameters weekly.",
      steps: ["Photograph weekly under similar light", "Clean filtration per manufacturer", "Quarantine new fish"]
    }
  }
];

const byPet: Record<PetType, Array<{ w: number; t: Template }>> = {
  dog: dogTemplates,
  cat: catTemplates,
  bird: birdTemplates,
  rabbit: rabbitTemplates,
  fish: fishTemplates
};

export function simulatePetHealthAnalysis(petType: PetType): PetHealthAnalysis {
  const template = pickWeighted(byPet[petType]);
  const confidence = randInt(60, 95);
  const risk = bumpRisk(template.baseRisk, confidence);
  const { baseRisk: _b, ...rest } = template;
  return {
    ...rest,
    confidence,
    risk
  };
}
