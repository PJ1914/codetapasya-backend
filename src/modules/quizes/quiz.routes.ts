import { Router } from "express";
import { submitQuiz } from "./quiz.controller.js";
import { verifyFirebaseToken } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/:quizId/submit", verifyFirebaseToken, submitQuiz);

export default router;
