import { Router } from "express";
import {
  createLiveClassHandler,
  getCourseLiveClassesHandler,
  joinLiveClassHandler
} from "./liveClass.controller.js";
import { verifyFirebaseToken } from "../../middlewares/auth.middleware.js";
import { isAdmin } from "../../middlewares/role.middleware.js";

const router = Router();

/**
 * ADMIN
 * Create a live class
 */
router.post(
  "/",
  verifyFirebaseToken,
  isAdmin,
  createLiveClassHandler
);

/**
 * USER
 * Get all live classes for a course
 */
router.get(
  "/course/:courseId",
  verifyFirebaseToken,
  getCourseLiveClassesHandler
);

/**
 * USER
 * Join a live class (mark attendance)
 */
router.post(
  "/:liveClassId/join",
  verifyFirebaseToken,
  joinLiveClassHandler
);

export default router;
