import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireSubscription } from "../middleware/requireSubscription.js";
import { deleteDiet, getDietForPet, updateDietById, upsertDiet } from "../controllers/dietController.js";

const router = Router();
router.use(requireAuth);

router.get("/:petId", asyncHandler(getDietForPet));
router.post("/", requireSubscription("pro"), asyncHandler(upsertDiet));
router.put("/:id", requireSubscription("pro"), asyncHandler(updateDietById));
router.delete("/:id", requireSubscription("pro"), asyncHandler(deleteDiet));

export default router;
