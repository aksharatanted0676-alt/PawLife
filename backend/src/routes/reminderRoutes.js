import { Router } from "express";
import { createReminder, deleteReminder, listReminders, markReminderRead } from "../controllers/reminderController.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();
router.use(requireAuth);

router.get("/", asyncHandler(listReminders));
router.post("/", asyncHandler(createReminder));
router.patch("/:id/read", asyncHandler(markReminderRead));
router.delete("/:id", asyncHandler(deleteReminder));

export default router;
