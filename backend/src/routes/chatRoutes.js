import { Router } from "express";
import { chat } from "../controllers/chatController.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();
router.use(requireAuth);
router.post("/", asyncHandler(chat));

export default router;
