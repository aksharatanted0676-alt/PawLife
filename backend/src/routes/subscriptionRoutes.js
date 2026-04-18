import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { subscribe } from "../controllers/subscriptionController.js";

const router = Router();
router.use(requireAuth);
router.post("/", asyncHandler(subscribe));

export default router;
