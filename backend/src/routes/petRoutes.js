import { Router } from "express";
import { createPet, deletePet, getPetById, listPets, updatePet, uploadPetReport } from "../controllers/petController.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { upload } from "../middleware/upload.js";
import petConnectRoutes from "./petConnectRoutes.js";

const router = Router();

router.use(requireAuth);
router.use("/connect", petConnectRoutes);
router.get("/", asyncHandler(listPets));
router.get("/:id", asyncHandler(getPetById));
router.post("/", asyncHandler(createPet));
router.put("/:id", asyncHandler(updatePet));
router.post("/:id/reports", upload.single("file"), asyncHandler(uploadPetReport));
router.delete("/:id", asyncHandler(deletePet));

export default router;
