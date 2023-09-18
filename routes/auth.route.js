import express from "express";
import {
  login,
  register,
  refreshToken,
  protectedPathOne,
} from "../controllers/auth.controller.js";
import { verifyAccessToken } from "../middelwares/verifyToken.middleware.js";

const router = express.Router();

router.post("/", async (req, res) => {
  res.send("This is the test route ");
});

router.post("/login", login);

router.post("/register", register);

router.post("/refreshToken", refreshToken);

router.get("/protected", verifyAccessToken, protectedPathOne);

export default router;
