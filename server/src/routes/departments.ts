import { Router } from "express";
import { getDepartments } from "../controllers/departmentController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

router.get("/", authenticate, getDepartments);

export default router;
