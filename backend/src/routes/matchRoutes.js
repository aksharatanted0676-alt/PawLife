import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireSubscription } from "../middleware/requireSubscription.js";
import {
  createMatchRequest,
  getSuggestionsForPet,
  listMatchRequests,
  upsertMatchProfile
} from "../controllers/matchController.js";

const router = Router();
router.use(requireAuth);
router.use(requireSubscription("elite")); // after auth so req.user is set

router.post("/profile", asyncHandler(upsertMatchProfile));
router.get("/suggestions/:petId", asyncHandler(getSuggestionsForPet));
router.post("/request", asyncHandler(createMatchRequest));
router.get("/requests", asyncHandler(listMatchRequests));

export default router;
