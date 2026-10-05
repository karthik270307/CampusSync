import { Router } from "express";
import { getPendingRequests, approveRequest, rejectRequest, requestResubmission } from "../controllers/verificationController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";

const router = Router();

router.use(authenticate);
router.use(authorizeRoles("admin", "super_admin", "dean")); // Dean can also potentially verify, but let's stick to admin/super_admin

router.get("/pending", getPendingRequests);
router.put("/:userId/approve", approveRequest);
router.put("/:userId/reject", rejectRequest);
router.put("/:userId/resubmit", requestResubmission);

export default router;
