import type { PetType } from "./types";

export const breedOptionsByPet: Record<PetType, string[]> = {
  dog: ["Labrador", "German Shepherd", "Beagle", "Indie", "Shih Tzu", "Golden Retriever"],
  cat: ["Indian Shorthair", "Persian", "Siamese", "Maine Coon", "Bengal"],
  bird: ["Budgie", "Cockatiel", "Parrot", "Lovebird", "Canary", "Macaw"],
  rabbit: ["Lop", "Dutch", "Angora", "Rex", "Lionhead"],
  fish: ["Goldfish", "Betta", "Guppy", "Koi", "Molly", "Arowana"]
};

