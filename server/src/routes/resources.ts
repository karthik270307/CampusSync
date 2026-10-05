import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { getResources } from "../controllers/resourceController.js";

const router = Router();

router.use(authenticate);

router.get("/", getResources);

export default router;