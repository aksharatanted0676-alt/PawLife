import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { subscribePush, unsubscribePush } from "../controllers/pushController.js";

const router = Router();
router.use(requireAuth);

router.post("/subscribe", asyncHandler(subscribePush));
router.post("/unsubscribe", asyncHandler(unsubscribePush));

export default router;

