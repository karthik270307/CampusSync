import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { checkConflicts } from "../controllers/conflictController.js";

const router = Router();

router.use(authenticate);

router.post("/check", checkConflicts);

export default router;