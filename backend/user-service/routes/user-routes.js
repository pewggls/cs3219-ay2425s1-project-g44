import express from "express";

import {
  createUser,
  deleteUser,
  getAllUsers,
  checkUserExistByEmailorId,
  getUser,
  getUserHistory,
  getQuestionAttemptDetails,
  getUserStats,   
  addQuestionAttempt,
  updateUser,
  updateUserPrivilege,
} from "../controller/user-controller.js";
import { verifyAccessToken, verifyIsAdmin, verifyIsOwnerOrAdmin } from "../middleware/basic-access-control.js";

const router = express.Router();

router.get("/", verifyAccessToken, verifyIsAdmin, getAllUsers);

router.get("/check", checkUserExistByEmailorId);

router.get("/history/:userId/stats", verifyAccessToken, getUserStats);

router.get("/history/:userId", verifyAccessToken, getUserHistory);

router.get("/history/:userId/question/:questionId", verifyAccessToken, getQuestionAttemptDetails);

router.patch("/:id/privilege", verifyAccessToken, verifyIsAdmin, updateUserPrivilege);

router.post("/", createUser);

router.post("/history/:userId", verifyAccessToken, addQuestionAttempt);

router.get("/:id", verifyAccessToken, verifyIsOwnerOrAdmin, getUser);

router.patch("/:id", verifyAccessToken, verifyIsOwnerOrAdmin, updateUser);

router.delete("/:id", verifyAccessToken, verifyIsOwnerOrAdmin, deleteUser);

export default router;
