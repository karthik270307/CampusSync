import { Router } from "express";

import { authenticate } from "../middleware/authenticate.js";

import {
  getMyApprovalRequests,
  getWorkflow,
  approve,
  requestRevision,
  reject,
} from "../controllers/approvalController.js";

const router = Router();

router.use(authenticate);

/*
 * IMPORTANT:
 * This route must come BEFORE /:eventId
 *
 * GET /api/approvals
 */
router.get("/", getMyApprovalRequests);

/*
 * POST /api/approvals/:approvalId/approve
 */
router.post("/:approvalId/approve", approve);

/*
 * POST /api/approvals/:approvalId/revision
 */
router.post("/:approvalId/revision", requestRevision);

/*
 * POST /api/approvals/:approvalId/reject
 */
router.post("/:approvalId/reject", reject);

/*
 * GET /api/approvals/:eventId
 */
router.get("/:eventId", getWorkflow);

export default router;