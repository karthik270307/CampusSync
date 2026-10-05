import { Router } from "express";

import {
  authenticate,
} from "../middleware/authenticate.js";

import {
  authorizeRoles,
} from "../middleware/authorizeRoles.js";

import {
  create,
  list,
  getOne,
  update,
  cancel,
} from "../controllers/eventController.js";

const router = Router();

router.use(authenticate);

router.get("/", list);

router.get("/:id", getOne);

router.post(
  "/",
  authorizeRoles(
    "club_organizer",
    "faculty_advisor",
    "hod",
    "admin"
  ),
  create
);

router.put(
  "/:id",
  authorizeRoles(
    "club_organizer",
    "faculty_advisor",
    "hod",
    "admin"
  ),
  update
);

router.patch(
  "/:id/cancel",
  authorizeRoles(
    "club_organizer",
    "faculty_advisor",
    "hod",
    "admin"
  ),
  cancel
);

export default router;