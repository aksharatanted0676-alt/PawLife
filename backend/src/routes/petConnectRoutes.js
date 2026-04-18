import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import {
  acceptConnectRequest,
  blockUser,
  listConnectRequests,
  listMessages,
  postMessage,
  rejectConnectRequest,
  reportUser,
  sendConnectRequest,
  verifyAccountDemo
} from "../controllers/petConnectController.js";

const router = Router();

router.get("/requests", asyncHandler(listConnectRequests));
router.post("/requests", asyncHandler(sendConnectRequest));
router.post("/requests/:id/accept", asyncHandler(acceptConnectRequest));
router.post("/requests/:id/reject", asyncHandler(rejectConnectRequest));
router.post("/blocks", asyncHandler(blockUser));
router.post("/reports", asyncHandler(reportUser));
router.get("/messages/:connectionId", asyncHandler(listMessages));
router.post("/messages", asyncHandler(postMessage));
router.post("/verify-account-demo", asyncHandler(verifyAccountDemo));

export default router;
