import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { getClubs } from "../controllers/clubController.js";

const router = Router();

router.use(authenticate);

router.get("/", getClubs);

export default router;