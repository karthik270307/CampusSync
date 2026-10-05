import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import eventRoutes from "./routes/events.js";
import venueRoutes from "./routes/venues.js";
import approvalRoutes from "./routes/approvals.js";
import verificationRoutes from "./routes/verifications.js";

import { connectDatabase } from "./config/database.js";
import authRoutes from "./routes/auth.js";
import {
  authenticate,
  AuthenticatedRequest,
} from "./middleware/authenticate.js";
import { authorizeRoles } from "./middleware/authorizeRoles.js";
import resourceRoutes from "./routes/resources.js";
import conflictRoutes from "./routes/conflicts.js";
dotenv.config();
import clubRoutes from "./routes/club.js";
import departmentRoutes from "./routes/departments.js";
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/approvals", approvalRoutes);
app.use("/api/conflicts", conflictRoutes);
app.use("/api/verifications", verificationRoutes);
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "CampusSync API is running",
  });
});

app.get(
  "/api/test/student",
  authenticate,
  authorizeRoles("student"),
  (req: AuthenticatedRequest, res) => {
    res.json({
      success: true,
      message: "Student-only route accessed successfully",
      user: req.user,
    });
  }
);

app.get(
  "/api/test/admin",
  authenticate,
  authorizeRoles("admin"),
  (req: AuthenticatedRequest, res) => {
    res.json({
      success: true,
      message: "Admin-only route accessed successfully",
      user: req.user,
    });
  }
);

const PORT = process.env.PORT || 5000;

// Connect to the database globally so Vercel can reuse the connection
connectDatabase().catch(console.error);

// Only listen if we are NOT running in a Vercel serverless environment
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`CampusSync API running on http://localhost:${PORT}`);
  });
}

export default app;